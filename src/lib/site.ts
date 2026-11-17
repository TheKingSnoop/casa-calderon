export const siteConfig = {
  name: "Casa Calderon",
  description:
    "A family of software developers building web apps, APIs and cloud solutions together.",
} as const;

/**
 * Builds a consistent browser-tab / SEO title.
 * pageTitle("Projects") → "Projects · Casa Calderon"
 * pageTitle()           → "Casa Calderon"
 */
export function pageTitle(title?: string): string {
  const trimmed = title?.trim();
  return trimmed ? `${trimmed} · ${siteConfig.name}` : siteConfig.name;
}
