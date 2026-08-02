import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import sharp from 'sharp';

const workspace = resolve(import.meta.dirname, '..');
const sourceDir = resolve(workspace, 'packages/design/assets');
const outputDir = resolve(workspace, 'apps/app/assets/images');

async function render(sourceName: string, outputName: string, size: number) {
  const source = await readFile(resolve(sourceDir, sourceName));
  await sharp(source, { density: 288 })
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9 })
    .toFile(resolve(outputDir, outputName));
}

await mkdir(outputDir, { recursive: true });
await Promise.all([
  render('offmap-app-mark.svg', 'offmap-icon.png', 1024),
  render('offmap-app-mark.svg', 'offmap-favicon.png', 128),
  render('offmap-route-glyph.svg', 'offmap-adaptive-foreground.png', 1024),
  render('offmap-route-glyph.svg', 'offmap-splash.png', 512),
  render('offmap-route-monochrome.svg', 'offmap-adaptive-monochrome.png', 1024),
]);

console.log('Generated deterministic OffMap app identity assets.');
