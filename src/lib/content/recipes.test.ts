import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { splitSections } from "../recipe";
import { createContentStore } from "./index";
import { ContentError, coverFiles, loadContent } from "./loader";

// The Kitchen space (ADR-0006): content/members/<slug>/kitchen/<recipe>.md

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

function makeContent(files: Record<string, string>): string {
  const root = path.join(
    mkdtempSync(path.join(tmpdir(), "recipes-test-")),
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

/** Creates the files `npm run images` would make for a base path */
function addImage(rootDir: string, src: string) {
  for (const file of coverFiles(src)) {
    const full = path.join(rootDir, "..", "public", file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, "");
  }
}

const md = (frontmatter: string, body = "") =>
  `---\n${frontmatter.trim()}\n---\n${body}`;

const member = (extra = "spaces: [kitchen]\npublished: true") =>
  md(`name: Ana Example\nrole: Dev\norder: 1\n${extra}`, "Bio");

const RECIPE_BODY = "## Ingredients\n\n- Rice\n\n## Method\n\n1. Cook it.";

const recipe = (frontmatter: string, body = RECIPE_BODY) =>
  md(frontmatter, body);

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

describe("recipes: valid content", () => {
  it("loads a member's recipes, newest first, with defaults", () => {
    const { recipes } = loadContent(
      makeContent({
        "members/ana.md": member(),
        "members/ana/kitchen/rice.md": recipe("title: Rice\ndate: 2026-11-01"),
        "members/ana/kitchen/soup.md": recipe(
          "title: Soup\ndate: 2026-11-20\npublished: true",
        ),
      }),
    );
    expect(recipes.map((r) => [r.slug, r.member])).toEqual([
      ["soup", "ana"],
      ["rice", "ana"],
    ]);
    expect(recipes[1]).toMatchObject({ published: false, photos: [] });
    expect(recipes[1].body).toContain("## Method");
  });

  it("accepts photos whose generated files exist", () => {
    const rootDir = makeContent({
      "members/ana.md": member(),
      "members/ana/kitchen/rice.md": recipe(
        "title: Rice\ndate: 2026-11-01\nphotos:\n  - src: /images/ana/rice\n    alt: A bowl of rice",
      ),
    });
    addImage(rootDir, "/images/ana/rice");
    expect(loadContent(rootDir).recipes[0].photos).toEqual([
      { src: "/images/ana/rice", alt: "A bowl of rice" },
    ]);
  });
});

describe("recipes: invalid content", () => {
  it("needs Ingredients and Method sections", () => {
    const errors = errorsFor({
      "members/ana.md": member(),
      "members/ana/kitchen/rice.md": recipe(
        "title: Rice\ndate: 2026-11-01",
        "Just cook it.",
      ),
    });
    expect(errors).toEqual([
      'content/members/ana/kitchen/rice.md → add a "## Ingredients" section to the recipe',
      'content/members/ana/kitchen/rice.md → add a "## Method" section to the recipe',
    ]);
  });

  it("reports missing photo files, with the fix", () => {
    const errors = errorsFor({
      "members/ana.md": member(),
      "members/ana/kitchen/rice.md": recipe(
        "title: Rice\ndate: 2026-11-01\nphotos:\n  - src: /images/ana/nope\n    alt: Rice",
      ),
    });
    expect(errors).toEqual([
      expect.stringMatching(
        /photos\[0\]\.src: missing public\/images\/ana\/nope-640\.avif.*Run: npm run images/,
      ),
    ]);
  });

  it("requires alt text, a date and a title", () => {
    const errors = errorsFor({
      "members/ana.md": member(),
      "members/ana/kitchen/rice.md": recipe(
        "photos:\n  - src: /images/ana/rice",
      ),
    });
    expect(errors.join("\n")).toMatch(/title: /);
    expect(errors.join("\n")).toMatch(/date: /);
    expect(errors.join("\n")).toMatch(/photos\[0\]\.alt: /);
  });

  it("asks for spaces: [kitchen] when a member has recipes but no kitchen tab", () => {
    const errors = errorsFor({
      "members/ana.md": member("published: true"),
      "members/ana/kitchen/rice.md": recipe("title: Rice\ndate: 2026-11-01"),
    });
    expect(errors).toEqual([
      expect.stringContaining(
        'add "spaces: [kitchen]" to content/members/ana.md',
      ),
    ]);
  });

  it("rejects folders for unknown members and unknown spaces", () => {
    const errors = errorsFor({
      "members/ana.md": member(),
      "members/ana/garden/tomatoes.md": "x",
      "members/bob/kitchen/rice.md": "x",
    });
    expect(errors).toEqual([
      expect.stringContaining('ana/garden → unknown space: only "kitchen/"'),
      expect.stringContaining('folder for unknown member "bob"'),
    ]);
  });

  it("rejects an unknown space in the member file", () => {
    const errors = errorsFor({
      "members/ana.md": member("spaces: [garden]"),
    });
    expect(errors).toEqual([expect.stringContaining("spaces[0]: ")]);
  });
});

describe("content store: recipes", () => {
  const files = (memberPublished: boolean) => ({
    "members/ana.md": member(
      `spaces: [kitchen]\npublished: ${memberPublished}`,
    ),
    "members/ana/kitchen/draft.md": recipe("title: Draft\ndate: 2026-11-01"),
    "members/ana/kitchen/live.md": recipe(
      "title: Live\ndate: 2026-11-02\npublished: true",
    ),
  });

  it("hides unpublished recipes on the live site", () => {
    const store = createContentStore({
      rootDir: makeContent(files(true)),
      showDrafts: false,
    });
    expect(store.getRecipes("ana").map((r) => r.slug)).toEqual(["live"]);
    expect(store.getRecipe("ana", "draft")).toBeUndefined();
  });

  it("hides every recipe while the member's page is unpublished", () => {
    const store = createContentStore({
      rootDir: makeContent(files(false)),
      showDrafts: false,
    });
    expect(store.getRecipes("ana")).toEqual([]);
  });

  it("shows drafts in local development", () => {
    const store = createContentStore({
      rootDir: makeContent(files(false)),
      showDrafts: true,
    });
    expect(store.getRecipes("ana").map((r) => r.slug)).toEqual([
      "live",
      "draft",
    ]);
  });
});

describe("splitSections", () => {
  it("splits at ## headings and keeps ### sub-headings inside a section", () => {
    expect(
      splitSections(
        "A story.\n\n## Ingredients\n\n### Sauce\n\n- Honey\n\n## Method\n\n1. Mix.",
      ),
    ).toEqual({
      intro: "A story.",
      sections: [
        { title: "Ingredients", body: "### Sauce\n\n- Honey" },
        { title: "Method", body: "1. Mix." },
      ],
    });
  });

  it("handles a body without headings", () => {
    expect(splitSections("Just text.")).toEqual({
      intro: "Just text.",
      sections: [],
    });
  });
});
