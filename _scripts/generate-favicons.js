/**
 * Generate favicon assets from SVG source
 * Requires: sharp, to-ico
 * Usage: node _scripts/generate-favicons.js
 */

const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');
const path = require('path');

const SOURCE_SVG = path.join(__dirname, '..', 'favicon.svg');
const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');
const ROOT_DIR = path.join(__dirname, '..');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('Generating favicon assets from SVG...\n');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const svgBuffer = fs.readFileSync(SOURCE_SVG);
  const icoSources = [];

  for (const { name, size } of sizes) {
    const outputPath = path.join(ICONS_DIR, name);

    await sharp(svgBuffer, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`  ✓ ${name} (${size}x${size}) - ${stats.size} bytes`);

    // Collect PNGs for ICO generation
    if (size <= 48) {
      icoSources.push(fs.readFileSync(outputPath));
    }
  }

  // Generate favicon.ico in root directory
  console.log('\nGenerating favicon.ico...');
  const icoBuffer = await toIco(icoSources);
  const icoPath = path.join(ROOT_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`  ✓ favicon.ico (multi-res) - ${icoBuffer.length} bytes`);

  console.log('\nDone! Generated assets:');
  console.log('  - /favicon.ico (root)');
  console.log('  - /assets/icons/*.png');
}

generateFavicons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
