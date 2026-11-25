import Link from "next/link";
import type { Collective } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { DraftBadge } from "./badges";
import { Logo } from "./logo";

const WIDTHS = [640, 1280, 1920];
const srcSet = (src: string, format: "avif" | "webp") =>
  WIDTHS.map((w) => `${src}-${w}.${format} ${w}w`).join(", ");

/**
 * Home page hero (FR-1). With `cover` in content/collective.md it's a
 * full-width photo with the text on top; without it, a plain text hero.
 */
export function Hero({ collective }: { collective: Collective }) {
  const { cover } = collective;
  const onPhoto = Boolean(cover);

  return (
    <section
      aria-labelledby="hero-title"
      className={onPhoto ? "relative isolate overflow-hidden" : undefined}
    >
      {cover && (
        <>
          <picture>
            <source
              type="image/avif"
              srcSet={srcSet(cover.src, "avif")}
              sizes="100vw"
            />
            {/* Static export: no image optimiser. `npm run images` pre-builds
                every size; the browser picks one via srcSet/sizes. */}
            <img
              src={`${cover.src}-1280.webp`}
              srcSet={srcSet(cover.src, "webp")}
              sizes="100vw"
              alt={cover.alt}
              fetchPriority="high"
              className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
          </picture>
          {/* Dark scrim so white text stays readable (WCAG AA) on any photo:
              even across the whole hero on phones, fading to the right on
              wider screens where the text sits on the left. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-black/60 sm:bg-transparent sm:bg-linear-to-r sm:from-black/80 sm:via-black/50 sm:to-black/10"
          />
        </>
      )}

      <div
        className={`mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 ${
          onPhoto ? "py-24 text-white sm:py-32" : "pt-16"
        }`}
      >
        <DraftBadge published={collective.published} />
        <Logo
          size={72}
          className={onPhoto ? "text-white" : "text-foreground"}
          // On the photo the logo is white, so its eye highlights go dark.
          highlight={onPhoto ? "#111111" : undefined}
        />
        <h1
          id="hero-title"
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          {siteConfig.name}
        </h1>
        <p className="max-w-2xl text-2xl text-balance">{collective.tagline}</p>
        <p
          className={`max-w-2xl text-lg ${onPhoto ? "text-white/85" : "text-muted"}`}
        >
          {collective.pitch}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/projects/"
            className={
              onPhoto
                ? "rounded-md bg-white px-5 py-2.5 font-medium text-neutral-900 focus-visible:outline-white"
                : "rounded-md bg-accent px-5 py-2.5 font-medium text-accent-foreground"
            }
          >
            See our work
          </Link>
          <Link
            href="#contact"
            className={
              onPhoto
                ? "rounded-md border border-white/70 px-5 py-2.5 font-medium text-white focus-visible:outline-white"
                : "rounded-md border border-border px-5 py-2.5 font-medium"
            }
          >
            Work with us
          </Link>
        </div>
      </div>
    </section>
  );
}
