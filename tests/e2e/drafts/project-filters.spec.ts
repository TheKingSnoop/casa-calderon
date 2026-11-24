import { expect, test } from "../fixtures";

/** /projects/ filters (FR-20): 3 placeholder projects in the drafts build. */

const status = (page: import("@playwright/test").Page) =>
  page.getByRole("status");
const cards = (page: import("@playwright/test").Page) =>
  page.locator("main").getByRole("article");

test("filters by member and keeps the choice in the URL", async ({ page }) => {
  await page.goto("/projects/");
  await expect(status(page)).toHaveText("Showing 3 of 3 projects");

  await page.getByLabel("Member").selectOption({ label: "Cristhyan Calderon" });
  await expect(page).toHaveURL(/\?member=cristhyan$/);
  await expect(status(page)).toHaveText("Showing 2 of 3 projects");
  await expect(cards(page)).toHaveCount(2);
});

test("combines member and type filters", async ({ page }) => {
  await page.goto("/projects/");
  await page.getByLabel("Member").selectOption("cristhyan");
  await page.getByLabel("Type").selectOption("professional");
  await expect(page).toHaveURL(/\?member=cristhyan&type=professional$/);
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page)).toContainText("Example confidential project");
});

test("'Clear filters' shows everything again and cleans the URL", async ({
  page,
}) => {
  await page.goto("/projects/?type=professional");
  await expect(cards(page)).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(cards(page)).toHaveCount(3);
});

test("a shared link opens with its filters applied", async ({ page }) => {
  await page.goto("/projects/?member=marcy");
  await expect(page.getByLabel("Member")).toHaveValue("marcy");
  await expect(status(page)).toHaveText("Showing 1 of 3 projects");
});

test("an invalid filter value is ignored", async ({ page }) => {
  await page.goto("/projects/?member=nobody&type=secret");
  await expect(status(page)).toHaveText("Showing 3 of 3 projects");
});

test("a link typed without the trailing slash keeps its filters", async ({
  page,
}) => {
  await page.goto("/projects?member=marcy");
  await expect(page).toHaveURL(/\/projects\/\?member=marcy$/);
  await expect(status(page)).toHaveText("Showing 1 of 3 projects");
});
