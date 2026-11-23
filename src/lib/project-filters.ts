import type { ProjectType } from "./content/schema";

/**
 * Project list filters (FR-20). Kept in the URL so a filtered view can be
 * shared: /projects/?member=marcy&type=personal
 * Pure functions, so they're unit-tested without a browser.
 */

export type ProjectFilters = { member?: string; type?: ProjectType };

/** The fields a filter needs; works with full Projects or card-sized data. */
type Filterable = { members: string[]; type: ProjectType };

const TYPES: readonly ProjectType[] = ["professional", "personal"];

/**
 * Reads filters from the URL. Unknown members or types (an old link, a typo)
 * are ignored rather than showing an empty page.
 */
export function parseFilters(
  params: { get(name: string): string | null },
  validMembers: readonly string[],
): ProjectFilters {
  const member = params.get("member") ?? undefined;
  const type = params.get("type") ?? undefined;
  return {
    member: member && validMembers.includes(member) ? member : undefined,
    type: TYPES.find((t) => t === type),
  };
}

export function filterProjects<T extends Filterable>(
  projects: T[],
  filters: ProjectFilters,
): T[] {
  return projects.filter(
    (p) =>
      (!filters.member || p.members.includes(filters.member)) &&
      (!filters.type || p.type === filters.type),
  );
}

/** Builds the query string for the URL ("" when no filters are active). */
export function filtersToQuery(filters: ProjectFilters): string {
  const params = new URLSearchParams();
  if (filters.member) params.set("member", filters.member);
  if (filters.type) params.set("type", filters.type);
  const query = params.toString();
  return query ? `?${query}` : "";
}
