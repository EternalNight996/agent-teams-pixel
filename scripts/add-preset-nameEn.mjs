// 给 PRESETS / TEAM_PRESETS 数组每条加 nameEn 字段（中英同步）。
//
// 触发条件：src/client.main.js 的 PRESETS、lib/index.js 的 TEAM_PRESETS，
// 当前每行结构是 `{ name: '中文名', leader: '...', roles: [...] },`。
// 改完是 `{ name: '中文名', nameEn: 'English Name', leader: ..., roles: [...] },`。
//
// 翻译表（zh → en）手工维护；保持两边一致。
import { readFileSync, writeFileSync } from 'node:fs'

const PRESET_EN = {
  '研发团队': 'Engineering Team',
  '科学团队': 'Science Team',
  '航天科研团队': 'Aerospace R&D Team',
  '营销团队': 'Marketing Team',
  '安全团队': 'Security Team',
  '设计团队': 'Design Team',
  '财务团队': 'Finance Team',
  '游戏开发团队': 'Game Development Team',
  '供应链团队': 'Supply Chain Team',
  '测试质量团队': 'QA Team',
  '产品团队': 'Product Team',
  '销售团队': 'Sales Team',
  '地理信息团队': 'GIS Team',
  '法律合规团队': 'Legal & Compliance Team',
  '人力资源团队': 'HR Team',
  'AI大模型团队': 'AI / LLM Team',
  '智能体编排团队': 'Agent Orchestration Team',
  'SRE运维团队': 'SRE Team',
  '数据工程团队': 'Data Engineering Team',
  '区块链Web3团队': 'Blockchain & Web3 Team',
  '空间计算团队': 'Spatial Computing Team',
  '跨境电商团队': 'Cross-border E-commerce Team',
  '短视频直播团队': 'Short Video & Live Team',
  '内容媒体团队': 'Content & Media Team',
  '企业战略团队': 'Corporate Strategy Team',
  '付费广告团队': 'Paid Media Team',
  '移动应用团队': 'Mobile App Team',
  '物联网团队': 'IoT Team',
  '客户成功团队': 'Customer Success Team'
}

function patch(file, marker) {
  const src = readFileSync(file, 'utf8')
  const start = src.indexOf(marker)
  if (start < 0) throw new Error(`${file}: marker not found: ${marker}`)
  // PRESETS / TEAM_PRESETS 是 array literal；找到匹配的 '];'
  let depth = 0, end = -1, i = src.indexOf('[', start)
  for (; i < src.length; i++) {
    const c = src[i]
    if (c === '[') depth++
    else if (c === ']') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end < 0) throw new Error(`${file}: array end not found`)
  const before = src.slice(0, start)
  const arraySrc = src.slice(start, end + 1)
  const after = src.slice(end + 1)

  let added = 0, missing = []
  const newArray = arraySrc.replace(/\{ name: ('([^']+)'|")(?:, nameEn: '([^']+)')?, leader:/g, (m, _q, zh, _hasEn) => {
    if (!zh) return m
    const en = PRESET_EN[zh]
    if (!en) { missing.push(zh); return m }
    if (_hasEn) return m // 已有 nameEn：幂等，不动
    added++
    return `{ name: '${zh}', nameEn: '${en}', leader:`
  })
  if (missing.length) {
    throw new Error(`${file}: 未翻译的 preset: ${JSON.stringify(missing)}`)
  }
  writeFileSync(file, before + newArray + after)
  console.log(`${file}: +${added} nameEn (其余已存在，保持幂等)`)
}

patch('src/client.main.js', 'var PRESETS = [')
patch('lib/index.js', 'const TEAM_PRESETS = [')
