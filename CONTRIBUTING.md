# Contributing

How we work together on this repo.

## Team phases

- **Phase 1 (M0 to M3): solo build.** Israel builds the foundation alone. The workflow below still applies (branches, PRs, CI), so it's habit before others join. Israel can merge his own PRs once CI passes. The repo is **private** in this phase. GitHub Free doesn't enforce branch protection on private repos, so the "no direct commits to `main`" rule is followed by habit.
- **At the M3 showcase,** the repo goes **public** and a branch ruleset on `main` enforces PRs and passing CI.
- **Phase 2 (M4 onward): family contributors.** After the showcase at the end of M3, Cristhyan, Marcy and Benjamin are invited to the repo and the review rules below apply in full.

## Workflow

1. **Never commit directly to `main`.** `main` is protected and always deployable. Merging to `main` deploys to AWS.
2. Create a branch from `main`:
   - `feat/<short-description>`: new feature
   - `fix/<short-description>`: bug fix
   - `content/<member>-<description>`: content-only change (e.g. `content/marcy-add-weather-app`)
   - `infra/<description>`: AWS/CDK changes
   - `docs/<description>`: documentation only
   - `chore/<description>`: tooling, deps, config
3. Open a pull request. CI must pass (lint, type-check, tests, build).
4. Reviews (Phase 2):
   - Content PRs that only touch your own files can be approved by any member.
   - Changes to code, config, `infra/` or another member's content need Israel's review.
5. Squash-merge into `main`. The site deploys automatically.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(members): add experience timeline
fix(projects): correct filter when no tech selected
content(benjamin): add first project
infra: add security headers to CloudFront
docs: update roadmap for M2
```

## Adding your content

Everything about you lives in plain Markdown files. You don't need to touch any app code. The rules are enforced by [`src/lib/content/schema.ts`](src/lib/content/schema.ts), and `npm run content:check` tells you exactly what's wrong and where.

- **Your profile:** `content/members/<your-slug>.md` (`israel`, `cristhyan`, `marcy`, `benjamin`). The file name is your URL: `/members/<your-slug>/`.
- **A project:** `content/projects/<project-slug>.md` (lowercase letters, numbers, hyphens). List every contributor's slug in `members`.
- **Images:** always prepare photos with `npm run images` (see "Adding photos" below). Every image needs meaningful `alt` text.
- **Check your work:** `npm run content:check` (fast), or `npm run dev` to see it in the browser. Drafts are visible locally with a "Draft" badge.

### Publishing = your sign-off

Every file starts as a **draft** (`published: false`). Drafts appear only on your own machine (`npm run dev`), **never on the live site**. When you're happy for your page (or a project) to be public, set `published: true` in your own file, in its own PR. That's your privacy sign-off (NFR-6). Nobody else should publish your page for you.

- **On joint projects**, you're only named once your own page is published. Until then the credit reads "and 1 other".
- **Your email** (if you add one under `links`) is never written into the page's HTML. Visitors see a "Show email" button, which keeps it away from simple scrapers.

### Member template

```markdown
---
name: Your Name
role: Software engineer # shown under your name
order: 2 # position on the collective page (lower = first)
published: false # set to true when you're happy for this to go live
tagline: One sentence about what you do # optional
status: Available for freelance # optional badge
avatar: /images/your-slug/avatar-640.webp # optional; made with `npm run images`
links: # all optional
  github: https://github.com/your-username
  linkedin: https://www.linkedin.com/in/your-profile
  website: https://example.com
  email: you@example.com
  cv: /files/your-slug/cv.pdf # or a URL; see "Your CV as a PDF" below
skills: # optional
  - category: Languages
    items: [TypeScript, Python]
  - category: Cloud
    items: [AWS Lambda, S3]
experience: # optional, newest first; kind: work | education | achievement
  - title: Software Engineer
    org: Company
    kind: work
    start: 2024-09 # "YYYY-MM" or "YYYY-MM-DD"; optional if there's an end
    # end: 2025-06  # omit for "present"
    location: London, UK # optional
    summary: About the role or the organisation, in one line # optional
    highlights: # optional CV bullet points
      - What you did and achieved
languages: # optional
  - name: Spanish
    level: Native
certifications: # optional
  - name: AWS Certified Solutions Architect – Associate
    issuer: Amazon Web Services
    date: 2026-10 # optional
    url: https://www.credly.com/badges/... # optional verification link
interests: [Football, Cooking] # "Beyond the code", optional
---

