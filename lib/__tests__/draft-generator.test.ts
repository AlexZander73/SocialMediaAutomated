import { buildContentContext } from "@/lib/content-context";
import { generateDraftOutputs } from "@/lib/draft-generator";
import { UserPreferences } from "@/lib/types";
import { basePreferences, makeImageFixture, makeVideoFixture } from "@/lib/__tests__/test-fixtures";

function buildTravelContext() {
  return buildContentContext({
    media: [makeImageFixture({ latitude: 51.5072, longitude: -0.1276 })],
    category: "travel-outing",
    manual: {
      whatHappened: "Walked along the river",
      whoIsThisFor: "Friends",
      extraNotes: ""
    },
    primaryLocation: {
      latitude: 51.5072,
      longitude: -0.1276,
      city: "London",
      region: "England",
      country: "United Kingdom",
      source: "geocoded"
    },
    locationFormat: "city-region",
    spelling: "us"
  });
}

describe("generateDraftOutputs", () => {
  it("applies travel single-photo Instagram special-case template", () => {
    const context = buildTravelContext();
    const drafts = generateDraftOutputs(context, { ...basePreferences, draftLength: "medium" });

    const instagram = drafts.find((draft) => draft.key === "instagram-caption");

    expect(instagram).toBeDefined();
    expect(instagram?.generated).toContain("A nice moment from London, England");
    expect(instagram?.generated).toContain("Category: Travel Outing");
  });

  it("returns only enabled platform outputs plus generic outputs", () => {
    const context = buildTravelContext();

    const preferences: UserPreferences = {
      ...basePreferences,
      platforms: {
        instagram: false,
        facebook: true,
        youtube: false
      }
    };

    const drafts = generateDraftOutputs(context, preferences);
    const keys = drafts.map((draft) => draft.key);

    expect(keys).toContain("facebook-post");
    expect(keys).toContain("hashtags");
    expect(keys).toContain("alt-text");
    expect(keys).toContain("short-caption");
    expect(keys).not.toContain("instagram-caption");
    expect(keys).not.toContain("youtube-titles");
  });

  it("generates three YouTube title variants and bounded unique hashtags", () => {
    const context = buildContentContext({
      media: [
        makeVideoFixture({ id: "vid-1", latitude: 35.6762, longitude: 139.6503 }),
        makeImageFixture({ id: "img-1", latitude: 35.6762, longitude: 139.6503 })
      ],
      category: "youtube-upload",
      manual: {
        whatHappened: "Published the build recap",
        whoIsThisFor: "Maker community",
        extraNotes: "Cut highlights from this week"
      },
      primaryLocation: {
        latitude: 35.6762,
        longitude: 139.6503,
        city: "Tokyo",
        region: "Tokyo",
        country: "Japan",
        source: "geocoded"
      },
      locationFormat: "city-region",
      spelling: "us"
    });

    const drafts = generateDraftOutputs(context, {
      ...basePreferences,
      hashtagCount: 5,
      draftLength: "long"
    });

    const youtubeTitles = drafts.find((draft) => draft.key === "youtube-titles")?.generated ?? "";
    const hashtags = drafts.find((draft) => draft.key === "hashtags")?.generated ?? "";
    const altText = drafts.find((draft) => draft.key === "alt-text")?.generated ?? "";

    expect(youtubeTitles.split("\n")).toHaveLength(3);
    expect(youtubeTitles).toContain("1. ");
    expect(youtubeTitles).toContain("2. ");
    expect(youtubeTitles).toContain("3. ");

    const tagList = hashtags.split(" ").filter(Boolean);
    expect(tagList.length).toBeLessThanOrEqual(5);
    expect(new Set(tagList).size).toBe(tagList.length);
    expect(tagList.every((tag) => tag.startsWith("#"))).toBe(true);

    expect(altText).toContain("Visual scene details are not inferred in this MVP");
  });
});
