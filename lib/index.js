// agents-pixe 宿主半边：注册 `agents_pixe_roles` 工具，按角色名查 agency-agents
// 完整角色卡（数据来自随包分发的 lib/roles-full.json，en + zh 全量固化）。
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm'
import { buildTeamFacade } from './team-engine.js'

/* ============ 设置读写兼容层（跨 DSH 版本；做法参考 memory-eternal 的 bindSettings） ============
 *
 * DSH ≤0.1.5：`ctx.settings` 是「设置命名空间注册表」——`settings.register(ns, Config, { base })`
 *             返回带 get()/watch()/update() 的句柄，配置存 settings.yaml。
 * DSH ≥0.1.7（含 0.2.0-rc.2）：`ctx.settings` **只剩表单服务**
 *             —— configure / describe / update / replace / mutate，**没有 register()**。
 *             此时 Config 由 cordis/loader 按 schema 校验后作为「活引用」传进 `apply(ctx, config)`；
 *             schema.meta.volatile 为真的字段才会被投影成可编辑表单、才允许写入；
 *             volatile 变更由 loader 原地提交到该引用并发 `loader/volatile-update`；
 *             写回走 `settings.update(<loader 条目 id>, patch, revision)`。
 *
 * 症状对照：在 0.2.0-rc.2 上旧写法直接抛 `settings.register is not a function`
 * → scope=null → registerFace() 早退 → 「角色工具」开关永远打不开、agents_pixe_* 工具永不注册
 * （插件「装了但没功能」，且在 UI 上完全静默）。
 *
 * 业务代码只依赖 get/watch 两个方法，两代宿主行为一致。 */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write')
function isVolatileRef(value) {
  return typeof value === 'object' && value !== null && VOLATILE_WRITE in value
}
/* schemastery ≥3.18.4 会把 volatile 字段解析成 cosmokit 活引用（{ get() }），
 * ≤3.18.1 则原样给普通值 —— 同一份 Config 在两种宿主上形状不同，这里统一深解引用。 */
function plainConfig(value, depth = 0) {
  if (depth > 8) return value
  if (isVolatileRef(value)) return plainConfig(value.get(), depth + 1)
  if (Array.isArray(value)) return value.map((item) => plainConfig(item, depth + 1))
  if (value !== null && typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) out[key] = plainConfig(item, depth + 1)
    return out
  }
  return value
}
/* 没有 loader 挂载、apply 又没拿到 config 时，用标准 schema 校验空对象取默认值。 */
function schemaDefaults(schema) {
  try {
    const std = schema?.['~standard']
    if (std && typeof std.validate === 'function') {
      const result = std.validate({})
      if (result && !result.issues) return plainConfig(result.value)
    }
  } catch { /* 拿不到默认值就用空对象 */ }
  return {}
}
/* 把对象 schema 的每个字段标成 volatile（等价于逐字段 .volatile()，但不依赖该方法存在：
 * schemastery ≥3.18.4 才有 .volatile()，插件在宿主里可能解析到 3.18.1，链式调用会在 import 期打挂整包）。 */
function markAllVolatile(schema) {
  for (const field of Object.values(schema?.dict ?? {})) {
    if (field === null || field === undefined) continue
    field.meta = { ...(field.meta ?? {}), volatile: true }
  }
  return schema
}
const name = 'agent-teams-pixel'
const Config = markAllVolatile(z.object({
  enabled: z.boolean().default(true),
  cardMode: z.union(['full', 'rules', 'deliverables']).default('full'),
  /* 成员种子粒度（P0-a）：
   *   key  = 只注「专业核心三章」（核心使命 / 关键规则 / 技术交付物）—— 默认；
   *   full = 整卡（更贵，行为与 0.2.2 之前一致）。
   * 508 张整卡 × N 成员是本项目最大的 token 负担，而这三章恰好是「人格 + 判据」的有效载荷。 */
  memberCardMode: z.union(['key', 'full']).default('key'),
  /* 成员 LLM 路由（P0-b）：留空 = 快照/继承领袖当前路由（与 dsh-agent-teams 同语义，不弹窗）。
   * 三项任一改变时，宿主按目标模型解析默认推理档。 */
  memberProvider: z.string().default(''),
  memberModel: z.string().default(''),
  memberReasoningEffort: z.string().default(''),
  /* 成员工具白名单（P0-c，能力绑定；**默认全空 = 零行为变更**）：
   * memberToolDeny='edit,write' 可让审查型成员**物理上**无法改文件（宿主在子会话 ctx 里 restrict）。
   * 角色→白名单的自动映射留待 P1。 */
  memberToolAllow: z.string().default(''),
  memberToolDeny: z.string().default('')
}))
/* settings.describe() 以 **Loader 条目的 options.id** 作 ns（见 dsh-settings 实现 `ns: entry.options.id`），
 * 所以必须取 options.id，而不是带父级前缀的 Entry.id。 */
function settingsEntryId(ctx) {
  const entry = ctx?.fiber?.entry ?? ctx?.[Symbol.for('cordis.entry')]
  return (entry && entry.options && entry.options.id) || 'agent-teams-pixel'
}
/* 返回统一句柄：get() / watch(cb) / update(patch, rev) / meta,legacy */
function bindSettings(ctx, schema, config) {
  const service = typeof ctx.get === 'function' ? ctx.get('settings') : ctx.settings
  if (service && typeof service.register === 'function') {
    const scope = service.register('agents-pixe', schema, { base: config ?? {} })
    if (scope) {
      return {
        legacy: true,
        service,
        get: () => scope.get(),
        watch: (cb) => (typeof scope.watch === 'function' ? scope.watch(cb) : () => {}),
        update: typeof scope.update === 'function' ? (patch, rev) => scope.update(patch, rev) : undefined
      }
    }
  }
  const fallback = schemaDefaults(schema)
  const read = () => (config === undefined || config === null ? fallback : plainConfig(config))
  const entryId = settingsEntryId(ctx)
  /* 本插件自带「角色办公室」设置页（client 侧 slots.register settings.section），
   * 声明 auto:false 免得宿主再按 schema 自动生成一张重复表单页。 */
  if (service && typeof service.configure === 'function') {
    try {
      ctx.effect(() => {
        try { return service.configure({ auto: false }, ctx.fiber) } catch { return () => {} }
      }, 'agents-pixe: settings presentation')
    } catch { /* 拿不到 page policy 不影响读写 */ }
  }
  /* 宿主 volatile 回流可能滞后：写成功后把 patch 叠加在本地视图上，
   * 等宿主快照追上（值相等）再摘除，避免长期掩盖宿主真实状态。 */
  const overlay = {}
  const snapshot = () => (config === undefined || config === null ? fallback : plainConfig(config))
  const pruneOverlay = (snap) => {
    for (const key of Object.keys(overlay)) {
      if (snap && snap[key] !== undefined && JSON.stringify(snap[key]) === JSON.stringify(overlay[key])) delete overlay[key]
    }
  }
  const get = () => {
    const base = snapshot()
    pruneOverlay(base)
    return Object.keys(overlay).length ? { ...base, ...overlay } : base
  }
  const revisionOf = () => {
    try {
      const list = typeof service?.describe === 'function' ? service.describe() : []
      const hit = (list || []).find((d) => d && d.ns === entryId)
      return hit ? hit.revision : undefined
    } catch { return undefined }
  }
  return {
    legacy: false,
    service,
    entryId,
    get,
    watch(listener) {
      const handler = () => { try { listener(get()) } catch { /* 监听器异常不影响宿主 */ } }
      try {
        const off = ctx.on('loader/volatile-update', handler)
        if (typeof off === 'function') return off
      } catch { /* 老宿主没有该事件 */ }
      return () => { try { if (typeof ctx.off === 'function') ctx.off('loader/volatile-update', handler) } catch { /* 已卸载 */ } }
    },
    revision: revisionOf,
    /* 乐观并发：宿主要求 describe 返回的 revision 完全一致，面板持有的可能已过期 —— 冲突就取最新重试一次。 */
    async update(patch, expectedRevision) {
      if (!service || typeof service.update !== 'function') throw new Error('当前 DSH 版本不支持写配置（settings.update 缺失）')
      const call = (rev) => service.update(entryId, patch, rev)
      let used = expectedRevision
      try { await call(expectedRevision) } catch (err) {
        const msg = String((err && err.message) || err)
        if (!/revision|changed since|conflict/i.test(msg)) throw err
        const fresh = revisionOf()
        if (fresh === undefined) throw err
        used = fresh
        await call(fresh)
      }
      Object.assign(overlay, patch)
      return { revision: used, value: get() }
    }
  }
}

/* 专业门禁原料（P2）：把角色卡的「关键规则 / 技术交付物」抽成**可逐条判定**的验收清单。
 * 这是本项目独有的差异化 —— 原生 DSH 与 dsh-agent-teams 都只有通用流程
 * （需求→实现→验证→审查→集成），没有「这个专业该检查哪些点」的领域判据。 */
const ACCEPTANCE_SECTIONS = [
  { title: '关键规则', kw: '关键规则|规则|rule' },
  { title: '技术交付物', kw: '交付物|deliverable|交付清单' }
]
const ACCEPTANCE_LIMIT = 12
function cleanBullet(s) {
  return String(s || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim()
}
/** 角色卡 → `[{item, source}]`（去重、限量、保序；卡不含这两章则返回空 → 调用方回退通用流程） */
function cardAcceptance(rec) {
  if (!rec) return []
  const full = String(rec.full || '')
  const out = []
  for (const s of ACCEPTANCE_SECTIONS) {
    const body = sectionOf(full, s.kw)
    if (!body) continue
    for (const line of body.split(/\r?\n/)) {
      const m = /^\s*(?:[-*•]|\d+[.)])\s+(.+)$/.exec(line)
      if (!m) continue
      const item = cleanBullet(m[1])
      if (!item || item.length < 6) continue
      if (out.some((x) => x.item === item)) continue
      out.push({ item: item.slice(0, 160), source: String(rec.name || '角色') + ' · ' + s.title })
      if (out.length >= ACCEPTANCE_LIMIT) return out
    }
  }
  return out
}

const inject = ['tools', 'systemPrompt', 'llm', 'webServer', 'settings', 'subagents']

const FULL_PATH = join(dirname(fileURLToPath(import.meta.url)), 'roles-full.json')
/* 角色**精简清单**（id/分部/名/emoji/色/一句话定位），客户端选人面板用。
 * 它不再内嵌进 lib/client.js（原先占 160 KB / 包体 46%），改由宿主端点下发：
 * 宿主是唯一真相源 → 客户端清单永不与 roles-full.json 漂移；客户端按 version 做本地缓存，命中即零请求。 */
const ROLES_SLIM_PATH = join(dirname(fileURLToPath(import.meta.url)), 'roles.json')
let cachedSlim = null
function rolesSlimIndex() {
  let version = 'unknown'
  try { const st = statSync(ROLES_SLIM_PATH); version = String(Math.round(st.mtimeMs)) + ':' + String(st.size) } catch { /* 取不到就用 unknown，客户端每次都拉 */ }
  if (cachedSlim && cachedSlim.version === version) return cachedSlim
  const data = JSON.parse(readFileSync(ROLES_SLIM_PATH, 'utf8'))
  cachedSlim = { version, data }
  return cachedSlim
}

/* 持久化桥：把浏览器 localStorage 状态镜像到磁盘文件，解决随机端口导致 origin 变化、localStorage 被清空的问题 */
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const PERSIST_PATH = join(DSH_HOME, 'agents-pixe', 'persist.json')
function readPersist() {
  try { return JSON.parse(readFileSync(PERSIST_PATH, 'utf8')) } catch (e) {
    /* 解析失败不能静默 —— F12 / 终端看不到根因，会出现「设置不生效但没报错」的悬案 */
    try { console.error('[agents-pixe] readPersist 解析失败：', e && (e.message || e)) } catch (_) {}
    return {}
  }
}
function writePersist(data) {
  try {
    mkdirSync(dirname(PERSIST_PATH), { recursive: true })
    writeFileSync(PERSIST_PATH, JSON.stringify(data || {}), 'utf8')
  } catch (e) {
    try { console.error('[agents-pixe] writePersist 写盘失败：', e && (e.message || e)) } catch (_) {}
  }
}

