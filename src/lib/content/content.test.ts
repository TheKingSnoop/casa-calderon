import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createContentStore, shouldShowDrafts } from "./index";
import { ContentError, coverFiles, loadContent } from "./loader";

// ── Helpers ─────────────────────────────────────────────────────────────────

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

/** Creates <tmp>/content with the given files, e.g. { "members/ana.md": "..." } */
function makeContent(files: Record<string, string>): string {
  const root = path.join(
    mkdtempSync(path.join(tmpdir(), "content-test-")),
    "content",
  );
  tempDirs.push(path.dirname(root));
  for (const [file, text] of Object.entries(files)) {
    const full = path.join(root, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, text);
  }
  return root;
}

const md = (frontmatter: string, body = "") =>
  `---\n${frontmatter.trim()}\n---\n${body}`;

const ana = md(
  `
name: Ana Example
role: Software engineer
order: 2
published: true
links:
  github: https://github.com/ana
  email: ana@example.com
skills:
  - category: Languages
    items: [TypeScript, Go]
`,
  "Ana builds APIs.",
);

const ben = md(
  `
name: Ben Example
role: Incoming CS student
order: 1
`,
  "Ben is starting university.",
);

const jointProject = md(
  `
title: Joint app
summary: Built together.
members: [ana, ben]
type: personal
tech: [Next.js]
date: 2026-11-01
published: true
`,
  "## Problem\nSomething.",
);

const confidentialProject = md(`
title: Client work
summary: Under NDA.
members: [ana]
type: professional
confidential: true
date: 2025-06
`);

const validFiles = {
  "members/ana.md": ana,
  "members/ben.md": ben,
  "projects/joint-app.md": jointProject,
  "projects/client-work.md": confidentialProject,
};

/** Runs loadContent and returns the issue messages ("file → message") */
function errorsFor(files: Record<string, string>): string[] {
  try {
    loadContent(makeContent(files));
  } catch (error) {
    if (error instanceof ContentError) {
      return error.issues.map((i) => `${i.file} → ${i.message}`);
    }
    throw error;
  }
  throw new Error("expected loadContent to throw a ContentError");
}

// ── Valid content ───────────────────────────────────────────────────────────

describe("loadContent: valid content", () => {
  it("loads members and projects, with slugs from file names", () => {
    const { members, projects } = loadContent(makeContent(validFiles));
    expect(members.map((m) => m.slug)).toEqual(["ben", "ana"]); // sorted by order
    expect(projects.map((p) => p.slug)).toEqual(["joint-app", "client-work"]); // newest first
    expect(members[1].bio).toBe("Ana builds APIs.");
    expect(projects[0].body).toContain("## Problem");
  });

  it("applies defaults (kind, published, links, tech, featured, confidential)", () => {
    const { members, projects } = loadContent(makeContent(validFiles));
    const ben = members.find((m) => m.slug === "ben")!;
    expect(ben).toMatchObject({ kind: "core", published: false, links: {} });
    const client = projects.find((p) => p.slug === "client-work")!;
    expect(client).toMatchObject({
      tech: [],
      featured: false,
      published: false,
    });
  });

  it('normalises unquoted YAML dates (2026-11-01) to "YYYY-MM-DD"', () => {
    const { projects } = loadContent(makeContent(validFiles));
    expect(projects[0].date).toBe("2026-11-01");
  });

  it("treats a missing content folder as empty", () => {
    expect(loadContent(path.join(tmpdir(), "does-not-exist-content"))).toEqual({
      collective: null,
      members: [],
      projects: [],
    });
  });

  it("ignores hidden files and files starting with _", () => {
    const { members } = loadContent(
      makeContent({
        ...validFiles,
        "members/.gitkeep": "",
        "members/_notes.md": "x",
      }),
    );
    expect(members).toHaveLength(2);
  });

  it("allows family members without a bio or skills", () => {
    const { members } = loadContent(
      makeContent({
        "members/mum.md": md("name: Mum\nrole: Family\nkind: family\norder: 9"),
      }),
    );
    expect(members[0]).toMatchObject({ slug: "mum", kind: "family", bio: "" });
  });
});

// ── Invalid content: each rule produces a clear, located message ────────────

