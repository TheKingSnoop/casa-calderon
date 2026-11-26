/**
 * Validates every file in content/ (drafts included).
 * Runs automatically before `npm run build` (the "prebuild" script), and on
 * its own with `npm run content:check`. Exits with code 1 on any problem.
 */
import * as path from "node:path";
import { ContentError, loadContent } from "../src/lib/content/loader";

try {
  const { collective, members, projects, recipes } = loadContent(
    path.join(process.cwd(), "content"),
  );
  const items = [
    ...(collective ? [collective] : []),
    ...members,
    ...projects,
    ...recipes,
  ];
  const drafts = items.filter((item) => !item.published).length;
  const home = collective
    ? `home page${collective.published ? "" : " (draft)"}`
    : "no home page yet";
  console.log(
    `✔ Content OK: ${home}, ${members.length} members, ${projects.length} projects, ${recipes.length} recipe${recipes.length === 1 ? "" : "s"} (${drafts} unpublished drafts, hidden on the live site)`,
  );
} catch (error) {
  if (error instanceof ContentError) {
    console.error(`✖ ${error.message}`);
    process.exit(1);
  }
  throw error;
}