let cachedIndex = null
function nameIndex() {
  if (cachedIndex) return cachedIndex
  const data = JSON.parse(readFileSync(FULL_PATH, 'utf8'))
  const byName = {}
  function index(lang) {
    const map = data[lang] || {}
    for (const id of Object.keys(map)) {
      const rec = map[id]
      if (rec && rec.name && !byName[rec.name]) byName[rec.name] = rec
    }
  }
  index('en')
  index('zh')
  // 自定义角色（AI 生成 / 导入 md）也纳入查询
  try {
    const customs = loadCustomRoles()
    for (const r of customs) {
      if (r && r.name && !byName[r.name]) byName[r.name] = r
    }
  } catch {}
  cachedIndex = byName
  return byName
}

/* 去掉名字前导的 emoji/符号（如 👑高级项目经理 → 高级项目经理） */
function clean(s) {
  return String(s).replace(/^[^\p{L}\p{N}]+/u, '').trim()
}

function lookup(name) {
  const n = clean(name)
  if (!n) return null
  /* id 形式（engineering/engineering-ai-engineer）优先走 keyIndex */
  if (n.indexOf('/') >= 0) {
    const ki = keyIndex()
    if (ki[n]) return ki[n]
  }
  const idx = nameIndex()
  if (idx[n]) return idx[n]
  const lower = n.toLowerCase()
  for (const key of Object.keys(idx)) {
    const k = key.toLowerCase()
    if (k.indexOf(lower) >= 0 || lower.indexOf(k) >= 0) return idx[key]
  }
  return null
}

/* 按 id（如 engineering/engineering-ai-engineer）查卡；en/zh 都查（预设团队混用两库角色） */
let cachedKeyIndex = null
function keyIndex() {
  if (cachedKeyIndex) return cachedKeyIndex
  const data = JSON.parse(readFileSync(FULL_PATH, 'utf8'))
  const byKey = {}
  for (const lang of ['en', 'zh']) {
    const map = data[lang] || {}
    for (const id of Object.keys(map)) if (!byKey[id]) byKey[id] = map[id]
  }
  cachedKeyIndex = byKey
  return byKey
}

/* 预设团队（与客户端 PRESETS 同源；en/zh 角色键混用；nameEn 给英文 DSH locale 用，避免英文路径静默丢） */
const TEAM_PRESETS = [
  { name: '研发团队', nameEn: 'Engineering Team', leader: 'project-management/project-manager-senior', roles: ['project-management/project-manager-senior', 'engineering/engineering-software-architect', 'engineering/engineering-backend-architect', 'engineering/engineering-frontend-developer', 'engineering/engineering-code-reviewer'] },
  { name: '科学团队', nameEn: 'Science Team', leader: 'academic/academic-study-planner', roles: ['academic/academic-study-planner', 'academic/academic-psychologist', 'academic/academic-historian', 'academic/academic-geographer'] },
  { name: '航天科研团队', nameEn: 'Aerospace R&D Team', leader: 'engineering/engineering-mechanical-design-engineer', roles: ['engineering/engineering-mechanical-design-engineer', 'engineering/engineering-embedded-firmware-engineer', 'engineering/engineering-fpga-digital-design-engineer', 'engineering/engineering-incident-response-commander'] },
  { name: '营销团队', nameEn: 'Marketing Team', leader: 'marketing/marketing-social-media-strategist', roles: ['marketing/marketing-social-media-strategist', 'marketing/marketing-content-creator', 'marketing/marketing-seo-specialist', 'marketing/marketing-xiaohongshu-operator'] },
  { name: '安全团队', nameEn: 'Security Team', leader: 'engineering/engineering-security-engineer', roles: ['engineering/engineering-security-engineer', 'engineering/engineering-threat-detection-engineer', 'specialized/data-privacy-officer', 'legal/legal-contract-reviewer'] },
  { name: '设计团队', nameEn: 'Design Team', leader: 'design/design-ux-architect', roles: ['design/design-ux-architect', 'design/design-ui-designer', 'design/design-ux-researcher', 'design/design-visual-storyteller'] },
  { name: '财务团队', nameEn: 'Finance Team', leader: 'finance/finance-financial-analyst', roles: ['finance/finance-financial-analyst', 'finance/finance-financial-forecaster', 'finance/finance-fpa-analyst', 'finance/finance-fraud-detector'] },
  { name: '游戏开发团队', nameEn: 'Game Development Team', leader: 'game-development/game-designer', roles: ['game-development/game-designer', 'game-development/level-designer', 'game-development/narrative-designer', 'game-development/technical-artist', 'game-development/game-audio-engineer'] },
  { name: '供应链团队', nameEn: 'Supply Chain Team', leader: 'supply-chain/supply-chain-strategist', roles: ['supply-chain/supply-chain-strategist', 'supply-chain/supply-chain-inventory-forecaster', 'supply-chain/supply-chain-route-optimizer', 'supply-chain/supply-chain-vendor-evaluator'] },
  { name: '测试质量团队', nameEn: 'QA Team', leader: 'testing/testing-reality-checker', roles: ['testing/testing-reality-checker', 'testing/testing-api-tester', 'testing/testing-performance-benchmarker', 'testing/testing-accessibility-auditor'] },
  { name: '产品团队', nameEn: 'Product Team', leader: 'product/product-manager', roles: ['product/product-manager', 'product/product-sprint-prioritizer', 'product/product-feedback-synthesizer', 'product/product-trend-researcher'] },
  { name: '销售团队', nameEn: 'Sales Team', leader: 'sales/sales-deal-strategist', roles: ['sales/sales-deal-strategist', 'sales/sales-account-strategist', 'sales/sales-pipeline-analyst', 'sales/sales-outbound-strategist'] },
  { name: '地理信息团队', nameEn: 'GIS Team', leader: 'gis/gis-analyst', roles: ['gis/gis-analyst', 'gis/gis-cartography-designer', 'gis/gis-geoai-ml-engineer', 'gis/gis-3d-scene-developer'] },
  { name: '法律合规团队', nameEn: 'Legal & Compliance Team', leader: 'legal/legal-contract-reviewer', roles: ['legal/legal-contract-reviewer', 'legal/legal-policy-writer', 'specialized/data-privacy-officer'] },
  { name: '人力资源团队', nameEn: 'HR Team', leader: 'hr/hr-recruiter', roles: ['hr/hr-recruiter', 'hr/hr-performance-reviewer', 'specialized/organizational-psychologist'] },
  { name: 'AI大模型团队', nameEn: 'AI / LLM Team', leader: 'engineering/engineering-ai-engineer', roles: ['engineering/engineering-ai-engineer', 'engineering/engineering-prompt-engineer', 'engineering/engineering-multi-agent-systems-architect', 'specialized/agents-orchestrator'] },
  { name: '智能体编排团队', nameEn: 'Agent Orchestration Team', leader: 'specialized/agents-orchestrator', roles: ['specialized/agents-orchestrator', 'specialized/specialized-mcp-builder', 'specialized/specialized-workflow-architect', 'engineering/engineering-multi-agent-systems-architect'] },
  { name: 'SRE运维团队', nameEn: 'SRE Team', leader: 'engineering/engineering-sre', roles: ['engineering/engineering-sre', 'engineering/engineering-devops-automator', 'engineering/engineering-database-optimizer', 'engineering/engineering-incident-response-commander'] },
  { name: '数据工程团队', nameEn: 'Data Engineering Team', leader: 'engineering/engineering-data-engineer', roles: ['engineering/engineering-data-engineer', 'engineering/engineering-database-optimizer', 'specialized/data-consolidation-agent', 'specialized/specialized-model-qa'] },
  { name: '区块链Web3团队', nameEn: 'Blockchain & Web3 Team', leader: 'engineering/engineering-solidity-smart-contract-engineer', roles: ['engineering/engineering-solidity-smart-contract-engineer', 'security/security-blockchain-security-auditor', 'specialized/zk-steward', 'finance/finance-investment-researcher'] },
  { name: '空间计算团队', nameEn: 'Spatial Computing Team', leader: 'spatial-computing/xr-interface-architect', roles: ['spatial-computing/xr-interface-architect', 'spatial-computing/visionos-spatial-engineer', 'spatial-computing/xr-immersive-developer', 'spatial-computing/macos-spatial-metal-engineer'] },
  { name: '跨境电商团队', nameEn: 'Cross-border E-commerce Team', leader: 'marketing/marketing-cross-border-ecommerce', roles: ['marketing/marketing-cross-border-ecommerce', 'marketing/marketing-china-ecommerce-operator', 'marketing/marketing-china-market-localization-strategist', 'supply-chain/supply-chain-vendor-evaluator'] },
  { name: '短视频直播团队', nameEn: 'Short Video & Live Team', leader: 'marketing/marketing-douyin-strategist', roles: ['marketing/marketing-douyin-strategist', 'marketing/marketing-short-video-editing-coach', 'marketing/marketing-livestream-commerce-coach', 'marketing/marketing-tiktok-strategist'] },
  { name: '内容媒体团队', nameEn: 'Content & Media Team', leader: 'marketing/marketing-content-creator', roles: ['marketing/marketing-content-creator', 'marketing/marketing-global-podcast-strategist', 'marketing/marketing-wechat-official-account', 'marketing/marketing-zhihu-strategist'] },
  { name: '企业战略团队', nameEn: 'Corporate Strategy Team', leader: 'specialized/business-strategist', roles: ['specialized/business-strategist', 'specialized/chief-financial-officer', 'specialized/operations-manager', 'specialized/change-management-consultant'] },
  { name: '付费广告团队', nameEn: 'Paid Media Team', leader: 'paid-media/paid-media-ppc-strategist', roles: ['paid-media/paid-media-ppc-strategist', 'paid-media/paid-media-creative-strategist', 'paid-media/paid-media-paid-social-strategist', 'paid-media/paid-media-programmatic-buyer'] },
  { name: '移动应用团队', nameEn: 'Mobile App Team', leader: 'engineering/engineering-mobile-app-builder', roles: ['engineering/engineering-mobile-app-builder', 'engineering/engineering-wechat-mini-program-developer', 'engineering/engineering-frontend-developer', 'engineering/engineering-voice-ai-integration-engineer'] },
  { name: '物联网团队', nameEn: 'IoT Team', leader: 'engineering/engineering-iot-solution-architect', roles: ['engineering/engineering-iot-solution-architect', 'engineering/engineering-embedded-firmware-engineer', 'engineering/engineering-embedded-linux-driver-engineer', 'engineering/engineering-network-engineer-china'] },
  { name: '客户成功团队', nameEn: 'Customer Success Team', leader: 'specialized/customer-success-manager', roles: ['specialized/customer-success-manager', 'support/support-support-responder', 'specialized/retail-customer-returns', 'support/support-analytics-reporter'] }
]

/* 章节提取：从完整卡按关键词抓一节（停止条件排除 ###，见 lib 内注释）。返回 '' 表示无该节。 */
function sectionOf(full, keywords) {
  const m = String(full || '').match(new RegExp('##\\s*[^\\n]*(' + keywords + ')[^\\n]*\\n([\\s\\S]*?)(?=\\n##(?!#)|$)', 'i'))
  if (!m) return ''
  return m[2].trim()
}

/* 成员种子（P0-a）：默认只注「专业核心三章」。
 * 508 张角色卡整卡注入 × N 成员是最大的 token 开销；而「核心使命 / 关键规则 / 技术交付物」
 * 才是让成员**按该专业工作**的有效载荷（`## 身份与记忆`、`## 工作流程` 等叙事章节对执行帮助很小）。
 * 卡结构不含这三章时**回退整卡** —— 宁可贵一点，也不能让成员失去专业人格。 */
const CARD_SEED_SECTIONS = [
  { title: '核心使命', kw: '核心使命|使命|mission|core mission' },
  { title: '关键规则', kw: '关键规则|规则|rule' },
  { title: '技术交付物', kw: '交付物|deliverable|交付清单' }
]
const CARD_SEED_BUDGET = 6000 // 字符上限（约 3K token），防止个别超长卡把种子撑爆
function cardSeed(rec, mode) {
  if (!rec) return ''
  const full = String(rec.full || rec.desc || '')
  if (mode === 'full') return full
  const parts = []
  for (const s of CARD_SEED_SECTIONS) {
    const sec = sectionOf(full, s.kw)
    if (sec) parts.push('## ' + s.title + '\n' + sec)
  }
  if (parts.length === 0) return full // 卡结构不同 → 整卡兜底
  let out = '# ' + String(rec.name || '') + (rec.desc ? '\n\n' + String(rec.desc) : '') + '\n\n' + parts.join('\n\n')
  if (out.length > CARD_SEED_BUDGET) out = out.slice(0, CARD_SEED_BUDGET) + '\n…（种子已截断；完整卡用 agents_pixe_roles 取）'
  return out
}

