import { z } from "zod";

/**
 * Content schemas: the rules every file in content/ must follow.
 * See docs/decisions/0005-content-pipeline.md and CONTRIBUTING.md
 * ("Adding your content") for examples.
 *
 * Objects are *strict*: unknown keys (e.g. a typo like `linkdin:`) are errors,
 * not silently ignored.
 */

/** File names become URL slugs: lowercase letters, digits and hyphens. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * "2026-11" or "2026-11-01". YAML turns an unquoted 2026-11-01 into a Date,
 * so accept that too and normalise it back to "YYYY-MM-DD".
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/,
      'Use "YYYY-MM" or "YYYY-MM-DD", e.g. "2026-11"',
    ),
);

const nonEmpty = z.string().trim().min(1, "Must not be empty");

/** Paths to files in public/, e.g. "/images/israel/avatar.webp" */
const publicImagePath = z
  .string()
  .regex(/^\/images\/.+\.(png|jpe?g|webp|avif|svg)$/, {
    message: 'Must be a path like "/images/<your-slug>/photo.webp"',
  });

// ── Member ──────────────────────────────────────────────────────────────────

export const memberLinksSchema = z.strictObject({
  github: z.url().optional(),
  linkedin: z.url().optional(),
  website: z.url().optional(),
  /** Path to a PDF in public/, or a URL */
  cv: z.string().min(1).optional(),
  email: z.email().optional(),
});

export const memberFrontmatterSchema = z.strictObject({
  name: nonEmpty,
  /** core = developer members; family = e.g. parents (skills/projects optional) */
  kind: z.enum(["core", "family"]).default("core"),
  role: nonEmpty,
  tagline: nonEmpty.optional(),
  avatar: publicImagePath.optional(),
  /** Display order on the collective page (lower first) */
  order: z.int().min(0),
  /** Privacy sign-off (NFR-6): only `true` appears on the live site */
  published: z.boolean().default(false),
  /** e.g. "Available for freelance" */
  status: nonEmpty.optional(),
  skills: z
    .array(
      z.strictObject({ category: nonEmpty, items: z.array(nonEmpty).min(1) }),
    )
    .optional(),
  experience: z
    .array(
      z.strictObject({
        title: nonEmpty,
        org: nonEmpty,
        kind: z.enum(["work", "education", "achievement"]),
        start: isoDate,
        /** Omit for "present" */
        end: isoDate.optional(),
        summary: nonEmpty.optional(),
      }),
    )
    .optional(),
  certifications: z
    .array(
      z.strictObject({
        name: nonEmpty,
        issuer: nonEmpty,
        date: isoDate,
        /** Verification link, e.g. a Credly badge */
        url: z.url().optional(),
      }),
    )
    .optional(),
  /** "Beyond the code" (FR-16) */
  interests: z.array(nonEmpty).optional(),
  links: memberLinksSchema.default({}),
});

export type MemberFrontmatter = z.infer<typeof memberFrontmatterSchema>;

export type Member = MemberFrontmatter & {
  slug: string;
  /** Markdown body of the file */
  bio: string;
};

// ── Collective (content/collective.md: the home page) ───────────────────────

/** Base path of an image made by `npm run images` (no width or extension) */
const imageBasePath = z.string().regex(/^\/images\/[a-z0-9-]+\/[a-z0-9-]+$/, {
  message:
    'Use the base path printed by `npm run images`, e.g. "/images/site/cover" (no width or extension)',
});

export const collectiveFrontmatterSchema = z.strictObject({
  /** Hero headline under the site name */
  tagline: nonEmpty.max(120, "Keep the tagline to 120 characters or fewer"),
  /** One or two sentences under the tagline */
  pitch: nonEmpty.max(300, "Keep the pitch to 300 characters or fewer"),
  /** "What we offer" (FR-4) */
  services: z
    .array(z.strictObject({ title: nonEmpty, description: nonEmpty }))
    .min(1, "List at least one service"),
  /** "Work with us" (FR-6): text above the list of members */
  contact: nonEmpty.optional(),
  /**
   * Full-width hero photo, prepared with `npm run images`. `src` is the base
   * path without width/extension, e.g. "/images/site/cover"; the loader checks
   * the files exist.
   */
  cover: z
    .strictObject({
      src: imageBasePath,
      /** Optional dark-mode version, shown to visitors using dark mode */
      srcDark: imageBasePath.optional(),
      alt: nonEmpty.describe("Describe the photo for screen readers"),
    })
    .optional(),
  /** Family sign-off: only `true` replaces "Coming soon" on the live site */
  published: z.boolean().default(false),
});

export type Collective = z.infer<typeof collectiveFrontmatterSchema> & {
  /** Markdown body: "Our story" (FR-7) */
  story: string;
};

// ── Project ─────────────────────────────────────────────────────────────────

export const projectFrontmatterSchema = z
  .strictObject({
    title: nonEmpty,
    /** One-liner for cards */
    summary: nonEmpty.max(160, "Keep the summary to 160 characters or fewer"),
    /** Member slugs (file names in content/members). 2+ = joint project */
    members: z.array(nonEmpty).min(1, "List at least one member"),
    type: z.enum(["professional", "personal"]),
    /** Under NDA: describe at a high level, no code/demo links (FR-23) */
    confidential: z.boolean().default(false),
    tech: z.array(nonEmpty).default([]),
    links: z
      .strictObject({
        repo: z.url().optional(),
        live: z.url().optional(),
        caseStudy: z.url().optional(),
      })
      .optional(),
    images: z
      .array(
        z.strictObject({
          src: publicImagePath,
          alt: nonEmpty.describe("Describe the image for screen readers"),
        }),
      )
      .optional(),
    date: isoDate,
    /** Show on the collective page */
    featured: z.boolean().default(false),
    /** Privacy sign-off (NFR-6): only `true` appears on the live site */
    published: z.boolean().default(false),
  })
  .superRefine((project, ctx) => {
    if (project.confidential && project.links) {
      ctx.addIssue({
        code: "custom",
        path: ["links"],
        message: "Confidential projects can't have repo/live/case-study links",
      });
    }
  });

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type ProjectType = ProjectFrontmatter["type"];

export type Project = ProjectFrontmatter & {
  slug: string;
  /** Markdown body: problem, approach, outcome */
  body: string;
};
