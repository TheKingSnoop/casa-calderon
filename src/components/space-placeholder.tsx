import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMember, getMembers, type Member, type Space } from "@/lib/content";
import { pageTitle } from "@/lib/site";
import { withPlaceholder } from "@/lib/static-params";
import { MemberMasthead, MemberTabs } from "./member-tabs";

/**
 * Helpers for a space that only has a "coming soon" page so far (ADR-0006):
 * the tab exists, the content comes later. Each space's page.tsx wires these
 * up, so it can grow into a real page on its own.
 */
export function spacePlaceholder(
  space: Space,
  copy: { title: string; description: (firstName: string) => string },
) {
  const owner = (slug: string) => {
    const member = getMember(slug);
    return member?.spaces?.includes(space) ? member : undefined;
  };
  const firstName = (member: Member) => member.name.split(" ")[0];

  return {
    generateStaticParams: () =>
      withPlaceholder(
        getMembers()
          .filter((m) => m.spaces?.includes(space))
          .map((m) => ({ slug: m.slug })),
      ),

    generateMetadata: async ({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }): Promise<Metadata> => {
      const member = owner((await params).slug);
      if (!member) return {};
      return {
        title: pageTitle(`${copy.title} · ${member.name}`),
        description: copy.description(firstName(member)),
      };
    },

    Page: async ({ params }: { params: Promise<{ slug: string }> }) => {
      const member = owner((await params).slug);
      if (!member) notFound();
      return (
        <article className="mx-auto w-full max-w-3xl px-6 py-12">
          <MemberMasthead member={member} />
          <MemberTabs member={member} current={space} />
          <header className="mt-10 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {copy.title}
            </h1>
            <p className="text-muted">{copy.description(firstName(member))}</p>
          </header>
          <p className="mt-8 rounded-lg border border-dashed border-border p-6 text-muted">
            Coming soon. {firstName(member)} is still putting this together.
          </p>
        </article>
      );
    },
  };
}
