import { expect, test } from "../fixtures";

/** The Kitchen space on Israel's hub (ADR-0006, FR-42/43). */

test("the profile has tabs, and Kitchen opens the recipe list", async ({
  page,
}) => {
  await page.goto("/members/israel/");
  const tabs = page.getByRole("navigation", { name: "Israel's spaces" });
  await expect(tabs.getByRole("link")).toHaveText([
    "Profile",
    "Kitchen",
    "Photos",
    "Training",
  ]);
  await expect(tabs.getByRole("link", { name: "Profile" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await tabs.getByRole("link", { name: "Kitchen" }).click();
  await expect(page).toHaveURL(/\/members\/israel\/kitchen\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kitchen");
  await expect(
    page
      .getByRole("navigation", { name: "Israel's spaces" })
      .getByRole("link", { name: "Kitchen" }),
  ).toHaveAttribute("aria-current", "page");
});

test("members without spaces have no tabs and no kitchen", async ({ page }) => {
  await page.goto("/members/marcy/");
  await expect(page.getByRole("navigation", { name: /spaces/ })).toHaveCount(0);
  const response = await page.goto("/members/marcy/kitchen/");
  expect(response?.status()).toBe(404);
});

test("a recipe card opens the recipe, laid out as ingredients and method", async ({
  page,
}) => {
  await page.goto("/members/israel/kitchen/");
  await page.getByRole("link", { name: /Korean meatballs/ }).click();
  await expect(page).toHaveURL(/\/kitchen\/korean-meatballs\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Korean meatballs",
  );
  await expect(page.getByText("Made 25 Nov 2026")).toBeVisible();

  const ingredients = page.getByRole("region", { name: "Ingredients" });
  await expect(ingredients.getByRole("heading", { level: 3 })).toHaveText([
    "Meatballs",
    "Sauce",
  ]);
  const method = page.getByRole("region", { name: "Method" });
  await expect(method.getByText("350°F (175°C)")).toBeVisible();
  await expect(page.getByRole("region", { name: "To serve" })).toBeVisible();

  // Side by side on desktop, like a recipe card
  const a = await ingredients.boundingBox();
  const b = await method.boundingBox();
  expect(b!.x).toBeGreaterThan(a!.x + a!.width - 1);
});

test("recipe photos load in a modern format and open full size", async ({
  page,
}) => {
  await page.goto("/members/israel/kitchen/korean-meatballs/");
  const main = page.getByRole("img", {
    name: /Glazed meatballs with spaghetti/,
  });
  await expect(main).toBeVisible();
  const { naturalWidth, currentSrc } = await main.evaluate(
    (img: HTMLImageElement) => ({
      naturalWidth: img.naturalWidth,
      currentSrc: img.currentSrc,
    }),
  );
  expect(naturalWidth).toBeGreaterThan(0);
  expect(currentSrc).toMatch(/korean-meatballs-plate-\d+\.(avif|webp)$/);

  const more = page.getByRole("region", { name: "More photos" });
  const link = more.getByRole("link", { name: /green bowl/ });
  const href = await link.getAttribute("href");
  expect(href).toBe("/images/israel/korean-meatballs-bowl-1920.webp");
  const full = await page.request.get(href!);
  expect(full.status()).toBe(200);
  expect(full.headers()["content-type"]).toBe("image/webp");
});

test("unknown recipes are a 404", async ({ page }) => {
  const response = await page.goto("/members/israel/kitchen/nope/");
  expect(response?.status()).toBe(404);
});