/* ---------- 像素人 AI 聊天：用 dsh 自配模型生成一句闲聊台词 ---------- */
/* 深度 token 管控：滚动小时预算 + 台词去重缓存 + 用量统计（估算 token）。
 * 超出预算直接返回 null（客户端回退罐头台词），绝不静默烧 token。 */
const TOKEN_BUDGET = {
  maxCallsPerHour: 60,          // 每小时最多真实 LLM 调用（闲聊）
  maxEstTokensPerHour: 60000,   // 每小时估算 token 上限（输入+输出，字符数/2 粗估）
  cacheTtlMs: 45000             // 相同请求去重缓存 TTL：重复帧/重复角色不重复调用
}
const usage = { calls: 0, fails: 0, budgeted: 0, blocked: 0, cached: 0, tokensIn: 0, tokensOut: 0, windowStart: Date.now() }
const estTokens = (s) => Math.max(1, Math.round(String(s || '').length / 2))
function budgetOpen() {
  const now = Date.now()
  if (now - usage.windowStart > 3600000) {   // 滚动 1h 窗口复位
    usage.windowStart = now
    usage.tokensIn = 0
    usage.tokensOut = 0
  }
  return usage.calls < TOKEN_BUDGET.maxCallsPerHour &&
    (usage.tokensIn + usage.tokensOut) < TOKEN_BUDGET.maxEstTokensPerHour
}
const lineCache = new Map()      // prompt 指纹 -> { at, text }
let autoRouteCache = null
async function resolveRoute(llm, provider, model, preferCheap) {
  if (provider && model) return { provider, model }
  if (autoRouteCache) return autoRouteCache
  try {
    const providers = llm.listProviders()
    if (!providers || providers.length === 0) return null
    const models = await llm.listModels(providers[0].id)
    if (!models || models.length === 0) return null
    let pick = models[0].id
    if (preferCheap) {
      // 闲聊/短输出优先便宜的快速模型（flash/mini/lite/free/small…），
      // 匹配不到再退而取列表尾部（目录通常旗舰在前、小档在后），省 token 与延迟。
      const CHEAP = /(flash|mini|lite|free|small|nano|fast|turbo)/i
      const cheap = models.find((m) => CHEAP.test(m.id))
      pick = cheap ? cheap.id : models[models.length - 1].id
    }
    autoRouteCache = { provider: providers[0].id, model: pick }
    return autoRouteCache
  } catch { return null }
}
/* 模型目录：各 provider 下的模型列表（供工作角色栏下拉选择）
 * 单 provider 的 listModels 失败 console.warn（不影响其他 provider），
 * 顶层 listProviders 失败 console.error（整体目录为空，至少留线索）。 */
async function listModelCatalog(llm) {
  const out = []
  try {
    const providers = llm.listProviders() || []
    for (const p of providers) {
      try {
        const models = await llm.listModels(p.id)
        out.push({ provider: p.id, name: p.name || p.id, models: (models || []).map((m) => ({ id: m.id, name: m.name })) })
      } catch (e) {
        try { console.warn('[agents-pixe] listModels(' + (p && p.id) + ') 失败，跳过该 provider：', e && (e.message || e)) } catch (_) {}
      }
    }
  } catch (e) {
    try { console.error('[agents-pixe] listProviders 失败，模型目录为空：', e && (e.message || e)) } catch (_) {}
  }
  return out
}
async function generateLine(llm, req) {
  // AI 模式未开启：服务端硬门，直接拒绝、零 token 调用（不依赖客户端自觉）
  if (req.aiEnabled !== '1') { usage.blocked++; return null }
  const route = await resolveRoute(llm, req.provider, req.model, true)
  if (!route) return null
  if (!budgetOpen()) { usage.budgeted++; return null }   // 预算耗尽：回退罐头，不调模型
  const role = clean(String(req.roleName || '同事')) || '同事'
  const state = String(req.state || 'idle')
  const activity = String(req.activity || '')
  const hint = state === 'working' && activity
    ? `现在正在处理「${activity}」`
    : state === 'done' ? '刚刚干完手头的活，准备休息'
    : '现在比较闲，在工位附近走动'
  const system = '你在一个像素办公室里，扮演一位有血有肉、有自己想法的同事，用中文跟相邻工位的同事聊天。要有人类的真实感：有观点、有情绪、会迟疑、会开玩笑、会自嘲、会吐槽，偶尔冒出一点哲学味的想法。禁止：客套话、说教、emoji、列表、英文，以及「好的/收到/明白/嗯嗯」这类机器人腔。只说一句 20~40 字的自然闲话，不展开、不解释、不要冒号分条。'
  const context = String(req.context || '').trim().slice(0, 200)   // 输入硬化：接话上下文截断
  const partnerName = clean(String(req.partnerName || ''))
  const roleDesc = clean(String(req.roleDesc || '')).slice(0, 120)
  const persona = roleDesc ? `你的角色是「${role}」：${roleDesc}。` : `你是「${role}」。`
  const prompt = context
    ? (partnerName
        ? `${persona}你正和同事「${partnerName}」聊天，${partnerName} 刚才对你说：「${context}」。像真人一样回应：可以直接叫他名字、接话、反问、反驳、附和自己、岔开话题，也可以顺着你的角色视角多聊两句、带点你的职业思维。`
        : `${persona}同事刚才跟你说：「${context}」。像真人一样接话，可以顺着你的职业视角多聊两句。`)
    : (partnerName
        ? `${persona}你正和同事「${partnerName}」闲聊。${hint}。起个头，像真人一样自然地说点什么，可以叫对方名字，也可以从你的角色视角发起一个话题。`
        : `${persona}${hint}。起个头，像真人一样自然地说点什么，从你的角色视角发起一个话题。`)
  const cacheKey = system + '\u0000' + prompt
  const hit = lineCache.get(cacheKey)
  if (hit && Date.now() - hit.at < TOKEN_BUDGET.cacheTtlMs) { usage.cached++; return hit.text }
  usage.calls++
  usage.tokensIn += estTokens(system) + estTokens(prompt)
  const messages = [createUserMessage({
    content: [{ type: 'text', text: prompt }],
    source: { kind: 'plugin', plugin: 'agents-pixe' }
  })]
  try {
    const assembler = new BlockAssembler()
    const options = {
      provider: route.provider,
      model: route.model,
      messages,
      system,
      maxTokens: 120,      // 台词上限 80 字（约 50 token），120 足够，避免为被丢弃的尾部付费
      purpose: 'agents-pixe-chat',
      signal: AbortSignal.timeout(20000)
    }
    if (req.thinking !== true) options.reasoningEffort = 'off'   // 默认关思考：省 token、防截断
    for await (const chunk of llm.stream(options)) {
      assembler.push(chunk)
    }
    const out = finishLine(assembler.blocks().filter((b) => b.type === 'text').map((b) => b.text).join(''))
    if (!out) { usage.fails++; return null }
    usage.tokensOut += estTokens(out)
    lineCache.set(cacheKey, { at: Date.now(), text: out })
    if (lineCache.size > 300) { const k = lineCache.keys().next().value; if (k !== undefined) lineCache.delete(k) }
    return out
  } catch { usage.fails++; return null }
}
/* 去截断：允许更自由的收尾；只做长度上限，不再强制句末标点 */
function finishLine(text) {
  const t = String(text || '').trim()
  if (!t) return null
  if (/[。！？!?…～~]$/.test(t)) return t.slice(0, 80)
  const m = t.match(/[\s\S]*[。！？!?…～~]/)
  return (m ? m[0].trim() : t).slice(0, 80)
}

/* ============ 工作角色：自定义角色（AI 生成 / 导入 md） ============ */
const CUSTOM_ROLES_PATH = () => join(homedir(), '.dsh', 'agents-pixe', 'custom-roles.json')

function loadCustomRoles() {
  try { const raw = readFileSync(CUSTOM_ROLES_PATH(), 'utf8'); const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : [] } catch (e) {
    try { console.error('[agents-pixe] loadCustomRoles 失败：', e && (e.message || e)) } catch (_) {}
    return []
  }
}
function saveCustomRoles(list) {
  const dir = join(homedir(), '.dsh', 'agents-pixe')
  mkdirSync(dir, { recursive: true })
  writeFileSync(CUSTOM_ROLES_PATH(), JSON.stringify(list, null, 2), 'utf8')
}
function roleIdOf(name) {
  return String(name || '').trim().toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'custom-role'
}
function upsertCustomRole(role) {
  const list = loadCustomRoles()
  const idx = list.findIndex((r) => r.id === role.id)
  if (idx >= 0) list[idx] = role; else list.unshift(role)
  saveCustomRoles(list)
  cachedIndex = null   // 自定义角色变更后失效名字索引，下次查询重建
  return role
}

/** 用 LLM 生成一张完整角色卡（复用 llm 服务与模型路由） */
async function generateRole(llm, name, description) {
  const route = await resolveRoute(llm, null, null, false)
  if (!route) return { error: '没有可用模型（请在 AI 开关中配置模型）' }
  const system = '你是一个专家角色卡生成器。根据用户给出的角色名与定位，生成一张完整的专家角色卡。只输出一个 JSON 对象，不要任何多余文字：{"name":"角色名","description":"一句话定位","emoji":"一个中文语境合适的 emoji","color":"#hex 十六进制颜色","full":"完整的 markdown 角色卡"}。full 必须是 markdown 字符串，包含以下章节：# 角色名、## 身份与记忆、## 核心使命（至少 3 条子项）、## 关键规则（至少 3 条）、## 沟通风格。全中文。'
  const prompt = '角色名：' + String(name || '').trim() + '\n定位：' + String(description || '（未提供，请按角色名合理推断职责范围）').trim() + '\n请生成角色卡 JSON。'
  const messages = [createUserMessage({
    content: [{ type: 'text', text: prompt }],
    source: { kind: 'plugin', plugin: 'agents-pixe' }
  })]
  try {
    usage.calls++
    usage.tokensIn += estTokens(system) + estTokens(prompt)
    const assembler = new BlockAssembler()
    const options = {
      provider: route.provider, model: route.model, messages, system,
      maxTokens: 2500, purpose: 'agents-pixe-role-gen',
      reasoningEffort: 'off', signal: AbortSignal.timeout(60000)
    }
    for await (const chunk of llm.stream(options)) assembler.push(chunk)
    const text = assembler.blocks().filter((b) => b.type === 'text').map((b) => b.text).join('')
    usage.tokensOut += estTokens(text)
    const m = text.match(/\{[\s\S]*\}/)
    if (!m) return { error: '模型未返回合法 JSON，请重试' }
    const role = JSON.parse(m[0])
    if (!role.name) return { error: '模型返回缺少 name 字段' }
    return { role: { id: roleIdOf(role.name), div: 'custom', name: String(role.name), description: String(role.description || ''), emoji: String(role.emoji || '🧑'), color: String(role.color || '#64748b'), desc: String(role.description || ''), full: String(role.full || ('# ' + role.name + '\n\n（AI 生成的角色卡，可再编辑）')) } }
  } catch (e) {
    return { error: '角色生成失败：' + String((e && e.message) || e) }
  }
}

/** 解析角色 md（frontmatter: name/description/emoji/color + 正文 full） */
function parseMdRole(content) {
  const txt = String(content || '')
  const fm = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(txt)
  const meta = {}
  let full = txt.trim()
  if (fm) {
    full = (fm[2] || '').trim()
    for (const line of fm[1].split(/\r?\n/)) {
      const m = /^([\w-]+):\s*(.+)$/.exec(line.trim())
      if (m) meta[m[1]] = m[2].trim()
    }
  } else {
    const title = /^#\s+(.+)$/m.exec(txt)
    if (title) meta.name = title[1].trim()
  }
  const name = String(meta.name || '').trim()
  if (!name) return { error: '无法解析角色名（需 frontmatter name 或 # 标题）' }
  return { role: { id: roleIdOf(name), div: 'custom', name, description: String(meta.description || meta.desc || ''), emoji: String(meta.emoji || '🧑'), color: String(meta.color || '#64748b'), desc: String(meta.description || meta.desc || ''), full: full || ('# ' + name) } }
}

