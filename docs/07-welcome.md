# 07 · Welcome, Cristhyan, Marcy and Benjamin

This is Casa Calderon: our family portfolio. It's a "studio" page for freelance clients, plus a page for each of us that shows who we are beyond the code. Israel built the foundation (M0 to M3). From here on, it's ours to shape together.

**Live preview:** https://d2ea5d75wlmb93.cloudfront.net. For now it only says "Coming soon": nothing personal is public until each of us says so (see "Publishing" below).

## What's built so far

| Area                      | What it does                                                                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Home page**             | Hero with Israel's photos from Sajama (day in light mode, sunset in dark mode), "What we offer", the team, featured work, "Built together", "Work with us" |
| **Your member page**      | Bio, skills, experience timeline, languages, certifications, interests, your projects, links, and a "Download CV" button if you add one                    |
| **Projects**              | One page per project, joint projects credit everyone, confidential (NDA) projects show no links; a list with filters by member and type                    |
| **Member hub** (optional) | Extra tabs on your page. Israel's is the pilot: Kitchen (recipe cards), plus Photos and Training as "coming soon" pages                                    |
| **Behind the scenes**     | Static site on AWS (S3 + CloudFront, about $0/month), deployed automatically when a PR is merged, with tests that stop drafts from ever going live         |

Israel's hub shows **one** idea of what a member page can be. Yours can be similar, completely different, or just the standard page. It's your call.

## Your first contribution (about 30 minutes)

1. **Accept the GitHub invite** to `TheKingSnoop/casa-calderon` (Israel sends these).
2. **Set up your machine:** follow the [README "Getting started"](../README.md#getting-started) (Node 26 via fnm, `npm ci`, `npm run dev`).
3. **Make a branch:** `git switch -c content/<your-name>-bio`.
4. **Edit your page:** `content/members/<your-name>.md`. Today it only has your name and role. The full template, with every field, is in [CONTRIBUTING, "Member template"](../CONTRIBUTING.md#member-template). Watch it update at http://localhost:3000/members/<your-name>/.
5. **Check and open a PR:** `npm run check`, then push and open a pull request. CI runs every check. Once it's green, the PR can be merged.

You can't break the live site by accident: `main` only accepts PRs that pass CI, and your page stays a draft until you publish it.

## Publishing is your decision

- Everything starts as **`published: false`**. Drafts show up on your machine with a "Draft" badge, and **never** on the live site.
- **Nobody publishes anyone else's page.** You set `published: true` on your own page when you're happy with it.
- **The home page is a family decision:** its text (tagline, pitch, services, our story) in `content/collective.md` goes live only when all of us agree.
- **The repo is public,** and so is everything in its history, forever. Leave out phone numbers and home addresses, and only add photos of people with their consent. Always add photos with `npm run images`, which removes GPS and camera data.

## What we need to decide together

1. **The home page text:** the tagline, the pitch, the services we offer, and "Our story". Israel has drafted the tagline and pitch.
2. **How clients contact us:** each person on their own page for now, or a shared address once we have a domain (M5).
3. **The look (M4):** the logo is Israel's dog badge, and the font is Geist for now. Both are open to change.
4. **Who does what next:** see the [Roadmap](04-roadmap.md). M4 is design, accessibility and SEO; M5 is our real content and the launch on our own domain.

## Where to find things

- [CONTRIBUTING](../CONTRIBUTING.md): branches, commit messages, templates for members, projects and recipes, adding photos
- [Development workflow](06-development-workflow.md): everyday commands and troubleshooting
- [Decision records](decisions/): why things are the way they are
- **AWS:** you'll get your own read-only access later (M4). Until then, Israel handles anything on AWS.
