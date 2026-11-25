import { expect, MEMBER_NAMES, test } from "../fixtures";

/**
 * Runs against a normal production build: exactly what gets deployed.
 * Everything in content/ is a draft today, so NOTHING personal may appear
 * (NFR-6). When members publish, update these expectations on purpose.
 */

test("home page shows 'Coming soon' until the family publishes it", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Casa Calderon",
  );
  await expect(page.getByText("Coming soon")).toBeVisible();
});

test("the header shows the logo; the home page doesn't use the cover yet", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("header svg[data-logo]")).toBeVisible();
  expect(await page.content()).not.toContain("/images/site/cover");
});

test("the browser tab icon is the site's own, not the Next.js default", async ({
  page,
}) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toMatch(/^\/icon\.svg/);
  const icon = await page.request.get(href!);
  expect(icon.status()).toBe(200);
  expect(await icon.text()).toContain("CC");
});

test("projects page shows the empty state", async ({ page }) => {
  await page.goto("/projects/");
  await expect(page.getByText("No projects published yet.")).toBeVisible();
});

for (const path of ["/", "/projects/"]) {
  test(`no draft names or placeholder text on ${path}`, async ({ page }) => {
    await page.goto(path);
    const html = await page.content();
    for (const name of [...MEMBER_NAMES, "Placeholder", "Draft"]) {
      expect(html, `"${name}" leaked into the live build`).not.toContain(name);
    }
  });
}

for (const path of ["/members/israel/", "/projects/casa-calderon-website/"]) {
  test(`draft page ${path} doesn't exist on the live site`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByText("This page could not be found")).toBeVisible();
  });
}

test("responses carry the production security headers", async ({ page }) => {
  const response = await page.goto("/");
  const headers = response?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
});
