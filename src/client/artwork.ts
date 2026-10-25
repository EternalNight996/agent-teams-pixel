/**
 * Cultivation artwork lookup for the activity panel and the conversation card.
 *
 * Every built-in 道途 resolves by role id, so a quick-start roster never falls
 * back to a bare initial. Custom roles fall back to a keyword heuristic and,
 * failing that, to the caller's initial-letter badge.
 * @module dsh-agent-teams/client/artwork
 */

/** Artwork route prefix served by the plugin host half. */
export const ART_BASE = '/plugins/dsh-agent-teams/assets/'

/** One portrait per built-in role id (the wire id, never the display name). */
const ROLE_ART: Readonly<Record<string, string>> = {
  planner: 'avatar-planner.png',
  implementer: 'avatar-implementer.png',
  verifier: 'avatar-verifier.png',
  reviewer: 'avatar-reviewer.png',
  researcher: 'avatar-researcher.png',
  analyst: 'avatar-analyst.png',
  writer: 'avatar-writer.png',
  auditor: 'avatar-auditor.png',
  architect: 'avatar-architect.png',
  tester: 'avatar-tester.png',
  documenter: 'avatar-documenter.png',
  operator: 'avatar-operator.png',
}

/** Keyword fallback for custom roles, mapped onto the closest 道途 portrait. */
const KEYWORD_ART: ReadonlyArray<readonly [RegExp, string]> = [
  [/数据|分析|推演|指标|analys|metric|data/, 'avatar-analyst.png'],
  [/研究|调研|取证|探索|resear|investig|explor/, 'avatar-researcher.png'],
  [/qa|质量|验证|校验|verif|quality/, 'avatar-verifier.png'],
  [/测试|回归|test|regress/, 'avatar-tester.png'],
  [/实现|开发|工程|代码|编程|engineer|implement|backend|\bapi\b|runtime/, 'avatar-implementer.png'],
  [/架构|设计|边界|architect|design/, 'avatar-architect.png'],
  [/审查|裁断|评审|review|judge/, 'avatar-reviewer.png'],
  [/审计|巡查|安全|风险|audit|secur/, 'avatar-auditor.png'],
  [/文档|撰写|写作|书记|docs|writer|spec/, 'avatar-writer.png'],
  [/传道|示例|document|tutorial/, 'avatar-documenter.png'],
  [/发布|构建|部署|运维|打包|release|build|deploy|\bops\b/, 'avatar-operator.png'],
  [/规划|拆解|排程|plan|strateg/, 'avatar-planner.png'],
]

/** Captain portrait (the sect leader). */
export const LEAD_ART = `${ART_BASE}avatar-captain.png`

/** Status action artwork per member activity. */
export const ACTION_ART: Record<'working' | 'idle' | 'unknown', string> = {
  working: `${ART_BASE}state-working.png`,
  idle: `${ART_BASE}state-idle.png`,
  unknown: `${ART_BASE}state-unknown.png`,
}

/**
 * Member artwork URL, or null when no role matches (initial-letter fallback).
 * @param name - the member's display name.
 * @param role - the member's role text.
 * @returns the artwork URL, or null when unmatched.
 */
export function memberArtUrl(name: string, role: string): string | null {
  const id = role.trim().toLowerCase()
  const exact = ROLE_ART[id]
  if (exact !== undefined) return `${ART_BASE}${exact}`
  const identity = `${name} ${role}`.toLowerCase()
  for (const [pattern, art] of KEYWORD_ART) {
    if (pattern.test(identity)) return `${ART_BASE}${art}`
  }
  return null
}
