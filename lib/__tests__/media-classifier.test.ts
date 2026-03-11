import { classifyMedia } from "@/lib/media-classifier";
import { makeImageFixture, makeVideoFixture } from "@/lib/__tests__/test-fixtures";

describe("classifyMedia", () => {
  it("classifies mixed media and derives aggregate tags", () => {
    const media = [
      makeImageFixture({ id: "img-1", createdAt: "2026-03-11T08:00:00", width: 1080, height: 1920, latitude: 40.7128, longitude: -74.006 }),
      makeImageFixture({ id: "img-2", createdAt: "2026-03-11T08:05:00", width: 1080, height: 1080 }),
      makeVideoFixture({ id: "vid-1", createdAt: "2026-03-11T08:07:00" })
    ];

    const classification = classifyMedia(media);

    expect(classification.fileCount).toBe(3);
    expect(classification.imageCount).toBe(2);
    expect(classification.videoCount).toBe(1);
    expect(classification.hasGps).toBe(true);
    expect(classification.includesVideo).toBe(true);
    expect(classification.includesOnlyImages).toBe(false);
    expect(classification.albumSize).toBe("small");
    expect(classification.timeOfDay).toBe("morning");
    expect(classification.orientations).toEqual(expect.arrayContaining(["portrait", "square", "landscape"]));
  });

  it("ignores unsupported files for counts", () => {
    const media = [
      makeImageFixture({ id: "img-1" }),
      {
        id: "bad-1",
        fileName: "document.pdf",
        fileSize: 500,
        fileType: "application/pdf",
        kind: "unsupported" as const,
        metadata: {
          mimeType: "application/pdf",
          extension: "pdf",
          orientation: "unknown" as const,
          parseWarnings: ["Unsupported file format"]
        },
        unsupportedReason: "unsupported"
      }
    ];

    const classification = classifyMedia(media);

    expect(classification.fileCount).toBe(1);
    expect(classification.imageCount).toBe(1);
    expect(classification.videoCount).toBe(0);
    expect(classification.includesOnlyImages).toBe(true);
  });
});
