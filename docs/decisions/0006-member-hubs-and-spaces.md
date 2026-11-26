# 0006 · Member hubs and spaces

- **Status:** Accepted
- **Date:** 2026-11-26
- **Deciders:** Israel

## Context

Before the sibling showcase, Israel wants his member page to show what the "studio/hub" can be: a professional side for clients (bio, a creative CV, a downloadable ATS-friendly CV) and a personal side (cooking, photography, gym, and a private family album). The site is a static export with content in Git ([ADR-0002](0002-static-site-nextjs-git-content.md), [ADR-0005](0005-content-pipeline.md)), with no server and a public repo from M3.

## Options considered

1. **Tabs on one long page:** one URL, so tabs can't be shared or bookmarked, and every visitor downloads every space.
2. **Separate pages with a tab bar** (`/members/<slug>/<space>/`): shareable and indexable, still fully static, each page only loads its own content.
3. **A CMS or backend now:** the right tool for uploads from a phone or private photos, but a cost and a new architecture before the showcase.

For the CV PDF: **generate it at build time** from the member file (always in sync, but a new dependency and a design job), or **upload a PDF the member made** (no new code, but kept in sync by hand).

## Decision

- **Option 2**, built one space per PR: **CV first** (on the main member page), then **Kitchen**, then Photos, Training and the Family placeholder. The tab bar arrives with the second space, because a single tab adds nothing.
- **Israel only** for now. Other members keep the standard page; the code reads spaces from content (no names hard-coded), so anyone can opt in later, or do something completely different.
- **The CV is data in the member file** (`experience` with `location` and `highlights`, `languages`, `certifications`), rendered as a timeline. No separate CV file is needed.
- **The ATS CV is a PDF the member uploads** to `public/files/<slug>/` (`links.cv`). Because `public/` is reachable by URL even for drafts, it stays a **placeholder until the member publishes**, and a live e2e test enforces that.
- **The family album is a locked placeholder only.** No photos of the child in the repo or the public bucket, and she isn't named. Real access control (e.g. Cognito + CloudFront signed cookies on a private bucket) is a later milestone with its own ADR.
- **English only for now.** English, Spanish and French versions are a goal for later (backlog); until then visitors can use their browser's translation.

## Consequences

- No new dependencies or AWS resources; cost stays $0.
- The CV page and the PDF can drift apart; the member keeps them in sync.
- Spaces that need writes (photo uploads, logging workouts, a private album) need a backend: planned for M6+, not faked with client-side passwords, which aren't security on a static site.
