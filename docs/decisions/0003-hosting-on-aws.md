# 0003 · Host on AWS (S3 + CloudFront, managed with CDK)

- **Status:** Accepted
- **Date:** 2026-11-12
- **Deciders:** Israel Calderon

## Context

Vercel would be the zero-effort option for Next.js. But the family recently earned the AWS Solutions Architect and AWS AI Practitioner certifications and wants hands-on practice. Hosting on AWS is a learning goal in itself (Vision G7). Cost must stay **at or near zero** for now.

## Options considered

1. **Vercel.** Easiest, PR previews built in. No AWS learning.
2. **AWS Amplify Hosting.** Managed, supports Next.js, PR previews built in. Close to Vercel in effort, but hides most of the underlying AWS services, so less learning.
3. **S3 + CloudFront, defined as code with AWS CDK (TypeScript), deployed from GitHub Actions.** Classic static-hosting architecture. Teaches S3, CloudFront, ACM, Route 53, IAM/OIDC and infrastructure as code. More setup, and PR previews have to be built ourselves (deferred).

## Decision

Option 3:

- **Account:** the existing `aws-calderon` account.
- **Region:** `eu-west-2` (London) for all resources, except the ACM certificate for CloudFront, which AWS requires in `us-east-1` (needed only once we add a custom domain).
- **S3** private bucket holds the static build. It's reachable only through CloudFront via Origin Access Control (OAC). It uses default SSE-S3 encryption.
- **CloudFront** for CDN and HTTPS, with security response headers.
- **AWS CDK (TypeScript)** in `infra/`.
- **GitHub Actions** deploys using **OIDC**. There are no long-lived AWS access keys, and the deploy role can only write to the site bucket and invalidate the distribution.

## Cost guardrails (keep it free)

| Guardrail                                                                                  | Why                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zero-spend budget + $5 monthly budget** in AWS Budgets, set up before any other resource | Email alert on the first cent of spend, and again if anything runs away. _Implemented (2026-11-13) as a single $1/month budget alerting on actual spend above $0.01_ |
| Use the default `*.cloudfront.net` URL until launch (M5)                                   | Defers Route 53 (about $0.50/month per hosted zone) and domain costs until we're ready                                                                               |
| No AWS WAF, no customer-managed KMS keys, no NAT gateways, no always-on compute            | These are the usual surprise costs; none are needed for a static site                                                                                                |
| CloudFront access logging off at first                                                     | Avoids log storage costs; revisit post-launch                                                                                                                        |
| Tag every resource `project=casa-calderon`                                                 | Enables cost tracking per project in Cost Explorer                                                                                                                   |

Expected cost before launch: **$0 or a few cents a month**. A small static site sits well within S3/CloudFront free allowances. Check the AWS pricing pages for current free-tier terms on the `aws-calderon` account, since they depend on the account's age and plan. After launch, the domain registration and hosted zone are the only planned costs.

## Consequences

- Strong hands-on AWS practice, and `infra/` becomes portfolio material in its own right.
- No PR preview deployments at first. We review locally and add previews later as a learning exercise.
- More moving parts than Vercel. If AWS becomes a blocker to shipping, we can fall back to Amplify or Vercel without changing app code, because the site is a static export.
