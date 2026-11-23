/**
 * Validates every file in content/ (drafts included).
 * Runs automatically before `npm run build` (the "prebuild" script), and on
 * its own with `npm run content:check`. Exits with code 1 on any problem.
 */
import * as path from "node:path";
import { ContentError, loadContent } from "../src/lib/content/loader";

try {
  const { members, projects } = loadContent(
    path.join(process.cwd(), "content"),
  );
  const drafts = [...members, ...projects].filter(
    (item) => !item.published,
  ).length;
  console.log(
    `✔ Content OK: ${members.length} members, ${projects.length} projects (${drafts} unpublished drafts, hidden on the live site)`,
  );
} catch (error) {
  if (error instanceof ContentError) {
    console.error(`✖ ${error.message}`);
    process.exit(1);
  }
  throw error;
}
