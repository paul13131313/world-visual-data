// Generate thumbnails for all photos in public/photos/{CODE}/
// Usage: node scripts/generate-thumbs.mjs
// Requires: sharp (already in devDependencies)

import sharp from "sharp";
import { readdir, mkdir, stat } from "fs/promises";
import { join } from "path";

const PHOTOS_DIR = "public/photos";
const THUMB_WIDTH = 800; // Thumbnail width in pixels
const THUMB_QUALITY = 80; // JPEG quality

async function generateThumbs() {
  let totalGenerated = 0;
  let totalSkipped = 0;

  let dirs;
  try {
    dirs = await readdir(PHOTOS_DIR);
  } catch {
    console.log("No photos directory found. Create public/photos/ and add country folders.");
    return;
  }

  for (const countryCode of dirs) {
    const countryDir = join(PHOTOS_DIR, countryCode);
    const dirStat = await stat(countryDir);
    if (!dirStat.isDirectory()) continue;
    if (countryCode === ".DS_Store") continue;

    const thumbDir = join(countryDir, "thumbs");
    await mkdir(thumbDir, { recursive: true });

    const files = await readdir(countryDir);
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f) && f !== "thumbs"
    );

    for (const file of imageFiles) {
      const srcPath = join(countryDir, file);
      const thumbPath = join(thumbDir, file);

      // Skip if thumbnail already exists and is newer than source
      try {
        const srcStat = await stat(srcPath);
        const thumbStat = await stat(thumbPath);
        if (thumbStat.mtimeMs >= srcStat.mtimeMs) {
          totalSkipped++;
          continue;
        }
      } catch {
        // Thumbnail doesn't exist, generate it
      }

      try {
        await sharp(srcPath)
          .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
          .jpeg({ quality: THUMB_QUALITY })
          .toFile(thumbPath);
        totalGenerated++;
        console.log(`  ✓ ${countryCode}/${file}`);
      } catch (err) {
        console.error(`  ✗ ${countryCode}/${file}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone: ${totalGenerated} generated, ${totalSkipped} skipped (up to date)`);
}

generateThumbs();