describe("loadContent: invalid content", () => {
  it("reports a missing required field", () => {
    expect(
      errorsFor({ "members/ana.md": md("role: Dev\norder: 1", "Bio") }),
    ).toEqual([expect.stringMatching(/^content\/members\/ana\.md → name: /)]);
  });

  it("rejects unknown keys such as typos", () => {
    const errors = errorsFor({
      "members/ana.md": md(
        "name: Ana\nrole: Dev\norder: 1\nlinks:\n  linkdin: https://x.com",
        "Bio",
      ),
    });
    expect(errors.join("\n")).toMatch(/links: Unrecognized key: "linkdin"/);
  });

  it("validates URLs and email addresses", () => {
    const errors = errorsFor({
      "members/ana.md": md(
        "name: Ana\nrole: Dev\norder: 1\nlinks:\n  github: not-a-url\n  email: nope",
        "Bio",
      ),
    });
    expect(errors).toEqual([
      expect.stringContaining("links.github: Invalid URL"),
      expect.stringContaining("links.email: Invalid email"),
    ]);
  });

  it("requires a bio for core members", () => {
    expect(
      errorsFor({ "members/ana.md": md("name: Ana\nrole: Dev\norder: 1") }),
    ).toEqual([expect.stringContaining("bio: add a short bio")]);
  });

  it("rejects badly formatted dates", () => {
    const errors = errorsFor({
      ...validFiles,
      "projects/joint-app.md": jointProject.replace(
        "date: 2026-11-01",
        "date: Nov 2026",
      ),
    });
    expect(errors.join("\n")).toMatch(/joint-app\.md → date: Use "YYYY-MM"/);
  });

  it("rejects links on confidential projects", () => {
    const errors = errorsFor({
      ...validFiles,
      "projects/client-work.md": confidentialProject.replace(
        "confidential: true",
        "confidential: true\nlinks:\n  repo: https://github.com/x/y",
      ),
    });
    expect(errors).toEqual([
      expect.stringContaining("links: Confidential projects can't"),
    ]);
  });

  it("rejects project members that don't exist", () => {
    const errors = errorsFor({
      ...validFiles,
      "projects/joint-app.md": jointProject.replace(
        "[ana, ben]",
        "[ana, benjy]",
      ),
    });
    expect(errors).toEqual([
      'content/projects/joint-app.md → members[1]: unknown member "benjy" (expected a file content/members/benjy.md)',
    ]);
  });

  it("requires alt text on images", () => {
    const errors = errorsFor({
      ...validFiles,
      "projects/joint-app.md": jointProject.replace(
        "published: true",
        'published: true\nimages:\n  - src: /images/ana/shot.webp\n    alt: ""',
      ),
    });
    expect(errors.join("\n")).toMatch(/images\[0\]\.alt: Must not be empty/);
  });

  it("limits card summaries to 160 characters", () => {
    const errors = errorsFor({
      ...validFiles,
      "projects/joint-app.md": jointProject.replace(
        "Built together.",
        "x".repeat(161),
      ),
    });
    expect(errors.join("\n")).toMatch(
      /summary: Keep the summary to 160 characters/,
    );
  });

  it("rejects file names that can't be URLs, and non-.md files", () => {
    const errors = errorsFor({
      ...validFiles,
      "members/Ana Smith.md": ana,
      "members/ben.mdx": ben,
    });
    expect(errors).toEqual([
      expect.stringContaining('"Ana Smith" must use lowercase letters'),
      expect.stringContaining("ben.mdx → unsupported file type"),
    ]);
  });

  it("reports malformed YAML instead of crashing", () => {
    const errors = errorsFor({
      "members/ana.md": "---\nname: [unclosed\n---\nBio",
    });
    expect(errors).toEqual([
      expect.stringContaining("could not read frontmatter"),
    ]);
  });

  it("collects every problem across all files in one error", () => {
    const errors = errorsFor({
      "members/ana.md": md("role: Dev\norder: 1", "Bio"),
      "members/ben.md": md("name: Ben\nrole: Dev\norder: -1", "Bio"),
      "projects/x.md": md(
        "title: X\nsummary: S\nmembers: [ana]\ntype: personal\ndate: 2026-01",
      ),
    });
    expect(errors).toHaveLength(3); // ana: name, ben: order, x: unknown member (ana invalid)
  });
});

// ── Collective (content/collective.md) ──────────────────────────────────────

const collective = md(
  `
tagline: Building together.
pitch: A family of developers.
services:
  - title: Web apps
    description: Full-stack web applications.
`,
  "Our story starts here.",
);

