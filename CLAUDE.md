# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project

**Casa Calderon**: a portfolio site for the Calderon Patiño family (Israel, Cristhyan, Marcy, Benjamin; parents possibly later). It has a collective "studio" page aimed mainly at freelance clients, individual member pages that also show personal side, and project pages. Start with [README.md](README.md) and [docs/](docs/).

## Current phase

**M1 (Scaffold, Tooling & AWS Hosting) in progress.** App scaffold and tooling are done; the AWS foundation is next. Israel is building solo through M3. Repo: `TheKingSnoop/casa-calderon` (private until M3). Check [docs/04-roadmap.md](docs/04-roadmap.md) for the current milestone before starting work, and [docs/decisions/](docs/decisions/) for accepted decisions.

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

## Commands

Node 26 (`.nvmrc`, managed with fnm). Details: [docs/06-development-workflow.md](docs/06-development-workflow.md).

- `npm run dev`: dev server on http://localhost:3000
- `npm run build`: static export to `out/`
- `npm run check`: format check + lint + type-check + tests (run before opening a PR)
- `npm run format` / `npm run lint` / `npm run typecheck` / `npm test`

### Infrastructure (`infra/`, a separate npm package)

AWS CDK app; see [infra/README.md](infra/README.md) and CDK's assistant guidance in [infra/AGENTS.md](infra/AGENTS.md) (read the service README in `node_modules/aws-cdk-lib/<service>/` before writing constructs).

- From the repo root, the same commands exist as `npm run infra:<name>` (e.g. `infra:diff`).
- Site deploys happen automatically in CI (the `deploy` job in `.github/workflows/ci.yml`) on merge to `main`. Never run `aws s3 sync` / invalidations by hand without confirmation.
- Safe, no AWS: `npm run typecheck`, `npm test`, `npm run synth`
- Read-only AWS: `npm run whoami`, `npm run diff`
- **Changes AWS, needs explicit confirmation each time:** `npm run bootstrap`, `npm run deploy`
- Always use the `casa-calderon` profile (the scripts do). Never rely on `[default]`, which holds an old long-lived key.
