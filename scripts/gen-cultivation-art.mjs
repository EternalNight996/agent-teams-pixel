/**
 * Generate the cultivation-world pixel avatars used by the activity panel.
 * Pure Node (zlib) so the repo needs no image tooling: 24x24 art scaled x4.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(import.meta.dirname, '..', 'assets', 'agent-teams')
const SIZE = 24
const SCALE = 4

const PALETTES = {
  'team-lead-v2.png': { robe: '#d4af37', trim: '#8a1c1c', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe9a8', kind: 'crown' },
  'member-data-v2.png': { robe: '#4a6fa5', trim: '#2c4363', hair: '#3a2a22', skin: '#f0c9a8', accent: '#d8e6ff', kind: 'scroll' },
  'member-researcher-v2.png': { robe: '#4f7d5a', trim: '#2f4d38', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#d9f2df', kind: 'gourd' },
  'member-qa-v2.png': { robe: '#7a5c9e', trim: '#4b3665', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#e6d9ff', kind: 'pill' },
  'member-engineer-v2.png': { robe: '#8a5a3a', trim: '#573923', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe0c2', kind: 'hammer' },
  'member-designer-v2.png': { robe: '#b05a7a', trim: '#6f3650', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffd9e6', kind: 'brush' },
  'member-security-v2.png': { robe: '#5a5a6a', trim: '#353542', hair: '#1e1e1e', skin: '#f0c9a8', accent: '#e0e0ff', kind: 'sword' },
  'member-docs-v2.png': { robe: '#6a7a4a', trim: '#3f4b2c', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#f0f2d9', kind: 'scroll' },
  'member-operator-v2.png': { robe: '#3a6a6a', trim: '#234444', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#d9f2f2', kind: 'fan' },
  'member-array-v2.png': { robe: '#3f6a8a', trim: '#274358', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#bfe3ff', kind: 'array' },
  'member-body-v2.png': { robe: '#8a3f3f', trim: '#5a2626', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffd9c2', kind: 'fist' },
  'member-beast-v2.png': { robe: '#6a5a3f', trim: '#40351f', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe9b8', kind: 'beast' },
  'member-puppet-v2.png': { robe: '#5f5f7a', trim: '#3a3a52', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#e0e0ff', kind: 'puppet' },
}

function canvas() {
  const px = new Uint8Array(SIZE * SIZE * 4)
  const set = (x, y, hex) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
    const i = (y * SIZE + x) * 4
    px[i] = parseInt(hex.slice(1, 3), 16)
    px[i + 1] = parseInt(hex.slice(3, 5), 16)
    px[i + 2] = parseInt(hex.slice(5, 7), 16)
    px[i + 3] = 255
  }
  const rect = (x0, y0, w, h, hex) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, hex) }
  return { px, set, rect }
}

function draw(p) {
  const { px, set, rect } = canvas()
  // 道袍
  rect(7, 12, 10, 10, p.robe)
  rect(7, 20, 10, 2, p.trim)
  rect(10, 12, 4, 3, p.trim)
  // 头与发髻
  rect(8, 4, 8, 8, p.skin)
  rect(8, 3, 8, 2, p.hair)
  rect(11, 1, 2, 2, p.hair)
  set(8, 8, '#3a3a3a'); set(9, 8, '#3a3a3a')
  // 腰带
  rect(9, 17, 6, 1, p.accent)
  // 本命法器
  if (p.kind === 'sword') { rect(19, 6, 1, 12, '#d8e6ff'); rect(18, 16, 3, 1, '#8a6a3a') }
  if (p.kind === 'scroll') { rect(17, 9, 4, 5, p.accent); rect(17, 11, 4, 1, p.trim) }
  if (p.kind === 'pill') { rect(18, 14, 3, 3, p.accent); set(19, 15, p.trim) }
  if (p.kind === 'gourd') { rect(18, 12, 3, 4, p.accent); rect(19, 10, 1, 2, p.trim) }
  if (p.kind === 'hammer') { rect(18, 10, 2, 8, '#8a6a3a'); rect(17, 8, 4, 3, p.accent) }
  if (p.kind === 'brush') { rect(19, 7, 1, 10, '#8a6a3a'); rect(18, 16, 3, 2, p.accent) }
  if (p.kind === 'fan') { rect(18, 12, 3, 5, p.accent); rect(19, 10, 1, 2, p.trim) }
  if (p.kind === 'array') { rect(17, 12, 5, 5, p.accent); rect(18, 13, 3, 3, p.trim); set(19, 14, p.accent) }
  if (p.kind === 'fist') { rect(17, 14, 4, 4, p.accent); rect(18, 15, 2, 2, p.trim) }
  if (p.kind === 'beast') { rect(18, 14, 3, 3, p.accent); set(18, 13, p.accent); set(20, 13, p.accent) }
  if (p.kind === 'puppet') { rect(18, 10, 3, 3, p.accent); rect(19, 13, 1, 4, p.trim) }
  if (p.kind === 'crown') { rect(9, 1, 6, 1, p.accent); set(11, 0, p.accent); set(13, 0, p.accent) }
  return px
}

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encode(px) {
  const w = SIZE * SCALE, h = SIZE * SCALE
  const raw = Buffer.alloc((w * 4 + 1) * h)
  let o = 0
  for (let y = 0; y < h; y++) {
    raw[o++] = 0
    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / SCALE), sy = Math.floor(y / SCALE)
      const i = (sy * SIZE + sx) * 4
      raw[o++] = px[i]; raw[o++] = px[i + 1]; raw[o++] = px[i + 2]; raw[o++] = px[i + 3]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT, { recursive: true })
for (const [name, palette] of Object.entries(PALETTES)) {
  const p = draw(palette)
  writeFileSync(join(OUT, name), encode(p))
  console.log('wrote', name)
}
