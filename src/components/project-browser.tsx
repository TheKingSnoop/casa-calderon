"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  filterProjects,
  filtersToQuery,
  parseFilters,
  type ProjectFilters,
} from "@/lib/project-filters";
import { ProjectCard, type ProjectCardData } from "./project-card";

export type MemberOption = { slug: string; name: string };

/**
 * Filterable project grid. Filters live in the URL (?member=&type=) so a
 * view can be shared or bookmarked. Rendered inside <Suspense>: until this
 * client component loads (or if JavaScript is off), the fallback shows the
 * full, unfiltered list.
 */
export function ProjectBrowser({
  projects,
  members,
}: {
  projects: ProjectCardData[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const slugs = members.map((m) => m.slug);

  // The filters live in component state, and the URL is updated from it.
  // Why not read them straight from the URL? router.replace() updates the
  // URL asynchronously: change "Member" then quickly "Type", and the second
  // change would be built from the old URL, silently dropping the member
  // (caught by the e2e tests on a busy machine).
  const query = searchParams.toString();
  const [syncedQuery, setSyncedQuery] = useState(query);
  const [filters, setFilters] = useState(() =>
    parseFilters(searchParams, slugs),
  );
  // If the URL changes for any other reason (e.g. following a link to a
  // filtered view), adopt it: React's "adjust state when a prop changes" pattern.
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setFilters(parseFilters(searchParams, slugs));
  }

  const visible = filterProjects(projects, filters);
  const active = Boolean(filters.member || filters.type);

  const update = (next: ProjectFilters) => {
    setFilters(next);
    router.replace(`${pathname}${filtersToQuery(next)}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        aria-label="Filter projects"
        className="flex flex-wrap items-end gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Member</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={filters.member ?? ""}
            onChange={(e) =>
              update({ ...filters, member: e.target.value || undefined })
            }
          >
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Type</span>
          <select
            className="rounded-md border border-border bg-background px-3 py-2"
            value={filters.type ?? ""}
            onChange={(e) =>
              update({
                ...filters,
                type: (e.target.value || undefined) as ProjectFilters["type"],
              })
            }
          >
            <option value="">All types</option>
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
          </select>
        </label>

        {active && (
          <button
            type="button"
            className="cursor-pointer py-2 text-sm text-accent underline underline-offset-2"
            onClick={() => update({})}
          >
            Clear filters
          </button>
        )}
      </form>

      {/* Announced to screen readers when the filters change (WCAG 4.1.3) */}
      <p className="text-sm text-muted" role="status" aria-live="polite">
        Showing {visible.length} of {projects.length}{" "}
        {projects.length === 1 ? "project" : "projects"}
      </p>

      {visible.length > 0 ? (
        <ProjectGrid projects={visible} />
      ) : (
        <p className="rounded-lg bg-surface p-6 text-muted">
          No projects match these filters.{" "}
          <button
            type="button"
            className="cursor-pointer text-accent underline underline-offset-2"
            onClick={() => update({})}
          >
            Show all projects
          </button>
        </p>
      )}
    </div>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectCardData[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
