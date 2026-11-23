import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, DraftBadge, TagList } from "@/components/badges";
import { Markdown } from "@/components/markdown";
import { getMember, getProject, getProjects } from "@/lib/content";
import { displayUrl, formatMonth } from "@/lib/format";
import { pageTitle } from "@/lib/site";
import { withPlaceholder } from "@/lib/static-params";

// Only projects from content/ exist; any other slug is a 404 (static export).
export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(getProjects().map((p) => ({ slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return { title: pageTitle(project.title), description: project.summary };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  // Credit only members whose own pages are visible. Unpublished members
  // haven't signed off, so they're counted but not named (NFR-6).
  const credited = project.members
    .map(getMember)
    .filter((m) => m !== undefined);
  const hiddenCount = project.members.length - credited.length;
  const links = [
    project.links?.live && { label: "Live site", href: project.links.live },
    project.links?.repo && { label: "Source code", href: project.links.repo },
    project.links?.caseStudy && {
      label: "Case study",
      href: project.links.caseStudy,
    },
  ].filter((l): l is { label: string; href: string } => Boolean(l));

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>
            {project.type === "professional" ? "Professional" : "Personal"}
          </Badge>
          {project.confidential && <Badge>Confidential</Badge>}
          {project.members.length > 1 && <Badge>Joint project</Badge>}
          <DraftBadge published={project.published} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {project.title}
        </h1>
        <p className="text-lg text-muted">{project.summary}</p>
        <p className="text-sm text-muted">
          <time dateTime={project.date}>{formatMonth(project.date)}</time>
          {credited.length > 0 && (
            <>
              {" · By "}
              {credited.map((member, i) => (
                <span key={member.slug}>
                  {i > 0 &&
                    (i === credited.length - 1 && hiddenCount === 0
                      ? " and "
                      : ", ")}
                  <Link
                    href={`/members/${member.slug}/`}
                    className="text-accent underline underline-offset-2"
                  >
                    {member.name}
                  </Link>
                </span>
              ))}
              {hiddenCount > 0 &&
                ` and ${hiddenCount} other${hiddenCount > 1 ? "s" : ""}`}
            </>
          )}
        </p>
      </header>

      {project.tech.length > 0 && (
        <section className="mt-8" aria-label="Tech stack">
          <TagList items={project.tech} label="Tech stack" />
        </section>
      )}

      {project.confidential ? (
        <p className="mt-8 rounded-lg bg-surface p-4 text-sm text-muted">
          This was professional work under a non-disclosure agreement, so
          it&apos;s described at a high level only, with no code or demo links.
        </p>
      ) : (
        links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-4" aria-label="Project links">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-accent underline underline-offset-2"
                >
                  {link.label}
                </a>
                <span className="text-sm text-muted">
                  {" "}
                  ({displayUrl(link.href)})
                </span>
              </li>
            ))}
          </ul>
        )
      )}

      {project.images && project.images.length > 0 && (
        <div className="mt-8 flex flex-col gap-6">
          {project.images.map((image) => (
            <figure key={image.src}>
              {/* Static export: no image optimiser; images are pre-sized in public/images. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full rounded-lg border border-border"
              />
            </figure>
          ))}
        </div>
      )}

      {project.body && (
        <div className="mt-10">
          <Markdown>{project.body}</Markdown>
        </div>
      )}
    </article>
  );
}
