import { expect, test } from "../fixtures";

/** Runs against the drafts build: every page exists, with placeholder content. */

test.describe("home page", () => {
  test("shows every section in order", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Casa Calderon",
    );
    const sections = page.getByRole("heading", { level: 2 });
    await expect(sections).toHaveText([
      "What we offer",
      "Meet the team",
      "Featured work",
      "Built together",
      "Our story",
      "Work with us",
    ]);
  });

  for (const [scheme, image] of [
    ["light", "mountains-dawn"],
    ["dark", "mountains-night"],
  ] as const) {
    test(`shows the ${image} cover in ${scheme} mode, in a modern format, with alt text`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const cover = page.getByRole("img", { name: /mountain ranges/ });
      await expect(cover).toBeVisible();
      // Actually decoded (not a broken image), the right version for the
      // theme, and AVIF/WebP was chosen
      const { naturalWidth, currentSrc } = await cover.evaluate(
        (img: HTMLImageElement) => ({
          naturalWidth: img.naturalWidth,
          currentSrc: img.currentSrc,
        }),
      );
      expect(naturalWidth).toBeGreaterThan(0);
      expect(currentSrc).toMatch(
        new RegExp(`/images/site/${image}-\\d+\\.(avif|webp)$`),
      );
    });
  }

  test("shows the logo in the header and the hero, hidden from screen readers", async ({
    page,
  }) => {
    await page.goto("/");
    const logos = page.locator("svg[data-logo]");
    await expect(logos).toHaveCount(2);
    for (const logo of await logos.all()) {
      await expect(logo).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("'Work with us' jumps to the contact section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Work with us" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(
      page.getByRole("link", { name: "Contact Marcy" }),
    ).toBeInViewport();
  });

  test("member cards link to member pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Marcy Calderon" }).click();
    await expect(page).toHaveURL(/\/members\/marcy\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Marcy Calderon",
    );
  });
});

test.describe("member pages", () => {
  test("show the member's projects", async ({ page }) => {
    await page.goto("/members/cristhyan/");
    const projects = page.getByRole("region", { name: "Projects" });
    await expect(projects.getByRole("article")).toHaveCount(2);
  });

  test("show an empty state when there are no projects", async ({ page }) => {
    await page.goto("/members/benjamin/");
    await expect(
      page.getByText("No projects listed yet. Benjamin is working on it."),
    ).toBeVisible();
  });

  test("unknown members are a 404", async ({ page }) => {
    const response = await page.goto("/members/nobody/");
    expect(response?.status()).toBe(404);
  });
});

test.describe("project pages", () => {
  test("credit every member of a joint project", async ({ page }) => {
    await page.goto("/projects/example-joint-project/");
    await expect(
      page.getByRole("link", { name: "Cristhyan Calderon" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Marcy Calderon" }),
    ).toBeVisible();
    // exact: the title "Example joint project" also contains the words
    await expect(
      page.getByText("Joint project", { exact: true }),
    ).toBeVisible();
  });

  test("confidential projects show the NDA notice and no outside links", async ({
    page,
  }) => {
    await page.goto("/projects/example-confidential-project/");
    await expect(
      page.getByText("under a non-disclosure agreement"),
    ).toBeVisible();
    await expect(page.locator("main a[href^='http']")).toHaveCount(0);
  });

  test("URLs without a trailing slash redirect to the canonical one", async ({
    page,
  }) => {
    await page.goto("/projects/example-joint-project");
    await expect(page).toHaveURL(/\/projects\/example-joint-project\/$/);
  });
});

test.describe("keyboard and navigation", () => {
  test("the skip link is the first thing you tab to, and jumps to the content", async ({
    page,
  }) => {
    await page.goto("/members/israel/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("the header marks the current section", async ({ page }) => {
    await page.goto("/projects/example-joint-project/");
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "Projects" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
