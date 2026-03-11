import { CATEGORY_HASHTAGS, TIME_OF_DAY_HASHTAGS, TONE_TEMPLATE_REGISTRY } from "@/lib/template-registry";
import { createTemplateTokens, joinSentences } from "@/lib/output-formatter";
import { ContentContext, DraftLength, DraftOutput, UserPreferences } from "@/lib/types";
import { cleanText, dedupe, maybeEmoji, slugFromText, toTitleCase } from "@/lib/utils";

function baseSubject(context: ContentContext): string {
  return (
    cleanText(context.manual.whatHappened) ||
    cleanText(context.manual.extraNotes) ||
    toTitleCase(context.category.replace(/-/g, " "))
  );
}

function categoryFallback(context: ContentContext): string {
  return toTitleCase(context.category.replace(/-/g, " "));
}

function dateFragment(tokens: ReturnType<typeof createTemplateTokens>): string {
  return tokens.dateText ? ` on ${tokens.dateText}` : "";
}

function locationFragment(tokens: ReturnType<typeof createTemplateTokens>): string {
  return tokens.locationText ? ` ${tokens.locationText}` : "";
}

function phraseByLength(values: Record<DraftLength, string>, length: DraftLength): string {
  return values[length];
}

function generateInstagramCaption(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const toneProfile = TONE_TEMPLATE_REGISTRY[preferences.tone];
  const length = preferences.draftLength;
  const subject = baseSubject(context);

  if (
    context.classification.fileCount === 1 &&
    context.classification.includesOnlyImages &&
    context.category === "travel-outing" &&
    tokens.locationText
  ) {
    return joinSentences([
      `A nice moment from ${tokens.locationText}${dateFragment(tokens)}`,
      length !== "short" ? `Category: ${categoryFallback(context)}` : undefined,
      length === "long" ? phraseByLength(toneProfile.close, length) : undefined
    ]);
  }

  if (
    context.classification.fileCount > 1 &&
    context.classification.includesOnlyImages &&
    context.category === "project-progress"
  ) {
    return joinSentences([
      `Progress update${dateFragment(tokens)}`,
      `Worked on ${subject} and wanted to share a few photos`,
      length !== "short" ? phraseByLength(toneProfile.close, length) : undefined
    ]);
  }

  return joinSentences([
    `${phraseByLength(toneProfile.intro, length)}${maybeEmoji(preferences.includeEmojis, toneProfile.emoji)}`,
    `${subject} ${phraseByLength(toneProfile.connector, length)}${locationFragment(tokens) || " this update"}${dateFragment(tokens)}`.replace(
      /\s+/g,
      " "
    ),
    length !== "short" ? `Category: ${categoryFallback(context)}` : undefined,
    length === "long" ? phraseByLength(toneProfile.close, length) : undefined
  ]);
}

function generateFacebookPost(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const toneProfile = TONE_TEMPLATE_REGISTRY[preferences.tone];
  const length = preferences.draftLength;
  const subject = baseSubject(context);

  const audienceSentence = tokens.audienceText ? `This is for ${tokens.audienceText}` : "";
  const notesSentence = tokens.notesText ? `Extra note: ${tokens.notesText}` : "";

  return joinSentences([
    `${phraseByLength(toneProfile.intro, length)}${maybeEmoji(preferences.includeEmojis, toneProfile.emoji)}`,
    `Sharing ${tokens.fileDescriptor}${tokens.locationText ? ` in${locationFragment(tokens)}` : ""}${dateFragment(tokens)}`,
    `Main update: ${subject}`,
    length !== "short" ? audienceSentence : "",
    length === "long" ? notesSentence : "",
    length !== "short" ? phraseByLength(toneProfile.close, length) : ""
  ]);
}

function generateYouTubeTitleVariants(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const subject = baseSubject(context);
  const locationPart = tokens.locationText ? ` - ${tokens.locationText}` : "";
  const datePart = tokens.dateText ? ` (${tokens.dateText})` : "";
  const filePart = context.classification.includesVideo ? "Video" : "Photo Recap";

  const variants = [
    `${subject} | ${filePart}${locationPart}`,
    `${categoryFallback(context)} Update: ${subject}${datePart}`,
    `${filePart}: ${subject}${locationPart}${datePart}`
  ];

  if (preferences.draftLength === "long") {
    variants[1] = `${categoryFallback(context)} Progress Breakdown: ${subject}${locationPart}${datePart}`;
  }

  return variants.map((value, index) => `${index + 1}. ${value}`).join("\n");
}

function generateYouTubeDescription(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const subject = baseSubject(context);
  const metadataScope = context.classification.includesVideo ? "video metadata" : "photo metadata";

  return joinSentences([
    `${subject}`,
    `Category: ${categoryFallback(context)}`,
    `Captured${tokens.locationText ? ` in${locationFragment(tokens)}` : ""}${dateFragment(tokens)}`,
    tokens.audienceText ? `Intended audience: ${tokens.audienceText}` : "",
    tokens.notesText ? `Notes: ${tokens.notesText}` : "",
    preferences.draftLength !== "short"
      ? `This draft is generated from ${metadataScope} and manual inputs only`
      : ""
  ]);
}

