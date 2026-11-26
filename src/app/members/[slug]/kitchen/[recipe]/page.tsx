import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBadge } from "@/components/badges";
import { Markdown } from "@/components/markdown";
import { MemberMasthead, MemberTabs } from "@/components/member-tabs";
import {
  fullSizeSrc,
  ResponsivePicture,
} from "@/components/responsive-picture";
import { getMember, getMembers, getRecipe, getRecipes } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { splitSections } from "@/lib/recipe";
import { pageTitle } from "@/lib/site";
import { PLACEHOLDER_SLUG, withPlaceholder } from "@/lib/static-params";

// Only recipes in content/ exist; anything else is a 404 (static export).
export const dynamicParams = false;

export function generateStaticParams() {
  return withPlaceholder(
    getMembers().flatMap((member) =>
      getRecipes(member.slug).map((recipe) => ({
        slug: member.slug,
        recipe: recipe.slug,
      })),
    ),
    { slug: PLACEHOLDER_SLUG, recipe: PLACEHOLDER_SLUG },
  );
}

async function load(
  params: PageProps<"/members/[slug]/kitchen/[recipe]">["params"],
) {
  const { slug, recipe } = await params;
  const member = getMember(slug);
  const found = member && getRecipe(slug, recipe);
  return found ? { member, recipe: found } : undefined;
}

export async function generateMetadata({
  params,
}: PageProps<"/members/[slug]/kitchen/[recipe]">): Promise<Metadata> {
  const page = await load(params);
  if (!page) return {};
  return {
    title: pageTitle(page.recipe.title),
    description:
      page.recipe.summary ??
      `${page.recipe.title}, from ${page.member.name.split(" ")[0]}'s kitchen.`,
  };
}

/** One recipe, laid out like a recipe card (FR-43) */
export default async function RecipePage({
  params,
}: PageProps<"/members/[slug]/kitchen/[recipe]">) {
  const page = await load(params);
  if (!page) notFound();
  const { member, recipe } = page;

  const { intro, sections } = splitSections(recipe.body);
  // Ingredients and Method side by side; any other sections (e.g. "To
  // serve", "Notes") full width underneath.
  const card = sections.filter((s) =>
    ["ingredients", "method"].includes(s.title.toLowerCase()),
  );
  const extra = sections.filter((s) => !card.includes(s));
  const [mainPhoto, ...morePhotos] = recipe.photos;

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12">
      <MemberMasthead member={member} />
      <MemberTabs member={member} current="kitchen" />

      <p className="mt-6 text-sm">
        <Link
          href={`/members/${member.slug}/kitchen/`}
          className="text-accent underline underline-offset-2"
        >
          ← All recipes
        </Link>
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        {mainPhoto && (
          <a href={fullSizeSrc(mainPhoto.src)} className="block">
            <ResponsivePicture
              src={mainPhoto.src}
              alt={mainPhoto.alt}
              sizes="(min-width: 768px) 720px, 100vw"
              priority
              imgClassName="aspect-video w-full object-cover"
            />
            <span className="sr-only"> (open full size)</span>
          </a>
        )}

        <div className="flex flex-col gap-8 p-6 sm:p-8">
          <header className="flex flex-col gap-2 border-b border-border pb-6">
            <div>
              <DraftBadge published={recipe.published} />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                {recipe.title}
              </h1>
              <p className="text-sm text-muted">
                Made{" "}
                <time dateTime={recipe.date}>{formatDate(recipe.date)}</time>
              </p>
            </div>
            {intro && <Markdown>{intro}</Markdown>}
          </header>

          {card.length > 0 && (
            <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
              {card.map((section) => (
                <RecipeSection key={section.title} {...section} />
              ))}
            </div>
          )}

          {extra.map((section) => (
            <RecipeSection key={section.title} {...section} />
          ))}

          {morePhotos.length > 0 && (
            <section aria-label="More photos" className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
                More photos
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {morePhotos.map((photo) => (
                  <li key={photo.src}>
                    <a href={fullSizeSrc(photo.src)} className="block">
                      <ResponsivePicture
                        src={photo.src}
                        alt={photo.alt}
                        sizes="(min-width: 640px) 220px, 50vw"
                        imgClassName="aspect-[4/3] w-full rounded-md object-cover"
                      />
                      <span className="sr-only"> (open full size)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

function RecipeSection({ title, body }: { title: string; body: string }) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col gap-3 [&_.markdown>:first-child]:mt-0"
    >
      <h2 className="text-xs font-semibold tracking-wider text-muted uppercase">
        {title}
      </h2>
      <Markdown>{body}</Markdown>
    </section>
  );
}
