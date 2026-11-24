import { expect, test as base } from "@playwright/test";

/**
 * Every test fails if the page logs a console error or throws, which
 * includes Content-Security-Policy violations: the test server sends the
 * production CSP (infra/lib/security-headers.ts). That catches a CSP that
 * would break the live site before it's deployed.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        // 404 pages log a failed resource load for their own status code.
        if (message.text().includes("404 (Not Found)")) return;
        errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await use(errors);
      expect(errors, "console errors / CSP violations on the page").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export const MEMBER_NAMES = [
  "Israel Calderon",
  "Cristhyan Calderon",
  "Marcy Calderon",
  "Benjamin Calderon",
];
