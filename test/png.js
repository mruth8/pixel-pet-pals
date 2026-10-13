// Minimal PNG reader for tests (8-bit RGBA, non-interlaced: what the packs use). No dependencies.
const zlib = require("zlib"), fs = require("fs");
function readPng(file) {
  const b = fs.readFileSync(file); let p = 8, w, h, depth, ctype, inter; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString("ascii", p + 4, p + 8), d = b.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ctype = d[9]; inter = d[12]; }
    else if (type === "IDAT") idat.push(d); else if (type === "IEND") break; p += 12 + len; }
  if (depth !== 8 || ctype !== 6 || inter) throw new Error(`${file}: only 8-bit RGBA non-interlaced supported`);
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? out[y * stride + x - bpp] : 0, up = y ? out[(y - 1) * stride + x] : 0, c = y && x >= bpp ? out[(y - 1) * stride + x - bpp] : 0;
      let v = src[x]; if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      out[y * stride + x] = v & 255; } }
  return { width: w, height: h, data: out };
}
// Set of opaque colours ("r,g,b,a" for alpha > 0).
function colours(img) { const s = new Set(); for (let i = 0; i < img.data.length; i += 4) if (img.data[i + 3]) s.add(img.data.subarray(i, i + 4).join(",")); return s; }
module.exports = { readPng, colours };
