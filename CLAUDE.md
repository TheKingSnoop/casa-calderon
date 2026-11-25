# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project

**Casa Calderon**: a portfolio site for the Calderon Patiño family (Israel, Cristhyan, Marcy, Benjamin; parents possibly later). It has a collective "studio" page aimed mainly at freelance clients, individual member pages that also show personal side, and project pages. Start with [README.md](README.md) and [docs/](docs/).

## Current phase

**M1 and M2 are done** (site live at https://d2ea5d75wlmb93.cloudfront.net, auto-deployed from `main`; content layer in `src/lib/content`, placeholder content in `content/`, all unpublished). **M3 (Core Pages + sibling showcase) is next.** Israel is building solo through M3. Repo: `TheKingSnoop/casa-calderon` (private until M3). Check [docs/04-roadmap.md](docs/04-roadmap.md) for the current milestone before starting work, and [docs/decisions/](docs/decisions/) for accepted decisions.

## Working agreements

- Work in small, reviewable steps that map to roadmap items. Explain the plan before large changes.
- Ask before adding new dependencies, services, or making architectural changes. Propose an ADR for significant decisions.
- Keep docs in sync: if a change affects requirements, architecture, or the roadmap, update the relevant doc in the same change.
- Explain _why_ when making non-obvious choices. Israel wants to learn from the process, especially the AWS parts.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for branch names and Conventional Commits.

## Safety rules

- AWS: account `aws-calderon`, region `eu-west-2`. **Cost must stay at or near $0.** Flag anything that would add a recurring charge (WAF, KMS keys, NAT, Route 53 zones, logging, compute) before proposing it. Tag all resources `project=casa-calderon`.
- **Never run commands that change real AWS resources** (`cdk deploy`, `cdk destroy`, `aws s3 sync`, IAM changes, etc.) without explicit confirmation each time. `cdk synth` / `cdk diff` are fine.
- Never commit secrets, AWS credentials or `.env` files.
- Never add personal information about family members that isn't already in `content/`.

## Next.js version notes

This is **Next.js 16.4**, which has breaking changes compared with older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. Constraints from static export (`output: "export"`): no server features (route handlers that use the request, server actions, cookies, rewrites/redirects/headers, ISR, default image optimisation, `cacheComponents`/PPR). Dynamic routes need `generateStaticParams()`.

@AGENTS.md

## Content rules

- Pages read content **only** via `src/lib/content` (`getCollective`, `getMembers`, `getMember`, `getProjects`, `getProject`). Never read `content/` with `fs` in pages or components. Schemas live in `src/lib/content/schema.ts` ([ADR-0005](docs/decisions/0005-content-pipeline.md)).
- **Never set `published: true` on a member's page or project on their behalf.** Publishing is each member's own sign-off (NFR-6). Publishing `content/collective.md` (the home page) is a whole-family decision.
- Placeholder content may only contain what's already public in the repo (names, roles). Don't invent employers, schools, locations or other personal details.
- **Images:** always via `npm run images` (strips EXIF/GPS). Never commit original photos or photos of people without their consent: `public/` is reachable by URL even for drafts, and git history is permanent once the repo is public. The logo (geometric dog badge) lives in `src/components/logo.tsx` (site version) and `src/app/icon.svg` (simplified tab-icon variant); the untouched original is `assets/logo/logo-badge.svg`. Change all three together.

## Commands

Node 26 (`.nvmrc`, managed with fnm). Details: [docs/06-development-workflow.md](docs/06-development-workflow.md).

- `npm run dev`: dev server on http://localhost:3000
- `npm run build`: static export to `out/`
- `npm run check`: format check + lint + type-check + tests + content check (run before opening a PR)
- `npm run content:check`: validate everything in `content/` (also runs automatically before `npm run build`)
- `npm run e2e:all`: build the drafts + live test sites and run the Playwright tests (`tests/e2e/`). The `live` tests assert that nothing personal is published; when a member publishes, update them in the same PR, deliberately
- Security headers (CSP etc.) are defined once in `infra/lib/security-headers.ts` and shared with the e2e test server. Never inline them
- `npm run format` / `npm run lint` / `npm run typecheck` / `npm test`

### Infrastructure (`infra/`, a separate npm package)

AWS CDK app; see [infra/README.md](infra/README.md) and CDK's assistant guidance in [infra/AGENTS.md](infra/AGENTS.md) (read the service README in `node_modules/aws-cdk-lib/<service>/` before writing constructs).

- From the repo root, the same commands exist as `npm run infra:<name>` (e.g. `infra:diff`).
- Site deploys happen automatically in CI (the `deploy` job in `.github/workflows/ci.yml`) on merge to `main`. Never run `aws s3 sync` / invalidations by hand without confirmation.
- Safe, no AWS: `npm run typecheck`, `npm test`, `npm run synth`
- Read-only AWS (read-only profile): `npm run whoami`, `npm run diff`
- Admin, read-only effect: `npm run whoami:admin`; `npm run diff:changeset` creates a temporary change set
- **Changes AWS, needs explicit confirmation each time:** `npm run bootstrap`, `npm run deploy`
- **Use the `casa-calderon-readonly` profile for every check** (`whoami`, `diff`, describe/list/get calls). Use the admin profile `casa-calderon` only for changes the user has explicitly confirmed (`deploy`, `bootstrap`) or for `diff:changeset` right before a deploy. Never rely on `[default]`, which holds an old long-lived key.
- If an SSO session has expired, ask the user to run `aws sso login --sso-session casa-calderon` (it opens a browser). Don't try to log in yourself.
