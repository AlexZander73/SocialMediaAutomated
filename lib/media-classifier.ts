import { MediaClassification, Orientation, TimeOfDay, UploadedMedia } from "@/lib/types";
import { dedupe } from "@/lib/utils";

function inferAlbumSize(fileCount: number): MediaClassification["albumSize"] {
  if (fileCount <= 1) {
    return "single";
  }
  if (fileCount <= 5) {
    return "small";
  }
  if (fileCount <= 15) {
    return "medium";
  }
  return "large";
}

function inferTimeOfDay(media: UploadedMedia[]): TimeOfDay {
  const timestamps = media
    .map((item) => item.metadata.createdAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  if (timestamps.length === 0) {
    return "unknown";
  }

  const hour = timestamps[0].getHours();
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
}

export function classifyMedia(media: UploadedMedia[]): MediaClassification {
  const supported = media.filter((item) => item.kind !== "unsupported");
  const imageCount = supported.filter((item) => item.kind === "image").length;
  const videoCount = supported.filter((item) => item.kind === "video").length;
  const orientations = dedupe(
    supported
      .map((item) => item.metadata.orientation)
      .filter((orientation): orientation is Orientation => orientation !== "unknown")
  );

  return {
    fileCount: supported.length,
    imageCount,
    videoCount,
    hasGps: supported.some((item) => Boolean(item.metadata.gps)),
    orientations: orientations.length > 0 ? orientations : ["unknown"],
    albumSize: inferAlbumSize(supported.length),
    timeOfDay: inferTimeOfDay(supported),
    includesVideo: videoCount > 0,
    includesOnlyImages: imageCount > 0 && videoCount === 0
  };
}
