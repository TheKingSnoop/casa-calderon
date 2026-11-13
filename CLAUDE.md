# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project
**Casa Calderon**: a portfolio site for the Calderon Patiño family (Israel, Cristhyan, Marcy, Benjamin; parents possibly later). It has a collective "studio" page aimed mainly at freelance clients, individual member pages that also show personal side, and project pages. Start with [README.md](README.md) and [docs/](docs/).

## Current phase
**M0 (Planning) is done; M1 (Scaffold, Tooling & AWS Hosting) is next.** Israel is building solo through M3. Repo: `TheKingSnoop/casa-calderon` (private until M3). Check [docs/04-roadmap.md](docs/04-roadmap.md) for the current milestone before starting work, and [docs/decisions/](docs/decisions/) for accepted decisions.

## Working agreements
- Work in small, reviewable steps that map to roadmap items. Explain the plan before large changes.
- Ask before adding new dependencies, services, or making architectural changes. Propose an ADR for significant decisions.
- Keep docs in sync: if a change affects requirements, architecture, or the roadmap, update the relevant doc in the same change.
- Explain *why* when making non-obvious choices. Israel wants to learn from the process, especially the AWS parts.
- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for branch names and Conventional Commits.

## Safety rules
- AWS: account `aws-calderon`, region `eu-west-2`. **Cost must stay at or near $0.** Flag anything that would add a recurring charge (WAF, KMS keys, NAT, Route 53 zones, logging, compute) before proposing it. Tag all resources `project=casa-calderon`.
- **Never run commands that change real AWS resources** (`cdk deploy`, `cdk destroy`, `aws s3 sync`, IAM changes, etc.) without explicit confirmation each time. `cdk synth` / `cdk diff` are fine.
- Never commit secrets, AWS credentials or `.env` files.
- Never add personal information about family members that isn't already in `content/`.

## Commands
_To be added in M1 (dev, build, lint, test, cdk)._
