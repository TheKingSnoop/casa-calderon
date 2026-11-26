# 02 · Requirements

Priority uses **MoSCoW**: **M**ust / **S**hould / **C**ould / **W**on't (this release).

## Functional requirements

### Collective (home) page

| ID   | Requirement                                                                                             | Priority |
| ---- | ------------------------------------------------------------------------------------------------------- | -------- |
| FR-1 | Hero section introducing the family as a collective (name, tagline, short pitch)                        | M        |
| FR-2 | Member cards linking to each individual page                                                            | M        |
| FR-3 | Featured projects (curated, mixed across members)                                                       | M        |
| FR-4 | "What we offer": services/capabilities aimed at prospective clients (e.g. web apps, APIs, cloud on AWS) | M        |
| FR-5 | Joint projects section (work done by 2+ members)                                                        | S        |
| FR-6 | Contact / "work with us" call to action                                                                 | M        |
| FR-7 | "Our story": short, human section about the family (where we're from, what drives us)                   | S        |

### Member pages

| ID    | Requirement                                                                                           | Priority                |
| ----- | ----------------------------------------------------------------------------------------------------- | ----------------------- |
| FR-10 | Bio, photo/avatar, role/title                                                                         | M                       |
| FR-11 | Skills (grouped, e.g. languages / frameworks / cloud / tools)                                         | M                       |
| FR-12 | Experience timeline (work, education, certifications, achievements)                                   | S                       |
| FR-13 | That member's projects, filterable professional vs personal                                           | M                       |
| FR-14 | Links (GitHub, LinkedIn, CV download, email)                                                          | M                       |
| FR-15 | Status badge, e.g. "Available for freelance" / "Starting university 2026"                             | C                       |
| FR-16 | "Beyond the code": personal interests, hobbies, fun facts                                             | S                       |
| FR-17 | Certifications with optional verification links (e.g. AWS Credly badges)                              | S                       |
| FR-18 | Support non-developer members (e.g. parents): skills/projects optional, personal sections still shown | W (model must allow it) |

### Member hub (pilot: Israel, [ADR-0006](decisions/0006-member-hubs-and-spaces.md))

| ID    | Requirement                                                                                                            | Priority |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-40 | Creative CV on the member page: experience timeline with location and highlights, education, languages, certifications | S        |
| FR-41 | "Download CV" and "View PDF" buttons for an ATS-friendly PDF the member uploads; a placeholder until they publish      | S        |
| FR-42 | Spaces as separate pages with a tab bar (`/members/<slug>/<space>/`), switched on per member in content                | S        |
| FR-43 | Kitchen: recipes (own and family), with a servings scaler and recipe structured data                                   | C        |
| FR-44 | Photos: a "photo of the week" series (metadata stripped, settings typed by hand)                                       | C        |
| FR-45 | Training: routine and progress charts, drawn at build time from a log in content                                       | C        |
| FR-46 | Family album: locked placeholder only; real access control later (no photos of the child in the repo or bucket)        | C        |
| FR-47 | English, Spanish and French versions of each page                                                                      | W        |

### Projects

| ID    | Requirement                                                                          | Priority |
| ----- | ------------------------------------------------------------------------------------ | -------- |
| FR-20 | Project list with filters: member, type (professional/personal), tech                | M        |
| FR-21 | Project detail page: summary, problem, role, tech stack, outcome, links, images      | M        |
| FR-22 | A project can belong to multiple members (joint work)                                | M        |
| FR-23 | Professional projects can be marked "confidential" (description only, no code/links) | S        |

### Content management

| ID    | Requirement                                                                            | Priority |
| ----- | -------------------------------------------------------------------------------------- | -------- |
| FR-30 | Members add/edit content via files in the repo (Markdown/MDX + frontmatter)            | M        |
| FR-31 | Content is validated at build time; invalid content fails the build with a clear error | M        |
| FR-32 | Admin UI / headless CMS for non-code editing                                           | W        |

## Non-functional requirements

| ID    | Requirement                                                                                                                                                                                                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-1 | **Performance:** Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO                                                                                                                                                                                          |
| NFR-2 | **Accessibility:** WCAG 2.2 AA (keyboard nav, contrast, alt text, semantic HTML)                                                                                                                                                                                             |
| NFR-3 | **Responsive:** works from 360px mobile to wide desktop                                                                                                                                                                                                                      |
| NFR-4 | **SEO:** per-page titles/descriptions, Open Graph images, sitemap, structured data (Person/Organization)                                                                                                                                                                     |
| NFR-5 | **Maintainability:** TypeScript strict mode, lint + format enforced in CI, tests for content validation and key components                                                                                                                                                   |
| NFR-6 | **Privacy & consent:** each member signs off on their own page before launch; no home address, phone number or other sensitive data; emails obfuscated or via a contact alias; extra care for any member who is a student or not a developer                                 |
| NFR-7 | **Security:** no secrets in the repo; GitHub → AWS via OIDC (no long-lived keys); least-privilege IAM; private S3 bucket behind CloudFront; security headers (CSP, HSTS, etc.); root account MFA'd and unused; Dependabot enabled                                            |
| NFR-8 | **Cost:** target **$0/month until launch**; AWS Budgets alert on any spend above $0.01 (in place since M1 start); only planned post-launch costs are the domain and Route 53 hosted zone (see ADR-0003 cost guardrails)                                                      |
| NFR-9 | **Infrastructure as code:** all project resources defined in CDK (`infra/`); no manual console changes to them. Account-wide security settings (Identity Center, Budgets, Access Analyzer) are a documented **account baseline** set up in the console (see infra/README.md) |

## Example user stories

- _As a potential client_, I want to see what the family offers and projects they built together so I can judge whether they can deliver as a team.
- _As a potential client_, I want to get a sense of who they are as people so I feel comfortable reaching out.
- _As a recruiter_, I want to see a member's skills, certifications and experience on one page so I can decide quickly whether to reach out.
- _As a family member_, I want to add a new project by creating one file so that keeping my profile current takes minutes.
- _As the project lead_, I want the build to fail on malformed content so nobody accidentally breaks the live site.
