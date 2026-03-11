import { ContentCategory, DraftLength, ToneStyle } from "@/lib/types";

export interface ToneTemplateProfile {
  intro: Record<DraftLength, string>;
  connector: Record<DraftLength, string>;
  close: Record<DraftLength, string>;
  emoji: string;
}

export const TONE_TEMPLATE_REGISTRY: Record<ToneStyle, ToneTemplateProfile> = {
  simple: {
    intro: {
      short: "Quick update",
      medium: "Sharing a quick update",
      long: "Here is a full update from this set"
    },
    connector: {
      short: "from",
      medium: "captured during",
      long: "documenting"
    },
    close: {
      short: "More soon",
      medium: "Thanks for following along",
      long: "I appreciate you checking in on this update"
    },
    emoji: ""
  },
  friendly: {
    intro: {
      short: "A little life update",
      medium: "Sharing this moment with you",
      long: "Wanted to post a fuller update from this moment"
    },
    connector: {
      short: "at",
      medium: "from",
      long: "while spending time in"
    },
    close: {
      short: "Hope you enjoy this",
      medium: "Let me know what you think",
      long: "Thanks for being part of the journey"
    },
    emoji: "✨"
  },
  professional: {
    intro: {
      short: "Project update",
      medium: "Progress update",
      long: "Detailed progress update"
    },
    connector: {
      short: "from",
      medium: "recorded in",
      long: "captured during work in"
    },
    close: {
      short: "Feedback welcome",
      medium: "Appreciate your feedback",
      long: "I welcome feedback and suggestions on the next steps"
    },
    emoji: ""
  },
  adventurous: {
    intro: {
      short: "Adventure note",
      medium: "New adventure moment",
      long: "Adventure log from this outing"
    },
    connector: {
      short: "in",
      medium: "around",
      long: "while exploring"
    },
    close: {
      short: "On to the next stop",
      medium: "More adventures soon",
      long: "More trail notes coming in the next update"
    },
    emoji: "🌍"
  }
};

export const CATEGORY_HASHTAGS: Record<ContentCategory, string[]> = {
  "personal-update": ["LifeUpdate", "DailyMoment"],
  "travel-outing": ["TravelMoments", "OutAndAbout", "CityDiaries"],
  "project-progress": ["ProjectProgress", "BuildInPublic", "WorkUpdate"],
  "workshop-building": ["WorkshopLife", "MakerJourney", "HandsOnBuild"],
  "product-showcase": ["ProductShowcase", "NewRelease", "FeatureHighlight"],
  "nature-outdoors": ["NatureOutdoors", "TrailDay", "FreshAir"],
  "fitness-lifestyle": ["FitnessLifestyle", "HealthyRoutine", "MoveDaily"],
  "youtube-upload": ["NewVideo", "YouTubeUpload", "WatchNow"],
  other: ["ContentUpdate", "NewPost"]
};

export const TIME_OF_DAY_HASHTAGS = {
  morning: "MorningCapture",
  afternoon: "AfternoonUpdate",
  evening: "EveningRecap",
  night: "NightLog",
  unknown: "AnytimeUpdate"
};
