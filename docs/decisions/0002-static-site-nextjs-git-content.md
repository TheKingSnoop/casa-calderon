# 0002 · Static site with Next.js and Git-based content

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Israel Calderon

## Context
The site shows four (later possibly six) family members and their projects. Content changes occasionally (a few times a month), not constantly. We want low cost, a small security surface and little maintenance, and we don't want to run a database yet.

## Options considered
1. **Static site, content as Markdown/MDX files in the repo.** No database, no server. Content is versioned and reviewed through PRs. Editing requires Git (fine, since everyone is a developer except future parent pages).
2. **Server-rendered app + database.** Flexible, but needs hosting for a server and a DB, plus auth for editing. Overkill for v1.
3. **Static site + headless CMS.** Nice editing UI, but adds a third-party dependency and cost.

## Decision
Option 1. Next.js (App Router) with TypeScript (strict) and Tailwind CSS, built as a **fully static export** (`output: "export"`). Content lives in `content/` as MDX with frontmatter, validated by Zod at build time.

## Consequences
- No server or database to secure, patch or pay for.
- Static export means no Next.js server features (no SSR, ISR, API routes, or built-in image optimisation). Images must be pre-optimised or use an `unoptimized`/custom loader.
- Any dynamic feature later (contact form, AI assistant) will need a separate backend, most likely AWS Lambda. That would get its own ADR.
- Pages read content only through `src/lib/content`, so swapping in a CMS later doesn't touch page code.
