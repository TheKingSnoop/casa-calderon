import { mkdirSync } from "node:fs";
import * as path from "node:path";
import sharp from "sharp";
import { COVER_FORMATS, COVER_WIDTHS } from "../../src/lib/content/loader";

/**
 * Turns one source image into web-ready files:
 *   <outDir>/<name>-640.avif  <name>-640.webp
 *   <outDir>/<name>-1280.avif <name>-1280.webp
 *   <outDir>/<name>-1920.avif <name>-1920.webp
 *
 * - Applies the EXIF orientation first (so phone photos aren't sideways),
 *   then writes files with NO metadata: sharp drops EXIF (camera, date,
 *   GPS location), IPTC and XMP unless asked to keep them. Tests check this.
 * - Never upscales: a small source keeps its own size at the larger widths.
 */
// One source of truth: the content loader checks these exact files exist.
export const IMAGE_WIDTHS = COVER_WIDTHS;
export const IMAGE_FORMATS = COVER_FORMATS;

export type ProcessedImage = {
  files: string[];
  /** Pixel size of the largest output, for width/height attributes */
  width: number;
  height: number;
};

export async function processImage(
  input: string,
  outDir: string,
  name: string,
): Promise<ProcessedImage> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `Image name "${name}" must use lowercase letters, numbers and hyphens`,
    );
  }
  mkdirSync(outDir, { recursive: true });

  const files: string[] = [];
  let largest = { width: 0, height: 0 };
  for (const width of IMAGE_WIDTHS) {
    // .rotate() with no argument = auto-orient from EXIF, before it's dropped
    const resized = sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true });
    for (const format of IMAGE_FORMATS) {
      const file = path.join(outDir, `${name}-${width}.${format}`);
      const info = await resized
        .clone()
        .toFormat(format, { quality: format === "avif" ? 55 : 78 })
        .toFile(file);
      files.push(file);
      if (width === IMAGE_WIDTHS.at(-1)) {
        largest = { width: info.width, height: info.height };
      }
    }
  }
  return { files, ...largest };
}
