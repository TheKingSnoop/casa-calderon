import Link from "next/link";
import type { Collective } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { DraftBadge } from "./badges";
import { Logo } from "./logo";
import { ResponsivePicture } from "./responsive-picture";

/**
 * Logo above the site name in the hero. Off for now (Israel: cleaner
 * without it); set to true to bring it back. The header logo is unaffected.
 */
const SHOW_HERO_LOGO = false;

/** One full-width cover image (see ResponsivePicture) */
function CoverPicture({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <ResponsivePicture
      src={src}
      alt={alt}
      sizes="100vw"
      priority
      className={className}
      imgClassName="absolute inset-0 -z-10 h-full w-full object-cover"
    />
  );
}

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
          {/* A themed cover renders both versions and CSS shows the one
              for the current theme (OS setting or the header toggle). A
              <picture media="(prefers-color-scheme: dark)"> can't follow the
              toggle. Cost: both images download, ~10-20 KB extra at these sizes.
              display:none also hides the other version from screen readers. */}
          {cover.srcDark ? (
            <>
              <CoverPicture
                src={cover.src}
                alt={cover.alt}
                className="only-light"
              />
              <CoverPicture
                src={cover.srcDark}
                alt={cover.alt}
                className="only-dark"
              />
            </>
          ) : (
            <CoverPicture src={cover.src} alt={cover.alt} />
          )}
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
        {SHOW_HERO_LOGO && (
          <Logo
            size={72}
            className={style === "photo" ? "text-white" : "text-foreground"}
            // White logo on a dark photo: its eye highlights go dark. Otherwise
            // the default (page background) matches whatever is behind it.
            highlight={style === "photo" ? "#111111" : undefined}
          />
        )}
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