Your bio in Markdown. A few short paragraphs: who you are, what you enjoy
building, what you're looking for.
```

### Your CV as a PDF

`links.cv` adds "Download CV" and "View PDF" buttons to your page. Put the PDF in `public/files/<your-slug>/cv.pdf`.

- **Anything in `public/` is reachable by URL, even while your page is a draft.** Keep a placeholder there until you publish, and add your real CV in the same PR that sets `published: true` (update the live e2e test that checks for the placeholder at the same time).
- Use a web version without your phone number or home address (NFR-6), and check the PDF's properties (author, title) for anything you don't want public.
- If YAML lists contain commas inside an item, quote it: `["AWS (S3, Lambda)", Docker]`.

### Recipes (the Kitchen space)

Members can add extra pages ("spaces") to their hub, shown as tabs next to their profile ([ADR-0006](docs/decisions/0006-member-hubs-and-spaces.md)). To add a Kitchen:

1. Add `spaces: [kitchen]` to your member file.
2. Add one file per recipe in `content/members/<your-slug>/kitchen/`. The file name becomes the URL, e.g. `korean-meatballs.md` → `/members/<your-slug>/kitchen/korean-meatballs/`.
3. Add photos with `npm run images -- <photo> <your-slug> <name>` (strips GPS and other metadata).

```markdown
---
title: Korean meatballs
date: 2026-11-25 # when you made it
summary: One line for the Kitchen page card # optional, 160 characters max
published: false # each recipe has its own sign-off
photos: # optional; the first one is the main photo
  - src: /images/your-slug/korean-meatballs-plate
    alt: What's in the photo, for screen readers
---

An optional story or tip.

## Ingredients

### Meatballs

- 60% pork, 40% beef

## Method

1. Fry and brown the meatballs.

## To serve

- Any other `##` sections go full width under the card
```

`## Ingredients` and `## Method` are required; they sit side by side on wide screens. Write both units for oven temperatures, e.g. 350°F (175°C). A recipe only appears on the live site when both it **and** your page are published.

### Project template

```markdown
---
title: Project name
summary: One line for cards, 160 characters max.
members: [your-slug] # two or more slugs = joint project
type: personal # personal | professional
date: 2026-11 # when it was built or launched; sorts newest first
published: false
tech: [Next.js, TypeScript, AWS]
featured: false # true = show on the collective page
links: # optional; NOT allowed when confidential: true
  repo: https://github.com/...
  live: https://...
images: # optional
  - src: /images/your-slug/project-screenshot.webp
    alt: Dashboard showing weekly habit streaks
# confidential: true  # NDA work: no links, describe at a high level
---

## Problem

What problem did it solve, and for whom?

## Approach

What you built and the interesting decisions.

## Outcome

Results, what you learned, what you'd do next.
```

### The home page (`content/collective.md`)

The collective page's text lives in one shared file. It's validated the same way, so a typo fails the build.

```markdown
---
tagline: One-line headline (max 120 characters)
pitch: One or two sentences introducing us (max 300 characters)
published: false # a FAMILY decision: only when everyone agrees on this text
services: # "What we offer", at least one
  - title: Web applications
    description: Full-stack web apps, from idea to deployed product.
contact: How to start a conversation with us (optional)
cover: # optional full-width hero photo, made with `npm run images`
  src: /images/site/sajama-day # base path: no width or extension
  srcDark: /images/site/sajama-dusk # optional: shown in dark mode
  alt: Describe the photo for screen readers
---

"Our story" in Markdown.
```

Until it's published, the live site shows "Coming soon". The team, featured and joint-project sections fill themselves from member and project files: set `featured: true` on a project to show it on the home page.

### Adding photos

```bash
npm run images -- <path-to-photo> <folder> <name>
# e.g. npm run images -- ~/Pictures/me.jpg marcy avatar
#   → public/images/marcy/avatar-{640,1280,1920}.{avif,webp}
```

The script resizes the photo to three widths in modern formats (AVIF and WebP) and **strips all metadata, including the GPS location** phones embed in photos. Then:

- **Commit only the files in `public/images/`, never the original photo.**
- **Only add photos of people who've agreed to be online.** Anything in `public/` is reachable by its URL once deployed, even on a draft page, and the repo's history keeps every committed file, even after it's deleted.
- Reference a **cover** by its base path (`/images/site/cover`); the build checks every size exists. Reference an **avatar** by one file (`/images/marcy/avatar-640.webp`).

### Common errors

| Message                                      | Fix                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------ |
| `links: Unrecognized key: "linkdin"`         | Typo in a field name. Check the template above                                 |
| `links.github: Invalid URL`                  | URLs need `https://`                                                           |
| `date: Use "YYYY-MM" or "YYYY-MM-DD"`        | Write dates like `2026-11` or `2026-11-01`                                     |
| `members[1]: unknown member "benjy"`         | Use the member's file name, e.g. `benjamin`                                    |
| `bio: add a short bio below the frontmatter` | Write something after the closing `---`                                        |
| `could not read frontmatter`                 | YAML syntax error between the `---` lines: check indentation, brackets, quotes |

## Privacy rules

- Only publish information about **yourself**. Don't add details about another member (or our parents) without their OK.
- No home addresses, phone numbers, or private employer information.
- Professional projects under NDA: set `confidential: true` and describe them at a high level only.

## AWS rules

- All AWS changes go through CDK in `infra/` and a PR. No manual console changes to production.
- Never commit AWS keys or `.env` files. CI authenticates with OIDC.
- Use your own IAM Identity Center user, never the root account.

## Working with the AI assistant

AI-generated code is reviewed like any other code. The PR author is responsible for understanding and testing everything they submit. Project-specific guidance for the assistant lives in [CLAUDE.md](CLAUDE.md).
