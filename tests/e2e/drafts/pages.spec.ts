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
    ["light", "sajama-day"],
    ["dark", "sajama-dusk"],
  ] as const) {
    test(`shows the ${image} cover in ${scheme} mode, in a modern format, with alt text`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      const cover = page.getByRole("img", { name: /volcanoes/ });
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

  test("shows the logo in the header only (hero logo switched off), hidden from screen readers", async ({
    page,
  }) => {
    await page.goto("/");
    // SHOW_HERO_LOGO = false in src/components/hero.tsx
    const logos = page.locator("svg[data-logo]");
    await expect(logos).toHaveCount(1);
    await expect(page.locator("header svg[data-logo]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
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

  test("Israel's projects are in their own tab, not on his profile", async ({
    page,
  }) => {
    await page.goto("/members/israel/");
    await expect(page.getByRole("region", { name: "Projects" })).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Israel's spaces" })
      .getByRole("link", { name: "Projects" })
      .click();
    await expect(page).toHaveURL(/\/members\/israel\/projects\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Projects",
    );
    await expect(
      page.getByRole("link", { name: "Casa Calderon website" }),
    ).toBeVisible();
  });

  test("members without the projects space have no projects tab", async ({
    page,
  }) => {
    const response = await page.goto("/members/cristhyan/projects/");
    expect(response?.status()).toBe(404);
  });

  test("show an empty state when there are no projects", async ({ page }) => {
    await page.goto("/members/benjamin/");
    await expect(
      page.getByText("No projects listed yet. Benjamin is working on it."),
    ).toBeVisible();
  });

  test("Israel's page shows his CV as a timeline, in CV order", async ({
    page,
  }) => {
    await page.goto("/members/israel/");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "About",
      "Experience",
      "Education",
      "Skills",
      "Languages",
      "Certifications",
      "Beyond the code",
    ]);
    const experience = page.getByRole("list", { name: "Experience" });
    await expect(experience.getByRole("heading", { level: 3 })).toHaveCount(5);
    await expect(
      experience.getByRole("heading", { level: 3 }).first(),
    ).toContainText("Volunteer Software Developer");
    // A graduation has a single date, not "– Present"
    await expect(
      page.getByRole("list", { name: "Education" }).getByText("Jul 2015"),
    ).toBeVisible();
    await expect(page.getByText(/– Present/)).toHaveCount(0);
  });

  test("the CV buttons download and open the PDF", async ({ page }) => {
    await page.goto("/members/israel/");
    const download = page.getByRole("link", { name: "Download CV as a PDF" });
    await expect(download).toHaveAttribute("href", "/files/israel/cv.pdf");
    await expect(download).toHaveAttribute(
      "download",
      "Israel-Calderon-CV.pdf",
    );
    const view = page.getByRole("link", { name: /View PDF/ });
    await expect(view).toHaveAttribute("target", "_blank");

    const pdf = await page.request.get("/files/israel/cv.pdf");
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
  });

  test("members without a CV have no CV buttons", async ({ page }) => {
    await page.goto("/members/benjamin/");
    await expect(page.getByRole("link", { name: /Download CV/ })).toHaveCount(
      0,
    );
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
