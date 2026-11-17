# 01 · Vision & Scope

## Problem

Each of us could build a separate portfolio, but four disconnected sites undersell the family. Together we cover more range: full-stack, software engineering, and an up-and-coming CS student. A combined site lets us present that range like a small studio, while each person still gets credit for their own work, and shows we're real people, not just a list of skills.

## Vision

> **Casa Calderon** is a professional but warm home for the Calderon Patiño family's work. Clients see a capable team they could hire **together**. Everyone sees who we are **individually**, both as developers and as people.

## Tone

**Studio first, family always.** The site should be credible enough to win freelance work, but not a hard-sell agency page. Think "small, friendly studio run by siblings": clear services and proof of work, plus personality (interests, story, life outside code).

## Goals

| #   | Goal                                                               | How we'll know                                                                      |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| G1  | Showcase each member's skills, experience and projects             | Every member has a complete individual page                                         |
| G2  | Present the family as a collective that clients can hire           | The collective page clearly says what we offer and how to get in touch              |
| G3  | Show professional **and** personal projects, clearly labelled      | Projects can be filtered by type and by member                                      |
| G4  | Show who we are beyond the code                                    | Each member page has a personal section; the collective page tells the family story |
| G5  | Make it easy for every member to keep their own content up to date | A member can add a project without touching app code                                |
| G6  | Serve as a well-documented, well-engineered project itself         | Docs, CI, tests, infrastructure as code. The repo is part of the portfolio          |
| G7  | Get hands-on AWS practice (Solutions Architect, AI Practitioner)   | Site hosted on AWS via CDK; AI features explored post-launch                        |
| G8  | Learn and measure how an AI coding assistant affects delivery      | Notes kept per milestone (see Roadmap)                                              |

## Audiences (in priority order)

1. **Potential clients & collaborators.** Want to know what we can build, see proof, and contact us easily.
2. **Recruiters & hiring managers.** Scan individual pages for skills and experience.
3. **Peers & the developer community.** Interested in projects and code.
4. **Friends & family.** Want to see who we are.
5. **The family as maintainers.** Keep their own content up to date.

## In scope (for v1)

- Collective landing page: who we are, what we offer, featured work, family story, contact
- One page per member: bio, skills, experience, projects, links, personal interests
- Project pages: professional & personal, solo & joint
- Responsive, accessible, fast, SEO-friendly
- Content stored in the repo, editable by each member
- Hosted on AWS with infrastructure as code

## Out of scope (for v1), candidates for later

- Pages for non-developer family members (our parents). The content model should allow them, though
- AI features (e.g. an "ask us about our work" assistant on Amazon Bedrock)
- User accounts / login / admin dashboard
- Blog
- Contact form with a backend (v1 uses links/email)
- Paid services, invoicing, client portal
- Internationalisation (a Spanish version could be a nice later touch)

## Guiding principles

- **Ship small, ship often.** Each milestone ends in something deployable.
- **Content over chrome.** The work and the people are the hero, not animations.
- **Consent & privacy first.** Each member approves their own page; no personal data beyond what they choose to publish (see Requirements, NFR-6).
- **Secure and cheap by default on AWS.** Least-privilege IAM, no long-lived keys, budget alarms before deploying.
- **Document decisions.** Anything non-obvious gets an ADR.
