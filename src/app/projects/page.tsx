import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectBrowser, ProjectGrid } from "@/components/project-browser";
import type { ProjectCardData } from "@/components/project-card";
import { getMembers, getProjects } from "@/lib/content";
import { pageTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: pageTitle("Projects"),
  description:
    "Professional and personal projects by the Calderon Patiño family, solo and together.",
};

export default function ProjectsPage() {
  // Card-sized data only: the Markdown bodies aren't needed for the list,
  // so they aren't sent to the browser.
  const projects: ProjectCardData[] = getProjects().map(
    ({ body: _body, ...card }) => card,
  );
  // Filter options: visible members who have at least one visible project.
  const members = getMembers()
    .filter((m) => projects.some((p) => p.members.includes(m.slug)))
    .map((m) => ({ slug: m.slug, name: m.name }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="text-lg text-muted">
          What we&apos;ve built: professional and personal, solo and together.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-muted">
          No projects published yet. Check back soon.
        </p>
      ) : (
        // useSearchParams needs a Suspense boundary in a static export. The
        // fallback (also what you get without JavaScript) is the full list.
        <Suspense fallback={<ProjectGrid projects={projects} />}>
          <ProjectBrowser projects={projects} members={members} />
        </Suspense>
      )}
    </div>
  );
}
