// Plain constants (no Node.js imports), so components can use them too.
/**
 * The files `npm run images` produces for a base path. Must match
 * IMAGE_WIDTHS / IMAGE_FORMATS in scripts/lib/images.ts.
 */
export const COVER_WIDTHS = [640, 1280, 1920] as const;
export const COVER_FORMATS = ["avif", "webp"] as const;
export function coverFiles(src: string): string[] {
  return COVER_WIDTHS.flatMap((w) =>
    COVER_FORMATS.map((f) => `${src}-${w}.${f}`),
  );
}
