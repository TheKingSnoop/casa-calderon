import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemberMasthead, MemberTabs } from "@/components/member-tabs";
import { ProjectCard } from "@/components/project-card";
import { getMember, getMembers, getProjects } from "@/lib/content";
import { pageTitle } from "@/lib/site";
import { withPlaceholder } from "@/lib/static-params";

// Only members with the "projects" space have this tab; everyone else shows
// their projects on the profile page.
export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    getMembers()
      .filter((m) => m.spaces?.includes("projects"))
      .map((m) => ({ slug: m.slug })),
  );
}

function owner(slug: string) {
  const member = getMember(slug);
  return member?.spaces?.includes("projects") ? member : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/members/[slug]/projects">): Promise<Metadata> {
  const member = owner((await params).slug);
  if (!member) return {};
  return {
    title: pageTitle(`Projects · ${member.name}`),
    description: `Projects by ${member.name}, professional and personal.`,
  };
}

/** A member's projects as their own tab (FR-13, ADR-0006) */
export default async function MemberProjectsPage({
  params,
}: PageProps<"/members/[slug]/projects">) {
  const member = owner((await params).slug);
  if (!member) notFound();

  const projects = getProjects({ member: member.slug });
  const firstName = member.name.split(" ")[0];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <MemberMasthead member={member} />
      <MemberTabs member={member} current="projects" />

      <header className="mt-10 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="text-muted">
          What {firstName} has built, professional and personal.
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-muted">
          No projects listed yet. {firstName} is working on it.
        </p>
      )}
    </article>
  );
}
