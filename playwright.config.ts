import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests (see docs/06-development-workflow.md).
 * Run `npm run e2e:build` first (or `npm run e2e:all`). Each project runs
 * against its own static build, served the way CloudFront serves it.
 */
const DRAFTS_PORT = 4310;
const LIVE_PORT = 4311;
const serve = (dir: string, port: number) => ({
  command: `npx tsx scripts/serve-static.ts ${dir} ${port}`,
  url: `http://localhost:${port}/`,
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
});

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI), // a stray test.only fails CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "drafts",
      testDir: "tests/e2e/drafts",
      use: { baseURL: `http://localhost:${DRAFTS_PORT}` },
    },
    {
      name: "live",
      testDir: "tests/e2e/live",
      use: { baseURL: `http://localhost:${LIVE_PORT}` },
    },
  ],
  webServer: [
    serve("out-e2e/drafts", DRAFTS_PORT),
    serve("out-e2e/live", LIVE_PORT),
  ],
});
