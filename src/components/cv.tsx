import type { Member } from "@/lib/content";
import { formatMonth, formatPeriod } from "@/lib/format";

type ExperienceItem = NonNullable<Member["experience"]>[number];

/**
 * The CV as a timeline (FR-12): one entry per role, newest first (the order
 * they're written in the member file), with location and bullet points.
 */
export function CvTimeline({
  items,
  label,
}: {
  items: ExperienceItem[];
  label: string;
}) {
  return (
    <ol
      aria-label={label}
      className="flex flex-col gap-8 border-l border-border pl-6"
    >
      {items.map((item) => (
        <li
          key={`${item.org}-${item.title}-${item.start ?? item.end}`}
          className="relative flex flex-col gap-1"
        >
          {/* Dot on the timeline line (decorative) */}
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[calc(1.875rem+0.5px)] size-3 rounded-full border-2 border-accent bg-background"
          />
          <p className="text-sm text-muted">
            {formatPeriod(item.start, item.end)}
            {item.location && <> · {item.location}</>}
            {item.kind === "achievement" && <> · Achievement</>}
          </p>
          <h3 className="font-semibold">
            {item.title}
            <span className="font-normal text-muted"> · {item.org}</span>
          </h3>
          {item.summary && <p className="text-sm text-muted">{item.summary}</p>}
          {item.highlights && item.highlights.length > 0 && (
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 marker:text-muted">
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

/** "View PDF" opens the browser's own PDF viewer; "Download" saves it. */
export function CvActions({ cv, name }: { cv: string; name: string }) {
  const fileName = `${name.replace(/\s+/g, "-")}-CV.pdf`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={cv}
        download={fileName}
        className="rounded-md bg-accent px-5 py-2.5 font-medium text-accent-foreground"
      >
        Download CV<span className="sr-only"> as a PDF</span>
      </a>
      <a
        href={cv}
        target="_blank"
        rel="noopener"
        className="rounded-md border border-border px-5 py-2.5 font-medium"
      >
        View PDF<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <p className="text-sm text-muted">Plain, ATS-friendly version</p>
    </div>
  );
}

export function LanguageList({
  languages,
}: {
  languages: NonNullable<Member["languages"]>;
}) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {languages.map((language) => (
        <div key={language.name} className="flex flex-col">
          <dt className="font-medium">{language.name}</dt>
          {language.level && (
            <dd className="text-sm text-muted">{language.level}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

export function CertificationList({
  certifications,
}: {
  certifications: NonNullable<Member["certifications"]>;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {certifications.map((cert) => (
        <li key={`${cert.name}-${cert.date ?? ""}`}>
          <p className="font-medium">{cert.name}</p>
          <p className="text-sm text-muted">
            {cert.issuer}
            {cert.date && (
              <>
                {" · "}
                <time dateTime={cert.date}>{formatMonth(cert.date)}</time>
              </>
            )}
            {cert.url && (
              <>
                {" · "}
                <a
                  href={cert.url}
                  className="text-accent underline underline-offset-2"
                >
                  Verify<span className="sr-only"> {cert.name}</span>
                </a>
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
