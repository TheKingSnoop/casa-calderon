import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Hero } from "@/components/hero";
import { Markdown } from "@/components/markdown";
import { MemberCard } from "@/components/member-card";
import { ProjectCard } from "@/components/project-card";
import { getCollective, getMembers, getProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function generateMetadata(): Metadata {
  const collective = getCollective();
  return collective ? { description: collective.pitch } : {};
}

/**
 * The collective "studio" page (FR-1 to FR-7). Its text comes from
 * content/collective.md; until the family publishes that file, the live
 * site keeps showing "Coming soon".
 */
export default function HomePage() {
  const collective = getCollective();
  if (!collective) return <ComingSoon />;

  const team = getMembers().filter((m) => m.kind === "core");
  const projects = getProjects();
  const featured = projects.filter((p) => p.featured);
  const joint = projects.filter((p) => p.members.length > 1 && !p.featured);

  return (
    <>
      {/* FR-1: hero (full width when there's a cover photo) */}
      <Hero collective={collective} />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-6 py-16">
        {/* FR-4: what we offer */}
        <Section id="services" title="What we offer">
          <ul className="grid gap-4 sm:grid-cols-3">
            {collective.services.map((service) => (
              <li
                key={service.title}
                className="flex flex-col gap-2 rounded-lg bg-surface p-5"
              >
                <h3 className="font-semibold">{service.title}</h3>
                <p className="text-muted">{service.description}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* FR-2: the team */}
        {team.length > 0 && (
          <Section id="team" title="Meet the team">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <MemberCard key={member.slug} member={member} />
              ))}
            </div>
          </Section>
        )}

        {/* FR-3: featured work */}
        {featured.length > 0 && (
          <Section
            id="featured"
            title="Featured work"
            action={
              <Link
                href="/projects/"
                className="text-accent underline underline-offset-2"
              >
                All projects
              </Link>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {featured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </Section>
        )}

        {/* FR-5: work done by two or more of us (not already featured) */}
        {joint.length > 0 && (
          <Section id="together" title="Built together">
            <div className="grid gap-4 sm:grid-cols-2">
              {joint.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </Section>
        )}

        {/* FR-7: our story */}
        {collective.story && (
          <Section id="story" title="Our story">
            <div className="max-w-2xl">
              <Markdown>{collective.story}</Markdown>
            </div>
          </Section>
        )}

        {/* FR-6: contact. Per member for now; a shared address comes with the domain (M5). */}
        <Section id="contact" title="Work with us">
          {collective.contact && (
            <p className="max-w-2xl text-lg">{collective.contact}</p>
          )}
          {team.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {team.map((member) => (
                <li key={member.slug}>
                  <Link
                    href={`/members/${member.slug}/`}
                    className="text-accent underline underline-offset-2"
                  >
                    Contact {member.name.split(" ")[0]}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}

function Section({
  id,
  title,
  action,
  children,
}: {
  id: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-8 flex-col gap-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id={`${id}-title`}
          className="text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Shown until content/collective.md is published (the live site today). */
function ComingSoon() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-md text-lg text-muted">{siteConfig.description}</p>
      <p className="text-sm uppercase tracking-widest text-muted">
        Coming soon
      </p>
    </div>
  );
}
