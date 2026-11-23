/**
 * Slug used when a dynamic route has nothing to generate. It can never clash
 * with real content: slugs may only contain lowercase letters, digits and
 * hyphens (see SLUG_PATTERN in src/lib/content/schema.ts).
 */
export const PLACEHOLDER_SLUG = "_";

/**
 * With `output: "export"`, Next.js 16 fails the build if a dynamic route's
 * generateStaticParams() returns an empty array. On the live site that
 * happens whenever nothing in a collection is published yet (drafts are
 * hidden). In that case we generate a single placeholder route, whose page
 * calls notFound(), so it renders the 404 page with `noindex`, and no draft
 * names leak into the build.
 */
export function withPlaceholder<T extends { slug: string }>(params: T[]) {
  return params.length > 0 ? params : [{ slug: PLACEHOLDER_SLUG }];
}
