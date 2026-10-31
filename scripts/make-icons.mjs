// Gera os PNGs do ícone sem dependências: desenha em um buffer e codifica PNG com zlib.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [0x11, 0x1b, 0x19];
const FG = [0xb8, 0xd9, 0x9a];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, draw) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x + 0.5, y + 0.5, size);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
function design(x, y, size, { rounded, pad }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const r = s * 0.27 * (1 - pad), w = s * 0.086 * (1 - pad), dot = s * 0.066 * (1 - pad);
  const d = Math.hypot(x - cx, y - cy);
  const aa = (edge, v) => Math.max(0, Math.min(1, (edge - v) + 0.5));
  let col = BG, alpha = 255;
  if (rounded) {
    const rad = s * 0.22;
    const qx = Math.max(Math.abs(x - cx) - (s / 2 - rad), 0), qy = Math.max(Math.abs(y - cy) - (s / 2 - rad), 0);
    const outside = Math.hypot(qx, qy) - rad;
    alpha = Math.round(255 * aa(0, outside));
  }
  const ring = Math.min(aa(r + w / 2, d), aa(d, r - w / 2));
  const core = aa(dot, d);
  col = mix(col, FG, Math.max(ring, core));
  return [...col, alpha];
}
mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, (x, y, s) => design(x, y, s, { rounded: true, pad: 0 })));
writeFileSync('public/icons/icon-512.png', png(512, (x, y, s) => design(x, y, s, { rounded: true, pad: 0 })));
writeFileSync('public/icons/icon-512-maskable.png', png(512, (x, y, s) => design(x, y, s, { rounded: false, pad: 0.2 })));
writeFileSync('public/icons/apple-touch-icon.png', png(180, (x, y, s) => design(x, y, s, { rounded: false, pad: 0 })));
console.log('ícones gerados');
