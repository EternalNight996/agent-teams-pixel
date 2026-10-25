/**
 * Generate the cultivation-world pixel art used by the activity panel.
 *
 * Pure Node (zlib) so the repo needs no image tooling: every icon is a 24x24
 * pixel grid scaled x4 to a 96x96 RGBA PNG. The set is keyed by role id, not
 * by the legacy agency buckets, so every built-in 道途 resolves to a portrait
 * and the panel never falls back to a bare initial.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(import.meta.dirname, '..', 'assets', 'agent-teams')
const SIZE = 24
const SCALE = 4

/** 道途立绘：袍色 + 本命法器。 */
const AVATARS = {
  'avatar-captain.png': { robe: '#d4af37', trim: '#8a1c1c', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe9a8', kind: 'crown' },
  'avatar-planner.png': { robe: '#3f4f7a', trim: '#26304a', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#d8e6ff', kind: 'fan' },
  'avatar-implementer.png': { robe: '#3f6a8a', trim: '#274358', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#cfe8ff', kind: 'sword' },
  'avatar-verifier.png': { robe: '#7a5c9e', trim: '#4b3665', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#e6d9ff', kind: 'pill' },
  'avatar-reviewer.png': { robe: '#4a4a58', trim: '#2b2b35', hair: '#1e1e1e', skin: '#f0c9a8', accent: '#ffe9a8', kind: 'scroll' },
  'avatar-researcher.png': { robe: '#4f7d5a', trim: '#2f4d38', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#d9f2df', kind: 'gourd' },
  'avatar-analyst.png': { robe: '#3f5a8a', trim: '#28395a', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#bfe3ff', kind: 'compass' },
  'avatar-writer.png': { robe: '#5a6a3f', trim: '#39452a', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#f0f2d9', kind: 'brush' },
  'avatar-auditor.png': { robe: '#5a5a6a', trim: '#353542', hair: '#1e1e1e', skin: '#f0c9a8', accent: '#ffe9b8', kind: 'lantern' },
  'avatar-architect.png': { robe: '#2f6a6a', trim: '#1f4444', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#bff3ef', kind: 'array' },
  'avatar-tester.png': { robe: '#8a3f3f', trim: '#5a2626', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffd9c2', kind: 'fist' },
  'avatar-documenter.png': { robe: '#8a6a3a', trim: '#573f23', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe9c2', kind: 'book' },
  'avatar-operator.png': { robe: '#6a5a3f', trim: '#40351f', hair: '#2a2a2a', skin: '#f0c9a8', accent: '#ffe9b8', kind: 'hammer' },
}

/** 状态小像：修炼 / 静修 / 推演。 */
const STATES = {
  'state-working.png': 'working',
  'state-idle.png': 'idle',
  'state-unknown.png': 'unknown',
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

function drawAvatar(p) {
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
  switch (p.kind) {
    case 'sword': rect(19, 4, 1, 12, '#d8e6ff'); rect(18, 15, 3, 1, p.trim); rect(19, 16, 1, 2, '#8a6a3a'); break
    case 'scroll': rect(17, 9, 4, 5, p.accent); rect(17, 11, 4, 1, p.trim); rect(18, 8, 2, 1, p.trim); break
    case 'pill': rect(18, 14, 3, 3, p.accent); set(19, 15, p.trim); set(20, 16, '#ffffff'); break
    case 'gourd': rect(18, 12, 3, 4, p.accent); rect(19, 10, 1, 2, p.trim); break
    case 'hammer': rect(19, 9, 1, 8, '#8a6a3a'); rect(17, 7, 4, 3, p.accent); break
    case 'brush': rect(19, 6, 1, 10, '#8a6a3a'); rect(18, 15, 3, 2, p.accent); break
    case 'fan': rect(18, 10, 1, 6, '#8a6a3a'); rect(17, 7, 4, 3, p.accent); rect(19, 6, 1, 1, p.trim); break
    case 'array': rect(17, 11, 5, 5, p.accent); rect(18, 12, 3, 3, p.trim); set(19, 13, p.accent); break
    case 'compass': rect(17, 9, 5, 5, p.accent); rect(18, 10, 3, 3, p.trim); set(19, 11, '#ffe9a8'); rect(19, 12, 1, 2, p.accent); break
    case 'lantern': rect(18, 9, 3, 5, p.accent); rect(18, 8, 3, 1, p.trim); rect(18, 14, 3, 1, p.trim); rect(19, 7, 1, 1, p.trim); break
    case 'book': rect(17, 9, 4, 4, p.accent); rect(17, 13, 4, 1, p.trim); rect(18, 10, 2, 1, p.trim); rect(18, 12, 2, 1, p.trim); break
    case 'fist': rect(17, 13, 4, 4, p.accent); rect(18, 14, 2, 2, p.trim); break
    case 'crown': rect(9, 1, 6, 1, p.accent); set(11, 0, p.accent); set(13, 0, p.accent); break
    default: break
  }
  return px
}

/** 修炼中：御剑，剑身带剑气。 */
function drawWorking() {
  const { px, set, rect } = canvas()
  rect(11, 3, 2, 11, '#d8e6ff')
  rect(10, 4, 1, 9, '#9fc4ef')
  rect(9, 14, 6, 2, '#d4af37')
  rect(11, 16, 2, 4, '#8a6a3a')
  set(11, 2, '#ffffff'); set(13, 1, '#bff3ef'); set(8, 8, '#bff3ef'); set(15, 11, '#bff3ef')
  set(7, 18, '#5fd0a8'); set(16, 6, '#5fd0a8')
  return px
}

/** 静修：盘坐修士。 */
function drawIdle() {
  const { px, set, rect } = canvas()
  rect(9, 5, 6, 5, '#f0c9a8')
  rect(9, 4, 6, 2, '#2a2a2a')
  set(10, 8, '#3a3a3a'); set(13, 8, '#3a3a3a')
  rect(8, 11, 8, 6, '#3f6a8a')
  rect(8, 14, 8, 1, '#bff3ef')
  rect(6, 17, 12, 3, '#274358')
  rect(6, 20, 12, 1, '#1c2f42')
  rect(11, 12, 2, 3, '#bff3ef')
  return px
}

/** 推演：卦盘。 */
function drawUnknown() {
  const { px, set, rect } = canvas()
  rect(7, 3, 10, 1, '#bff3ef')
  rect(5, 5, 14, 1, '#7fd4c0')
  rect(4, 8, 16, 1, '#bff3ef')
  rect(4, 12, 16, 1, '#7fd4c0')
  rect(5, 15, 14, 1, '#bff3ef')
  rect(7, 17, 10, 1, '#7fd4c0')
  rect(10, 6, 4, 4, '#d4af37')
  set(11, 7, '#fff6cf'); set(12, 8, '#fff6cf')
  rect(10, 16, 4, 4, '#1c2f42')
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
for (const [name, palette] of Object.entries(AVATARS)) {
  writeFileSync(join(OUT, name), encode(drawAvatar(palette)))
  console.log('wrote', name)
}
for (const [name, kind] of Object.entries(STATES)) {
  const px = kind === 'working' ? drawWorking() : kind === 'idle' ? drawIdle() : drawUnknown()
  writeFileSync(join(OUT, name), encode(px))
  console.log('wrote', name)
}
