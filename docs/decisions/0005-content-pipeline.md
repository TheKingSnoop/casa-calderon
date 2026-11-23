# 0005 · Content pipeline: Markdown files, own loader, published flag

- **Status:** Accepted
- **Date:** 2026-11-23
- **Deciders:** Israel Calderon

## Context

ADR-0002 put content in the repo. M2 needs to decide the file format, how files are parsed and validated, and how we stop anyone's page going public before they've approved it (NFR-6). The live site is already reachable at a public (unlisted) URL.

## Options considered

**Format**

1. **Markdown (`.md`)**: frontmatter for structured data plus a Markdown body. Simple for every author (including future non-developer family pages), and content can't execute code.
2. **MDX (`.mdx`)**: Markdown plus embedded React components. More powerful, but content files run code at build time and authors need some JSX.

**Pipeline**

1. **Own small loader**: `gray-matter` (frontmatter) + **Zod 4** (validation) + `react-markdown` / `remark-gfm` (rendering, from M3). About 100 lines we own, unit-tested with Vitest, no build plugins.
2. **`content-collections`**: content layer with schemas and generated types via a Next.js plugin. Pre-1.0, with more hidden build behaviour.
3. **Velite**: similar, also pre-1.0, smaller community.
4. **`@next/mdx`**: aimed at MDX _pages_, with no frontmatter support, so validation would be awkward.

## Decision

- **Markdown files**, one per member (`content/members/<slug>.md`) and project (`content/projects/<slug>.md`). The file name is the slug.
- **Own loader** in `src/lib/content`: `gray-matter` + **strict Zod schemas** (unknown keys rejected) + cross-checks (project members must exist). All problems across all files are reported together in one `ContentError`.
- **Validation gates every build**: `prebuild` runs `npm run content:check` (via `tsx`), and a Vitest test validates the real `content/` folder in CI. Drafts are validated too.
- **`published` flag, default `false`**: drafts show only in local development (`NODE_ENV=development`, or `SHOW_DRAFTS=true`). **The live site shows only `published: true`.** Each member sets `published: true` on their own page as their sign-off.

## Consequences

- No hidden build magic: the pipeline is plain functions with tests, so it's easy to debug and to explain to new contributors.
- Typos and bad data fail fast with located messages (`content/members/marcy.md → links.github: Invalid URL`).
- Pages must use `getMembers()` / `getMember()` / `getProjects()` / `getProject()`. Swapping the source later (e.g. a CMS) doesn't touch pages.
- No components inside content. If a write-up ever needs one (e.g. a gallery), we can add MDX inside the loader later, or model it as frontmatter (as with `images`).
- The M3 showcase happens locally (drafts visible), unless a member has already published.
- `gray-matter` hasn't had a release since 2023, but it's stable and very widely used (about 15M downloads a week). If it becomes a problem, the loader can switch to the `yaml` package with a small frontmatter splitter, and nothing outside `loader.ts` changes.
