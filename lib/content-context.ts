import { CATEGORY_LABELS } from "@/lib/constants";
import { classifyMedia } from "@/lib/media-classifier";
import { ContentCategory, ContentContext, ManualInputs, ResolvedLocation, UploadedMedia } from "@/lib/types";
import { dedupe, formatLocation, isoToDisplayDate } from "@/lib/utils";

interface BuildContextInput {
  media: UploadedMedia[];
  category: ContentCategory;
  manual: ManualInputs;
  primaryLocation?: ResolvedLocation;
  locationFormat: "full" | "city-region" | "coordinates" | "hidden";
  spelling: "us" | "uk";
}

function buildDateRange(media: UploadedMedia[]): { start?: string; end?: string } {
  const dates = media
    .map((item) => item.metadata.createdAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  if (dates.length === 0) {
    return {};
  }

  return {
    start: dates[0].toISOString(),
    end: dates[dates.length - 1].toISOString()
  };
}

function formatDateRangeText(range: { start?: string; end?: string }, spelling: "us" | "uk"): string {
  if (!range.start) {
    return "No capture date metadata found";
  }

  const startText = isoToDisplayDate(range.start, spelling);
  if (!range.end || range.start === range.end) {
    return startText;
  }
  const endText = isoToDisplayDate(range.end, spelling);
  return `${startText} to ${endText}`;
}

export function buildContentContext({
  media,
  category,
  manual,
  primaryLocation,
  locationFormat,
  spelling
}: BuildContextInput): ContentContext {
  const dateRange = buildDateRange(media);
  const classification = classifyMedia(media);
  const resolutionSet = dedupe(
    media
      .filter((item) => item.kind !== "unsupported")
      .map((item) =>
        item.metadata.width && item.metadata.height ? `${item.metadata.width}x${item.metadata.height}` : "Unknown resolution"
      )
  );

  const mediaTypes = dedupe(
    media
      .filter((item) => item.kind !== "unsupported")
      .map((item) => item.kind)
      .map((type) => (type === "image" ? "Image" : "Video"))
  );

  const locationText = formatLocation(primaryLocation, locationFormat);

  return {
    media,
    category,
    manual,
    classification,
    primaryLocation,
    dateRange,
    summary: {
      fileCount: classification.fileCount,
      mediaTypes,
      dateRangeText: formatDateRangeText(dateRange, spelling),
      resolutionSet,
      gpsFound: classification.hasGps,
      locationText: locationText || (classification.hasGps ? "Coordinates available" : "No location metadata found"),
      manualCategory: category,
      notesPreview: manual.extraNotes || manual.whatHappened || CATEGORY_LABELS[category]
    }
  };
}
