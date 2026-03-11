import { ContentContext, DraftOutput, UploadedMedia, UserPreferences } from "@/lib/types";

export const exampleSeedMedia: UploadedMedia[] = [
  {
    id: "seed-1",
    fileName: "bench-progress-1.jpg",
    fileSize: 2456000,
    fileType: "image/jpeg",
    kind: "image",
    metadata: {
      mimeType: "image/jpeg",
      extension: "jpg",
      createdAt: "2026-03-09T05:10:00.000Z",
      width: 4032,
      height: 3024,
      gps: {
        latitude: -27.4698,
        longitude: 153.0251
      },
      cameraMake: "Apple",
      cameraModel: "iPhone 14",
      orientation: "landscape",
      parseWarnings: []
    }
  },
  {
    id: "seed-2",
    fileName: "bench-progress-2.jpg",
    fileSize: 2510000,
    fileType: "image/jpeg",
    kind: "image",
    metadata: {
      mimeType: "image/jpeg",
      extension: "jpg",
      createdAt: "2026-03-09T05:13:00.000Z",
      width: 4032,
      height: 3024,
      gps: {
        latitude: -27.4698,
        longitude: 153.0251
      },
      cameraMake: "Apple",
      cameraModel: "iPhone 14",
      orientation: "landscape",
      parseWarnings: []
    }
  },
  {
    id: "seed-3",
    fileName: "bench-progress-3.jpg",
    fileSize: 2489000,
    fileType: "image/jpeg",
    kind: "image",
    metadata: {
      mimeType: "image/jpeg",
      extension: "jpg",
      createdAt: "2026-03-09T05:20:00.000Z",
      width: 4032,
      height: 3024,
      gps: {
        latitude: -27.4698,
        longitude: 153.0251
      },
      cameraMake: "Apple",
      cameraModel: "iPhone 14",
      orientation: "landscape",
      parseWarnings: []
    }
  }
];

export const exampleSeedSummary: Pick<ContentContext, "summary" | "classification"> = {
  summary: {
    fileCount: 3,
    mediaTypes: ["Image"],
    dateRangeText: "March 9, 2026",
    resolutionSet: ["4032x3024"],
    gpsFound: true,
    locationText: "Brisbane, Queensland",
    manualCategory: "project-progress",
    notesPreview: "Bench prototype iteration"
  },
  classification: {
    fileCount: 3,
    imageCount: 3,
    videoCount: 0,
    hasGps: true,
    orientations: ["landscape"],
    albumSize: "small",
    timeOfDay: "afternoon",
    includesVideo: false,
    includesOnlyImages: true
  }
};

export const exampleSeedDrafts: DraftOutput[] = [
  {
    key: "instagram-caption",
    label: "Instagram Caption",
    platform: "instagram",
    generated: "Progress update from Brisbane on March 9, 2026. Worked on bench prototype iteration and wanted to share a few photos.",
    current: "Progress update from Brisbane on March 9, 2026. Worked on bench prototype iteration and wanted to share a few photos."
  },
  {
    key: "hashtags",
    label: "Hashtag Suggestions",
    platform: "generic",
    generated: "#ProjectProgress #WorkshopLife #BuildInPublic #Brisbane",
    current: "#ProjectProgress #WorkshopLife #BuildInPublic #Brisbane"
  }
];

export const exampleSeedPreferences: UserPreferences = {
  tone: "professional",
  platforms: {
    instagram: true,
    facebook: true,
    youtube: true
  },
  hashtagCount: 8,
  locationFormat: "city-region",
  includeDates: true,
  includeEmojis: false,
  spelling: "us",
  enableReverseGeocoding: true,
  draftLength: "medium"
};
