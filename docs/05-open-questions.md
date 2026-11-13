# 05 · Open Questions

**Blocking** means we can't finish the given milestone without it. Once answered, record the answer in an ADR (technical decisions) or the relevant doc.

## Open

| # | Question | Blocking? | Owner | Notes |
|---|---|---|---|---|
| Q4 | Custom domain: which one (e.g. `casacalderon.dev` / `.com`), and register via Route 53 or elsewhere? | No (M5) | Israel | Deferred to keep costs at $0; check availability early |
| Q8 | Contact: shared "work with us" email/alias, per-member links, or both? | No (M3) | Family | |
| Q9 | Privacy: what is each member comfortable publishing (photo, full name, location, email)? | No (M5) | Each member | |
| Q10 | Design inspiration or brand colours? Keep the accent ("Calderón") in the logo? | No (M4) | Family | |

## Resolved

| # | Question | Answer | Recorded in |
|---|---|---|---|
| Q1 | Stack | Next.js static export + TS + Tailwind + MDX in Git; no database | ADR-0002 |
| Q2 / Q11 | Hosting | AWS: S3 + CloudFront + CDK, cost kept at or near $0 | ADR-0003 |
| Q3 | Brand name | **Casa Calderon** (for now). Other candidates were Calderones, Caldera, Calderón Patiño & Co., Los Calderón | README, Vision |
| Q5 | Members | Israel, Cristhyan, Marcy, Benjamin Calderon; all on board. Parents possibly later | README, content model `kind` |
| Q6 | Who contributes | Israel builds solo through M3, then showcases to siblings, who join from M4 | Roadmap, CONTRIBUTING |
| Q7 | Focus | Leaning towards freelance clients, but also personal: who we are as people | Vision ("Tone") |
| Q12 | Roles | Israel: full-stack (lead); Cristhyan & Marcy: software engineers; Benjamin: incoming CS student | README |
| Q13 | AWS region / account | `eu-west-2` (London), existing `aws-calderon` account | ADR-0003 |
