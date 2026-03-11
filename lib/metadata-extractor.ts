import * as exifr from "exifr";
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_MIME_TYPES,
  SUPPORTED_VIDEO_EXTENSIONS,
  SUPPORTED_VIDEO_MIME_TYPES
} from "@/lib/constants";
import { Coordinates, ExtractedMetadata, UploadedMedia } from "@/lib/types";
import { getExtension, inferOrientation, uniqueId } from "@/lib/utils";

function isImageFile(file: File): boolean {
  const extension = getExtension(file.name);
  return SUPPORTED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase()) || SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
}

function isVideoFile(file: File): boolean {
  const extension = getExtension(file.name);
  return SUPPORTED_VIDEO_MIME_TYPES.includes(file.type.toLowerCase()) || SUPPORTED_VIDEO_EXTENSIONS.includes(extension);
}

function parseDateValue(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const candidate = new Date(value);
    if (!Number.isNaN(candidate.getTime())) {
      return candidate.toISOString();
    }
  }
  return undefined;
}

function dmsToDecimal(raw: unknown, ref?: unknown): number | undefined {
  if (!Array.isArray(raw) || raw.length < 3) {
    return undefined;
  }

  const [degrees, minutes, seconds] = raw.map((part) => (typeof part === "number" ? part : Number(part)));
  if ([degrees, minutes, seconds].some((part) => Number.isNaN(part))) {
    return undefined;
  }

  const sign = typeof ref === "string" && ["S", "W"].includes(ref.toUpperCase()) ? -1 : 1;
  return sign * (degrees + minutes / 60 + seconds / 3600);
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function extractGps(exifData: Record<string, unknown>): Coordinates | undefined {
  const latitude = toNumber(exifData.latitude) ?? dmsToDecimal(exifData.GPSLatitude, exifData.GPSLatitudeRef);
  const longitude = toNumber(exifData.longitude) ?? dmsToDecimal(exifData.GPSLongitude, exifData.GPSLongitudeRef);

  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }

  return { latitude, longitude };
}

async function loadImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Could not decode image dimensions"));
      image.src = imageUrl;
    });
    return dimensions;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function loadVideoBasics(file: File): Promise<{ width?: number; height?: number; durationSeconds?: number }> {
  const videoUrl = URL.createObjectURL(file);

  try {
    const metadata = await new Promise<{ width?: number; height?: number; durationSeconds?: number }>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          width: Number.isFinite(video.videoWidth) ? video.videoWidth : undefined,
          height: Number.isFinite(video.videoHeight) ? video.videoHeight : undefined,
          durationSeconds: Number.isFinite(video.duration) ? video.duration : undefined
        });
      };
      video.onerror = () => reject(new Error("Could not read video metadata"));
      video.src = videoUrl;
    });
    return metadata;
  } finally {
    URL.revokeObjectURL(videoUrl);
  }
}

function pickCreatedAt(exifData: Record<string, unknown>, fallback: File): string | undefined {
  const candidates = [
    exifData.DateTimeOriginal,
    exifData.CreateDate,
    exifData.ModifyDate,
    exifData.DateTime,
    exifData.CreationDate
  ];

  for (const candidate of candidates) {
    const parsed = parseDateValue(candidate);
    if (parsed) {
      return parsed;
    }
  }

  if (fallback.lastModified) {
    return new Date(fallback.lastModified).toISOString();
  }

  return undefined;
}

function buildBaseMetadata(file: File): ExtractedMetadata {
  return {
    mimeType: file.type || "unknown",
    extension: getExtension(file.name),
    orientation: "unknown",
    parseWarnings: []
  };
}

export function isSupportedMediaFile(file: File): boolean {
  return isImageFile(file) || isVideoFile(file);
}

export async function extractMediaFromFile(file: File): Promise<UploadedMedia> {
  const id = uniqueId("media");
  const image = isImageFile(file);
  const video = isVideoFile(file);
  const baseMetadata = buildBaseMetadata(file);

  if (!image && !video) {
    return {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "unknown",
      kind: "unsupported",
      unsupportedReason: "File format is not supported by this MVP.",
      metadata: {
        ...baseMetadata,
        parseWarnings: ["Unsupported file format"]
      }
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    baseMetadata.parseWarnings.push("Large file detected. Metadata extraction may be limited for performance.");
  }

  let exifData: Record<string, unknown> = {};
  try {
    exifData = ((await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
      xmp: true
    })) ?? {}) as Record<string, unknown>;
  } catch {
    baseMetadata.parseWarnings.push("Metadata parser could not read full EXIF data.");
  }

  baseMetadata.createdAt = pickCreatedAt(exifData, file);
  baseMetadata.cameraMake = typeof exifData.Make === "string" ? exifData.Make : undefined;
  baseMetadata.cameraModel = typeof exifData.Model === "string" ? exifData.Model : undefined;
  baseMetadata.gps = extractGps(exifData);

  let width =
    toNumber(exifData.ExifImageWidth) ??
    toNumber(exifData.ImageWidth) ??
    toNumber(exifData.PixelXDimension) ??
    toNumber(exifData.SourceImageWidth);
  let height =
    toNumber(exifData.ExifImageHeight) ??
    toNumber(exifData.ImageHeight) ??
    toNumber(exifData.PixelYDimension) ??
    toNumber(exifData.SourceImageHeight);
  let durationSeconds = toNumber(exifData.Duration);

  if (image && (!width || !height)) {
    try {
      const dimensions = await loadImageDimensions(file);
      width = width ?? dimensions.width;
      height = height ?? dimensions.height;
    } catch {
      baseMetadata.parseWarnings.push("Unable to decode image dimensions.");
    }
  }

  if (video) {
    try {
      const videoBasics = await loadVideoBasics(file);
      width = width ?? videoBasics.width;
      height = height ?? videoBasics.height;
      durationSeconds = durationSeconds ?? videoBasics.durationSeconds;
    } catch {
      baseMetadata.parseWarnings.push("Unable to read video duration or dimensions.");
    }
  }

  baseMetadata.width = width;
  baseMetadata.height = height;
  baseMetadata.durationSeconds = durationSeconds;
  baseMetadata.orientation = inferOrientation(width, height);

  const previewUrl = image ? URL.createObjectURL(file) : undefined;

  return {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || baseMetadata.extension || "unknown",
    kind: image ? "image" : "video",
    previewUrl,
    metadata: baseMetadata
  };
}
