import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  collectiveFrontmatterSchema,
  CV_PATH_PATTERN,
  memberFrontmatterSchema,
  projectFrontmatterSchema,
  SLUG_PATTERN,
  type Collective,
  type Member,
  type Project,
} from "./schema";

// NOTE: relative imports only (no "@/..."), so scripts/check-content.ts can
// load this file with tsx outside of Next.js.

export type ContentIssue = {
  /** e.g. "content/members/marcy.md" */
  file: string;
  /** e.g. "links.github: Invalid URL" */
  message: string;
};

/** Thrown when any content file is invalid. Lists every problem at once. */
export class ContentError extends Error {
  constructor(readonly issues: ContentIssue[]) {
    super(
      [
        `Content errors (${issues.length}):`,
        ...issues.map((i) => `  ${i.file} → ${i.message}`),
        "",
        'See CONTRIBUTING.md, "Adding your content", for the expected format.',
      ].join("\n"),
    );
    this.name = "ContentError";
  }
}

export type Content = {
  /** content/collective.md, or null if the file doesn't exist yet */
  collective: Collective | null;
  /** Sorted by `order`, then name */
  members: Member[];
  /** Sorted newest first */
  projects: Project[];
};

/**
 * Reads and validates `<rootDir>/collective.md`, `<rootDir>/members` and `<rootDir>/projects`.
 * Throws a ContentError listing *all* problems if anything is invalid.
 * Drafts are included; visibility is decided by the content store (./index.ts).
 */
export function loadContent(rootDir: string): Content {
  const issues: ContentIssue[] = [];
  const label = (folder: string, file: string) =>
    [path.basename(rootDir), folder, file].filter(Boolean).join("/");

  let collective: Collective | null = null;
  const collectivePath = path.join(rootDir, "collective.md");
  if (existsSync(collectivePath)) {
    const entry = readMarkdown(
      collectivePath,
      label("", "collective.md"),
      issues,
    );
    if (entry) {
      const parsed = collectiveFrontmatterSchema.safeParse(entry.data);
      if (parsed.success) {
        collective = { ...parsed.data, story: entry.body };
        const cover = parsed.data.cover;
        if (cover) {
          // Check every generated size exists.
          const variants = [
            ["src", cover.src],
            ["srcDark", cover.srcDark],
          ] as const;
          for (const [field, src] of variants) {
            if (!src) continue;
            const missing = coverFiles(src).filter(
              (file) => !existsSync(publicFile(rootDir, file)),
            );
            if (missing.length > 0) {
              issues.push({
                file: entry.file,
                message: `cover.${field}: missing ${missing.map((f) => `public${f}`).join(", ")}. Run: npm run images -- <photo> <folder> <name>`,
              });
            }
          }
        }
      } else {
        addZodIssues(issues, entry.file, parsed.error);
      }
    }
  }

  const members = readCollection(rootDir, "members", issues, label).flatMap(
    ({ slug, file, data, body }) => {
      const parsed = memberFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        addZodIssues(issues, file, parsed.error);
        return [];
      }
      if (parsed.data.kind === "core" && body.length === 0) {
        issues.push({
          file,
          message: "bio: add a short bio below the frontmatter (---)",
        });
        return [];
      }
      const cv = parsed.data.links.cv;
      if (
        cv &&
        CV_PATH_PATTERN.test(cv) &&
        !existsSync(publicFile(rootDir, cv))
      ) {
        issues.push({
          file,
          message: `links.cv: missing public${cv}. Add the PDF there, or use a URL`,
        });
      }
      return [{ ...parsed.data, slug, bio: body } satisfies Member];
    },
  );

  const projectFiles = new Map<string, string>(); // slug → file, for messages
  const projects = readCollection(rootDir, "projects", issues, label).flatMap(
    ({ slug, file, data, body }) => {
      const parsed = projectFrontmatterSchema.safeParse(data);
      if (!parsed.success) {
        addZodIssues(issues, file, parsed.error);
        return [];
      }
      projectFiles.set(slug, file);
      return [{ ...parsed.data, slug, body } satisfies Project];
    },
  );

  // Cross-check: every project member must be an existing member file.
  // (Only meaningful if the member files themselves were readable.)
  const memberSlugs = new Set(members.map((m) => m.slug));
  for (const project of projects) {
    project.members.forEach((slug, index) => {
      if (!memberSlugs.has(slug)) {
        issues.push({
          file: projectFiles.get(project.slug)!,
          message: `members[${index}]: unknown member "${slug}" (expected a file content/members/${slug}.md)`,
        });
      }
    });
  }

  if (issues.length > 0) throw new ContentError(issues);

  return {
    collective,
    members: members.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name),
    ),
    projects: projects.sort((a, b) => b.date.localeCompare(a.date)),
  };
}

