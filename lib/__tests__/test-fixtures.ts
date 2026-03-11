import { UserPreferences, UploadedMedia } from "@/lib/types";

export const basePreferences: UserPreferences = {
  tone: "simple",
  platforms: {
    instagram: true,
    facebook: true,
    youtube: true
  },
  hashtagCount: 8,
  locationFormat: "full",
  includeDates: true,
  includeEmojis: false,
  spelling: "us",
  enableReverseGeocoding: false,
  draftLength: "medium"
};

interface MediaFixtureOptions {
  id?: string;
  fileName?: string;
  createdAt?: string;
  width?: number;
  height?: number;
  latitude?: number;
  longitude?: number;
}

export function makeImageFixture(options: MediaFixtureOptions = {}): UploadedMedia {
  const {
    id = "image-1",
    fileName = "photo.jpg",
    createdAt = "2026-03-11T16:20:00.000Z",
    width = 4032,
    height = 3024,
    latitude,
    longitude
  } = options;

  const hasGps = typeof latitude === "number" && typeof longitude === "number";

  return {
    id,
    fileName,
    fileSize: 1024 * 1024,
    fileType: "image/jpeg",
    kind: "image",
    metadata: {
      mimeType: "image/jpeg",
      extension: "jpg",
      createdAt,
      width,
      height,
      gps: hasGps ? { latitude, longitude } : undefined,
      cameraMake: "Apple",
      cameraModel: "iPhone",
      orientation: width > height ? "landscape" : width < height ? "portrait" : "square",
      parseWarnings: []
    }
  };
}

export function makeVideoFixture(options: MediaFixtureOptions = {}): UploadedMedia {
  const {
    id = "video-1",
    fileName = "clip.mp4",
    createdAt = "2026-03-11T22:10:00.000Z",
    width = 1920,
    height = 1080,
    latitude,
    longitude
  } = options;

  const hasGps = typeof latitude === "number" && typeof longitude === "number";

  return {
    id,
    fileName,
    fileSize: 25 * 1024 * 1024,
    fileType: "video/mp4",
    kind: "video",
    metadata: {
      mimeType: "video/mp4",
      extension: "mp4",
      createdAt,
      width,
      height,
      durationSeconds: 95,
      gps: hasGps ? { latitude, longitude } : undefined,
      orientation: width > height ? "landscape" : width < height ? "portrait" : "square",
      parseWarnings: []
    }
  };
}
