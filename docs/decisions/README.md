# Architecture Decision Records (ADRs)

An ADR is a short note that captures **one** significant decision: the context, what we chose, and the consequences. ADRs help anyone joining later understand *why* the project is the way it is.

## When to write one
- Choosing or replacing a framework, library, service or hosting provider
- Changing the content model or folder structure
- Any decision someone might later ask "why did we do it this way?"

## How
1. Copy [`0000-template.md`](0000-template.md) to `NNNN-short-title.md` (next number).
2. Fill it in with status **Proposed** and open a PR.
3. Once agreed, set status to **Accepted** and merge.
4. Never delete an ADR. If a decision changes, write a new one and mark the old one **Superseded by NNNN**.

## Index
| # | Title | Status |
|---|---|---|
| 0001 | [Record architecture decisions](0001-record-architecture-decisions.md) | Accepted |
| 0002 | [Static site with Next.js and Git-based content](0002-static-site-nextjs-git-content.md) | Accepted |
| 0003 | [Host on AWS (S3 + CloudFront, managed with CDK)](0003-hosting-on-aws.md) | Accepted |