/** public/ sits next to content/: "/files/a.pdf" → <root>/../public/files/a.pdf */
function publicFile(rootDir: string, urlPath: string): string {
  return path.join(rootDir, "..", "public", urlPath);
}

/**
 * The files `npm run images` produces for a base path. Must match
 * IMAGE_WIDTHS / IMAGE_FORMATS in scripts/lib/images.ts.
 */
export const COVER_WIDTHS = [640, 1280, 1920] as const;
export const COVER_FORMATS = ["avif", "webp"] as const;
export function coverFiles(src: string): string[] {
  return COVER_WIDTHS.flatMap((w) =>
    COVER_FORMATS.map((f) => `${src}-${w}.${f}`),
  );
}

type RawEntry = { slug: string; file: string; data: unknown; body: string };

function readCollection(
  rootDir: string,
  folder: string,
  issues: ContentIssue[],
  label: (folder: string, file: string) => string,
): RawEntry[] {
  const dir = path.join(rootDir, folder);
  if (!existsSync(dir)) return [];

  const entries: RawEntry[] = [];
  for (const name of readdirSync(dir).sort()) {
    // Hidden files (.gitkeep) and drafts-in-progress (_notes.md) are ignored.
    if (name.startsWith(".") || name.startsWith("_")) continue;

    const file = label(folder, name);
    if (path.extname(name) !== ".md") {
      issues.push({
        file,
        message: "unsupported file type: content files must end in .md",
      });
      continue;
    }

    const slug = path.basename(name, ".md");
    if (!SLUG_PATTERN.test(slug)) {
      issues.push({
        file,
        message: `file name "${slug}" must use lowercase letters, numbers and hyphens (it becomes the URL)`,
      });
      continue;
    }

    const entry = readMarkdown(path.join(dir, name), file, issues);
    if (entry) entries.push({ slug, ...entry });
  }
  return entries;
}

/** Parses one Markdown file; records an issue and returns null on bad YAML. */
function readMarkdown(
  fullPath: string,
  file: string,
  issues: ContentIssue[],
): { file: string; data: unknown; body: string } | null {
  try {
    const { data, content } = matter(readFileSync(fullPath, "utf8"));
    return { file, data, body: content.trim() };
  } catch (error) {
    issues.push({
      file,
      message: `could not read frontmatter (YAML between the --- lines): ${(error as Error).message.split("\n")[0]}`,
    });
    return null;
  }
}

function addZodIssues(issues: ContentIssue[], file: string, error: z.ZodError) {
  for (const issue of error.issues) {
    const where = formatPath(issue.path);
    issues.push({
      file,
      message: where ? `${where}: ${issue.message}` : issue.message,
    });
  }
}

/** ["links", "github"] → "links.github"; ["skills", 0, "items"] → "skills[0].items" */
function formatPath(segments: PropertyKey[]): string {
  return segments.reduce<string>((out, segment) => {
    if (typeof segment === "number") return `${out}[${segment}]`;
    const key = String(segment);
    return out ? `${out}.${key}` : key;
  }, "");
}
