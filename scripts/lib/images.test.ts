import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { IMAGE_FORMATS, IMAGE_WIDTHS, processImage } from "./images";

let dir: string;
let source: string;

// sharp caches open file handles; on Windows that locks the temp folder and
// the cleanup below fails with EPERM.
sharp.cache(false);

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "images-test-"));
  source = path.join(dir, "photo.jpg");
  // A 2400×1200 JPEG carrying EXIF data, like a phone photo.
  await sharp({
    create: { width: 2400, height: 1200, channels: 3, background: "#8a6a4e" },
  })
    .jpeg()
    .withExif({
      IFD0: { Make: "TestPhone", Model: "Camera 1", Artist: "Someone" },
    })
    .toFile(source);
});

afterAll(() =>
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }),
);

describe("processImage", () => {
  it("the test photo really has metadata to strip", async () => {
    expect((await sharp(source).metadata()).exif).toBeDefined();
  });

  it("writes every width in every format", async () => {
    const { files } = await processImage(
      source,
      path.join(dir, "out"),
      "cover",
    );
    const names = files.map((f) => path.basename(f)).sort();
    const expected = IMAGE_WIDTHS.flatMap((w) =>
      IMAGE_FORMATS.map((f) => `cover-${w}.${f}`),
    ).sort();
    expect(names).toEqual(expected);
  });

  it("strips all metadata (EXIF, including GPS, IPTC, XMP)", async () => {
    const { files } = await processImage(
      source,
      path.join(dir, "out2"),
      "cover",
    );
    for (const file of files) {
      const meta = await sharp(file).metadata();
      expect(meta.exif, file).toBeUndefined();
      expect(meta.iptc, file).toBeUndefined();
      expect(meta.xmp, file).toBeUndefined();
    }
  });

  it("resizes to the target widths, keeping the aspect ratio", async () => {
    const { files, width, height } = await processImage(
      source,
      path.join(dir, "out3"),
      "cover",
    );
    expect({ width, height }).toEqual({ width: 1920, height: 960 });
    const small = files.find((f) => f.endsWith("cover-640.webp"))!;
    expect((await sharp(small).metadata()).width).toBe(640);
  });

  it("never upscales a small image", async () => {
    const tiny = path.join(dir, "tiny.png");
    await sharp({
      create: { width: 500, height: 300, channels: 3, background: "#000" },
    })
      .png()
      .toFile(tiny);
    const { width } = await processImage(tiny, path.join(dir, "out4"), "tiny");
    expect(width).toBe(500);
  });

  it("rejects names that can't be URLs", async () => {
    await expect(processImage(source, dir, "My Photo")).rejects.toThrow(
      "lowercase letters",
    );
  });
});
