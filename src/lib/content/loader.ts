import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  memberFrontmatterSchema,
  projectFrontmatterSchema,
  SLUG_PATTERN,
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
  /** Sorted by `order`, then name */
  members: Member[];
  /** Sorted newest first */
  projects: Project[];
};

/**
 * Reads and validates everything in `<rootDir>/members` and `<rootDir>/projects`.
 * Throws a ContentError listing *all* problems if anything is invalid.
 * Drafts are included; visibility is decided by the content store (./index.ts).
 */
export function loadContent(rootDir: string): Content {
  const issues: ContentIssue[] = [];
  const label = (folder: string, file: string) =>
    [path.basename(rootDir), folder, file].join("/");

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
    members: members.sort(
      (a, b) => a.order - b.order || a.name.localeCompare(b.name),
    ),
    projects: projects.sort((a, b) => b.date.localeCompare(a.date)),
  };
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

    try {
      const { data, content } = matter(
        readFileSync(path.join(dir, name), "utf8"),
      );
      entries.push({ slug, file, data, body: content.trim() });
    } catch (error) {
      issues.push({
        file,
        message: `could not read frontmatter (YAML between the --- lines): ${(error as Error).message.split("\n")[0]}`,
      });
    }
  }
  return entries;
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
