import Link from "next/link";
import type { Project } from "@/lib/content";
import { formatMonth } from "@/lib/format";
import { Badge, DraftBadge } from "./badges";

/** What a card needs: everything except the (possibly long) Markdown body. */
export type ProjectCardData = Omit<Project, "body">;

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="relative flex flex-col gap-3 rounded-lg border border-border p-5 transition-colors hover:border-accent">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          {project.type === "professional" ? "Professional" : "Personal"}
        </Badge>
        {project.confidential && <Badge>Confidential</Badge>}
        {project.members.length > 1 && <Badge>Joint project</Badge>}
        <DraftBadge published={project.published} />
      </div>
      <h3 className="text-lg font-semibold">
        {/* The ::after overlay makes the whole card clickable, with one link
            for screen readers instead of several. */}
        <Link
          href={`/projects/${project.slug}/`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {project.title}
        </Link>
      </h3>
      <p className="text-muted">{project.summary}</p>
      <p className="mt-auto text-sm text-muted">
        <time dateTime={project.date}>{formatMonth(project.date)}</time>
        {project.tech.length > 0 && (
          <> · {project.tech.slice(0, 4).join(", ")}</>
        )}
      </p>
    </article>
  );
}
