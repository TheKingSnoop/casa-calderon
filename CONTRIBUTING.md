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

## Adding your content (from M2 onward)

- Your profile: `content/members/<your-slug>.mdx` (`israel`, `cristhyan`, `marcy`, `benjamin`)
- A project: `content/projects/<project-slug>.mdx`. List all contributors' slugs in `members`.
- Images: `public/images/<your-slug>/...`. Always include meaningful `alt` text.
- Run `npm run build` locally. It will tell you if your content is invalid.

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
