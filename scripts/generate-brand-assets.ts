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

async function renderPaint(name: string, color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="180" viewBox="0 0 720 180">
      <defs>
        <filter id="wash" x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves="2" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="13" xChannelSelector="R" yChannelSelector="B"/>
        </filter>
      </defs>
      <path d="M26 37C103 16 191 28 270 20c111-10 222 3 320 1 57-1 91 11 104 35l-8 84c-78 16-171 0-253 11-112 15-233-8-342 4-37 4-61-8-70-31Z" fill="${color}" opacity=".92" filter="url(#wash)"/>
      <path d="M43 57c106-16 210 2 314-6 107-8 210-11 316 5l-9 68c-96-13-190 4-288 5-109 2-217-15-326 1Z" fill="${color}" opacity=".34"/>
    </svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(outputDir, name));
}

async function renderPaperTexture() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1400" viewBox="0 0 1400 1400">
      <defs>
        <filter id="paper">
          <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="4" seed="19" result="noise"/>
          <feColorMatrix in="noise" values="1 0 0 0 .72  0 1 0 0 .68  0 0 1 0 .57  0 0 0 .14 0"/>
        </filter>
      </defs>
      <rect width="1400" height="1400" fill="#F5EEDC"/>
      <rect width="1400" height="1400" filter="url(#paper)" opacity=".34"/>
    </svg>`;
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(resolve(outputDir, 'paper-texture.png'));
}

await mkdir(outputDir, { recursive: true });
await Promise.all([
  render('offmap-app-mark.svg', 'offmap-icon.png', 1024),
  render('offmap-app-mark.svg', 'offmap-favicon.png', 128),
  render('offmap-logo-mark.svg', 'offmap-logo-mark.png', 256),
  render('offmap-logo-mark.svg', 'offmap-adaptive-foreground.png', 1024),
  render('offmap-logo-mark.svg', 'offmap-splash.png', 512),
  render('offmap-logo-monochrome.svg', 'offmap-adaptive-monochrome.png', 1024),
  renderPaint('paint-blue.png', '#1268FF'),
  renderPaint('paint-lime.png', '#C9F43B'),
  renderPaint('paint-magenta.png', '#F42AA4'),
  renderPaint('paint-orange.png', '#FF5A24'),
  renderPaperTexture(),
]);

console.log('Generated deterministic OffMap app identity assets.');
