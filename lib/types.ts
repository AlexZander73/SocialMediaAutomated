export type MediaKind = "image" | "video" | "unsupported";

export type Orientation = "portrait" | "landscape" | "square" | "unknown";

export type ContentCategory =
  | "personal-update"
  | "travel-outing"
  | "project-progress"
  | "workshop-building"
  | "product-showcase"
  | "nature-outdoors"
  | "fitness-lifestyle"
  | "youtube-upload"
  | "other";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  displayName?: string;
  city?: string;
  region?: string;
  country?: string;
  source: "geocoded" | "coordinates";
}

export interface ExtractedMetadata {
  mimeType: string;
  extension: string;
  createdAt?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  gps?: Coordinates;
  cameraMake?: string;
  cameraModel?: string;
  orientation: Orientation;
  parseWarnings: string[];
}

export interface UploadedMedia {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  kind: MediaKind;
  previewUrl?: string;
  metadata: ExtractedMetadata;
  unsupportedReason?: string;
}

export interface ManualInputs {
  whatHappened: string;
  whoIsThisFor: string;
  extraNotes: string;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night" | "unknown";
export type AlbumSize = "single" | "small" | "medium" | "large";

export interface MediaClassification {
  fileCount: number;
  imageCount: number;
  videoCount: number;
  hasGps: boolean;
  orientations: Orientation[];
  albumSize: AlbumSize;
  timeOfDay: TimeOfDay;
  includesVideo: boolean;
  includesOnlyImages: boolean;
}

export interface DetectedSummary {
  fileCount: number;
  mediaTypes: string[];
  dateRangeText: string;
  resolutionSet: string[];
  gpsFound: boolean;
  locationText: string;
  manualCategory: ContentCategory;
  notesPreview: string;
}

export interface ContentContext {
  media: UploadedMedia[];
  category: ContentCategory;
  manual: ManualInputs;
  classification: MediaClassification;
  summary: DetectedSummary;
  primaryLocation?: ResolvedLocation;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export type ToneStyle = "simple" | "friendly" | "professional" | "adventurous";

export interface PlatformToggles {
  instagram: boolean;
  facebook: boolean;
  youtube: boolean;
}

export type LocationFormat = "full" | "city-region" | "coordinates" | "hidden";
export type DraftLength = "short" | "medium" | "long";
export type SpellingStyle = "us" | "uk";

export interface UserPreferences {
  tone: ToneStyle;
  platforms: PlatformToggles;
  hashtagCount: number;
  locationFormat: LocationFormat;
  includeDates: boolean;
  includeEmojis: boolean;
  spelling: SpellingStyle;
  enableReverseGeocoding: boolean;
  draftLength: DraftLength;
}

export type DraftKey =
  | "instagram-caption"
  | "facebook-post"
  | "youtube-titles"
  | "youtube-description"
  | "youtube-summary"
  | "hashtags"
  | "alt-text"
  | "short-caption";

export interface DraftOutput {
  key: DraftKey;
  label: string;
  platform: "instagram" | "facebook" | "youtube" | "generic";
  generated: string;
  current: string;
  description?: string;
}

export interface SavedSession {
  savedAt: string;
  context: ContentContext;
  drafts: DraftOutput[];
  preferences: UserPreferences;
}
