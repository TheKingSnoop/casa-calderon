---
title: Casa Calderon website
summary: This site, a statically generated family portfolio on AWS, built with infrastructure as code and deployed automatically from GitHub.
members: [israel]
type: personal
date: 2026-11
published: false
featured: true
tech:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Zod
  - AWS CDK
  - Amazon S3
  - Amazon CloudFront
  - GitHub Actions
links:
  live: https://d2ea5d75wlmb93.cloudfront.net
---

## Problem

Four siblings, four separate portfolios: none of them shows what we can build _together_. We wanted one place that works like a small studio's site for prospective clients, while still giving each of us our own page.

## Approach

- **Static site, no database:** Next.js static export, with content as Markdown files in the repo, validated by Zod before every build.
- **AWS, defined as code:** a private S3 bucket behind CloudFront (Origin Access Control, security headers, a CloudFront Function for clean URLs), all in AWS CDK with tests.
- **No stored credentials:** GitHub Actions deploys through OIDC to a role limited to five actions on this one bucket and distribution.
- **Privacy by default:** every page starts as a draft and only goes live when its owner sets `published: true`.
- **Documented decisions:** architecture decision records, a roadmap with exit criteria, and onboarding docs for new contributors.

## Outcome

Every merge to `main` is checked (format, lint, types, tests, content, CDK synth) and then deployed automatically, at close to zero cost.
