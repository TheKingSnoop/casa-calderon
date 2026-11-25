import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures";

/** Light/dark toggle in the header (src/components/theme-toggle.tsx). */

const toggle = (page: Page) => page.getByRole("button", { name: "Dark mode" });
const theme = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.theme ?? null);
const colors = (page: Page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { background: style.backgroundColor, text: style.color };
  });

test("switches light → dark → light, swapping colours and the cover image", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  expect(await colors(page)).toEqual({
    background: "rgb(255, 255, 255)",
    text: "rgb(23, 23, 23)",
  });
  const dawn = page.locator("picture.only-light img");
  const night = page.locator("picture.only-dark img");
  await expect(dawn).toBeVisible();
  await expect(night).toBeHidden();

  await toggle(page).click();
  expect(await theme(page)).toBe("dark");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  expect(await colors(page)).toEqual({
    background: "rgb(10, 10, 10)",
    text: "rgb(237, 237, 237)",
  });
  await expect(night).toBeVisible();
  await expect(dawn).toBeHidden();

  await toggle(page).click();
  expect(await theme(page)).toBe("light");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  await expect(dawn).toBeVisible();
});

test("overrides the OS setting in the other direction too (dark OS → light)", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await toggle(page).click();
  expect(await colors(page)).toEqual({
    background: "rgb(255, 255, 255)",
    text: "rgb(23, 23, 23)",
  });
});

test("toggled dark mode looks exactly like the OS dark mode", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/projects/");
  const osDark = await colors(page);

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await toggle(page).click();
  expect(await colors(page)).toEqual(osDark);
});

test("remembers the choice, applied before the page paints (no flash)", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await toggle(page).click();

  // On reload, the inline <head> script must set the theme during HTML
  // parsing, i.e. already by DOMContentLoaded, before React has hydrated.
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(await theme(page)).toBe("dark");
  expect((await colors(page)).background).toBe("rgb(10, 10, 10)");

  // ...and on other pages too
  await page.goto("/projects/");
  expect(await theme(page)).toBe("dark");
});

test("is reachable and usable with the keyboard", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/projects/");
  await toggle(page).focus();
  await expect(toggle(page)).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await theme(page)).toBe("dark");
});
