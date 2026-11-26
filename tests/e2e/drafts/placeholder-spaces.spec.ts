import { expect, test } from "../fixtures";

/** Spaces that only have a "coming soon" page so far (ADR-0006). */

for (const [space, title] of [
  ["photos", "Photos"],
  ["training", "Training"],
] as const) {
  test(`the ${title} tab opens a placeholder page`, async ({ page }) => {
    await page.goto("/members/israel/");
    await page
      .getByRole("navigation", { name: "Israel's spaces" })
      .getByRole("link", { name: title })
      .click();
    await expect(page).toHaveURL(new RegExp(`/members/israel/${space}/$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("Coming soon.")).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Israel's spaces" })
        .getByRole("link", { name: title }),
    ).toHaveAttribute("aria-current", "page");
  });

  test(`members without the ${title} space have no ${title} page`, async ({
    page,
  }) => {
    const response = await page.goto(`/members/marcy/${space}/`);
    expect(response?.status()).toBe(404);
  });
}
