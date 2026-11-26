import * as path from "node:path";
import { loadContent, type Content } from "./loader";
import type {
  Collective,
  Member,
  Project,
  ProjectType,
  Recipe,
} from "./schema";

export { ContentError, type ContentIssue } from "./loader";
export type {
  Collective,
  Member,
  Project,
  ProjectType,
  Recipe,
  Space,
} from "./schema";

/**
 * The single data layer for pages (see docs/03-architecture.md).
 * Pages must read content only through these functions, never from the
 * filesystem directly, so the source can change later (e.g. a CMS) without
 * touching page code.
 */

/**
 * Drafts (`published: false`) are shown with a badge during local development
 * and hidden everywhere else, including the live site, so nobody's page goes
 * public before they've signed off (NFR-6).
 * Preview a production build with drafts: `SHOW_DRAFTS=true npm run build`.
 */
export function shouldShowDrafts(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env.SHOW_DRAFTS === "true" || env.NODE_ENV === "development";
}

export type ContentStore = ReturnType<typeof createContentStore>;

export function createContentStore(options: {
  rootDir: string;
  showDrafts: boolean;
}) {
  let cache: Content | undefined;
  // Read + validate once per build/process.
  const content = () => (cache ??= loadContent(options.rootDir));
  const visible = (item: { published: boolean }) =>
    item.published || options.showDrafts;

  return {
    showDrafts: options.showDrafts,

    /** The home page content, or null if missing/unpublished (→ "Coming soon") */
    getCollective(): Collective | null {
      const collective = content().collective;
      return collective && visible(collective) ? collective : null;
    },

    getMembers(): Member[] {
      return content().members.filter(visible);
    },

    getMember(slug: string): Member | undefined {
      return this.getMembers().find((m) => m.slug === slug);
    },

    getProjects(
      filter: { member?: string; type?: ProjectType } = {},
    ): Project[] {
      return content()
        .projects.filter(visible)
        .filter((p) => !filter.member || p.members.includes(filter.member))
        .filter((p) => !filter.type || p.type === filter.type);
    },

    getProject(slug: string): Project | undefined {
      return this.getProjects().find((p) => p.slug === slug);
    },

    /**
     * A member's recipes, newest first. Empty unless the member is visible
     * and has the kitchen space switched on (spaces: [kitchen]).
     */
    getRecipes(member: string): Recipe[] {
      if (!this.getMember(member)?.spaces?.includes("kitchen")) return [];
      return content()
        .recipes.filter((r) => r.member === member)
        .filter(visible);
    },

    getRecipe(member: string, slug: string): Recipe | undefined {
      return this.getRecipes(member).find((r) => r.slug === slug);
    },
  };
}

const store = createContentStore({
  rootDir: path.join(process.cwd(), "content"),
  showDrafts: shouldShowDrafts(),
});

export const getCollective = () => store.getCollective();
export const getMembers = () => store.getMembers();
export const getMember = (slug: string) => store.getMember(slug);
export const getProjects = (filter?: { member?: string; type?: ProjectType }) =>
  store.getProjects(filter);
export const getProject = (slug: string) => store.getProject(slug);
export const getRecipes = (member: string) => store.getRecipes(member);
export const getRecipe = (member: string, slug: string) =>
  store.getRecipe(member, slug);
export const showDrafts = store.showDrafts;
