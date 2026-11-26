import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/badges";
import { MemberMasthead, MemberTabs } from "@/components/member-tabs";
import { ResponsivePicture } from "@/components/responsive-picture";
import { getMember, getMembers, getRecipes } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageTitle } from "@/lib/site";
import { withPlaceholder } from "@/lib/static-params";

// Only members with the kitchen space have this page (static export).
export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    getMembers()
      .filter((m) => m.spaces?.includes("kitchen"))
      .map((m) => ({ slug: m.slug })),
  );
}

function kitchenOwner(slug: string) {
  const member = getMember(slug);
  return member?.spaces?.includes("kitchen") ? member : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/members/[slug]/kitchen">): Promise<Metadata> {
  const member = kitchenOwner((await params).slug);
  if (!member) return {};
  const firstName = member.name.split(" ")[0];
  return {
    title: pageTitle(`${firstName}'s kitchen`),
    description: `Recipes from ${firstName}'s kitchen.`,
  };
}

/** The Kitchen space (FR-43): recipe cards, newest first */
export default async function KitchenPage({
  params,
}: PageProps<"/members/[slug]/kitchen">) {
  const member = kitchenOwner((await params).slug);
  if (!member) notFound();

  const recipes = getRecipes(member.slug);
  const firstName = member.name.split(" ")[0];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <MemberMasthead member={member} />
      <MemberTabs member={member} current="kitchen" />

      <header className="mt-10 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Kitchen
        </h1>
        <p className="text-muted">
          Recipes from {firstName}&apos;s kitchen, newest first.
        </p>
      </header>

      {recipes.length > 0 ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {recipes.map((recipe) => {
            const [photo] = recipe.photos;
            return (
              <li key={recipe.slug}>
                <Link
                  href={`/members/${member.slug}/kitchen/${recipe.slug}/`}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border hover:border-foreground/30"
                >
                  {photo && (
                    <ResponsivePicture
                      src={photo.src}
                      alt=""
                      sizes="(min-width: 640px) 360px, 100vw"
                      imgClassName="aspect-[4/3] w-full object-cover"
                    />
                  )}
                  <div className="flex flex-col gap-1 p-4">
                    <div>
                      <DraftBadge published={recipe.published} />
                    </div>
                    <h2 className="font-semibold group-hover:underline">
                      {recipe.title}
                    </h2>
                    <time dateTime={recipe.date} className="text-sm text-muted">
                      {formatDate(recipe.date)}
                    </time>
                    {recipe.summary && (
                      <p className="mt-1 text-sm">{recipe.summary}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 text-muted">
          No recipes yet. {firstName} is cooking something up.
        </p>
      )}
    </article>
  );
}
