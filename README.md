# Casa Calderon

A shared portfolio website for the Calderon Patiño family. It's part studio page and part family introduction. A collective page shows what we can build together, for prospective clients and collaborators. Each member has their own page showing their skills, experience and projects (professional and personal), and who they are beyond the code.

> **Status:** Core pages, the member-hub pilot (Israel's page) and automated deploys are done; the repo is public. Next: the sibling showcase, then Milestone 4 (design, accessibility, SEO). New here? Start with [Welcome](docs/07-welcome.md).
>
> **Live (preview):** https://d2ea5d75wlmb93.cloudfront.net
>
> **Repo:** [TheKingSnoop/casa-calderon](https://github.com/TheKingSnoop/casa-calderon)

## Members

| Member             | Role                                | Page                 |
| ------------------ | ----------------------------------- | -------------------- |
| Israel Calderon    | Full-stack developer · project lead | `/members/israel`    |
| Cristhyan Calderon | Software engineer                   | `/members/cristhyan` |
| Marcy Calderon     | Software engineer                   | `/members/marcy`     |
| Benjamin Calderon  | Incoming CS student                 | `/members/benjamin`  |

Pages for our parents may be added later (see [Roadmap](docs/04-roadmap.md) backlog).

## Tech at a glance

Node 26 · Next.js 16 (static export) · React 19 · TypeScript · Tailwind CSS 4 · Vitest · Markdown content in Git · AWS `eu-west-2` London (S3 + CloudFront, CDK) · GitHub Actions. See [Architecture](docs/03-architecture.md) and [Decision Records](docs/decisions/).

## Documentation

Read these in order if you're new to the project:

1. [Vision & Scope](docs/01-vision.md): why this exists, who it's for, what's out of scope
2. [Requirements](docs/02-requirements.md): features, user stories, MVP vs. later
3. [Architecture](docs/03-architecture.md): tech stack, AWS hosting, content model, structure
4. [Roadmap](docs/04-roadmap.md): milestones and exit criteria
5. [Open Questions](docs/05-open-questions.md): decisions we still need to make
6. [Development Workflow](docs/06-development-workflow.md): editor → commit hook → CI, everyday commands, troubleshooting
7. [Decision Records](docs/decisions/): why we chose what we chose (ADRs)
8. [Contributing](CONTRIBUTING.md): workflow, branching, commits, reviews
9. [Welcome](docs/07-welcome.md): for Cristhyan, Marcy and Benjamin: what's built, your first contribution, publishing

## Getting started

### 1. Install prerequisites (once per machine)

- **Git**
- **Node.js 26** via **[fnm](https://github.com/Schniz/fnm)** (a Node version manager that auto-switches to the version in `.nvmrc`)
  - Windows: `winget install Schniz.fnm`
  - macOS: `brew install fnm`
  - Then add fnm to your shell profile. Bash/Zsh (`~/.bashrc` or `~/.zshrc`):
    `eval "$(fnm env --use-on-cd --version-file-strategy=recursive)"`
    PowerShell (`$PROFILE`):
    `fnm env --use-on-cd --version-file-strategy=recursive --shell powershell | Out-String | Invoke-Expression`
  - Restart your terminal (and VS Code).
- **VS Code**: accept the recommended extensions when prompted (ESLint, Prettier, Tailwind, Vitest).

### 2. Set up the project

```bash
git clone https://github.com/TheKingSnoop/casa-calderon.git
cd casa-calderon
fnm install      # installs the Node version from .nvmrc (first time only)
npm ci           # installs exact locked dependencies + the Git pre-commit hook
npm run dev      # http://localhost:3000
```

### 3. Before you push

```bash
npm run check    # format, lint, type-check, test: the same checks CI runs
```

All commands and how the checks fit together are explained in [Development Workflow](docs/06-development-workflow.md).
