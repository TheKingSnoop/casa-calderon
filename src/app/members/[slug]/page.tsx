import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { Badge, DraftBadge, TagList } from "@/components/badges";
import {
  CertificationList,
  CvActions,
  CvTimeline,
  LanguageList,
} from "@/components/cv";
import { EmailLink } from "@/components/email-link";
import { Markdown } from "@/components/markdown";
import { MemberTabs } from "@/components/member-tabs";
import { ProjectCard } from "@/components/project-card";
import { getMember, getMembers, getProjects, type Member } from "@/lib/content";
import { displayUrl, encodeEmail } from "@/lib/format";
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
  const experience = member.experience ?? [];
  const work = experience.filter((item) => item.kind !== "education");
  const education = experience.filter((item) => item.kind === "education");

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

      <MemberTabs member={member} current="profile" />

      <MemberLinks member={member} />

      {member.links.cv && (
        <div className="mt-8">
          <CvActions cv={member.links.cv} name={member.name} />
        </div>
      )}

      {member.bio && (
        <Section title="About">
          <Markdown>{member.bio}</Markdown>
        </Section>
      )}

      {work.length > 0 && (
        <Section title="Experience">
          <CvTimeline items={work} label="Experience" />
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Education">
          <CvTimeline items={education} label="Education" />
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

      {member.languages && member.languages.length > 0 && (
        <Section title="Languages">
          <LanguageList languages={member.languages} />
        </Section>
      )}

      {member.certifications && member.certifications.length > 0 && (
        <Section title="Certifications">
          <CertificationList certifications={member.certifications} />
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
  // The CV gets its own buttons (CvActions), so it isn't listed here.
  const { github, linkedin, website, email } = member.links;
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
