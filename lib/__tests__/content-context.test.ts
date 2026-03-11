import { buildContentContext } from "@/lib/content-context";
import { makeImageFixture } from "@/lib/__tests__/test-fixtures";

describe("buildContentContext", () => {
  it("builds summary details and fallback location text when no GPS exists", () => {
    const context = buildContentContext({
      media: [
        makeImageFixture({ id: "img-1", createdAt: "2026-03-10T16:10:00.000Z", width: 2000, height: 1000 }),
        makeImageFixture({ id: "img-2", createdAt: "2026-03-11T16:10:00.000Z", width: 3000, height: 2000 })
      ],
      category: "project-progress",
      manual: {
        whatHappened: "Finished frame assembly",
        whoIsThisFor: "Maker group",
        extraNotes: "Tested alignment"
      },
      locationFormat: "full",
      spelling: "us"
    });

    expect(context.classification.fileCount).toBe(2);
    expect(context.summary.mediaTypes).toEqual(["Image"]);
    expect(context.summary.gpsFound).toBe(false);
    expect(context.summary.locationText).toBe("No location metadata found");
    expect(context.summary.dateRangeText).toContain("2026");
    expect(context.summary.resolutionSet).toEqual(expect.arrayContaining(["2000x1000", "3000x2000"]));
  });

  it("uses provided resolved location and respects city-region formatting", () => {
    const context = buildContentContext({
      media: [makeImageFixture({ id: "img-1", latitude: -27.4698, longitude: 153.0251 })],
      category: "travel-outing",
      manual: {
        whatHappened: "Riverfront walk",
        whoIsThisFor: "Friends",
        extraNotes: ""
      },
      primaryLocation: {
        latitude: -27.4698,
        longitude: 153.0251,
        city: "Brisbane",
        region: "Queensland",
        country: "Australia",
        source: "geocoded"
      },
      locationFormat: "city-region",
      spelling: "us"
    });

    expect(context.summary.gpsFound).toBe(true);
    expect(context.summary.locationText).toBe("Brisbane, Queensland");
  });
});
