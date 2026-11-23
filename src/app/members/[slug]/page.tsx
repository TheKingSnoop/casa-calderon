import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { Badge, DraftBadge, TagList } from "@/components/badges";
import { EmailLink } from "@/components/email-link";
import { Markdown } from "@/components/markdown";
import { ProjectCard } from "@/components/project-card";
import { getMember, getMembers, getProjects, type Member } from "@/lib/content";
import {
  displayUrl,
  encodeEmail,
  formatMonth,
  formatPeriod,
} from "@/lib/format";
import { pageTitle } from "@/lib/site";
import { withPlaceholder } from "@/lib/static-params";

// Only members from content/ exist; any other slug is a 404 (static export).
export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(getMembers().map((m) => ({ slug: m.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/members/[slug]">): Promise<Metadata> {
  const member = getMember((await params).slug);
  if (!member) return {};
  return {
    title: pageTitle(member.name),
    description: member.tagline ?? `${member.name}, ${member.role}`,
  };
}

export default async function MemberPage({
  params,
}: PageProps<"/members/[slug]">) {
  const member = getMember((await params).slug);
  if (!member) notFound();

  const projects = getProjects({ member: member.slug });
  const firstName = member.name.split(" ")[0];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar name={member.name} src={member.avatar} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <DraftBadge published={member.published} />
            {member.status && <Badge>{member.status}</Badge>}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {member.name}
          </h1>
          <p className="text-lg text-muted">{member.role}</p>
          {member.tagline && <p>{member.tagline}</p>}
        </div>
      </header>

      <MemberLinks member={member} />

      {member.bio && (
        <Section title="About">
          <Markdown>{member.bio}</Markdown>
        </Section>
      )}

      {member.skills && member.skills.length > 0 && (
        <Section title="Skills">
          <dl className="grid gap-4 sm:grid-cols-2">
            {member.skills.map((group) => (
              <div key={group.category} className="flex flex-col gap-2">
                <dt className="text-sm font-medium text-muted">
                  {group.category}
                </dt>
                <dd>
                  <TagList items={group.items} label={group.category} />
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {member.experience && member.experience.length > 0 && (
        <Section title="Experience">
          <ol className="flex flex-col gap-6 border-l border-border pl-6">
            {member.experience.map((item) => (
              <li
                key={`${item.org}-${item.title}-${item.start}`}
                className="flex flex-col gap-1"
              >
                <p className="font-medium">
                  {item.title} · {item.org}
                </p>
                <p className="text-sm text-muted">
                  {formatPeriod(item.start, item.end)}
                  {item.kind !== "work" && (
                    <>
                      {" "}
                      ·{" "}
                      {item.kind === "education" ? "Education" : "Achievement"}
                    </>
                  )}
                </p>
                {item.summary && <p>{item.summary}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {member.certifications && member.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="flex flex-col gap-3">
            {member.certifications.map((cert) => (
              <li key={`${cert.name}-${cert.date}`}>
                <p className="font-medium">{cert.name}</p>
                <p className="text-sm text-muted">
                  {cert.issuer} ·{" "}
                  <time dateTime={cert.date}>{formatMonth(cert.date)}</time>
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
        </Section>
      )}

      {member.interests && member.interests.length > 0 && (
        <Section title="Beyond the code">
          <TagList items={member.interests} label="Interests" />
        </Section>
      )}

      {member.kind === "core" && (
        <Section title="Projects">
          {projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-muted">
              No projects listed yet. {firstName} is working on it.
            </p>
          )}
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 flex flex-col gap-4" aria-label={title}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function MemberLinks({ member }: { member: Member }) {
  const { github, linkedin, website, cv, email } = member.links;
  const linkClass = "text-accent underline underline-offset-2";
  const items: { label: string; node: ReactNode }[] = [];

  if (github)
    items.push({
      label: "GitHub",
      node: (
        <a rel="me" href={github} className={linkClass}>
          {displayUrl(github)}
        </a>
      ),
    });
  if (linkedin)
    items.push({
      label: "LinkedIn",
      node: (
        <a rel="me" href={linkedin} className={linkClass}>
          {displayUrl(linkedin)}
        </a>
      ),
    });
  if (website)
    items.push({
      label: "Website",
      node: (
        <a rel="me" href={website} className={linkClass}>
          {displayUrl(website)}
        </a>
      ),
    });
  if (cv)
    items.push({
      label: "CV",
      node: (
        <a href={cv} className={linkClass}>
          Download CV
        </a>
      ),
    });
  if (email)
    items.push({
      label: "Email",
      node: <EmailLink encoded={encodeEmail(email)} className={linkClass} />,
    });

  if (items.length === 0) return null;
  return (
    <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex gap-2">
          <dt className="text-muted">{item.label}</dt>
          <dd>{item.node}</dd>
        </div>
      ))}
    </dl>
  );
}
