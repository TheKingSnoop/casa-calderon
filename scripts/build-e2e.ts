/**
 * Builds the site twice for the end-to-end tests:
 *
 *   out-e2e/drafts/  SHOW_DRAFTS=true: every page, for testing content and interactions
 *   out-e2e/live/    a normal production build: exactly what's deployed, for
 *                    proving that drafts never reach the live site
 *
 * Usage: npm run e2e:build
 */
import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import * as path from "node:path";

const outDir = path.resolve("out");
const e2eDir = path.resolve("out-e2e");

function build(name: "live" | "drafts", env: Record<string, string>) {
  console.log(`\n▶ Building "${name}" site…`);
  const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: true, // npm is npm.cmd on Windows
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  cpSync(outDir, path.join(e2eDir, name), { recursive: true });
}

rmSync(e2eDir, { recursive: true, force: true });
// Start from a clean Next.js cache: Turbopack's build cache once served a
// stale stylesheet after globals.css changed, so the tests ran against old
// CSS. CI always builds from a clean checkout; this makes local runs match.
rmSync(path.resolve(".next"), { recursive: true, force: true });
build("live", { SHOW_DRAFTS: "false" });
build("drafts", { SHOW_DRAFTS: "true" });
console.log(
  `\n✔ End-to-end builds ready in ${path.relative(process.cwd(), e2eDir)}/`,
);
