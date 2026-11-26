import { COVER_WIDTHS } from "@/lib/content/images";

const srcSet = (src: string, format: "avif" | "webp") =>
  COVER_WIDTHS.map((w) => `${src}-${w}.${format} ${w}w`).join(", ");

/** The largest size `npm run images` makes, e.g. for "open full size" links */
export const fullSizeSrc = (src: string) =>
  `${src}-${COVER_WIDTHS.at(-1)}.webp`;

/**
 * An image made by `npm run images`, as <picture>: AVIF with a WebP
 * fallback, in every width it produces. Static export has no image
 * optimiser, so the browser picks the format and width itself.
 *
 * `src` is the base path without width/extension, e.g. "/images/site/cover".
 * `sizes` tells the browser how wide the image is shown, so it downloads the
 * smallest file that's sharp enough.
 */
export function ResponsivePicture({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** For the main image at the top of a page: load it first */
  priority?: boolean;
}) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(src, "avif")} sizes={sizes} />
      <img
        src={`${src}-1280.webp`}
        srcSet={srcSet(src, "webp")}
        sizes={sizes}
        alt={alt}
        className={imgClassName}
        {...(priority
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const, decoding: "async" as const })}
      />
    </picture>
  );
}
