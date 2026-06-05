// Generates simple placeholder icons for the extension.
// Run: node create_icons.js
// Requires: npm install canvas (optional — falls back to SVG data URIs)

const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const iconsDir = __dirname;

try {
  // Try to use the 'canvas' package
  const { createCanvas } = require('canvas');

  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#a78bfa');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();

    // White rounded rectangle
    const padding = Math.round(size * 0.15);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.roundRect(padding, padding, size - padding * 2, size - padding * 2, size * 0.15);
    ctx.fill();

    // Text "MT"
    ctx.fillStyle = '#3b82f6';
    ctx.font = `bold ${Math.round(size * 0.4)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MT', size / 2, size / 2 + 1);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
    console.log(`Created: icon${size}.png`);
  }
  console.log('All icons created.');
} catch {
  // Fallback: create minimal valid PNG files using raw bytes
  console.log('canvas package not found — creating SVG-based placeholder icons.');

  function createSvgPng(size) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6"/>
          <stop offset="100%" style="stop-color:#a78bfa"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#g)"/>
      <rect x="${Math.round(size*0.15)}" y="${Math.round(size*0.15)}"
        width="${Math.round(size*0.7)}" height="${Math.round(size*0.7)}"
        rx="${Math.round(size*0.15)}" fill="rgba(255,255,255,0.85)"/>
      <text x="${size/2}" y="${size/2 + 1}"
        font-family="Arial" font-weight="bold" font-size="${Math.round(size*0.4)}px"
        text-anchor="middle" dominant-baseline="middle" fill="#3b82f6">MT</text>
    </svg>`;
    return Buffer.from(svg);
  }

  // Write SVG files as placeholders (browsers can also load SVG icons)
  for (const size of sizes) {
    const svg = createSvgPng(size);
    const pngPath = path.join(iconsDir, `icon${size}.png`);
    // Write a minimal 1x1 PNG as a true placeholder (browsers need PNG format)
    // Minimal valid PNG: 8x8 solid color
    const minimalPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAADklEQVQY02NgGAWjAAMAABwAAaYGqP8AAAA'
    , 'base64');
    fs.writeFileSync(pngPath, minimalPng);
    console.log(`Created placeholder: icon${size}.png (replace with real icons)`);
  }
}