function generateYouTubeSummary(
  context: ContentContext,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const subject = baseSubject(context);
  return joinSentences([
    `Upload summary: ${subject}`,
    `Category ${categoryFallback(context)}`,
    `Captured${tokens.locationText ? ` in${locationFragment(tokens)}` : ""}`
  ]);
}

function generateHashtags(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const hashtags = [...CATEGORY_HASHTAGS[context.category]];

  hashtags.push(TIME_OF_DAY_HASHTAGS[context.classification.timeOfDay]);
  hashtags.push(context.classification.includesVideo ? "VideoUpdate" : "PhotoUpdate");

  if (context.classification.fileCount > 1 && context.classification.includesOnlyImages) {
    hashtags.push("PhotoDump");
  }

  if (tokens.locationText) {
    const locationHash = slugFromText(tokens.locationText.split(",")[0] || tokens.locationText);
    if (locationHash) {
      hashtags.push(locationHash);
    }
  }

  if (tokens.dateText) {
    const dateParts = tokens.dateText.replace(/,/g, "").split(" ");
    if (dateParts.length >= 2) {
      hashtags.push(slugFromText(`${dateParts[0]} ${dateParts[1]}`));
    }
  }

  if (context.category === "youtube-upload" || context.classification.includesVideo) {
    hashtags.push("NewVideo");
  }

  if (context.manual.whoIsThisFor) {
    hashtags.push(slugFromText(context.manual.whoIsThisFor));
  }

  const finalTags = dedupe(hashtags)
    .filter(Boolean)
    .slice(0, Math.max(1, preferences.hashtagCount))
    .map((tag) => `#${tag}`);

  return finalTags.join(" ");
}

function generateAltText(
  context: ContentContext,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const subject = baseSubject(context);
  const mediaType = context.classification.includesVideo ? "Video" : "Photo";

  return joinSentences([
    `${mediaType} ${context.classification.fileCount > 1 ? "set" : "file"} with ${tokens.fileDescriptor}`,
    tokens.locationText ? `Metadata location: ${tokens.locationText}` : "No location metadata found",
    tokens.dateText ? `Metadata date: ${tokens.dateText}` : "No capture date metadata found",
    `Category: ${categoryFallback(context)}`,
    `Context note: ${subject}`,
    "Visual scene details are not inferred in this MVP"
  ]);
}

function generateShortCaption(
  context: ContentContext,
  preferences: UserPreferences,
  tokens: ReturnType<typeof createTemplateTokens>
): string {
  const toneProfile = TONE_TEMPLATE_REGISTRY[preferences.tone];
  const subject = baseSubject(context);
  return joinSentences([
    `${phraseByLength(toneProfile.intro, "short")}${maybeEmoji(preferences.includeEmojis, toneProfile.emoji)}: ${subject}`,
    `Category ${categoryFallback(context)}`,
    tokens.locationText ? `From ${tokens.locationText}` : ""
  ]);
}

function makeDraft(key: DraftOutput["key"], label: string, platform: DraftOutput["platform"], generated: string, description?: string): DraftOutput {
  return {
    key,
    label,
    platform,
    generated,
    current: generated,
    description
  };
}

export function generateDraftOutputs(context: ContentContext, preferences: UserPreferences): DraftOutput[] {
  const tokens = createTemplateTokens(context, preferences);
  const drafts: DraftOutput[] = [];

  if (preferences.platforms.instagram) {
    drafts.push(
      makeDraft(
        "instagram-caption",
        "Instagram Caption",
        "instagram",
        generateInstagramCaption(context, preferences, tokens),
        "Rule-based caption using metadata and manual context."
      )
    );
  }

  if (preferences.platforms.facebook) {
    drafts.push(
      makeDraft(
        "facebook-post",
        "Facebook Post",
        "facebook",
        generateFacebookPost(context, preferences, tokens),
        "Longer update format for feed posts."
      )
    );
  }

  if (preferences.platforms.youtube) {
    drafts.push(
      makeDraft(
        "youtube-titles",
        "YouTube Title Variants",
        "youtube",
        generateYouTubeTitleVariants(context, preferences, tokens),
        "Three deterministic title options for upload flow."
      ),
      makeDraft(
        "youtube-description",
        "YouTube Description",
        "youtube",
        generateYouTubeDescription(context, preferences, tokens),
        "Basic description generated from metadata only."
      ),
      makeDraft(
        "youtube-summary",
        "YouTube Upload Summary",
        "youtube",
        generateYouTubeSummary(context, tokens),
        "Short one-line summary for quick posting."
      )
    );
  }

  drafts.push(
    makeDraft("hashtags", "Hashtag Suggestions", "generic", generateHashtags(context, preferences, tokens), "Editable rule-based hashtag list."),
    makeDraft(
      "alt-text",
      "Alt Text Draft",
      "generic",
      generateAltText(context, tokens),
      "Metadata-only alt text. Does not infer visual scene contents."
    ),
    makeDraft("short-caption", "Generic Short Caption", "generic", generateShortCaption(context, preferences, tokens), "Compact cross-platform caption.")
  );

  return drafts;
}
