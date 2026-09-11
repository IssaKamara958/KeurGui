const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

function makePng(width, height, isMaskable = false) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines: width * 4 + 1 filter byte per line
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    scanlines[rowOffset] = 0; // filter type None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Color generation
      // Background: emerald to teal gradient (#059669 -> #0d9488)
      const gradT = (x + y) / (width + height);
      let r = Math.round(5 + gradT * (13 - 5));
      let g = Math.round(150 + gradT * (148 - 150));
      let b = Math.round(105 + gradT * (136 - 105));
      let a = 255;

      // Corner radius rounding for standard icons (unless maskable, where full bleed is desired)
      if (!isMaskable) {
        const cornerR = 0.22 * width;
        const dx = Math.abs(x - cx) - (cx - cornerR);
        const dy = Math.abs(y - cy) - (cy - cornerR);
        if (dx > 0 && dy > 0) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > cornerR) {
            a = 0; // outside rounded corner
          }
        }
      }

      // If within icon shape, draw house geometry
      if (a > 0) {
        const nx = x / scale;
        const ny = y / scale;

        // Roof triangle: (256, 120), (120, 230), (392, 230)
        const inRoof = ny >= 120 && ny <= 230 && Math.abs(nx - 256) <= (ny - 120) * 1.25;

        // Chimney: x: [328, 354], y: [136, 174]
        const inChimney = nx >= 328 && nx <= 354 && ny >= 136 && ny <= 180;

        // House body: x: [140, 372], y: [230, 396]
        const inBody = nx >= 140 && nx <= 372 && ny >= 230 && ny <= 396;

        if (inRoof || inChimney || inBody) {
          // White house base
          r = 255;
          g = 255;
          b = 255;

          // Windows (green squares)
          const inWin1 = nx >= 168 && nx <= 214 && ny >= 256 && ny <= 302;
          const inWin2 = nx >= 228 && nx <= 274 && ny >= 256 && ny <= 302;
          const inWin3 = nx >= 298 && nx <= 344 && ny >= 256 && ny <= 302;

          if (inWin1 || inWin2 || inWin3) {
            r = 16;
            g = 185;
            b = 129;
          }

          // Door: x: [230, 282], y: [306, 396]
          const inDoor = nx >= 230 && nx <= 282 && ny >= 306 && ny <= 396;
          if (inDoor) {
            r = 4;
            g = 120;
            b = 87;
          }

          // Badge 600m² area: x: [156, 214], y: [324, 370]
          const inBadge = nx >= 156 && nx <= 214 && ny >= 324 && ny <= 370;
          if (inBadge) {
            r = 245;
            g = 158;
            b = 11; // Amber gold
          }
        }
      }

      scanlines[pixelOffset] = r;
      scanlines[pixelOffset + 1] = g;
      scanlines[pixelOffset + 2] = b;
      scanlines[pixelOffset + 3] = a;
    }
  }

  // Deflate IDAT data
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate 192x192
const pwa192 = makePng(192, 192, false);
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), pwa192);
console.log('Created pwa-192x192.png');

// Generate 512x512 (any)
const pwa512 = makePng(512, 512, false);
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), pwa512);
console.log('Created pwa-512x512.png');

// Generate 512x512 (maskable: full bleed without transparent corners)
const pwaMaskable = makePng(512, 512, true);
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), pwaMaskable);
console.log('Created pwa-maskable-512x512.png');

// Generate Apple Touch Icon (180x180)
const appleIcon = makePng(180, 180, true);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleIcon);
console.log('Created apple-touch-icon.png');

// Generate favicon.ico (can be a 64x64 PNG inside standard header or standalone 48x48)
const favicon = makePng(64, 64, false);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), favicon);
console.log('Created favicon.ico');
