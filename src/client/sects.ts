/**
 * 门派：开宗时给一套预设道途（或让系统随机分配）。
 *
 * 门派只是「一队道途的预设」，不改变任务模板的语义，也不发明新的角色 id：
 * 选中门派后道途照常进入计划，自定义模式仍可手选 20 个道途中的任意组合。
 */
import type { AgentTeamsLocaleKey } from './locales.ts'

/** 一个门派：名称/说明的 locale key + 默认道途（角色 id）。 */
export interface SectPreset {
  readonly id: string
  readonly nameKey: AgentTeamsLocaleKey
  readonly descKey: AgentTeamsLocaleKey
  readonly roles: readonly string[]
}

/** 内置门派；新增门派只改这里。 */
export const SECT_PRESETS: readonly SectPreset[] = [
  { id: 'jian', nameKey: 'sect.jian.name', descKey: 'sect.jian.desc', roles: ['implementer', 'reviewer', 'planner'] },
  { id: 'dan', nameKey: 'sect.dan.name', descKey: 'sect.dan.desc', roles: ['verifier', 'healer', 'reviewer'] },
  { id: 'fuzhen', nameKey: 'sect.fuzhen.name', descKey: 'sect.fuzhen.desc', roles: ['talisman', 'architect', 'puppeteer'] },
  { id: 'mo', nameKey: 'sect.mo.name', descKey: 'sect.mo.desc', roles: ['demon', 'poisoner', 'tester'] },
  { id: 'fo', nameKey: 'sect.fo.name', descKey: 'sect.fo.desc', roles: ['monk', 'tester', 'documenter'] },
  { id: 'sanxiu', nameKey: 'sect.sanxiu.name', descKey: 'sect.sanxiu.desc', roles: ['researcher', 'analyst', 'writer'] },
  { id: 'yushou', nameKey: 'sect.yushou.name', descKey: 'sect.yushou.desc', roles: ['beastmaster', 'musician', 'auditor'] },
  { id: 'lianqi', nameKey: 'sect.lianqi.name', descKey: 'sect.lianqi.desc', roles: ['operator', 'implementer', 'verifier'] },
]

/** 按 id 找门派（未知 id 返回 undefined）。 */
export function sectPreset(id: string): SectPreset | undefined {
  return SECT_PRESETS.find(preset => preset.id === id)
}

/** 随机抽一个门派（「系统动态分配」）。 */
export function randomSect(current?: string): SectPreset {
  const pool = SECT_PRESETS.filter(preset => preset.id !== current)
  const list = pool.length > 0 ? pool : SECT_PRESETS
  return list[Math.floor(Math.random() * list.length)] as SectPreset
}
