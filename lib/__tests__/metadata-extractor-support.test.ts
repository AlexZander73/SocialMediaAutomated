import { isSupportedMediaFile } from "@/lib/metadata-extractor";

function mockFile(name: string, type: string): File {
  return {
    name,
    type
  } as File;
}

describe("isSupportedMediaFile", () => {
  it("accepts HEIC/HEIF extension and MIME variants", () => {
    const files = [
      mockFile("IMG_1001.HEIC", ""),
      mockFile("IMG_1002.heif", ""),
      mockFile("burst.heics", ""),
      mockFile("photo", "image/heic"),
      mockFile("sequence", "image/heic-sequence"),
      mockFile("sequence2", "image/heif-sequence")
    ];

    for (const file of files) {
      expect(isSupportedMediaFile(file)).toBe(true);
    }
  });

  it("rejects unsupported document formats", () => {
    expect(isSupportedMediaFile(mockFile("notes.pdf", "application/pdf"))).toBe(false);
  });
});
