import Link from "next/link";
import type { Collective } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { DraftBadge } from "./badges";
import { Logo } from "./logo";

const WIDTHS = [640, 1280, 1920];
const srcSet = (src: string, format: "avif" | "webp") =>
  WIDTHS.map((w) => `${src}-${w}.${format} ${w}w`).join(", ");
const DARK = "(prefers-color-scheme: dark)";

/**
 * Home page hero (FR-1), from content/collective.md:
 *
 * - no `cover`:              plain text hero
 * - `cover.src` only:        full-width photo, white text on a dark scrim
 * - `cover.src` + `srcDark`: theme-aware. The light image in light mode and
 *                            the dark one in dark mode, with the text, scrim
 *                            and buttons following the page's colour tokens
 */
export function Hero({ collective }: { collective: Collective }) {
  const { cover } = collective;
  const style = !cover ? "plain" : cover.srcDark ? "themed" : "photo";

  const styles = {
    plain: {
      inner: "pt-16",
      pitch: "text-muted",
      primary: "bg-accent text-accent-foreground",
      secondary: "border border-border",
    },
    // White on a dark scrim works on any photo.
    photo: {
      inner: "py-24 text-white sm:py-32",
      pitch: "text-white/85",
      primary: "bg-white text-neutral-900 focus-visible:outline-white",
      secondary:
        "border border-white/70 text-white focus-visible:outline-white",
      scrim:
        "bg-black/60 sm:bg-transparent sm:bg-linear-to-r sm:from-black/80 sm:via-black/50 sm:to-black/10",
    },
    // Page tokens: dark text on a light wash (light mode), light text on a
    // dark wash (dark mode), matching the image shown in each mode.
    themed: {
      inner: "py-24 text-foreground sm:py-32",
      pitch: "text-foreground/80",
      primary: "bg-accent text-accent-foreground",
      secondary: "border border-foreground/40",
      scrim:
        "bg-background/70 sm:bg-transparent sm:bg-linear-to-r sm:from-background/90 sm:via-background/55 sm:to-transparent",
    },
  }[style];

  return (
    <section
      aria-labelledby="hero-title"
      className={cover ? "relative isolate overflow-hidden" : undefined}
    >
      {cover && (
        <>
          {/* Static export: no image optimiser. `npm run images` pre-builds
              every size; the browser picks the format, width and (for a
              themed cover) the light/dark version. The first matching
              <source> wins, so dark comes first. */}
          <picture>
            {cover.srcDark && (
              <>
                <source
                  media={DARK}
                  type="image/avif"
                  srcSet={srcSet(cover.srcDark, "avif")}
                  sizes="100vw"
                />
                <source
                  media={DARK}
                  type="image/webp"
                  srcSet={srcSet(cover.srcDark, "webp")}
                  sizes="100vw"
                />
              </>
            )}
            <source
              type="image/avif"
              srcSet={srcSet(cover.src, "avif")}
              sizes="100vw"
            />
            <img
              src={`${cover.src}-1280.webp`}
              srcSet={srcSet(cover.src, "webp")}
              sizes="100vw"
              alt={cover.alt}
              fetchPriority="high"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
          </picture>
          {/* Scrim: even on phones (text spans the width), fading to the
              right on wider screens where the text sits on the left. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 -z-10 ${"scrim" in styles ? styles.scrim : ""}`}
          />
        </>
      )}

      <div
        className={`mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 ${styles.inner}`}
      >
        <DraftBadge published={collective.published} />
        <Logo
          size={72}
          className={style === "photo" ? "text-white" : "text-foreground"}
          // White logo on a dark photo: its eye highlights go dark. Otherwise
          // the default (page background) matches whatever is behind it.
          highlight={style === "photo" ? "#111111" : undefined}
        />
        <h1
          id="hero-title"
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-2xl text-balance">{collective.tagline}</p>
        <p className={`max-w-2xl text-lg ${styles.pitch}`}>
          {collective.pitch}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects/"
            className={`rounded-md px-5 py-2.5 font-medium ${styles.primary}`}
          >
            See our work
          </Link>
          <Link
            href="#contact"
            className={`rounded-md px-5 py-2.5 font-medium ${styles.secondary}`}
          >
            Work with us
          </Link>
        </div>
      </div>
    </section>
  );
}
