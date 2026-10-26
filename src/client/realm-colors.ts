/**
 * 境界配色：每跨越一重境界，等级牌换一套颜色。
 *
 * 场景里的等级牌是 canvas 画的，React 里的等级是 DOM 文本；两边共用这里的调色板，
 * 保证同一位修士在洞府/名册/装备页看到的是同一种境界色。
 */
import { realmIndexForLevel } from './cultivation.ts'

export interface RealmPalette {
  /** 等级牌边框 / 强调色。 */
  readonly border: string
  /** 等级牌底色。 */
  readonly background: string
  /** 等级文字颜色。 */
  readonly text: string
  /** 升级进度条颜色。 */
  readonly bar: string
}

/** 十五重境界，顺序与 CULTIVATION_REALMS / REALM_BANDS 一致。 */
export const REALM_PALETTES: readonly RealmPalette[] = [
  { border: '#8f8b78', background: '#e9e7dc', text: '#3d3a2e', bar: '#7c7866' }, // 凡人
  { border: '#7fb27a', background: '#d9f2cf', text: '#22452a', bar: '#4f9a57' }, // 炼气
  { border: '#5aab9f', background: '#d2efe9', text: '#123f3a', bar: '#2f8d80' }, // 筑基
  { border: '#6b9ed6', background: '#d6e6f8', text: '#173a5c', bar: '#3c78b5' }, // 金丹
  { border: '#9a7bd8', background: '#e6dcf9', text: '#332052', bar: '#6f4fb5' }, // 元婴
  { border: '#cf77b6', background: '#f6d9ec', text: '#4a173b', bar: '#ab3f8b' }, // 化神
  { border: '#d29452', background: '#f8e2c8', text: '#4d2c0f', bar: '#b56e22' }, // 炼虚
  { border: '#c9a227', background: '#f7edc6', text: '#4a3a08', bar: '#a9861a' }, // 合体
  { border: '#c96a5f', background: '#f7d9d4', text: '#4f1713', bar: '#a43a33' }, // 大乘
  { border: '#9b4bd1', background: '#e9d9f7', text: '#3c1355', bar: '#7d2fb0' }, // 渡劫
  { border: '#4fa9c9', background: '#d3eef7', text: '#0f3d4b', bar: '#1f8aa8' }, // 真仙
  { border: '#b8911f', background: '#f5e6b0', text: '#4a3208', bar: '#9c7a12' }, // 金仙
  { border: '#4faa78', background: '#d5f2e2', text: '#123f2a', bar: '#2f8f60' }, // 太乙
  { border: '#d07a45', background: '#f9dfcf', text: '#4d220f', bar: '#b45a22' }, // 大罗
  { border: '#f2c14e', background: '#2a2418', text: '#ffe9a8', bar: '#f2c14e' }, // 道祖
]

/** 某个等级对应的境界调色板。 */
export function realmPaletteForLevel(level: number): RealmPalette {
  return REALM_PALETTES[realmIndexForLevel(Math.max(1, Math.floor(level)))] ?? REALM_PALETTES[0]!
}