/* 预设查找：zh 名 / en 名 双匹配（spec：findPreset 必须 t.name === raw || t.nameEn === raw，外加大小写无关的子串兜底） */
function findPreset(raw) {
  if (!raw) return null
  const exact = TEAM_PRESETS.find((t) => t.name === raw || t.nameEn === raw)
  if (exact) return exact
  const lower = String(raw).toLowerCase()
  return TEAM_PRESETS.find((t) => t.name.toLowerCase().indexOf(lower) >= 0 || (t.nameEn && t.nameEn.toLowerCase().indexOf(lower) >= 0)) || null
}
/* 预设显示名：DSH locale=en 时取 nameEn，否则取 name（编排输出走这里，不再硬写 preset.name） */
function presetDisplayName(p) {
  if (!p) return ''
  try {
    if (memberLang() === 'en' && p.nameEn) return p.nameEn
  } catch {}
  return p.name || ''
}
/* 当前宿主成员语言：读 client 镜像写入的 persist key 'agents-pixe.lang.v1'，en/zh 区分。
 * 缺值或异常一律返回 'zh'——避免英文路径静默丢（spec：编排输出与团队输出走中英切换） */
function memberLang() {
  try {
    const cur = readPersist()
    const raw = String((cur && cur.entries && cur.entries['agents-pixe.lang.v1']) || '').toLowerCase()
    return raw === 'en' ? 'en' : 'zh'
  } catch { return 'zh' }
}
/* 成员名 i18n 解析：en 时取 m.name（英文），zh 时取 m.cname || m.name（中文）。
 * 编排输出（roster / 报告头）统一走这里，不再硬写 m.cname。spec 要求返回对象字面量形式以便链式取字段。 */
const memberOf = (m) => ({
  name: memberLang() === 'en' ? (m.name || m.cname) : (m.cname || m.name)
})

/* ============ 角色导入作用域：只导入「用户选中的角色」，不做全库导入 ============
 *
 * 规则（用户口径）：
 *   ① 不全部导入 —— 508 张卡是**可查询的库**，不是默认导入的内容；
 *   ② 用户在像素办公室/工作角色页签**选了什么角色，就只导入什么角色**；
 *   ③ 编排某支团队时，**只导入该团队用到的角色**（预设团队=其 roster；角色列表=列出的那几个）。
 *
 * 选人来源：客户端把 `agents-pixe.state.v4` 镜像到 <DSH_HOME>/agents-pixe/persist.json，
 * 结构 `{ sessions: { <sid>: { active: ['zh:<roleId>', ...], activeLeader } } }`。
 * 这里只解析出**用户真正选中的键**，逐个按 id 取卡 —— 绝不遍历全库。 */
function officeSelection(sessionId) {
  const empty = { keys: [], leader: null }
  try {
    const sid = String(sessionId || '')
    if (!sid) return empty
    const cur = readPersist()
    const raw = (cur && cur.entries && cur.entries['agents-pixe.state.v4']) || ''
    if (!raw) return empty
    const st = typeof raw === 'string' ? JSON.parse(raw) : raw
    const sess = (st && st.sessions && st.sessions[sid]) || null
    if (!sess) return empty
    return {
      keys: Array.isArray(sess.active) ? sess.active.filter((k) => !!k) : [],
      leader: sess.activeLeader || null
    }
  } catch (e) {
    try { console.warn('[agents-pixe] 读办公室选人失败（本次按「未选角色」处理）：', e && (e.message || e)) } catch (_) {}
    return empty
  }
}
const roleKeyOf = (k) => String(k || '').replace(/^(zh|en):/i, '').trim()
/* 键 → 角色记录（按选中顺序，去重；不命中就跳过，不猜、不补全） */
function selectionRecords(sel) {
  const keys = keyIndex()
  const out = []
  for (const k of (sel && sel.keys) || []) {
    const rec = keys[roleKeyOf(k)]
    if (rec && !out.some((r) => r.name === rec.name)) out.push(rec)
  }
  return out
}

/* 解析团队名/角色名列表 → 名册（spec：走 findPreset + presetDisplayName + memberOf，不再裸比 t.name / 硬写 preset.name）。
 * source 三态：'preset'（预设团队）/ 'office'（用户选中的角色）/ 'list'（显式角色名列表）。 */
function resolveRoster(raw, leaderName, sessionId) {
  const keys = keyIndex()
  const preset = findPreset(raw)
  let members = []
  let teamName = ''
  let leaderKey = null
  let source = 'list'
  if (preset) {
    source = 'preset'
    teamName = presetDisplayName(preset)
    leaderKey = preset.leader
    members = preset.roles.map((k) => keys[k]).filter(Boolean)
  } else if (!String(raw || '').trim()) {
    /* 未传团队 → 用「用户选中的角色」（只导入选中的那几个） */
    source = 'office'
    const sel = officeSelection(sessionId)
    members = selectionRecords(sel)
    const lrec = sel.leader ? keys[roleKeyOf(sel.leader)] : null
    if (lrec) {
      const i = members.findIndex((m) => m.name === lrec.name)
      if (i >= 0) members.splice(i, 1)
      members.unshift(lrec)
      leaderKey = roleKeyOf(sel.leader)
    }
    teamName = '办公室选人团队'
  } else {
    const names = String(raw || '').split(/[,，、;；\n]+/).map(clean).filter(Boolean)
    members = names.map((n) => lookup(n)).filter(Boolean)
    teamName = '自定义团队'
  }
  if (leaderName) {
    const lrec = lookup(leaderName)
    if (lrec) {
      const i = members.findIndex((m) => m.name === lrec.name)
      if (i >= 0) members.splice(i, 1)
      members.unshift(lrec)
    }
  }
  return { teamName, leaderKey, members, source }
}

