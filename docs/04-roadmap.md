# 04 · Roadmap

Every milestone has **exit criteria**. We don't move on until they're met. Each milestone ends in something deployable (from M1 onward).

**Team phases:** Israel builds M0 to M3 solo. At the end of M3 the working site is **showcased to Cristhyan, Marcy and Benjamin**, and they join as contributors from M4.

| Milestone | Theme                           | Who    | Status         |
| --------- | ------------------------------- | ------ | -------------- |
| M0        | Planning & Foundations          | Israel | ✅ Done        |
| M1        | Scaffold, Tooling & AWS Hosting | Israel | ✅ Done        |
| M2        | Content Model & Data Layer      | Israel | 🟡 Next        |
| M3        | Core Pages + sibling showcase   | Israel | ⚪ Not started |
| M4        | Design, Accessibility & SEO     | Family | ⚪ Not started |
| M5        | Content Collection & Launch     | Family | ⚪ Not started |
| M6+       | Post-launch Enhancements        | Family | ⚪ Backlog     |

---

### M0: Planning & Foundations

- [x] Vision, requirements, architecture draft, roadmap
- [x] Stack decision ([ADR-0002](decisions/0002-static-site-nextjs-git-content.md))
- [x] AWS hosting approach ([ADR-0003](decisions/0003-hosting-on-aws.md)): `aws-calderon`, `eu-west-2`
- [x] Brand name: **Casa Calderon**
- [x] First commit; GitHub repo created: [TheKingSnoop/casa-calderon](https://github.com/TheKingSnoop/casa-calderon) (**private**)
- [x] Branch protection deferred: not available on private repos on GitHub Free; enabled when the repo goes public at M3

**Exit:** all _blocking_ open questions answered; repo on GitHub with these docs on `main`. ✅

### M1: Scaffold, Tooling & AWS Hosting

**App & tooling**

- [x] Initialise Next.js app (static export), TypeScript strict, Tailwind ([ADR-0004](decisions/0004-toolchain-and-quality-gates.md))
- [x] ESLint, Prettier, pre-commit hooks (Husky + lint-staged), Vitest, `.gitattributes`
- [x] CI workflow: format, lint, type-check, test, build on every PR
- [x] Onboarding docs: README "Getting started", [Development Workflow](06-development-workflow.md)

**AWS foundation** (do these in order)

- [x] **AWS Budgets alert** on `aws-calderon`: $1/month budget, email alert on any actual spend above $0.01 (set up first, before anything else)
- [x] Account hygiene: root MFA, IAM Identity Center (org instance, eu-west-2) user `israel`, AWS CLI profile `casa-calderon` via SSO
- [x] CSP check in the browser: no Content Security Policy errors in the console (2026-11-23)
- [x] Least privilege for daily use: `ReadOnlyAccess` permission set + `casa-calderon-readonly` profile (default for checks); admin only for deploys (2026-11-23)
- [x] IAM Access Analyzer (external access, free) in eu-west-2: 0 findings (2026-11-23)
- [ ] **Follow-up, not blocking M1:** retire the 2022 `[default]` access key (`calderon-aws-admin`) once the other project that uses it is moved to SSO
- [x] CDK app in [`infra/`](../infra/README.md), with tests and `cdk synth` in CI
- [x] Stack code: private S3 bucket + CloudFront (OAC) + security headers + URL-rewrite function
- [x] Stack code: GitHub OIDC provider + least-privilege deploy role (5 actions, `main` only)
- [x] `cdk bootstrap` in `eu-west-2` (2026-11-20)
- [x] `cdk deploy` the `CasaCalderonSite` stack (2026-11-20): https://d2ea5d75wlmb93.cloudfront.net
- [x] Deploy job in CI: on merge to `main`, after all checks → OIDC → S3 sync → CloudFront invalidation
- [x] First automatic deploy succeeds (2026-11-20, after the OIDC immutable-subject fix in #7; confirmed again on the #7 merge, 2026-11-23)

**Exit:** merging a PR to `main` automatically deploys a "hello world" page to the CloudFront URL, with no AWS keys stored in GitHub. ✅

**Deferred hardening (decided 2026-11-23):** scope down the CDK bootstrap CloudFormation execution role (currently `AdministratorAccess`, the CDK default) **before anyone else gets infrastructure-deploy access** (M4 at the earliest). Today only Israel (already admin) can deploy infrastructure, so it adds no extra risk yet.

### M2: Content Model & Data Layer

- [ ] Zod schemas for `Member` and `Project` (incl. `kind`, `interests`, `certifications`)
- [ ] Content loaders in `src/lib/content`
- [ ] Placeholder content for all four members, a few projects incl. one joint
- [ ] Unit tests: valid content passes, invalid content fails with clear messages

**Exit:** `npm run build` fails on bad content and succeeds on good content.

### M3: Core Pages + sibling showcase

- [ ] Collective landing page (FR-1 to FR-7)
- [ ] Member page (FR-10 to FR-17)
- [ ] Projects list + filters, project detail (FR-20 to FR-23)
- [ ] Basic e2e smoke tests (each route renders)
- [ ] Make the repo **public** and enable a branch ruleset on `main` (require PR + passing CI); check no secrets or private info in git history first
- [ ] **Showcase to siblings**, collect feedback, give them write access to the repo

**Exit:** all _Must_ requirements work with placeholder content; siblings onboarded via CONTRIBUTING.md.

### M4: Design, Accessibility & SEO

- [ ] Before giving siblings AWS access: give them their own permission sets (read-only by default, **never admin by default**), and do the deferred bootstrap hardening from M1 if any of them will deploy infrastructure

- [ ] Visual identity (wordmark, palette, typography) based on the chosen brand name
- [ ] Responsive polish, dark mode (optional)
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Metadata, OG images, sitemap, structured data

**Exit:** Lighthouse ≥ 90 across the board on key pages (NFR-1).

### M5: Content Collection & Launch

- [ ] Each member writes their real content (via PR)
- [ ] **Each member signs off on their own page** (NFR-6)
- [ ] Domain in Route 53, ACM certificate, DNS → CloudFront
- [ ] Privacy-friendly analytics (or CloudFront logs)
- [ ] Launch 🚀

**Exit:** live on the custom domain with all members' approval.

### M6+: Backlog (unprioritised)

- Parent pages (`kind: "family"`)
- "Ask the family" AI assistant on Amazon Bedrock (AI Practitioner practice)
- Contact form (API Gateway + Lambda + SES)
- PR preview environments on AWS
- CloudWatch monitoring & alarms
- Optional Dev Container (`.devcontainer/`) for a one-click dev environment, also usable with GitHub Codespaces (Codespaces on org repos bills the org; keep the spending limit at $0). See ADR-0004.
- Spanish translation, blog, case-study templates, testimonials

---

## AI-assistant efficiency log

Since one goal (G8) is to learn how an AI coding assistant affects delivery, keep a short note at the end of each milestone:

| Milestone | What the assistant did well                                                                                                                                                                                                                                                                              | Where it needed correction                                                                                                                                                                           | Rough time saved/lost |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| M0        | Laying out a clear temmplate for execution of the first steps of the project. Provided options and made sure to ask for feedback before carrying out any changes.                                                                                                                                        | Some additional information from my part was needed to help configure some account and preference settings.                                                                                          | Two hours saved       |
| M1        | Simple, efficient and secure way of deploying this first version on AWS. Carefully and systematically configured the AWS account to have a live version of the site up. Very much appreciated the step by step approach, as it gave space to learn from the design and catch any potential overstepping. | -the OIDC subject format Claude didn't anticipate; the architecture doc's wrong claim about the rewrite function; -not saying whoami had to run from infra/; -switching branches without telling me. | 5 hours saved         |
