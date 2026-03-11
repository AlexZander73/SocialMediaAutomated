import { CATEGORY_LABELS } from "@/lib/constants";
import { ContentContext, UserPreferences } from "@/lib/types";
import { cleanText, formatLocation, isoToDisplayDate } from "@/lib/utils";

export interface TemplateTokens {
  categoryLabel: string;
  locationText: string;
  dateText: string;
  happenedText: string;
  audienceText: string;
  notesText: string;
  fileDescriptor: string;
  mediaDescriptor: string;
}

function buildFileDescriptor(context: ContentContext): string {
  const { fileCount, imageCount, videoCount } = context.classification;
  if (videoCount > 0 && imageCount > 0) {
    return `${imageCount} photo${imageCount > 1 ? "s" : ""} and ${videoCount} video${videoCount > 1 ? "s" : ""}`;
  }
  if (videoCount > 0) {
    return `${videoCount} video${videoCount > 1 ? "s" : ""}`;
  }
  return `${fileCount} photo${fileCount > 1 ? "s" : ""}`;
}

export function createTemplateTokens(context: ContentContext, preferences: UserPreferences): TemplateTokens {
  const categoryLabel = CATEGORY_LABELS[context.category];
  const dateText = preferences.includeDates && context.dateRange?.start ? isoToDisplayDate(context.dateRange.start, preferences.spelling) : "";
  const locationText = formatLocation(context.primaryLocation, preferences.locationFormat);

  const happenedText = cleanText(context.manual.whatHappened);
  const audienceText = cleanText(context.manual.whoIsThisFor);
  const notesText = cleanText(context.manual.extraNotes);
  const fileDescriptor = buildFileDescriptor(context);

  const mediaDescriptor = context.classification.includesVideo
    ? context.classification.includesOnlyImages
      ? "photo set"
      : "media set"
    : "photo set";

  return {
    categoryLabel,
    locationText,
    dateText,
    happenedText,
    audienceText,
    notesText,
    fileDescriptor,
    mediaDescriptor
  };
}

export function joinSentences(parts: Array<string | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .map((part) => (/[.!?]$/.test(part) ? part : `${part}.`))
    .join(" ");
}