describe("collective.md", () => {
  it("loads the home page content with the body as the story", () => {
    const content = loadContent(makeContent({ "collective.md": collective }));
    expect(content.collective).toMatchObject({
      tagline: "Building together.",
      services: [{ title: "Web apps" }],
      published: false,
      story: "Our story starts here.",
    });
  });

  it("is optional (no file means no home page content yet)", () => {
    expect(loadContent(makeContent(validFiles)).collective).toBeNull();
  });

  it("is validated like everything else", () => {
    const errors = errorsFor({
      "collective.md": md("tagline: Hi\npitch: P\nservices: []\nslogan: typo"),
    });
    expect(errors).toEqual([
      expect.stringContaining(
        "content/collective.md → services: List at least one service",
      ),
      expect.stringContaining('Unrecognized key: "slogan"'),
    ]);
  });

  it("accepts a cover photo whose generated files exist", () => {
    const rootDir = makeContent({
      "collective.md": collective.replace(
        "tagline:",
        "cover:\n  src: /images/site/cover\n  alt: A sunset\ntagline:",
      ),
    });
    // public/ next to content/, with every size `npm run images` writes
    for (const file of coverFiles("/images/site/cover")) {
      const full = path.join(rootDir, "..", "public", file);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, "");
    }
    expect(loadContent(rootDir).collective?.cover).toEqual({
      src: "/images/site/cover",
      alt: "A sunset",
    });
  });

  it("reports a cover photo whose files are missing, with the fix", () => {
    const errors = errorsFor({
      "collective.md": collective.replace(
        "tagline:",
        "cover:\n  src: /images/site/nope\n  alt: A sunset\ntagline:",
      ),
    });
    expect(errors).toEqual([
      expect.stringMatching(
        /cover\.src: missing public\/images\/site\/nope-640\.avif.*Run: npm run images/,
      ),
    ]);
  });

  it("checks the dark-mode cover's files too", () => {
    const rootDir = makeContent({
      "collective.md": collective.replace(
        "tagline:",
        "cover:\n  src: /images/site/day\n  srcDark: /images/site/night\n  alt: Hills\ntagline:",
      ),
    });
    for (const file of coverFiles("/images/site/day")) {
      const full = path.join(rootDir, "..", "public", file);
      mkdirSync(path.dirname(full), { recursive: true });
      writeFileSync(full, "");
    }
    try {
      loadContent(rootDir);
      throw new Error("expected a ContentError");
    } catch (error) {
      const messages = (error as ContentError).issues.map((i) => i.message);
      expect(messages).toEqual([
        expect.stringMatching(
          /^cover\.srcDark: missing public\/images\/site\/night-640\.avif/,
        ),
      ]);
    }
  });

  it("rejects a cover path with a width or extension, and a missing alt", () => {
    const errors = errorsFor({
      "collective.md": collective.replace(
        "tagline:",
        'cover:\n  src: /images/site/cover-1920.webp\n  alt: ""\ntagline:',
      ),
    });
    expect(errors.join("\n")).toMatch(/cover\.src: Use the base path/);
    expect(errors.join("\n")).toMatch(/cover\.alt: Must not be empty/);
  });

  it("is hidden until published (unless drafts are shown)", () => {
    const rootDir = makeContent({ "collective.md": collective });
    expect(
      createContentStore({ rootDir, showDrafts: false }).getCollective(),
    ).toBeNull();
    expect(
      createContentStore({ rootDir, showDrafts: true }).getCollective(),
    ).not.toBeNull();
  });
});

// ── Draft visibility (NFR-6) ────────────────────────────────────────────────

describe("content store: draft visibility", () => {
  it("hides unpublished members and projects when drafts are off (live site)", () => {
    const store = createContentStore({
      rootDir: makeContent(validFiles),
      showDrafts: false,
    });
    expect(store.getMembers().map((m) => m.slug)).toEqual(["ana"]);
    expect(store.getProjects().map((p) => p.slug)).toEqual(["joint-app"]);
    expect(store.getMember("ben")).toBeUndefined();
    expect(store.getProject("client-work")).toBeUndefined();
  });

  it("shows everything when drafts are on (local dev)", () => {
    const store = createContentStore({
      rootDir: makeContent(validFiles),
      showDrafts: true,
    });
    expect(store.getMembers()).toHaveLength(2);
    expect(store.getProjects()).toHaveLength(2);
  });

  it("filters projects by member and type", () => {
    const store = createContentStore({
      rootDir: makeContent(validFiles),
      showDrafts: true,
    });
    expect(store.getProjects({ member: "ben" }).map((p) => p.slug)).toEqual([
      "joint-app",
    ]);
    expect(
      store.getProjects({ type: "professional" }).map((p) => p.slug),
    ).toEqual(["client-work"]);
  });

  it("shows drafts in development or with SHOW_DRAFTS=true, never in production by default", () => {
    expect(shouldShowDrafts({ NODE_ENV: "development" })).toBe(true);
    expect(shouldShowDrafts({ NODE_ENV: "production" })).toBe(false);
    expect(
      shouldShowDrafts({ NODE_ENV: "production", SHOW_DRAFTS: "true" }),
    ).toBe(true);
    expect(shouldShowDrafts({ NODE_ENV: "test" })).toBe(false);
  });
});

// ── The real content/ folder ────────────────────────────────────────────────

describe("content/ (the real files)", () => {
  it("is valid", () => {
    expect(() =>
      loadContent(path.join(process.cwd(), "content")),
    ).not.toThrow();
  });
});
