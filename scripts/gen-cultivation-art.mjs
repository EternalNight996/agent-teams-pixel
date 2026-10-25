/**
 * Generate the cultivation-world pixel art used by the activity panel.
 *
 * Pure Node (zlib) so the repo needs no image tooling: every icon is a 32x32
 * pixel grid with a 1px outline and two-tone shading, scaled x4 to a 128x128
 * RGBA PNG. Larger grids plus outlines keep the portraits readable at 40px.
 * The set is keyed by role id, so every built-in 道途 resolves to a portrait.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(import.meta.dirname, '..', 'assets', 'agent-teams')
const SIZE = 32
const SCALE = 4
const OUTLINE = '#17131c'
const EYE = '#2b2430'
const MOUTH = '#b0605a'

/** 道途立绘：袍色 + 本命法器。 */
const AVATARS = {
  'avatar-captain.png': { robe: '#d4af37', robeDark: '#9a7a1e', robeLight: '#f2d97a', trim: '#8a1c1c', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9a8', kind: 'crown' },
  'avatar-planner.png': { hairStyle: 'topknot', robe: '#3f4f7a', robeDark: '#2b3757', robeLight: '#5c6fa0', trim: '#d8e6ff', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#d8e6ff', kind: 'fan' },
  'avatar-implementer.png': { robe: '#3f6a8a', robeDark: '#2a4a63', robeLight: '#5f8fb2', trim: '#cfe8ff', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#cfe8ff', kind: 'sword' },
  'avatar-verifier.png': { robe: '#7a5c9e', robeDark: '#55416f', robeLight: '#9b7fc0', trim: '#e6d9ff', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#e6d9ff', kind: 'pill' },
  'avatar-reviewer.png': { beard: true, robe: '#4a4a58', robeDark: '#32323d', robeLight: '#666675', trim: '#d4af37', hair: '#1c1a22', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9a8', kind: 'scroll' },
  'avatar-researcher.png': { hairStyle: 'long', robe: '#4f7d5a', robeDark: '#365740', robeLight: '#6c9f78', trim: '#d9f2df', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#d9f2df', kind: 'gourd' },
  'avatar-analyst.png': { hairStyle: 'topknot', robe: '#3f5a8a', robeDark: '#2a3f63', robeLight: '#5c7cb2', trim: '#bfe3ff', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#bfe3ff', kind: 'compass' },
  'avatar-writer.png': { hairStyle: 'long', robe: '#5a6a3f', robeDark: '#3e4a2a', robeLight: '#788c56', trim: '#f0f2d9', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#f0f2d9', kind: 'brush' },
  'avatar-auditor.png': { beard: true, robe: '#5a5a6a', robeDark: '#3d3d49', robeLight: '#787888', trim: '#ffe9b8', hair: '#1c1a22', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9b8', kind: 'lantern' },
  'avatar-architect.png': { robe: '#2f6a6a', robeDark: '#1f4848', robeLight: '#4b8f8f', trim: '#bff3ef', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#bff3ef', kind: 'array' },
  'avatar-tester.png': { robe: '#8a3f3f', robeDark: '#612a2a', robeLight: '#ad5c5c', trim: '#ffd9c2', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffd9c2', kind: 'fist' },
  'avatar-documenter.png': { robe: '#8a6a3a', robeDark: '#614a26', robeLight: '#ad8a56', trim: '#ffe9c2', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9c2', kind: 'book' },
  'avatar-operator.png': { robe: '#6a5a3f', robeDark: '#4a3f2b', robeLight: '#8a7856', trim: '#ffe9b8', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9b8', kind: 'hammer' },
  'avatar-talisman.png': { robe: '#a85a3a', robeDark: '#7a3f28', robeLight: '#c97a56', trim: '#f2d97a', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffd27a', kind: 'talisman' },
  'avatar-healer.png': { robe: '#cfd8d4', robeDark: '#9fada8', robeLight: '#eef4f0', trim: '#7fb89a', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#d9f2e6', kind: 'needle' },
  'avatar-beastmaster.png': { robe: '#7a6a3f', robeDark: '#544a2b', robeLight: '#9a8a56', trim: '#d9c27a', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9b8', kind: 'whistle' },
  'avatar-puppeteer.png': { robe: '#5f4a6a', robeDark: '#3f3149', robeLight: '#806a8c', trim: '#c7a8d8', hair: '#1c1a22', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#e0d0ff', kind: 'puppet' },
  'avatar-musician.png': { robe: '#8a9ec2', robeDark: '#5f7291', robeLight: '#a8bcdc', trim: '#e8f0ff', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#cfe4ff', hairStyle: 'long', kind: 'flute' },
  'avatar-poisoner.png': { robe: '#4a6a4a', robeDark: '#33503a', robeLight: '#648a64', trim: '#b8e08a', hair: '#241f2c', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#d4ff9a', kind: 'vial' },
  'avatar-monk.png': { robe: '#a06a3a', robeDark: '#754a24', robeLight: '#c08a56', trim: '#f2c14e', hair: '#2a2230', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ffe9a8', kind: 'beads' },
  'avatar-demon.png': { robe: '#5a2a3a', robeDark: '#3c1a28', robeLight: '#7a3f52', trim: '#d43a4a', hair: '#1c1a22', skin: '#f2cfae', skinShade: '#d9ab8a', accent: '#ff9aa8', kind: 'blade' },
}

/** 状态小像：修炼 / 静修 / 推演。 */
const STATES = ['state-working.png', 'state-idle.png', 'state-unknown.png']

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
  const hline = (x0, y, w, hex) => rect(x0, y, w, 1, hex)
  const vline = (x, y0, h, hex) => rect(x, y0, 1, h, hex)
  return { px, set, rect, hline, vline }
}

/** Paint a 1px outline around every opaque pixel (sprite silhouette). */
function outline(px) {
  const source = px.slice()
  const opaque = (x, y) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && source[(y * SIZE + x) * 4 + 3] === 255
  const hex = [parseInt(OUTLINE.slice(1, 3), 16), parseInt(OUTLINE.slice(3, 5), 16), parseInt(OUTLINE.slice(5, 7), 16)]
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const i = (y * SIZE + x) * 4
      if (source[i + 3] === 255) continue
      if (!opaque(x - 1, y) && !opaque(x + 1, y) && !opaque(x, y - 1) && !opaque(x, y + 1)) continue
      px[i] = hex[0]; px[i + 1] = hex[1]; px[i + 2] = hex[2]; px[i + 3] = 255
    }
  }
}

/** 道袍、头部与本命法器（32x32 网格）。 */
function drawAvatar(p) {
  const { px, set, rect, hline, vline } = canvas()
  // 靴
  rect(11, 28, 4, 3, '#2c2433')
  rect(18, 28, 4, 3, '#2c2433')
  hline(11, 28, 4, '#3d3346'); hline(18, 28, 4, '#3d3346')
  // 袍身
  rect(8, 16, 16, 12, p.robe)
  rect(8, 16, 3, 12, p.robeLight)
  rect(21, 16, 3, 12, p.robeDark)
  rect(8, 27, 16, 1, p.trim)
  // 衣襟
  rect(13, 16, 6, 3, p.trim)
  vline(15, 19, 8, p.trim); vline(16, 19, 8, p.trim)
  // 腰带
  rect(9, 22, 14, 2, p.robeDark)
  rect(14, 22, 4, 2, p.accent)
  // 手臂与手
  rect(7, 17, 2, 8, p.robeDark)
  rect(23, 17, 2, 8, p.robeDark)
  rect(7, 25, 2, 2, p.skin)
  rect(23, 25, 2, 2, p.skin)
  // 颈
  rect(14, 14, 4, 2, p.skinShade)
  // 头
  rect(10, 4, 12, 11, p.skin)
  rect(10, 12, 12, 1, p.skinShade)
  rect(20, 4, 2, 8, p.skinShade)
  // 发
  rect(9, 2, 14, 4, p.hair)
  rect(9, 6, 2, 6, p.hair)
  rect(21, 6, 2, 6, p.hair)
  rect(14, 0, 4, 2, p.hair)
  rect(13, 1, 6, 1, p.hair)
  hline(13, 3, 3, p.robeLight)
  // 发型差异
  if (p.hairStyle === 'long') {
    rect(8, 6, 2, 12, p.hair); rect(22, 6, 2, 12, p.hair)
    rect(9, 18, 2, 2, p.hair); rect(21, 18, 2, 2, p.hair)
  }
  if (p.hairStyle === 'topknot') {
    rect(14, 0, 4, 3, p.hair); rect(15, 0, 2, 2, p.hair)
    hline(13, 3, 6, p.trim); set(13, 4, p.accent)
  }
  if (p.beard === true) {
    rect(13, 13, 6, 3, '#d8d2c8'); rect(14, 16, 4, 2, '#c8c1b4')
    set(16, 14, MOUTH)
  }
  // 眼与眉
  hline(12, 8, 3, p.hair); hline(18, 8, 3, p.hair)
  set(13, 10, EYE); set(14, 10, '#f7f3ea'); set(18, 10, EYE); set(19, 10, '#f7f3ea')
  set(13, 11, p.skinShade); set(19, 11, p.skinShade)
  if (p.beard !== true) set(16, 12, MOUTH)
  // 本命法器
  switch (p.kind) {
    case 'sword':
      rect(26, 2, 2, 14, '#e6f0ff'); vline(26, 2, 14, '#ffffff'); vline(27, 4, 10, '#a9c4e6')
      rect(23, 16, 8, 2, p.accent); rect(23, 16, 8, 1, '#fff6d8')
      rect(25, 18, 3, 6, '#8a5a3a'); vline(26, 18, 6, '#b07a52'); set(26, 25, p.accent)
      break
    case 'fan':
      // 羽扇：上宽下窄的叶片 + 扇柄
      rect(25, 7, 5, 2, p.accent)
      rect(23, 9, 9, 3, p.accent)
      rect(22, 12, 11, 3, p.accent)
      rect(23, 15, 9, 2, p.accent)
      rect(25, 17, 5, 1, p.trim)
      vline(27, 18, 8, '#8a5a3a')
      set(26, 8, '#ffffff'); set(28, 10, p.robeLight); set(28, 13, p.robeLight)
      hline(24, 14, 7, p.trim)
      break
    case 'pill':
      // 丹瓶：瓶腹 + 瓶颈 + 高光
      rect(24, 18, 7, 6, p.accent)
      rect(24, 18, 1, 6, p.robeDark); rect(30, 18, 1, 6, p.robeDark)
      rect(25, 20, 3, 3, '#fff2ff'); set(26, 20, '#ffffff')
      rect(26, 16, 3, 2, p.trim); hline(25, 15, 5, p.trim)
      set(28, 23, p.trim)
      break
    case 'scroll':
      rect(23, 12, 8, 10, p.accent); vline(23, 12, 10, p.trim); vline(30, 12, 10, p.trim)
      hline(25, 15, 4, p.robeDark); hline(25, 17, 4, p.robeDark); hline(25, 19, 3, p.robeDark)
      rect(23, 11, 8, 1, '#8a6a3a'); rect(23, 22, 8, 1, '#8a6a3a')
      break
    case 'gourd':
      rect(24, 20, 7, 5, p.accent); rect(25, 16, 5, 4, p.accent)
      rect(24, 20, 2, 5, p.robeLight); hline(24, 20, 7, '#ffffff')
      rect(26, 15, 3, 1, p.trim); set(27, 19, p.trim); set(28, 22, p.robeDark)
      break
    case 'compass':
      rect(23, 10, 8, 8, p.accent); rect(24, 11, 6, 6, p.robeDark)
      rect(25, 12, 4, 4, p.robe); set(27, 13, '#ffe9a8'); rect(27, 14, 1, 2, p.accent)
      hline(23, 10, 8, p.trim)
      break
    case 'brush':
      rect(27, 5, 2, 12, '#8a5a3a'); vline(28, 5, 12, '#b07a52')
      rect(26, 17, 4, 4, p.accent); set(27, 20, '#ffffff'); rect(26, 21, 4, 1, p.trim)
      break
    case 'lantern':
      rect(24, 9, 6, 8, p.accent); rect(25, 10, 4, 6, '#fff2c4')
      rect(23, 8, 8, 1, p.trim); rect(23, 17, 8, 1, p.trim); rect(26, 6, 2, 2, p.trim)
      set(27, 12, '#ffffff')
      break
    case 'array':
      rect(23, 10, 8, 8, p.accent); rect(24, 11, 6, 6, p.robeDark)
      set(25, 12, p.accent); set(28, 12, p.accent); set(25, 15, p.accent); set(28, 15, p.accent)
      vline(26, 13, 2, p.trim); vline(27, 13, 2, p.trim)
      break
    case 'fist':
      rect(23, 15, 7, 6, p.skin); hline(23, 15, 7, '#ffffff'); vline(25, 16, 3, p.skinShade); vline(27, 16, 3, p.skinShade)
      rect(22, 17, 1, 3, p.skin); rect(24, 21, 5, 2, p.accent); set(26, 22, p.trim)
      break
    case 'book':
      rect(23, 11, 8, 8, p.accent); rect(24, 12, 6, 6, '#fff6e0')
      hline(24, 14, 6, p.robeDark); hline(24, 16, 6, p.robeDark)
      vline(23, 11, 8, p.trim); vline(30, 11, 8, p.trim)
      break
    case 'hammer':
      rect(27, 10, 2, 12, '#8a5a3a'); rect(23, 7, 8, 5, p.accent)
      hline(23, 7, 8, '#fff6d8'); rect(24, 8, 6, 3, p.robeLight)
      break
    case 'crown':
      rect(13, 0, 6, 2, p.accent); set(13, 0, p.accent); set(18, 0, p.accent)
      set(15, 1, p.trim); set(16, 1, p.trim)
      break
    case 'talisman':
      rect(24, 8, 7, 13, '#f2e6c4'); rect(25, 9, 5, 11, '#fff6dd')
      hline(24, 8, 7, p.trim); rect(25, 11, 5, 1, p.trim); rect(25, 13, 3, 1, p.trim)
      rect(26, 16, 3, 3, '#c23a3a'); set(27, 17, '#f2d97a')
      break
    case 'needle':
      vline(25, 6, 13, '#dfe9f2'); vline(28, 8, 11, '#dfe9f2'); vline(30, 6, 13, '#dfe9f2')
      set(25, 6, '#ffffff'); set(30, 6, '#ffffff')
      rect(24, 20, 7, 3, p.trim); set(27, 21, p.accent)
      break
    case 'whistle':
      rect(23, 14, 7, 5, p.accent); hline(23, 14, 7, '#ffffff')
      rect(21, 12, 2, 9, p.trim); rect(30, 15, 1, 3, p.trim)
      set(25, 16, p.robeDark); set(27, 16, p.robeDark)
      break
    case 'puppet':
      vline(26, 2, 7, '#d8d2c8'); vline(29, 2, 7, '#d8d2c8')
      rect(26, 9, 4, 4, p.accent); set(27, 10, p.robeDark); set(29, 10, p.robeDark)
      rect(25, 13, 6, 6, p.robeLight); rect(25, 19, 2, 2, p.accent); rect(29, 19, 2, 2, p.accent)
      break
    case 'flute':
      rect(21, 14, 11, 2, '#8a6a3a'); hline(21, 14, 11, '#b07a52')
      rect(20, 13, 1, 4, p.trim); rect(31, 13, 1, 4, p.trim)
      set(24, 15, p.robeDark); set(27, 15, p.robeDark); set(30, 15, p.robeDark)
      break
    case 'vial':
      rect(24, 16, 7, 6, p.accent); hline(24, 16, 7, '#ffffff')
      rect(26, 13, 3, 3, p.trim); set(26, 17, p.robeDark); set(29, 19, p.trim)
      break
    case 'beads':
      set(24, 12, p.accent); set(27, 10, p.accent); set(30, 12, p.accent)
      set(31, 15, p.accent); set(30, 18, p.accent); set(27, 20, p.accent)
      set(24, 18, p.accent); set(23, 15, p.accent); rect(27, 15, 2, 2, p.trim)
      break
    case 'blade':
      // 魔剑：锯齿阔身 + 品红锋刃 + 金色护手 + 血色剑首
      rect(24, 4, 4, 3, '#6a2fd0')
      rect(25, 7, 4, 3, '#5a26b8')
      rect(26, 10, 3, 3, '#4a1f9a')
      rect(27, 13, 2, 4, '#3a1878')
      vline(27, 4, 3, '#ff4fb0'); vline(28, 7, 3, '#ff4fb0')
      vline(28, 10, 4, '#ff4fb0'); vline(28, 14, 3, '#ff4fb0')
      set(25, 6, '#ffd27a'); set(26, 9, '#ffd27a'); set(27, 12, '#ffd27a')
      rect(21, 17, 9, 2, '#f2c14e'); hline(21, 17, 9, '#ffe9a8')
      rect(24, 19, 3, 6, '#2a1a2a'); vline(25, 19, 6, '#7a3f52')
      rect(23, 25, 5, 3, '#c23a3a'); set(25, 26, '#ff9aa8')
      break
    default: break
  }
  outline(px)
  return px
}

/** 修炼中：御剑，剑气环绕。 */
function drawWorking() {
  const { px, set, rect, hline, vline } = canvas()
  rect(14, 4, 3, 16, '#e6f0ff'); vline(14, 4, 16, '#ffffff'); vline(16, 6, 12, '#a9c4e6')
  rect(11, 19, 9, 2, '#d4af37'); hline(11, 19, 9, '#ffe9a8')
  rect(14, 21, 3, 7, '#8a5a3a'); set(15, 27, '#d4af37')
  set(11, 8, '#7fe0c0'); set(20, 11, '#7fe0c0'); set(9, 16, '#bff3ef')
  set(12, 5, '#ffffff'); set(19, 6, '#ffffff')
  rect(6, 22, 2, 6, '#5fd0a8'); hline(6, 27, 2, '#bff3ef')
  rect(23, 20, 2, 6, '#5fd0a8'); hline(23, 25, 2, '#bff3ef')
  outline(px)
  return px
}

/** 静修：盘坐修士，闭目。 */
function drawIdle() {
  const { px, set, rect, hline, vline } = canvas()
  // 蒲团
  rect(6, 25, 20, 4, '#2f4858'); hline(6, 25, 20, '#4b7089'); hline(6, 28, 20, '#1e303c')
  // 盘腿
  rect(8, 21, 16, 4, '#3f6a8a'); hline(8, 21, 16, '#5f8fb2')
  // 袍身
  rect(10, 12, 12, 10, '#3f6a8a'); vline(10, 12, 10, '#5f8fb2'); vline(21, 12, 10, '#2a4a63')
  rect(14, 14, 4, 2, '#bff3ef'); rect(14, 20, 4, 1, '#bff3ef')
  // 手
  rect(12, 18, 2, 2, '#f2cfae'); rect(18, 18, 2, 2, '#f2cfae')
  // 头
  rect(12, 4, 8, 8, '#f2cfae'); rect(12, 10, 8, 1, '#d9ab8a')
  rect(11, 2, 10, 3, '#2a2230'); rect(13, 0, 6, 2, '#2a2230')
  // 闭目
  hline(13, 7, 2, '#2b2430'); hline(17, 7, 2, '#2b2430')
  hline(13, 6, 2, '#d9ab8a'); hline(17, 6, 2, '#d9ab8a')
  set(15, 9, '#b0605a')
  // 灵气
  set(7, 12, '#7fe0c0'); set(6, 17, '#bff3ef'); set(25, 14, '#7fe0c0'); set(26, 19, '#bff3ef')
  outline(px)
  return px
}

/** 推演：卦盘，含铜针与卦爻。 */
function drawUnknown() {
  const { px, set, rect, hline, vline } = canvas()
  // 外盘
  rect(5, 6, 22, 2, '#3f6a6a'); hline(5, 6, 22, '#7fd4c0')
  rect(4, 9, 24, 2, '#2f5252'); hline(4, 9, 24, '#5fb3a6')
  rect(3, 12, 26, 2, '#3f6a6a'); hline(3, 12, 26, '#7fd4c0')
  rect(4, 15, 24, 2, '#2f5252'); hline(4, 15, 24, '#5fb3a6')
  rect(5, 18, 22, 2, '#3f6a6a'); hline(5, 18, 22, '#7fd4c0')
  rect(7, 21, 18, 2, '#2f5252'); hline(7, 21, 18, '#5fb3a6')
  // 中宫
  rect(13, 7, 6, 15, '#1f3333'); rect(14, 8, 4, 13, '#132424')
  rect(14, 10, 4, 4, '#d4af37'); hline(14, 10, 4, '#ffe9a8'); set(15, 11, '#ffffff')
  rect(14, 16, 4, 4, '#8a1c1c'); hline(14, 16, 4, '#c23a3a')
  outline(px)
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

/** Emit the shared role visuals (palette + weapon) consumed by the canvas scene. */
function emitRoleVisuals() {
  const rows = Object.entries(AVATARS).map(([file, p]) => {
    const role = file.replace(/^avatar-/, '').replace(/\.png$/, '')
    const extras = [
      p.hairStyle === undefined ? '' : ` hairStyle: '${p.hairStyle}',`,
      p.beard === true ? ' beard: true,' : '',
    ].join('')
    return `  ${role}: { weapon: '${p.kind}', robe: '${p.robe}', robeDark: '${p.robeDark}', robeLight: '${p.robeLight}', trim: '${p.trim}', accent: '${p.accent}', hair: '${p.hair}', skin: '${p.skin}',${extras} },`
  })
  const output = [
    '/**',
    ' * Generated by scripts/gen-cultivation-art.mjs from the avatar palettes.',
    ' * The canvas scene dresses each desk with the 道途 robe and 本命法器 so the',
    ' * office and the roster portraits show the same character.',
    ' */',
    '',
    `export type RoleWeapon = ${[...new Set(Object.values(AVATARS).map(entry => entry.kind))].map(kind => `'${kind}'`).join(' | ')}`,
    '',
    'export interface RoleVisual {',
    '  readonly weapon: RoleWeapon',
    '  readonly robe: string',
    '  readonly robeDark: string',
    '  readonly robeLight: string',
    '  readonly trim: string',
    '  readonly accent: string',
    '  readonly hair: string',
    '  readonly skin: string',
    "  readonly hairStyle?: 'long' | 'topknot'",
    '  readonly beard?: boolean',
    '}',
    '',
    'export const ROLE_VISUALS: Readonly<Record<string, RoleVisual>> = {',
    ...rows,
    '}',
    '',
    '/** Visuals for a role id (custom roles resolve to undefined). */',
    'export function roleVisual(role: string): RoleVisual | undefined {',
    '  return ROLE_VISUALS[role.trim().toLowerCase()]',
    '}',
    '',
  ].join('\n')
  writeFileSync(join(import.meta.dirname, '..', 'src', 'client', 'role-visuals.ts'), output)
}

emitRoleVisuals()

mkdirSync(OUT, { recursive: true })
for (const [name, palette] of Object.entries(AVATARS)) {
  writeFileSync(join(OUT, name), encode(drawAvatar(palette)))
}
writeFileSync(join(OUT, 'state-working.png'), encode(drawWorking()))
writeFileSync(join(OUT, 'state-idle.png'), encode(drawIdle()))
writeFileSync(join(OUT, 'state-unknown.png'), encode(drawUnknown()))
console.log('wrote', Object.keys(AVATARS).length + STATES.length, 'images')