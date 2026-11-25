/**
 * Prepares a photo for the website: resizes it to 640/1280/1920px wide in
 * AVIF + WebP and strips all metadata (including GPS location).
 *
 * Usage:
 *   npm run images -- <source-image> <folder> <name>
 *
 * Examples:
 *   npm run images -- ~/Pictures/family.jpg site cover
 *     → public/images/site/cover-{640,1280,1920}.{avif,webp}
 *   npm run images -- ~/Pictures/me.jpg israel avatar
 *     → public/images/israel/avatar-{640,1280,1920}.{avif,webp}
 *
 * Keep the ORIGINAL photo out of the repo; only the processed files belong
 * in public/images. Only add photos of people who've agreed to be online.
 */
import * as path from "node:path";
import { processImage } from "./lib/images";

const [input, folder, name] = process.argv.slice(2);
if (!input || !folder || !name) {
  console.error("Usage: npm run images -- <source-image> <folder> <name>");
  console.error("Example: npm run images -- ~/Pictures/family.jpg site cover");
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder)) {
  console.error(
    `Folder "${folder}" must use lowercase letters, numbers and hyphens`,
  );
  process.exit(1);
}

const outDir = path.join("public", "images", folder);
processImage(input, outDir, name)
  .then(({ files, width, height }) => {
    console.log(
      `✔ ${files.length} files in ${outDir} (largest ${width}×${height}, metadata stripped):`,
    );
    for (const file of files) console.log(`  ${file}`);
    console.log(`\nUse it in content as: /images/${folder}/${name}`);
  })
  .catch((error: Error) => {
    console.error(`✖ ${error.message}`);
    process.exit(1);
  });