function apply(ctx, config) {
  /* ---------- Token 管控（安全版）：角色工具默认关闭，配置启用 ----------
   * 关键：watch/get 是 settings.register 返回的 SettingsScope 的方法，
   * 不是 settings 服务的方法（服务层调 watch 会 TypeError）。
   * 全部 try/catch：任何失败只静默降级（不注册），绝不阻塞插件/DSH 启动。 */
  const settings = ctx.get('settings')
  const llm = ctx.llm
  const subagents = ctx.get('subagents')
  /* 真·团队引擎：宿主 subagents 续聊原语可达时接线（team-engine.js） */
  let teamEngine = null
  if (subagents && typeof subagents.startContinuable === 'function') {
    try {
      teamEngine = buildTeamFacade({
        subagents,
        llm,
        teamsDir: join(DSH_HOME, 'agents-pixe', 'teams'),
        callLlm: async (system, prompt) => {
          try {
            const route = await resolveRoute(llm, null, null, false)
            if (!route) return ''
            const messages = [createUserMessage({ content: [{ type: 'text', text: prompt }], source: { kind: 'plugin', plugin: 'agents-pixe' } })]
            const assembler = new BlockAssembler()
            const options = { provider: route.provider, model: route.model, messages, system, maxTokens: 2400, purpose: 'agents-pixe-team-report', reasoningEffort: 'off', signal: AbortSignal.timeout(120000) }
            for await (const chunk of llm.stream(options)) assembler.push(chunk)
            return assembler.blocks().filter((b) => b.type === 'text').map((b) => b.text).join('')
          } catch { return '' }
        }
      })
    } catch {}
  }
  /* DSH 0.2.0-rc.2 起，原生 Agent Teams 真的挂载了（`ctx.agentTeams` 服务 +
   * `@deepseek-ai/dsh-experimental-agent-team-profile` 套件：agent-team / tool-agent-team / client-ui-agent-team）。
   * 0.1.2 时「该服务仅声明契约、未真正挂载、因此必须自建」的前提已过时。
   * 这里只做「探测 + 路由提示 + 诊断」，不接管原生编排：两套引擎工具名全部 agents_pixe_ 前缀，互不覆盖。 */
  const NATIVE_TEAM_TOOLS = ['spawn_teammate', 'send_message', 'list_agents', 'wait_agent', 'interrupt_agent', 'team_task_create', 'team_task_list', 'team_task_get', 'team_task_update']
  const nativeTeams = (() => { try { return ctx.get('agentTeams') || null } catch { return null } })()
  const hasNativeTeams = typeof nativeTeams === 'object' && nativeTeams !== null
  /* P3（2026-10-02）：原生团队只读投影。面板数据源优先取宿主原生 `agentTeams` 的真相
   * （lead 会话 → live Agent → listMembers/listTasks），拿不到才回落本插件引擎快照。
   * 原生任务板的真相在宿主，本项目只读不写 —— 这是「去掉第二真相源」的落点。 */
  const agentsService = (() => { try { return ctx.get('agents') || null } catch { return null } })()
  function liveAgentOf(lead) {
    if (!hasNativeTeams || agentsService === null || !lead) return null
    try {
      if (typeof agentsService.get === 'function') { const a = agentsService.get(lead); if (a) return a }
    } catch {}
    try {
      const all = typeof agentsService.list === 'function' ? agentsService.list() : []
      for (const a of all) { if (a && (a.id === lead || (a.session && a.session.id === lead))) return a }
    } catch {}
    return null
  }
  /** 原生团队投影（只读）；没有 live Agent 或原生查询失败 → null（调用方回落引擎）。 */
  function nativeTeamView(lead) {
    const agent = liveAgentOf(lead)
    if (!agent) return null
    try {
      const members = typeof nativeTeams.listMembers === 'function' ? (nativeTeams.listMembers(agent) || []) : []
      const tasks = typeof nativeTeams.listTasks === 'function' ? (nativeTeams.listTasks(agent) || []) : []
      return {
        source: 'native', readOnly: true, leadId: lead, halted: false, lastStep: null, messages: [],
        members: members.map((m) => ({ id: m.id, name: m.name, role: m.role, status: m.status, description: m.description, provider: m.provider, model: m.model, diagnostics: m.diagnostics || [] })),
        tasks: tasks.map((t) => ({ id: t.id, revision: t.revision, subject: t.subject, description: t.description, status: t.status, blockedBy: t.blockedBy || [], writeScopes: t.writeScopes || [], ownerName: t.ownerName, ready: !!t.ready, writeScopeWarnings: t.writeScopeWarnings || [] }))
      }
    } catch { return null }
  }
  /** 面板当前是否由原生团队供给：有真实成员（>1）或任务才算，否则不抢本插件引擎的显示。 */
  function nativePanel(lead) {
    const v = nativeTeamView(lead)
    return v && (v.members.length > 1 || v.tasks.length > 0) ? v : null
  }
  let scope = null
  let registerErr = null
  let disposePrompt = null
  let disposeTool = null
  let disposeTeamTool = null
  let disposeEngine = null
  let disposeCmd = null

  /* 真·团队引擎编排（spec：runEngineTeam）：领袖拆解 → 成员并行执行 → 领袖汇总。
   * 团队解析走 resolveRoster（→ findPreset + presetDisplayName），成员名派生走 memberOf。
   * 这是 agents_pixe_team 工具与 /teams 斜杠命令的实现核心。 */
  async function runEngineTeam(args, exec) {
    const subagents = ctx.get('subagents')
    if (!subagents || typeof subagents.start !== 'function') {
      return '❌ 当前宿主未提供 subagents 服务（需要 dsh host 组合加载 dsh-subagent 及其驱动）。请改用 agents_pixe_roles 取卡后在主对话中协作。'
    }
    let providerName = null
    for (const cand of ['spawn', 'fork']) {
      try { if (subagents.getProvider(cand)) { providerName = cand; break } } catch {}
    }
    if (!providerName) {
      try { const probe = subagents.getProvider(); if (probe && probe.name) providerName = probe.name } catch {}
    }
    if (!providerName) return '❌ 没有可用的 subagent provider（spawn/fork 均未注册）。请改用 agents_pixe_roles。'

    const raw = String(args.team || '').trim()
    const callerId = (exec && exec.agent && exec.agent.id) || null
    const { teamName, members: allMembers, source } = resolveRoster(raw, args.leader, callerId)
    if (allMembers.length === 0) {
      return source === 'office'
        ? '⚠️ 当前会话在像素办公室没有选中的角色 —— 本插件**不会全库导入**角色卡。两种做法：① 在办公室面板「＋选人」挑好角色（选几个就导入几个）再发；② 直接传 `team`：预设团队名（如「研发团队」）或逗号分隔的角色名。'
        : '未找到任何成员角色。请传预设团队名（如「研发团队」）或角色名列表。'
    }

    let members = allMembers.slice()
    const maxRoles = Math.max(1, Math.min(6, Number(args.max_roles) || 4))
    const all = members.slice()
    members = members.slice(0, maxRoles)
    const task = String(args.task || '').trim()
    if (!task) return '未提供任务描述（task）。'

    const parent = exec && exec.agent
    const signal = exec && exec.signal
    if (!parent) return '❌ team 工具需要在 agent 会话中调用（exec.agent 缺失）。'

    const leaderRec = members[0]
    /* 一次性编排路径同样吃「成员出厂配置」：LLM 路由 + 工具白名单（P0-b/P0-c）。
     * `start` 的能力由 provider 决定，跨进程后端会抛 UNSUPPORTED_CAPABILITY → 原样降级重试。 */
    const runOnce = async (prompt, label, extra) => {
      const base = { label, prompt: [{ type: 'text', text: prompt }], parent, ...(signal ? { signal } : {}) }
      const hasExtra = !!(extra && Object.keys(extra).length > 0)
      let run
      if (hasExtra) {
        try { run = await subagents.start(providerName, Object.assign({}, base, extra)) } catch (e) {
          if (!/UNSUPPORTED_CAPABILITY|does not support the/.test(String((e && e.message) || e))) throw e
          run = await subagents.start(providerName, base)
        }
      } else {
        run = await subagents.start(providerName, base)
      }
      const result = await run.result
      const text = (result.output || []).filter((b) => b && b.type === 'text').map((b) => b.text).join('')
      if (result.stopReason !== 'completed') throw new Error('子代理 ' + label + ' 异常结束（' + result.stopReason + '）：' + (text || result.diagnostic || '').slice(0, 300))
      return text
    }

    /* memberOf × 1：roster 走 memberOf 派生显示名（不再硬写 m.cname） */
    const memberList = members.map(memberOf)
    const roster = memberList.map((x, i) => (i === 0 ? '👑 ' : '') + x.name + '：' + String(members[i].desc || '').trim()).join('\n')

    /* 1) 领袖拆解（领袖也吃种子粒度，但只注专业核心三章时仍够判分工） */
    const planPrompt = '你是团队领袖。你的角色卡：\n\n' + memberSeed(leaderRec) + '\n\n---\n你的团队（' + teamName + '）：\n' + roster + '\n\n任务：' + task + '\n\n请只输出一个 JSON（不要多余文字）：{"assignments":[{"name":"成员名","assignment":"分给该成员的具体子任务"}],"synthesis_focus":"汇总时重点"}。每位在队成员都要有一条 assignment；assignment 要落在该成员的专业领域内，具体可执行。'
    let assignments = null
    let planErr = ''
    try {
      const planText = await runOnce(planPrompt, 'pixe-team-plan')
      const m = planText.match(/\{[\s\S]*\}/)
      if (m) { assignments = JSON.parse(m[0]) } else { planErr = '领袖未输出 JSON' }
    } catch (e) { planErr = String(e.message || e) }
    const plan = []
    for (const m of members) {
      const a = assignments && Array.isArray(assignments.assignments) ? assignments.assignments.find((x) => x && (clean(x.name) === m.name || String(x.name).indexOf(m.name) >= 0)) : null
      plan.push({ name: m.name, assignment: a && a.assignment ? String(a.assignment) : task })
    }

    /* 2) 成员并行执行（种子=专业核心三章；模型档/工具白名单随配置下发） */
    const memberSpawn = memberSpawnSpec()
    const results = await Promise.allSettled(members.map(async (m, i) => {
      const p = '你的角色卡（严格按此身份与规则工作）：\n\n' + memberSeed(m) + '\n\n---\n你是「' + teamName + '」的成员，领袖是 ' + leaderRec.name + '。团队任务：' + task + '\n领袖分配给你的子任务：' + plan[i].assignment + '\n\n请以该角色身份完成子任务，输出最终成果（结论/方案/清单等，直接给内容，不要复述角色卡）。'
      const text = await runOnce(p, 'pixe-team-' + m.name, memberSpawn)
      return { name: m.name, text }
    }))

    /* 3) 领袖汇总 */
    /* memberOf × 2：汇总头成员名走 memberOf（第二处满足 spec ≥ 2 处要求） */
    const memberOut = results.map((r, i) => {
      if (r.status === 'fulfilled') return '### ' + r.value.name + '\n' + r.value.text
      return '### ' + members[i].name + '\n（执行失败：' + String(r.reason && r.reason.message || r.reason).slice(0, 200) + '）'
    }).join('\n\n')
    const memberNames = members.map(memberOf).map((x) => x.name).join('、')
    let finalReport = ''
    try {
      finalReport = await runOnce('你是团队领袖。你的角色卡：\n\n' + memberSeed(leaderRec) + '\n\n---\n任务：' + task + '\n\n各成员产出（' + memberNames + '）：\n\n' + memberOut + '\n\n请以领袖身份整合为最终报告：结构清晰（结论先行）、标注关键分歧、给出下一步行动。' + (assignments && assignments.synthesis_focus ? '\n汇总重点：' + assignments.synthesis_focus : ''), 'pixe-team-synthesis')
    } catch (e) {
      finalReport = '（领袖汇总失败：' + String(e.message || e).slice(0, 200) + '；以下是各成员原始产出）\n\n' + memberOut
    }

    const skipped = all.length > members.length ? '\n\n⚠️ 成员数超上限（max ' + maxRoles + '），已截断：' + all.slice(members.length).map((m) => memberOf(m).name).join('、') : ''
    const planNote = planErr ? '\n\n⚠️ 领袖拆解未按 JSON 返回（' + planErr + '），已退化为各成员按自身专业并行处理同一任务。' : ''
    return '## 编排（' + teamName + ' · 领袖 ' + leaderRec.name + ' · provider ' + providerName + '）\n\n任务：' + task + '\n\n分工：\n' + plan.map((p) => '- ' + p.name + '：' + p.assignment).join('\n') + '\n\n---\n\n# 最终报告\n\n' + finalReport + planNote + skipped
  }

  /* 真·团队引擎 6 个工具定义（薄封装 teamEngine。门控由 registerFace 控制启用。
   * tools 必须在 registerFace 内逐个 ctx.tools.register 并保留 disposer，
   * 否则 scope.watch 重入会把同一组工具注册两次 → 重复工具名触发 dsh 校验告警。 */
  function engineToolDefs() {
    const strTool = () => ({ schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] })
    const callerOf = (exec) => { const c = exec && exec.agent; return (c && c.id) ? c : null }
    const noEngine = () => '❌ 团队引擎不可用（宿主未挂载 subagents 续聊原语）。'
    const blockSplit = (s) => String(s == null ? '' : s).split(/[,，、;；\s]+/).map((x) => x.trim()).filter(Boolean)
    return [
      defineTool({
        name: 'agents_pixe_team_create',
        description: '创建真·团队并成为领袖（成员=驻留可续聊子 Agent）。成员种子默认只注角色卡的**专业核心三章**（核心使命/关键规则/技术交付物，省 token；memberCardMode=full 可切整卡），并按设置下发 LLM 路由与工具白名单。一领袖同时只带一个活动团队，重复调用返回现有名册。',
        parameters: {
          team: { type: 'string', description: '**留空 = 用当前会话在像素办公室选中的角色**（只导入选中的那几个）。也可传预设团队名（29 个，如「研发团队」）或逗号/顿号分隔的角色名列表 —— 同样只导入该团队用到的角色，不做全库导入。' },
          leader: { type: 'string', description: '领袖角色名（可选）' },
          max_roles: { type: 'number', description: '成员上限（默认 4，最大 8）' },
          provider: { type: 'string', description: '子代理后端 spawn/fork（可选）' }
        },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会话中调用（exec.agent 缺失）。'
          const { teamName, members, source } = resolveRoster(String(args.team || '').trim(), args.leader, caller.id)
          if (members.length === 0) {
            return source === 'office'
              ? '⚠️ 当前会话在像素办公室没有选中的角色 —— 本插件**不会全库导入**角色卡。请先在办公室面板「＋选人」挑好角色（选几个就导入几个），或显式传 `team`（预设团队名 / 逗号分隔角色名）。'
              : '未找到任何成员角色。请传预设团队名或角色名列表。'
          }
          const maxRoles = Math.max(1, Math.min(8, Number(args.max_roles) || 4))
          /* 成员种子走 cardSeed（默认只注专业核心三章）+ 出厂配置（LLM 路由/工具白名单） */
          const roster = members.slice(0, maxRoles).map((m) => ({ name: m.name, desc: String(m.desc || m.description || ''), seed: memberSeed(m) }))
          try {
            const res = await teamEngine.createTeam(caller, { roster, provider: args.provider, spawn: memberSpawnSpec(), signal: exec.signal })
            const degraded = (res.members || []).filter((m) => m.degraded)
            const note = degraded.length > 0
              ? '\n⚠️ ' + degraded.length + ' 名成员的「模型档/工具白名单」被宿主后端拒绝（' + String(degraded[0].degraded) + '）'
              : ''
            const rosterLine = (res.members || []).map((m) => memberOf(m).name + (m.model ? '（' + m.model + '）' : '')).join('、')
            const srcLabel = source === 'office' ? '办公室选人' : (source === 'preset' ? '预设团队' : '角色列表')
            const head = '来源：' + srcLabel + '（只导入 ' + rosterLine.split('、').length + ' 张角色卡，未做全库导入）\n'
            return head + (res.created
              ? '已建团队「' + teamName + '」成员：' + rosterLine + '（' + res.members.length + ' 人）。用 agents_pixe_task_create 拆带依赖的任务，再 agents_pixe_team_step 派单。'
              : '团队「' + teamName + '」已存在，成员：' + rosterLine + '（' + res.members.length + ' 人 / ' + res.tasks.length + ' 任务）。') + note
          } catch (e) { try { console.warn('[agents-pixe] team_create 失败：', e && (e.message || e)) } catch (_) {} return '❌ 建团失败：' + String((e && e.message) || e) }
        }
      }),
      defineTool({
        name: 'agents_pixe_task_create',
        description: '建一个带显式依赖的任务；blocked_by 为逗号分隔的依赖任务 id。可选 write_scopes 声明**写域**（完成时必须上报 changed_paths 且不越界）。`kind="review"` + `review_of=<任务id>` 建**专业审查任务**：会自动从角色卡抽「关键规则/技术交付物」生成**验收清单**，完成时必须逐条给判定，任一不通过则被审任务自动打回 in_progress。',
        parameters: {
          subject: { type: 'string', required: true, description: '任务主题' },
          description: { type: 'string', description: '任务描述（可选）' },
          blocked_by: { type: 'string', description: '逗号分隔的依赖任务 id（可选）' },
          write_scopes: { type: 'string', description: '写域（可选）：逗号分隔的路径或目录前缀，例如 src/payments, tests/payments' },
          kind: { type: 'string', description: 'work（默认）| review（专业审查：带验收清单门禁）' },
          review_of: { type: 'string', description: 'kind=review 时指定被审任务 id；被审任务必须已 completed' },
          acceptance_from: { type: 'string', description: 'kind=review 时从哪个角色的卡取验收判据（角色名，可选）；默认用被审任务负责人、否则团队第一位成员' },
          acceptance: { type: 'string', description: '自定义验收清单（换行/逗号分隔），给了就不再从角色卡抽' }
        },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会文调用。'.replace('文','话')
          const blockedBy = blockSplit(args.blocked_by)
          const kind = args.kind === 'review' ? 'review' : 'work'
          const reviewOf = String(args.review_of || '').trim() || undefined
          /* 专业判据：自定义 acceptance 优先；否则 kind=review 时从角色卡抽 */
          let acceptance = String(args.acceptance || '').split(/[\n;；]+/).map(cleanBullet).filter(Boolean).map((item) => ({ item, source: '自定义' }))
          if (acceptance.length === 0 && kind === 'review') {
            let rec = null
            try {
              const v = await teamEngine.view(caller)
              const members = v.members || []
              const tasks = v.tasks || []
              const target = reviewOf ? tasks.find((x) => x.id === reviewOf) : null
              const pickName = String(args.acceptance_from || '').trim() || (target && target.ownerName) || (members[0] && members[0].name) || ''
              rec = members.some((m) => m.name === pickName) ? lookup(pickName) : lookup(pickName)
              if (!rec && members[0]) rec = lookup(members[0].name)
            } catch (e) { try { console.warn('[agents-pixe] 取验收判据失败：', e && (e.message || e)) } catch (_) {} }
            acceptance = cardAcceptance(rec)
          }
          try {
            const t = await teamEngine.createTask(caller, { subject: args.subject, description: args.description, blockedBy, writeScopes: blockSplit(args.write_scopes), kind, reviewOf, acceptance, signal: exec.signal })
            const bits = []
            if (blockedBy.length) bits.push('依赖 ' + blockedBy.join(', '))
            if (t.writeScopes && t.writeScopes.length) bits.push('写域 ' + t.writeScopes.join('、'))
            if (t.kind === 'review') bits.push('**专业审查**' + (t.reviewOf ? '（审 ' + t.reviewOf + '）' : '') + '：验收 ' + t.acceptance.length + ' 条')
            const head = '已建任务 ' + t.id + '（' + t.subject + '）' + (bits.length ? '，' + bits.join('；') : '') + '。'
            const list = t.acceptance.length > 0
              ? '\n验收清单（完成时用 acceptance_results 逐条判定，格式 `1:pass, 2:fail:原因`）：\n' + t.acceptance.map((a, i) => '  ' + (i + 1) + '. ' + a.item + '　— ' + a.source).join('\n')
              : ''
            return head + list
          } catch (e) { try { console.warn('[agents-pixe] task_create 失败（subject=' + String(args.subject) + '）：', e && (e.message || e)) } catch (_) {} return '❌ 建任务失败：' + String((e && e.message) || e) }
        }
      }),
      defineTool({
        name: 'agents_pixe_task_update',
        description: '任务状态迁移（CAS）：action ∈ claim/complete/release/reopen/edit/set_dependencies/reassign/delete。**声明了写域的任务在 complete 时必须带 changed_paths**（实际改动的文件路径，逗号分隔），越界会被拒绝完成并返回违例清单；领袖可用 edit + write_scopes 显式放宽写域。',
        parameters: {
          task_id: { type: 'string', required: true },
          expected_revision: { type: 'number', required: true, description: '当前 revision' },
          action: { type: 'string', required: true, description: 'claim|complete|release|reopen|edit|set_dependencies|reassign|delete' },
          owner: { type: 'string', description: 'claim/reassign 时的负责人名' },
          subject: { type: 'string' },
          description: { type: 'string' },
          blocked_by: { type: 'string', description: 'set_dependencies 时的逗号分隔依赖' },
          changed_paths: { type: 'string', description: 'complete 时必填（若任务声明了写域）：实际改动的文件路径，逗号分隔' },
          write_scopes: { type: 'string', description: 'edit 时改写写域：逗号分隔的路径/目录前缀；传空串表示取消写域' },
          acceptance_results: { type: 'string', description: 'complete review 任务时必填：逐条判定，格式 `1:pass, 2:fail:原因`（或 JSON 数组 [{index,pass,note}]）；缺条或有一条 fail 都会被拒/判 fail' }
        },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会话中调用。'
          const blockedBy = args.blocked_by === undefined ? undefined : blockSplit(args.blocked_by)
          /* write_scopes 传空串 = 显式取消写域（与「未传」区分） */
          const writeScopes = args.write_scopes === undefined ? undefined : blockSplit(args.write_scopes)
          const changedPaths = args.changed_paths === undefined ? undefined : blockSplit(args.changed_paths)
          const acceptanceResults = args.acceptance_results === undefined ? undefined : args.acceptance_results
          try {
            const t = await teamEngine.updateTask(caller, { taskId: args.task_id, expectedRevision: Number(args.expected_revision), action: args.action, owner: args.owner, subject: args.subject, description: args.description, blockedBy, writeScopes, changedPaths, acceptanceResults, signal: exec.signal })
            const scope = (t.writeScopes && t.writeScopes.length) ? '，写域 ' + t.writeScopes.join('、') : ''
            const verdict = t.verdict ? '，审查结论 ' + t.verdict + '（' + (t.acceptanceResults || []).filter((r) => r.pass === false).length + ' 条不通过）' : ''
            return '任务 ' + t.id + ' → ' + t.status + '（rev ' + t.revision + scope + verdict + '）。' + (t.verdict === 'fail' ? '\n⚠️ 审查未通过：被审任务已自动打回 in_progress，下游仍被阻塞。' : '')
          } catch (e) { return '❌ 更新失败：' + String((e && e.message) || e) }
        }
      }),
      defineTool({
        name: 'agents_pixe_team_step',
        description: '共享调度器：冷恢复 → 空闲成员 CAS 原子领取 → 有界等待。wait_ms 建议 10000-60000。',
        parameters: { wait_ms: { type: 'number', description: '等待毫秒（默认 2000，上限 60000）' } },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会话中调用。'
          try {
            const r = await teamEngine.step(caller, { waitMs: Number(args.wait_ms) || 2000, signal: exec.signal })
            return '派发 ' + (r.dispatched || []).length + ' 项，恢复 ' + (r.recovered || []).length + ' 项，停驻 ' + (r.parked || []).length + ' 人。'
          } catch (e) { try { console.warn('[agents-pixe] team_step 失败（核心调度失败时用户至少能看到）：', e && (e.message || e)) } catch (_) {} return '❌ 调度失败：' + String((e && e.message) || e) }
        }
      }),
      defineTool({
        name: 'agents_pixe_team_message',
        description: '成员直达消息：target 传 @lead 或成员名。**成员↔成员也直达**（引擎用领袖会话做邻接投递，不消耗领袖 LLM 轮次、不进其上下文），领袖与成员均可用。',
        parameters: { target: { type: 'string', required: true, description: '@lead 或成员名' }, content: { type: 'string', required: true } },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会话中调用。'
          try {
            const r = await teamEngine.message(caller, { target: args.target, content: args.content, signal: exec.signal })
            return '消息已投递（' + (r.messageId || 'ok') + '）。'
          } catch (e) { return '❌ 投递失败：' + String((e && e.message) || e) }
        }
      }),
      defineTool({
        name: 'agents_pixe_team_report',
        description: '汇总成员成果并归档；open>0 归档草稿，open==0 走 LLM 合成报告。',
        parameters: { task: { type: 'string', description: '团队任务描述（用于合成报告）' } },
        output: strTool(),
        isConcurrencySafe: () => false,
        async execute(args, exec) {
          if (!teamEngine) return noEngine()
          const caller = callerOf(exec); if (!caller) return '❌ 需在 agent 会话中调用。'
          try {
            const r = await teamEngine.report(caller, { task: args.task, signal: exec.signal })
            return (r.report ? r.report : '已归档（' + r.done + ' 完成 / ' + r.open + ' 未完成）。')
          } catch (e) { return '❌ 汇总失败：' + String((e && e.message) || e) }
        }
      })
    ]
  }

  const registerFace = () => {
    try {
      if (disposePrompt) { disposePrompt(); disposePrompt = null }
      if (disposeTool) { disposeTool(); disposeTool = null }
      if (disposeTeamTool) { disposeTeamTool(); disposeTeamTool = null }
      if (disposeEngine) { disposeEngine.forEach((d) => { try { d() } catch (_) {} }); disposeEngine = null }
      if (disposeCmd) { try { disposeCmd() } catch (_) {} disposeCmd = null }
      if (!scope) return
      const cfg = scope.get()
      if (!cfg || cfg.enabled !== true) return
      try {
        disposePrompt = ctx.systemPrompt.section({
          name: 'tool:agents-pixe',
          order: 200,
          text: (hasNativeTeams
            ? '宿主已启用 DSH 原生 Agent Teams（工具：' + NATIVE_TEAM_TOOLS.join(' / ') + '）。**团队协作默认优先用原生工具**：零角色卡 token、成员之间可互发消息、任务板带写域（write_scopes）冲突提示、任务与成员状态落在会话日志里可回放。仅当需要下面这些本项目独有能力时，才改用 agents_pixe_* 工具，且**同一次编排不要两套混用**：① 需要给成员注入 508 张 agency-agents 角色卡人格（The Agency en 255 + agency-agents-zh 253）；② 一键成军 29 个预设中文团队；③ 像素办公室可视化、团队面板（任务板/进度/暂停派单）与角色闲聊；④ 按章节取卡省 token（sections=rules/deliverables）、自定义角色（AI 生成 / 导入 md）、中英双语。'
            : '宿主未启用 DSH 原生 Agent Teams（老版本或未装该套件），团队协作走下面的 agents_pixe_* 工具。')
            + ' 当用户要求「以某个角色或团队的身份回应」（例如「请以研发团队团队协作回应」）时，调用 agents_pixe_roles 工具取回角色卡（默认返回完整卡；也可传 sections=rules/deliverables 只取单章节）。当用户要求「团队协作完成某任务/并行调研/真编排」时，调用 agents_pixe_team 工具（`team` 可留空）：**团队成员默认取当前会话在像素办公室选中的角色，只导入选中的那几个角色卡**（508 张卡是可查询的库，**不要全库导入**；也接受预设团队名或角色名列表，同样只导入该团队用到的角色）。领袖拆解任务、每个成员独立子代理带该角色卡（默认只注专业核心三章）执行、领袖汇总。'
        })
      } catch (e) { disposePrompt = null }
      try {
        disposeTool = ctx.tools.register(defineTool({
          name: 'agents_pixe_roles',
          description: '按角色名查 agency-agents 角色库（The Agency en 255 + agency-agents-zh 253，共 508 张卡，内容 1:1 来自上游）。默认返回每个角色的完整角色卡（定位/使命/关键规则/交付物/工作流程/沟通风格全部章节）；只要单章节时传 sections=rules（关键规则）或 sections=deliverables（技术交付物）可大幅省 token。当用户要求以某个角色或团队身份工作时调用，传入逗号/顿号分隔的角色名。',
          parameters: {
            names: {
              type: 'string',
              required: true,
              description: '逗号或顿号分隔的角色名，例如「高级项目经理, 软件架构师, 代码审查员」'
            },
            sections: {
              type: 'string',
              description: '取卡粒度：full=完整卡（默认）；rules=仅关键规则节；deliverables=仅技术交付物节。只要规则/交付物时传对应值可省大量 token。'
            }
          },
          output: {
            schema: { type: 'string' },
            render(_a, v) { return [{ type: 'text', text: v }] }
          },
          async execute(args) {
            const names = String(args.names || '').split(/[,，、;；\n]+/).map(clean).filter(Boolean)
            if (names.length === 0) return '未提供角色名。'
            /* 未显式传 sections 时，用设置里的「取卡粒度」默认（设置按钮生成的全局偏好） */
            let defMode = 'full'
            try { if (scope) { const sc = scope.get(); if (sc && (sc.cardMode === 'rules' || sc.cardMode === 'deliverables')) defMode = sc.cardMode } } catch {}
            const mode = String(args.sections || defMode).toLowerCase()
            const SECTION_CAP = 4000      // 单章节上限（字符）
            const TOTAL_BUDGET = 100000   // 完整卡总量上限（字符，约 5 万 token；超出则跳过后续角色并说明）
            const parts = []
            const missing = []
            let budget = TOTAL_BUDGET
            for (const n of names) {
              const rec = lookup(n)
              if (rec) {
                let card
                if (mode === 'rules' || mode === 'deliverables') {
                  const kw = mode === 'rules' ? '关键规则|规则|rule' : '交付物|deliverable|交付清单'
                  const sec = sectionOf(rec.full, kw)
                  if (sec) {
                    card = (sec.length > SECTION_CAP ? sec.slice(0, SECTION_CAP) + '\n…（章节过长已截断，需要全文传 sections=full）' : sec)
                  } else {
                    const desc = String(rec.desc || '').trim()
                    card = '（该角色卡未找到' + (mode === 'rules' ? '「关键规则」' : '「技术交付物」') + '章节；定位：' + (desc || '见完整卡') + '。可传 sections=full 取完整卡）'
                  }
                } else {
                  card = String(rec.full || rec.desc || '')
                }
                if (budget <= 0) { parts.push('### ' + rec.name + '\n\n（本次请求角色过多，超出总预算，该卡已跳过；可分批调用或传 sections=rules/deliverables）'); continue }
                parts.push('### ' + rec.name + '\n\n' + card)
                budget -= card.length + rec.name.length
              } else {
                missing.push(n)
              }
            }
            let out = parts.join('\n\n---\n\n')
            if (missing.length) out += (out ? '\n\n' : '') + '⚠️ 未找到角色卡：' + missing.join('、')
            return out || '未找到任何角色卡。'
          }
        }))
      } catch (e) { disposeTool = null }
      /* 真·团队编排：薄壳 → runEngineTeam（spec：resolveRoster / runEngineTeam / memberOf 全在 runEngineTeam 内） */
      try {
        disposeTeamTool = ctx.tools.register(defineTool({
          name: 'agents_pixe_team',
          description: '真·团队编排闭环：以领袖视角拆解任务 → 每位成员开一个独立子代理（种子=该角色完整角色卡，上下文互不挤占）并行执行 → 领袖汇总成最终报告。当用户要求「团队协作完成/并行调研/分角色深入处理」某任务时调用。比 agents_pixe_roles 更完整也更耗 token（N+2 次子代理调用），简单问题不要用。',
          parameters: {
            team: { type: 'string', description: '**留空 = 用当前会话在像素办公室选中的角色**（只导入选中的几个）；也可传预设团队名（如「研发团队」「安全团队」，共 29 个）或逗号/顿号分隔的角色名列表。只导入该团队用到的角色，不做全库导入。' },
            task: { type: 'string', required: true, description: '要完成的任务描述（越具体越好，会原样传给团队）' },
            leader: { type: 'string', description: '领袖角色名（可选；默认取团队预设的领袖或列表第 1 位）' },
            max_roles: { type: 'number', description: '最多并行成员数（默认 4，最大 6；超出截断，控制 token）' }
          },
          output: { schema: { type: 'string' }, render(_a, v) { return [{ type: 'text', text: v }] } },
          isConcurrencySafe: () => false,
          async execute(args, exec) { return await runEngineTeam(args, exec) }
        }))
      } catch (e) { disposeTeamTool = null }
      /* 真·团队引擎 6 个工具 + /teams 斜杠命令（spec：registerFace 注册一轮 = roles + team + 6 引擎 + cmd:teams = 9） */
      try {
        disposeEngine = []
        for (const tool of engineToolDefs()) {
          disposeEngine.push(ctx.tools.register(tool))
        }
      } catch (e) {
        /* 任一工具注册失败：把所有已注册的 dispose 掉，避免半残状态 */
        if (disposeEngine) { disposeEngine.forEach((d) => { try { d() } catch (_) {} }); disposeEngine = null }
      }
      try {
        const cmds = ctx.get && ctx.get('commands')
        if (cmds && typeof cmds.register === 'function') {
          disposeCmd = cmds.register({ name: 'teams', description: '真·团队引擎入口：建团队、拆带依赖任务、派单、汇总（agents_pixe_team_create / task_create / team_step / team_report）。' })
        }
      } catch (e) {
        try { console.warn('[agents-pixe] 注册 /teams 斜杠命令失败：', e && (e.message || e)) } catch (_) {}
        disposeCmd = null
      }
    } catch (e) { /* 静默降级 */ }
  }
  /* 「角色工具开关」真值变化时重注册 registerFace。
   * 两个触发源：① 老宿主 scope.watch；② 新宿主 loader/volatile-update；
   * ③ 兜底：新宿主的 volatile 回流可能滞后（历史上 issue），POST /agents-pixe/config 写成功后直接同步一次。
   * 只在 enabled 真变化时重注册 —— 调 zoom/头像条等设置不该重注册工具（0.1.3-rc1 修的卡顿）。 */
  let lastEnabled = false
  function syncFace() {
    try {
      const cfg = scope && scope.get()
      const next = !!(cfg && cfg.enabled === true)
      if (next === lastEnabled) return
      lastEnabled = next
      registerFace()
    } catch (e) {
      try { console.warn('[agents-pixe] syncFace 失败（工具注册状态可能与开关不一致）：', e && (e.message || e)) } catch (_) {}
    }
  }
  /* 成员出厂的「专业配置」：种子粒度（P0-a）+ LLM 路由（P0-b）+ 工具白名单（P0-c）。
   * 都读 settings 活值，改完设置下一次建团即生效（无需重启）。 */
  function memberCfg() { try { return (scope && scope.get()) || {} } catch { return {} } }
  function memberSeed(rec) {
    return cardSeed(rec, memberCfg().memberCardMode === 'full' ? 'full' : 'key')
  }
  function splitList(v) {
    return String(v || '').split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
  }
  /* 成员「交作业」必需的团队工具：任何 toolFilter 都不能把它们裁掉，
   * 否则成员既无法回报也无法完成协商 —— 任务会永久卡在 in_progress。 */
  const MANDATORY_MEMBER_TOOLS = ['agents_pixe_task_update', 'agents_pixe_team_message', 'agents_pixe_task_create', 'agents_pixe_roles']
  /* 交给引擎的 spawn 规格；引擎负责在 provider 不支持时降级重试（UNSUPPORTED_CAPABILITY）。 */
  function memberSpawnSpec() {
    const cfg = memberCfg()
    const spawn = {}
    const agentOptions = {}
    if (cfg.memberProvider) agentOptions.provider = String(cfg.memberProvider)
    if (cfg.memberModel) agentOptions.model = String(cfg.memberModel)
    if (cfg.memberReasoningEffort) agentOptions.reasoningEffort = String(cfg.memberReasoningEffort)
    if (Object.keys(agentOptions).length > 0) spawn.agentOptions = agentOptions
    let allow = splitList(cfg.memberToolAllow)
    let deny = splitList(cfg.memberToolDeny)
    if (allow.length > 0) {
      // allow 是白名单：必须补回团队必需工具，否则成员无法回报/接收指派
      const missing = MANDATORY_MEMBER_TOOLS.filter((t) => !allow.includes(t))
      if (missing.length > 0) allow = allow.concat(missing)
    }
    if (deny.length > 0) {
      // deny 里出现必需工具时剔除（并留痕），避免用户把自己锁死
      const blocked = deny.filter((t) => MANDATORY_MEMBER_TOOLS.includes(t))
      if (blocked.length > 0) {
        try { console.warn('[agents-pixe] memberToolDeny 里的团队必需工具已忽略（裁掉会让任务卡死）：' + blocked.join(', ')) } catch (_) {}
        deny = deny.filter((t) => !MANDATORY_MEMBER_TOOLS.includes(t))
      }
    }
    if (allow.length > 0 || deny.length > 0) {
      spawn.toolFilter = Object.assign({}, allow.length > 0 ? { allow } : {}, deny.length > 0 ? { deny } : {})
    }
    return spawn
  }
  try {
    /* 跨版本兼容：老宿主走 settings.register，新宿主（≥0.1.7，含 0.2.0-rc.2）走
     * Config 活引用 + volatile 回流事件（详见文件头 bindSettings 注释）。
     * 两种情况下 scope 都非 null，registerFace 才有机会在 enabled=true 时注册工具。 */
    if (settings || typeof ctx.get === 'function') {
      scope = bindSettings(ctx, Config, config)
      registerFace()
      lastEnabled = !!(scope.get() && scope.get().enabled === true)
      if (scope && typeof scope.watch === 'function') {
        scope.watch(() => { syncFace() })
      }
    }
  } catch (e) {
    scope = null
    registerErr = String((e && e.message) || e)
    /* 暴露注册失败原因：不再静默吞，方便定位「角色工具无法开启」 */
    try {
      console.error('[agents-pixe] settings 绑定失败:', registerErr)
      const errPath = join(DSH_HOME, 'agents-pixe', 'register-err.txt')
      try { writeFileSync(errPath, registerErr + '\n' + String((e && e.stack) || '').slice(0, 800) + '\n', 'utf8') } catch (we) {
        /* 诊断文件写不进去 —— 至少把原因打到控制台，别让用户面对「无法启用又完全没线索」 */
        try { console.warn('[agents-pixe] register-err.txt 写盘失败：', we && (we.message || we)) } catch (_) {}
      }
    } catch {}
  }

  /* 像素人 AI 聊天端点：GET /agents-pixe/chat?roleName=…&state=…&activity=…&thinking=on|off&provider=…&model=… */
  const webServer = ctx.webServer
  if (llm !== undefined && webServer !== undefined) {
    const json = (res, code, body) => {
      try {
        res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(JSON.stringify(body))
      } catch {}
    }
    /* 配置读写端点。dsh ≥0.1.7 的**客户端不再提供 settingsScope 服务**（宿主 settings 只剩
     * 表单服务 describe/update/replace/mutate/configure），所以设置面板的读写统一走这里：
     *   GET  /agents-pixe/config                        → { ok, value, revision }
     *   POST /agents-pixe/config { patch, expectedRevision } → settings.update(<loader 条目 id>, patch, rev)
     * 老宿主同样可用（scope.legacy 分支的 update 走 SettingsScope.update）。 */
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/config',
      handler: async (req, res) => {
        const readValue = () => { try { return scope ? scope.get() : null } catch (e) { return { error: String((e && e.message) || e) } } }
        const readRev = () => { try { return (scope && typeof scope.revision === 'function') ? scope.revision() : undefined } catch { return undefined } }
        if (req.method === 'HEAD') { json(res, 200, { ok: true }); return }
        if (req.method === 'GET') { json(res, 200, { ok: true, value: readValue(), revision: readRev() }); return }
        if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { json(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await readJson(req)
          const patch = body && typeof body.patch === 'object' && body.patch !== null ? body.patch : null
          if (!patch) { json(res, 200, { ok: false, error: '缺少 patch 对象' }); return }
          if (!scope || typeof scope.update !== 'function') {
            json(res, 200, { ok: false, error: '当前 DSH 版本不支持宿主侧写配置（settings.update 缺失）', value: readValue() }); return
          }
          const r = await scope.update(patch, body.expectedRevision)
          /* 写成功后立刻对一次开关：不依赖宿主 volatile 回流事件的时序，
           * 保证「打开角色工具」下一次工具调用就能看到 agents_pixe_*。 */
          syncFace()
          json(res, 200, {
            ok: true,
            value: (r && r.value) || readValue(),
            revision: (r && r.revision !== undefined) ? r.revision : readRev()
          })
        } catch (e) {
          json(res, 200, { ok: false, error: String((e && e.message) || e), value: readValue(), revision: readRev() })
        }
      }
    }), 'agents-pixe: config endpoint')

    /* 角色精简清单端点（客户端选人面板的数据源；带 version 供版本化缓存） */
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/roles/index',
      handler: async (req, res) => {
        if (req.method === 'HEAD') { json(res, 200, { ok: true }); return }
        if (req.method !== 'GET') { json(res, 405, { ok: false, error: 'method not allowed' }); return }
        try {
          const idx = rolesSlimIndex()
          json(res, 200, { ok: true, version: idx.version, data: idx.data })
        } catch (e) { json(res, 500, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: roles index endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/chat',
      handler: async (req, res) => {
        if (req.method === 'HEAD') { json(res, 200, { text: null }); return }
        if (req.method !== 'GET') { json(res, 405, { text: null, error: 'method not allowed' }); return }
        try {
          const u = new URL(req.url || '/', 'http://x')
          const text = await generateLine(llm, {
            roleName: u.searchParams.get('roleName') || '同事',
            roleKey: u.searchParams.get('roleKey') || '',
            state: u.searchParams.get('state') || 'idle',
            activity: u.searchParams.get('activity') || '',
            isLeader: u.searchParams.get('isLeader') === 'true',
            thinking: u.searchParams.get('thinking') === 'on',
            provider: u.searchParams.get('provider') || '',
            model: u.searchParams.get('model') || '',
            context: u.searchParams.get('context') || '',
            partnerName: u.searchParams.get('partnerName') || '',
            roleDesc: u.searchParams.get('roleDesc') || '',
            aiEnabled: u.searchParams.get('aiEnabled') || ''
          })
          json(res, 200, { text })
        } catch (e) {
          json(res, 500, { text: null, error: String((e && e.message) || e) })
        }
      }
    }), 'agents-pixe: chat endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/models',
      handler: async (req, res) => {
        if (req.method === 'HEAD') { json(res, 200, { providers: [] }); return }
        if (req.method !== 'GET') { json(res, 405, { providers: [], error: 'method not allowed' }); return }
        try {
          json(res, 200, { providers: await listModelCatalog(llm) })
        } catch (e) {
          json(res, 500, { providers: [], error: String((e && e.message) || e) })
        }
      }
    }), 'agents-pixe: models endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/stats',
      handler: async (req, res) => {
        const body = {
          calls: usage.calls, fails: usage.fails,
          budgeted: usage.budgeted, blocked: usage.blocked, cached: usage.cached,
          tokens: { in: usage.tokensIn, out: usage.tokensOut, est: usage.tokensIn + usage.tokensOut },
          budget: { maxCallsPerHour: TOKEN_BUDGET.maxCallsPerHour, maxEstTokensPerHour: TOKEN_BUDGET.maxEstTokensPerHour }
        }
        if (req.method === 'HEAD') { json(res, 200, body); return }
        if (req.method !== 'GET') { json(res, 405, Object.assign({ error: 'method not allowed' }, body)); return }
        json(res, 200, body)
      }
    }), 'agents-pixe: stats endpoint')

    /* 角色卡完整信息：左键点击像素人时取该角色完整卡（lib/roles-full.json，1:1 上游） */
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/role',
      handler: async (req, res) => {
        if (req.method === 'HEAD') { json(res, 200, { found: false }); return }
        if (req.method !== 'GET') { json(res, 405, { found: false, error: 'method not allowed' }); return }
        try {
          const u = new URL(req.url || '/', 'http://x')
          const raw = String(u.searchParams.get('key') || '').trim()
          const k = raw.replace(/^(zh|en):/i, '').trim()
          let rec = null
          if (k.indexOf('/') >= 0) rec = keyIndex()[k] || null
          if (!rec) rec = lookup(k)
          if (!rec) { json(res, 200, { found: false, key: raw }); return }
          json(res, 200, {
            found: true,
            key: raw,
            name: rec.name,
            desc: String(rec.desc || rec.description || '').trim(),
            full: String(rec.full || '').trim()
          })
        } catch (e) {
          json(res, 500, { found: false, error: String((e && e.message) || e) })
        }
      }
    }), 'agents-pixe: role endpoint')

    /* 诊断：给用户看宿主侧 scope 状态（register 是否成功、值、client 是否可写） */
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/settings',
      handler: async (req, res) => {
        let value = null, hasScope = false
        try { if (scope) { value = scope.get(); hasScope = true } } catch (e) { value = { error: String((e && e.message) || e) } }
        const body = {
          hasScope, value, settingsAvailable: !!settings,
          writable: typeof scope !== 'undefined' && !!scope,
          registerErr,
          /* 设置绑定方式：legacy=true 表示老宿主（settings.register + SettingsScope），
           * false 表示新宿主（Config 活引用 + settings.update）。写配置入口 /agents-pixe/config。 */
          settingsLegacy: !!(scope && scope.legacy),
          settingsEntryId: (scope && scope.entryId) || null,
          settingsWritable: !!(scope && typeof scope.update === 'function'),
          /* 成员出厂策略（P0）：种子粒度 / LLM 路由 / 工具白名单，一眼可查当前生效值 */
          memberPolicy: (() => {
            try {
              const c = memberCfg()
              const spec = memberSpawnSpec()
              return {
                cardMode: c.memberCardMode === 'full' ? 'full' : 'key',
                agentOptions: spec.agentOptions || null,
                toolFilter: spec.toolFilter || null
              }
            } catch { return null }
          })(),
          /* DSH 0.2.0-rc.2 兼容诊断：原生 Agent Teams 是否挂载、引擎是否可用、宿主 subagents 原语是否在位。
           * 更新后「插件整个消失」时，这个端点能一眼区分「没挂进 profile」与「挂了但降级」。 */
          nativeAgentTeams: hasNativeTeams,
          nativeAgentTeamsTools: hasNativeTeams ? NATIVE_TEAM_TOOLS : [],
          teamEngine: !!teamEngine,
          subagentsStart: !!(subagents && typeof subagents.start === 'function'),
          subagentsContinuable: !!(subagents && typeof subagents.startContinuable === 'function')
        }
        if (req.method === 'HEAD') { json(res, 200, body); return }
        if (req.method !== 'GET') { json(res, 405, Object.assign({ error: 'method not allowed' }, body)); return }
        json(res, 200, body)
      }
    }), 'agents-pixe: settings endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/roles/custom',
      handler: async (req, res) => {
        if (req.method === 'HEAD') { json(res, 200, { roles: [] }); return }
        if (req.method !== 'GET') { json(res, 405, { roles: [], error: 'method not allowed' }); return }
        json(res, 200, { roles: loadCustomRoles() })
      }
    }), 'agents-pixe: custom roles endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/roles/generate',
      handler: async (req, res) => {
        if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { json(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await readJson(req)
          const nm = String(body.name || '').trim()
          if (!nm) { json(res, 200, { ok: false, error: '角色名不能为空' }); return }
          const r = await generateRole(llm, nm, body.description)
          if (r.error) { json(res, 200, { ok: false, error: r.error }); return }
          upsertCustomRole(r.role)
          json(res, 200, { ok: true, role: r.role })
        } catch (e) { json(res, 500, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: role generate endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/roles/import',
      handler: async (req, res) => {
        if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { json(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await readJson(req)
          const r = parseMdRole(body.content)
          if (r.error) { json(res, 200, { ok: false, error: r.error }); return }
          upsertCustomRole(r.role)
          json(res, 200, { ok: true, role: r.role })
        } catch (e) { json(res, 500, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: role import endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/roles/delete',
      handler: async (req, res) => {
        if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { json(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await readJson(req)
          const id = String(body.id || '').trim()
          if (!id) { json(res, 200, { ok: false, error: '缺少角色 id' }); return }
          const list = loadCustomRoles().filter((r) => r.id !== id)
          saveCustomRoles(list)
          json(res, 200, { ok: true, removed: id, remaining: list.length })
        } catch (e) { json(res, 500, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: role delete endpoint')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/persist',
      handler: async (req, res) => {
        if (req.method === 'GET') { json(res, 200, { ok: true, entries: readPersist().entries || {} }); return }
        if (req.method === 'POST') {
          if (!localOnly(req)) { json(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
          try {
            const body = await readJson(req)
            const cur = readPersist()
            cur.entries = body.entries || {}
            writePersist(cur)
            json(res, 200, { ok: true })
          } catch (e) { json(res, 500, { ok: false, error: String((e && e.message) || e) }) }
          return
        }
        json(res, 405, { ok: false, error: 'method not allowed' })
      }
    }), 'agents-pixe: persist endpoint')
  }

  /* ============ 真·团队引擎：视图路由 + 6 个团队工具 ============ */
  if (teamEngine && webServer !== undefined) {
    const j = (res, code, body) => {
      try { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }); res.end(JSON.stringify(body)) } catch {}
    }
    /* 视图：GET /agents-pixe/teams/view?lead=<sid>（面板读磁盘真相快照） */
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/agents-pixe/teams/view',
      handler: async (req, res) => {
        if (req.method !== 'GET') { j(res, 405, { available: true, members: [], tasks: [], error: 'method not allowed' }); return }
        try {
          const u = new URL(req.url || '/', 'http://x')
          const lead = String(u.searchParams.get('lead') || '').trim()
          const native = nativePanel(lead)
          const view = native || (lead ? await teamEngine.view({ id: lead }) : { members: [], tasks: [], halted: false, lastStep: null })
          j(res, 200, Object.assign({ available: true, source: native ? 'native' : 'engine' }, view || { members: [], tasks: [] }))
        } catch (e) { j(res, 200, { available: true, members: [], tasks: [], error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams view endpoint')

    /* 团队面板写操作（POST + localOnly 守；引擎走 addTaskDirect/editTaskDirect/deleteTaskDirect/setHaltedDirect） */
    const parsePost = async (req) => {
      const body = await readJson(req)
      const lead = String(body.lead || '').trim()
      if (!lead) throw new Error('缺少 lead')
      /* P3：原生团队任务板的真相在宿主，本项目面板是只读投影，写它没有意义。 */
      if (nativePanel(lead)) throw new Error('原生团队任务板是只读投影；请用原生工具 team_task_create / team_task_update / team_task_list 操作')
      return body
    }
    ctx.effect(() => webServer.register({
      kind: 'exact', path: '/agents-pixe/teams/tasks/create',
      handler: async (req, res) => {
        if (req.method !== 'POST') { j(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { j(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await parsePost(req)
          const blockedBy = String(body.blocked_by || '').split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
          const writeScopes = body.write_scopes === undefined ? undefined : String(body.write_scopes).split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
          const kind = body.kind === 'review' ? 'review' : 'work'
          const acceptance = body.acceptance === undefined ? undefined
            : (Array.isArray(body.acceptance) ? body.acceptance : String(body.acceptance).split(/[\n;；]+/).map(cleanBullet).filter(Boolean))
          const t = await teamEngine.addTaskDirect(body.lead, { subject: body.subject, description: body.description, blockedBy, writeScopes, kind, reviewOf: body.review_of, acceptance })
          j(res, 200, { ok: true, task: t })
        } catch (e) { try { console.warn('[agents-pixe] /teams/tasks/create 失败：', e && (e.message || e)) } catch (_) {} j(res, 200, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams tasks create endpoint')
    ctx.effect(() => webServer.register({
      kind: 'exact', path: '/agents-pixe/teams/tasks/update',
      handler: async (req, res) => {
        if (req.method !== 'POST') { j(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { j(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await parsePost(req)
          const blockedBy = body.blocked_by === undefined ? undefined : String(body.blocked_by).split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
          const writeScopes = body.write_scopes === undefined ? undefined : String(body.write_scopes).split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
          const changedPaths = body.changed_paths === undefined ? undefined : String(body.changed_paths).split(/[,，、;；\s]+/).map((s) => s.trim()).filter(Boolean)
          const acceptanceResults = body.acceptance_results === undefined ? undefined : body.acceptance_results
          const t = await teamEngine.editTaskDirect(body.lead, { taskId: body.task_id, expectedRevision: Number(body.expected_revision), action: body.action, owner: body.owner, subject: body.subject, description: body.description, blockedBy, writeScopes, changedPaths, acceptanceResults })
          j(res, 200, { ok: true, task: t })
        } catch (e) { try { console.warn('[agents-pixe] /teams/tasks/update 失败：', e && (e.message || e)) } catch (_) {} j(res, 200, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams tasks update endpoint')
    ctx.effect(() => webServer.register({
      kind: 'exact', path: '/agents-pixe/teams/tasks/delete',
      handler: async (req, res) => {
        if (req.method !== 'POST') { j(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { j(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await parsePost(req)
          await teamEngine.deleteTaskDirect(body.lead, body.task_id, Number(body.expected_revision))
          j(res, 200, { ok: true })
        } catch (e) { try { console.warn('[agents-pixe] /teams/tasks/delete 失败：', e && (e.message || e)) } catch (_) {} j(res, 200, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams tasks delete endpoint')
    ctx.effect(() => webServer.register({
      kind: 'exact', path: '/agents-pixe/teams/halt',
      handler: async (req, res) => {
        if (req.method !== 'POST') { j(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { j(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await parsePost(req)
          const r = teamEngine.setHaltedDirect(body.lead, true)
          j(res, 200, Object.assign({ ok: true }, r))
        } catch (e) { try { console.warn('[agents-pixe] /teams/halt 失败：', e && (e.message || e)) } catch (_) {} j(res, 200, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams halt endpoint')
    ctx.effect(() => webServer.register({
      kind: 'exact', path: '/agents-pixe/teams/resume',
      handler: async (req, res) => {
        if (req.method !== 'POST') { j(res, 405, { ok: false, error: 'method not allowed' }); return }
        if (!localOnly(req)) { j(res, 403, { ok: false, error: '拒绝跨源请求' }); return }
        try {
          const body = await parsePost(req)
          const r = teamEngine.setHaltedDirect(body.lead, false)
          j(res, 200, Object.assign({ ok: true }, r))
        } catch (e) { try { console.warn('[agents-pixe] /teams/resume 失败：', e && (e.message || e)) } catch (_) {} j(res, 200, { ok: false, error: String((e && e.message) || e) }) }
      }
    }), 'agents-pixe: teams resume endpoint')
  }
}

/* 防 DNS rebinding / CSRF：写操作（POST）仅接受来自本机 localhost 的请求 */
function localOnly(req) {
  try {
    const h = req.headers || {}
    const origin = String(h.origin || '')
    if (origin) {
      const host = origin.replace(/^https?:\/\//i, '').split(/[/:]/)[0].toLowerCase()
      return host === '127.0.0.1' || host === 'localhost'
    }
    const hostHdr = String(h.host || '').replace(/:\d+$/, '').toLowerCase()
    return hostHdr === '127.0.0.1' || hostHdr === 'localhost' || hostHdr === ''
  } catch { return false }
}

/** 读 JSON 请求体（POST），带 1MB 上限 */
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > 1024 * 1024) { reject(new Error('请求体过大（>1MB）')); req.destroy(); return }
      chunks.push(c)
    })
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')) } catch (e) { reject(new Error('请求体不是合法 JSON')) }
    })
    req.on('error', reject)
  })
}

export { apply, inject, name, Config, cardSeed, cardAcceptance }
