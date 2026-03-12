import { ContentCategory, ToneStyle, UserPreferences } from "@/lib/types";

export const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "heic", "heif", "heics", "heifs"];
export const SUPPORTED_VIDEO_EXTENSIONS = ["mp4", "mov"];

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/heics",
  "image/heifs"
];

export const SUPPORTED_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime"];

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
  "personal-update": "Personal update",
  "travel-outing": "Travel / outing",
  "project-progress": "Project progress",
  "workshop-building": "Workshop / building",
  "product-showcase": "Product / showcase",
  "nature-outdoors": "Nature / outdoors",
  "fitness-lifestyle": "Fitness / lifestyle",
  "youtube-upload": "YouTube upload",
  other: "Other"
};

export const CATEGORIES: ContentCategory[] = [
  "personal-update",
  "travel-outing",
  "project-progress",
  "workshop-building",
  "product-showcase",
  "nature-outdoors",
  "fitness-lifestyle",
  "youtube-upload",
  "other"
];

export const TONE_LABELS: Record<ToneStyle, string> = {
  simple: "Simple",
  friendly: "Friendly",
  professional: "Professional",
  adventurous: "Adventurous"
};

export const DEFAULT_PREFERENCES: UserPreferences = {
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
  enableReverseGeocoding: true,
  draftLength: "medium"
};

export const MAX_UPLOAD_BYTES = 500 * 1024 * 1024;

export const LOCAL_STORAGE_KEYS = {
  preferences: "social-post-helper/preferences",
  lastSession: "social-post-helper/last-session"
};
