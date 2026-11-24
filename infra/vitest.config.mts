import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Synthesizing the CDK stack (in beforeAll) takes ~5s warm, but over 10s
    // on a cold start (first run, busy CI runner). The default 10s hook
    // timeout made the suite flaky, so allow 60s.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
