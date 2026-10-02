// agent-teams-pixel 团队引擎：驱动宿主 `subagents` 续聊原语 + 文件态团队/任务/attempt 模型，
// 实现「真正团队协助」——领袖建团队、可续聊成员、显式依赖任务、共享调度器、
// attempt(CAS) 生命周期、邮箱直投、文件快照落盘、活动面板视图与归档。
// 设计：纯服务注入（不 import 任何 DSH 包），仅用 node:fs 落盘（setTimeout 为 Node 全局），逻辑可单测。
//
// 行为对齐规范：
//  - 一领袖活动团队唯一（createTeam 幂等；成员是领袖的续聊子 Agent）
//  - 成员 = `subagents.startContinuable` 建立的驻留续聊子会话；状态经 `listChildren`（running/inactive）刷新
//  - 任务带 blockedBy 显式依赖，ready = 依赖全 completed
//  - 任务可声明 writeScopes（写域）：complete 时必须上报 changed_paths 且全部落在域内，
//    否则拒绝置为 completed（**确定性硬拦**，原生 DSH 的 writeScopes 只做 advisory 提示）
//  - 共享调度器：真实 running/idle/ready 原子领取（CAS expectedRevision）→ sendMessage(wakeup) 唤醒空闲成员 → 有界轮询
//  - 邮箱投递：lead↔member 走宿主的父↔直系子邻接；**member↔member 由引擎用领袖 Agent 引用代理投递**
//    （宿主 sendMessage 不支持兄弟邻接；代理不消耗领袖 LLM 轮次，语义上即「队友直达」）
//  - 成员 spawn 可带 agentOptions(LLM 路由) / toolFilter(工具白名单) / persona；provider 不支持则降级并记 degraded
//  - attempt 生命周期：claim/complete/release/reassign/reopen 走 updateTask CAS；转派先 release 等待归静再 claim
//  - 冷停遗留：in_progress 但属主非 running（冷进程重启）→ 释放并重新 claim（新 attempt）恢复
//  - 状态文件持久化 + 单进程串行；面板读磁盘真相快照
import { mkdirSync, writeFileSync, readFileSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'

/* ================= 纯逻辑（无副作用，可单测） ================= */

// 「就绪」定义：pending 且所有 blockedBy 依赖均 completed
export function computeReady(task, allTasks) {
  if (!task) return false
  if (task.status && task.status !== 'pending') return false
  const blocked = task.blockedBy || []
  if (blocked.length === 0) return true
  const byId = new Map((allTasks || []).map((t) => [t.id, t]))
  return blocked.every((id) => {
    const b = byId.get(id)
    return !!b && b.status === 'completed'
  })
}

// 该成员是否正持有开放 attempt（存在归属自己且未完成的任务）
export function holdsOpenAttempt(memberName, tasks) {
  return (tasks || []).some((t) => t.status === 'in_progress' && t.ownerName === memberName)
}

// 冷停遗留：任务 in_progress，但属主在当前运行时已非 running（冷进程重启后未续）
export function strandedCold(task, byOwner) {
  if (!task || task.status !== 'in_progress' || !task.ownerName) return false
  const owner = byOwner && byOwner.get(task.ownerName)
  return !owner || owner.status === 'inactive' || owner.status === 'failed'
}

// 状态机合法迁移（attempt 语义）：禁止非法跳跃。'same' 表示动作不改变 status。
const TRANSITIONS = {
  claim:            { from: ['pending'], to: 'in_progress' },
  complete:         { from: ['in_progress'], to: 'completed' },
  release:          { from: ['in_progress'], to: 'pending' },
  reopen:           { from: ['completed'], to: 'in_progress' },
  edit:             { from: ['pending', 'in_progress', 'completed'], to: 'same' },
  set_dependencies: { from: ['pending', 'in_progress', 'completed'], to: 'same' },
  reassign:         { from: ['pending', 'in_progress'], to: 'same' },
  delete:           { from: ['pending', 'in_progress', 'completed'], to: 'deleted' },
}
export function transitionAllowed(task, action) {
  const rule = TRANSITIONS[action]
  if (!rule || !task) return false
  if (rule.to === 'same') return rule.from.includes(task.status)
  return rule.from.includes(task.status)
}

// 取任务 id 的数值序（用于按创建顺序派单）
export function orderNum(id) {
  const m = /(\d+)/.exec(String(id || ''))
  return m ? Number(m[1]) : 0
}

// 规划依赖防护：仅允许引用「已创建的前序任务」（下标 < 当前 i）。
// 自依赖 / 前向引用 / 非法引用一律剔除并记 warning —— 保证任务 DAG 无环。
export function resolvePlanDeps(plan) {
  const warnings = []
  const resolved = []
  for (let i = 0; i < (plan || []).length; i++) {
    const p = plan[i]
    const blocked = []
    for (const d of (p && p.blockedBy) || []) {
      const idx = Number(d)
      if (Number.isInteger(idx) && idx >= 0 && idx < i) blocked.push(idx)
      else warnings.push({ task: i, ref: d, reason: idx === i ? 'self-dep' : (idx > i ? 'forward-ref' : 'invalid-ref') })
    }
    resolved.push({ i, blocked })
  }
  return { resolved, warnings }
}

// 拆解失败兜底：退化到各成员并行处理同一整体任务
export function decomposeFallback(task, members) {
  const t = String(task || '')
  return (members || []).map((m, i) => ({ subject: (i + 1) + '. ' + t.slice(0, 60), description: t, blockedBy: [] }))
}

/* ================= 写域（writeScopes）纯逻辑 ================= */

/** 归一化写域条目：数组或逗号分隔字符串 → 去空、统一 `/`、去尾斜杠。 */
export function normScopes(input) {
  const arr = Array.isArray(input) ? input : String(input === undefined || input === null ? '' : input).split(/[,，、;；\n]+/)
  return arr
    .map((s) => String(s || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, ''))
    .filter(Boolean)
}
/** 归一化「实际改动路径」；未提供返回 null（区分「没上报」与「上报为空」）。 */
export function normPaths(input) {
  if (input === undefined || input === null || input === '') return null
  const arr = Array.isArray(input) ? input : String(input).split(/[,，、;；\n]+/)
  return arr.map((s) => String(s || '').trim().replace(/\\/g, '/').replace(/^\.\//, '')).filter(Boolean)
}
/**
 * 路径是否落在写域内（大小写不敏感，兼容相对/绝对混用）。命中任一即算在域内：
 *   ① 完全相同；② 以「域/」开头（域是目录）；③ 以「/域」结尾（上报绝对路径、域是相对路径）；
 *   ④ 中间出现「/域/」（域是嵌套目录）。
 * 取舍：宁可放宽（少误伤正常工作），也不放过明显域外改动 —— 四条全不命中才判越界。
 */
export function pathInScope(p, scopes) {
  const P = String(p || '').replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase()
  if (!P) return true
  for (const raw of scopes || []) {
    const S = String(raw || '').toLowerCase().replace(/\/+$/, '')
    if (!S) return true
    if (P === S || P.startsWith(S + '/') || P.endsWith('/' + S) || P.includes('/' + S + '/')) return true
  }
  return false
}

/* ================= 专业门禁（review 验收清单）纯逻辑 ================= */

/** 归一化验收清单：`['条目']` 或 `[{item, source}]` → `[{item, source}]`（去空、去重、保序）。 */
export function normAcceptance(input) {
  if (!input) return []
  const arr = Array.isArray(input) ? input : [input]
  const out = []
  for (const raw of arr) {
    const item = String((raw && typeof raw === 'object' ? raw.item : raw) || '').trim()
    if (!item) continue
    if (out.some((x) => x.item === item)) continue
    out.push({ item, source: String((raw && typeof raw === 'object' && raw.source) || '') })
  }
  return out
}
/**
 * 解析成员的逐条判定。两种输入：
 *   · `[{index, pass, note}]`（JSON 数组）
 *   · 紧凑串 `1:pass, 2:fail:原因, 3:pass`
 * 返回 null 表示**没给**（与「给了空数组」区分 —— 门禁靠它判断是否自证）。
 */
export function normAcceptanceResults(input) {
  if (input === undefined || input === null || input === '') return null
  if (Array.isArray(input)) {
    const out = []
    for (const r of input) {
      const index = Number(r && r.index)
      if (!Number.isInteger(index) || index < 1) continue
      out.push({ index, pass: !!(r && r.pass === true), note: r && r.note ? String(r.note) : undefined })
    }
    return out.length > 0 ? out : null
  }
  const text = String(input).trim()
  if (text.startsWith('[')) {
    try { return normAcceptanceResults(JSON.parse(text)) } catch { return null }
  }
  const out = []
  for (const chunk of text.split(/[,，、;；\n]+/)) {
    const m = /^\s*(\d+)\s*[:：=]\s*(pass|ok|通过|fail|no|不通过|失败)\s*(?:[:：]\s*([\s\S]*))?$/i.exec(chunk)
    if (!m) continue
    const verdict = m[2].toLowerCase()
    const pass = ['pass', 'ok', '通过'].includes(verdict)
    out.push({ index: Number(m[1]), pass, note: m[3] ? m[3].trim() : undefined })
  }
  return out.length > 0 ? out : null
}

/* ================= 引擎外观（subagents 续聊原语 + 文件态模型 + 落盘 + 归档） ================= */

function engineError(code, message) {
  const e = new Error(message)
  e.code = code
  return e
}
function safety(s) { return String(s).replace(/[^\w-]/g, '_') }

// 唤醒消息：把任务主体带给成员
function wakeTail(task, leadName, memberName) {
  return [
    '你的角色是「' + (memberName || '团队') + '」。',
    '【任务】' + (task ? task.subject : ''),
    (task && task.description ? task.description.slice(0, 600) : ''),
    '',
    '以「' + (memberName || '你的角色') + '」的身份完成该任务，输出结论/方案/清单（直接给内容）。',
    (task && Array.isArray(task.writeScopes) && task.writeScopes.length > 0
      ? '本任务有【写域限制】：只允许改动 ' + task.writeScopes.join('、') + '。完成时必须在 agents_pixe_task_update 里带 changed_paths（你实际改动的文件路径，逗号分隔）—— 越界或缺这个字段都会被拒绝完成。'
      : ''),
    (task && task.kind === 'review'
      ? '本任务是【专业审查任务】：完成时必须对验收清单逐条给判定 —— agents_pixe_task_update(action=complete, acceptance_results="1:pass, 2:fail:原因, …")。缺任何一条都会被拒；只要有 fail，被审任务会被自动打回，下游仍被阻塞。'
      : ''),
    '完成后：调用 agents_pixe_task_update（action=complete，task_id=' + (task ? task.id : '') + '，expected_revision=' + (task ? task.revision : '') + '），并用 agents_pixe_team_message 把成果发给领袖 ' + (leadName || 'lead') + '。发消息时以「' + (memberName || '你的角色') + '：」开头，表明这是谁的发言。',
    '需要队友配合时，直接 agents_pixe_team_message(target="队友名") —— 引擎会把它投进该队友的邮箱并唤醒它，**不需要**先发给领袖再让领袖转达。'
  ].filter(Boolean).join('\n')
}

export function buildTeamFacade(deps) {
  const { subagents, llm, teamsDir, callLlm } = deps
  if (!subagents) throw engineError('ENGINE_UNAVAILABLE', '宿主未提供 subagents 服务')
  const now = () => Date.now()
  const teamFile = (lead) => join(teamsDir, safety(String(lead)) + '.json')
  const inboxFile = (lead) => join(teamsDir, safety(String(lead)) + '.inbox.json')
  const idxFile = () => join(teamsDir, 'idx.json')
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  function loadIdx() { try { return JSON.parse(readFileSync(idxFile(), 'utf8')) } catch { return {} } }
  function atomicWrite(file, content) {
    try { const tmp = file + '.tmp'; writeFileSync(tmp, content, 'utf8'); renameSync(tmp, file) } catch {}
  }
  function saveIdx(idx) { mkdirSync(teamsDir, { recursive: true }); atomicWrite(idxFile(), JSON.stringify(idx, null, 2)) }
  function load(lead) { try { return JSON.parse(readFileSync(teamFile(lead), 'utf8')) } catch { return null } }
  function save(lead, st) { mkdirSync(teamsDir, { recursive: true }); atomicWrite(teamFile(lead), JSON.stringify(st, null, 2)) }
  function fresh(lead) { return { leadId: lead, at: now(), members: [], tasks: [], messages: [], halted: false, lastStep: null } }
  function readInbox(lead) { try { const r = JSON.parse(readFileSync(inboxFile(lead), 'utf8')); return Array.isArray(r) ? r : [] } catch { return [] } }
  function pushInbox(lead, e) { const l = readInbox(lead); l.push(e); if (l.length > 500) l.splice(0, l.length - 500); mkdirSync(teamsDir, { recursive: true }); writeFileSync(inboxFile(lead), JSON.stringify(l, null, 2), 'utf8') }

  // 解析成员 → 其领袖 leadId（成员调 updateTask/message 也要落回领袖团队）
  function resolveLead(caller) {
    if (!caller || !caller.id) return null
    const idx = loadIdx()
    return (idx[caller.id] || caller.id)
  }
  const leadIdOf = (caller) => safety(String(resolveLead(caller) || 'anon'))

  /* 领袖 Agent 引用（仅内存，不落盘）。
   *
   * 为什么需要：宿主 `subagents.sendMessage(sender, targetId, content)` 只支持
   * 「父 → 直系子」或「子 → 直系父」（见 dsh-subagent@0.2.0-rc.2 的契约原文
   * "Deliver one model-authored message to a direct continuable child or to the
   * sender's direct parent"，非直系会在 deliverToChild 里失败）。团队成员是领袖的
   * 兄弟子会话，彼此不邻接 —— 所以「成员点名队友」必须由引擎替它投递。
   *
   * 关键区别：这是**引擎级传输**，不是「人工转达」—— 不占领袖的 LLM 轮次、不进领袖上下文、
   * 立即唤醒目标成员。成员语义上达成「队友直达」，代价只是传输拓扑仍走父节点。 */
  const leadAgents = new Map()
  function rememberLead(caller) {
    try { if (caller && caller.id) leadAgents.set(String(caller.id), caller) } catch { /* 记不上就退化为人工转达 */ }
  }
  function leadAgentRef(lead) { return leadAgents.get(String(lead)) || null }

  function recomputeReady(st) {
    for (const t of st.tasks) {
      if (t.status !== 'pending') { t.ready = false; continue }
      const blocked = t.blockedBy || []
      t.ready = blocked.every((id) => { const b = st.tasks.find((x) => x.id === id); return !!b && b.status === 'completed' })
    }
  }
  async function refreshStatus(st, signal) {
    try {
      const children = await subagents.listChildren(st.leadId, signal)
      for (const m of st.members) {
        const c = (children || []).find((x) => x.id === m.id)
        m.status = c ? (c.activity === 'running' ? 'running' : 'idle') : 'inactive'
      }
    } catch { /* 保留上次状态 */ }
  }
  function providerName() {
    try {
      const names = subagents.list && typeof subagents.list === 'function' ? subagents.list() : []
      if (names.length === 0) return 'spawn'
      if (names.includes('spawn')) return 'spawn'
      if (names.includes('fork')) return 'fork'
      return names[0]
    } catch { return 'spawn' }
  }
  function snapshot(caller, extra) {
    try {
      const lead = leadIdOf(caller)
      const st = load(lead)
      if (!st) return null
      mkdirSync(teamsDir, { recursive: true })
      writeFileSync(teamFile(lead), JSON.stringify(Object.assign({ at: now(), leadId: lead }, st, extra || {}), null, 2), 'utf8')
      return { members: st.members.map((m) => ({ ...m })), tasks: st.tasks.map((t) => ({ ...t })) }
    } catch { return null }
  }

  /* 成员 spawn 的「专业配置」：LLM 路由 + 工具白名单 + persona。
   * 宿主契约（dsh-subagent@0.2.0-rc.2）：request 支持 agentOptions / toolFilter / persona，
   * 但**能力由 provider 决定** —— in-process `spawn`/`fork` advertise 全 true；
   * 跨进程后端 advertise 全 false 且会**抛 UNSUPPORTED_CAPABILITY**（不静默忽略）。
   * 所以这里必须「带配置试一次 → 命中不支持就降级重试」，并如实记录 degraded。 */
  async function spawnMember(caller, lead, st, idx, r, spawn, provider, signal, spawnErrors) {
    const rich = {}
    const agentOptions = Object.assign({}, (spawn && spawn.agentOptions) || {}, r.agentOptions || {})
    if (Object.keys(agentOptions).length > 0) rich.agentOptions = agentOptions
    const toolFilter = r.toolFilter || (spawn && spawn.toolFilter)
    if (toolFilter) rich.toolFilter = toolFilter
    const persona = r.persona !== undefined ? r.persona : (spawn && spawn.persona)
    if (persona !== undefined) rich.persona = persona
    const baseRequest = { prompt: [{ type: 'text', text: String(r.seed || r.full || r.desc || r.name) }], parent: caller }
    let started = null
    let degraded = false
    let applied = rich
    if (Object.keys(rich).length > 0) {
      try {
        started = await subagents.startContinuable({ provider, label: r.name, request: Object.assign({}, baseRequest, rich), signal })
      } catch (e) {
        const msg = String((e && e.message) || e)
        if (!/UNSUPPORTED_CAPABILITY|does not support the/.test(msg)) { spawnErrors.push(msg); return null }
        degraded = true
        applied = {}
      }
    }
    if (!started) {
      try {
        started = await subagents.startContinuable({ provider, label: r.name, request: baseRequest, signal })
      } catch (e) { spawnErrors.push(String((e && e.message) || e)); return null }
    }
    const member = { id: started.childId, name: r.name, desc: String(r.desc || ''), status: 'idle', provider }
    if (applied.agentOptions && applied.agentOptions.model) member.model = String(applied.agentOptions.model)
    if (applied.agentOptions && applied.agentOptions.provider) member.agentProvider = String(applied.agentOptions.provider)
    if (applied.agentOptions && applied.agentOptions.reasoningEffort) member.reasoningEffort = String(applied.agentOptions.reasoningEffort)
    if (applied.toolFilter) member.toolFilter = applied.toolFilter
    if (applied.persona !== undefined) member.persona = true
    if (degraded) member.degraded = 'provider 不支持 agentOptions/toolFilter/persona，已按默认路由 + 全量工具降级'
    st.members.push(member)
    idx[started.childId] = lead
    return member
  }

  // 1) 创建团队：spawn 可续聊成员（幂等）
  async function createTeam(caller, req) {
    const lead = caller && caller.id
    if (!lead) throw engineError('NO_LEAD', '需在 agent 会话中调用')
    rememberLead(caller)
    let st = load(lead)
    if (st) { await refreshStatus(st, req.signal); save(lead, st); return { created: false, lead: lead, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })) } }
    const provider = req.provider || providerName()
    st = fresh(lead)
    const idx = loadIdx()
    const spawnErrors = []
    for (const r of req.roster || []) {
      await spawnMember(caller, lead, st, idx, r, req.spawn, provider, req.signal, spawnErrors)
    }
    if (st.members.length === 0) {
      throw engineError('NO_MEMBERS', '未能创建任何成员：' + (spawnErrors[0] || 'subagents 续聊（startContinuable）不可用') + '。请确认宿主 subagents 续聊驱动已挂载（参考 dsh-agent-teams 用同一个 subagents）。')
    }
    save(lead, st); saveIdx(idx)
    await refreshStatus(st, req.signal); save(lead, st)
    return { created: true, lead: lead, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })) }
  }

  // 2) 创建任务（带显式依赖 + 可选写域 + 可选**专业门禁**：kind=review 的验收清单）
  async function createTask(caller, req) {
    const lead = leadIdOf(caller)
    if (String((caller && caller.id) || '') === lead) rememberLead(caller)
    let st = load(lead)
    if (!st) { st = fresh(lead); save(lead, st) }
    const id = 'task-' + (st.tasks.length + 1)
    const scopes = normScopes(req.writeScopes)
    const kind = req.kind === 'review' ? 'review' : 'work'
    const acceptance = normAcceptance(req.acceptance)
    const t = {
      id, revision: 1,
      subject: String(req.subject || '').trim(),
      description: String(req.description || req.subject || '').trim(),
      kind,
      status: 'pending',
      blockedBy: Array.isArray(req.blockedBy) ? req.blockedBy : [],
      writeScopes: scopes,
      acceptance,
      reviewOf: kind === 'review' ? String(req.reviewOf || '').trim() || undefined : undefined,
      ownerName: undefined,
      ready: false
    }
    st.tasks.push(t); recomputeReady(st); save(lead, st)
    return { ...t }
  }

  // 3) 任务状态迁移（CAS + 状态机 + **写域对账硬拦**）
  async function updateTask(caller, req) {
    const lead = leadIdOf(caller)
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    const t = st.tasks.find((x) => x.id === req.taskId)
    if (!t) throw engineError('NOT_FOUND', '任务不存在')
    if (Number(req.expectedRevision) !== t.revision) throw engineError('CONFLICT', 'CAS conflict：revision 已变')
    const action = String(req.action || '')
    if (!transitionAllowed(t, action)) throw engineError('ILLEGAL', '非法状态迁移：' + action + ' from ' + t.status)
    /* 写域门禁：声明了 writeScopes 的任务，完成时必须提交实际改动路径并全部落在域内。
     * 这是**确定性**拦截（原生只做 advisory 警告）：越界一律拒绝完成，任务留在 in_progress，
     * 成员要么改回域内、要么让领袖显式放宽 writeScopes（edit）—— 不允许"悄悄越界再报完成"。 */
    if (action === 'complete') {
      /* ① 专业门禁（kind=review）：必须逐条给出验收判定；有任一 fail → 判 fail，
       *    并把被审任务**自动打回 in_progress**（下游因此仍被阻塞，不会带着缺陷往下走）。 */
      if (t.kind === 'review' && t.acceptance.length > 0) {
        const target = t.reviewOf ? st.tasks.find((x) => x.id === t.reviewOf) : null
        if (t.reviewOf && !target) throw engineError('NOT_FOUND', 'review_of 指向的任务不存在：' + t.reviewOf)
        if (target && target.status !== 'completed') {
          throw engineError('REVIEW_TARGET_NOT_DONE', '被审任务 ' + target.id + ' 当前是 ' + target.status + '，不能在未完成时出审查结论。')
        }
        const results = normAcceptanceResults(req.acceptanceResults)
        if (results === null) {
          throw engineError('ACCEPTANCE_UNVERIFIED',
            '任务 ' + t.id + ' 是 review 任务，完成时必须逐条给出 acceptance_results（格式：`1:pass, 2:fail:原因` 或用 JSON 数组），验收清单共 ' + t.acceptance.length + ' 条：\n' + t.acceptance.map((a, i) => (i + 1) + '. ' + a.item + '（' + a.source + '）').join('\n'))
        }
        const missing = []
        for (let i = 1; i <= t.acceptance.length; i++) if (!results.some((r) => r.index === i)) missing.push(i)
        if (missing.length > 0) {
          throw engineError('ACCEPTANCE_UNVERIFIED', 'acceptance_results 缺少第 ' + missing.join('、') + ' 条的判定（清单共 ' + t.acceptance.length + ' 条）—— 不允许跳过任何一条。')
        }
        const extra = results.filter((r) => r.index > t.acceptance.length)
        if (extra.length > 0) {
          throw engineError('ACCEPTANCE_UNVERIFIED', 'acceptance_results 里有超出清单范围的第 ' + extra.map((r) => r.index).join('、') + ' 条（清单只有 ' + t.acceptance.length + ' 条）—— 判据可能已变，请按当前清单重新判定。')
        }
        const failed = results.filter((r) => r.pass === false)
        t.acceptanceResults = results.map((r) => ({ index: r.index, item: (t.acceptance[r.index - 1] || {}).item || '', pass: r.pass, note: r.note }))
        t.verdict = failed.length === 0 ? 'pass' : 'fail'
        t.reviewedAt = now()
        if (failed.length > 0 && target) {
          target.status = 'in_progress'
          target.revision++
          target.lastReviewFailures = {
            at: now(), by: 'task:' + t.id,
            failures: failed.map((r) => ({ item: (t.acceptance[r.index - 1] || {}).item || '', note: r.note }))
          }
        }
      }
      /* ② 写域门禁（声明了 writeScopes 就必须自证没越界）。 */
      const scopes = normScopes(t.writeScopes)
      if (scopes.length > 0) {
        const changed = normPaths(req.changedPaths)
        if (changed === null) {
          throw engineError('SCOPE_UNVERIFIED',
            '任务 ' + t.id + ' 声明了写域 [' + scopes.join(', ') + ']，完成时必须在 agents_pixe_task_update 里带 changed_paths（你实际改动的文件路径，逗号分隔）—— 否则无法证明没有越界，不能置为 completed。')
        }
        const outside = changed.filter((p) => !pathInScope(p, scopes))
        if (outside.length > 0) {
          throw engineError('SCOPE_VIOLATION',
            '任务 ' + t.id + ' 的写域是 [' + scopes.join(', ') + ']，但 changed_paths 里有 ' + outside.length + ' 个越界路径：' + outside.join('、') + '。请①把改动限制回域内后重试；或②让领袖用 agents_pixe_task_update(action=edit, write_scopes=…) 显式放宽写域。')
        }
        t.lastScopeCheck = { at: now(), scopes, changed, ok: true }
      }
      t.status = 'completed'
    }
    else if (action === 'claim') { t.status = 'in_progress'; t.ownerName = req.owner }
    else if (action === 'release') { t.status = 'pending'; t.ownerName = undefined }
    else if (action === 'reopen') { t.status = 'in_progress' }
    else if (action === 'edit') {
      if (req.subject !== undefined) t.subject = req.subject
      if (req.description !== undefined) t.description = req.description
      if (req.writeScopes !== undefined) t.writeScopes = normScopes(req.writeScopes)
      if (req.acceptance !== undefined) t.acceptance = normAcceptance(req.acceptance)
    }
    else if (action === 'set_dependencies') { t.blockedBy = Array.isArray(req.blockedBy) ? req.blockedBy : [] }
    else if (action === 'reassign') { t.ownerName = req.owner }
    else if (action === 'delete') { t.status = 'deleted' }
    recomputeReady(st); t.revision++; save(lead, st)
    return { ...t }
  }

  // 4) 邮箱直投：lead→member、member→lead、**member→member（引擎代理投递）**
  async function message(caller, req) {
    const lead = leadIdOf(caller)
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    const isLead = String(caller && caller.id) === lead
    if (isLead) rememberLead(caller)
    const target = String(req.target || '').trim()
    const content = String(req.content || '')
    const senderName = (st.members.find((x) => x.id === caller.id) || {}).name || (isLead ? 'lead' : String((caller && caller.id) || '?'))
    const toLead = (target === '@lead' || target === 'lead')
    const member = toLead ? null : st.members.find((x) => x.name === target)
    if (!toLead && !member) throw engineError('NOT_FOUND', '成员不存在：' + target)

    let sender = caller
    let text = content
    let relayed = false
    if (!isLead && !toLead) {
      /* 成员点名队友：兄弟子会话不邻接，由引擎用**领袖 Agent 引用**做邻接投递。
       * 这是传输层代理，不是「人工转达」—— 不占领袖 LLM 轮次、不进领袖上下文、立即唤醒目标。 */
      const leadAgent = leadAgentRef(lead)
      if (!leadAgent) {
        throw engineError('NO_TRANSPORT', '领袖会话引用不在本进程（团队可能是上次会话建的）：成员暂时无法直达队友，请改发 @lead 由领袖转达 ' + target + '。')
      }
      sender = leadAgent
      text = '【来自队友 ' + senderName + ' 的消息】\n' + content
      relayed = true
    }
    const targetId = toLead ? lead : member.id
    const messageId = await subagents.sendMessage(sender, targetId, [{ type: 'text', text }], { signal: req.signal })
    if (toLead) pushInbox(lead, { from: senderName, text: content, at: now() })
    const to = toLead ? 'lead' : member.name
    st.messages = (st.messages || []).concat([{ at: now(), from: senderName, to, relayed: relayed || undefined, chars: content.length }]).slice(-200)
    save(lead, st)
    return { messageId, status: 'accepted', from: senderName, to, relayed }
  }

  // 5) 共享调度器：冷恢复 + 原子领取 + 唤醒 + 有界轮询
  async function step(caller, req = {}) {
    const lead = leadIdOf(caller)
    if (String((caller && caller.id) || '') === lead) rememberLead(caller)
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    /* halt 闸门：halted 状态下只刷新成员状态并写 lastStep（告诉面板为什么这一轮是空的），不再派单 */
    if (st.halted) {
      await refreshStatus(st, req.signal)
      const last = { at: now(), dispatched: [], recovered: [], parked: [], timedOut: false, aborted: false, halted: true, note: 'halted: skip dispatch' }
      st.lastStep = last
      save(lead, st)
      return Object.assign({}, last, { lastStep: last, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })) })
    }
    await refreshStatus(st, req.signal)
    const byOwner = new Map(st.members.filter((m) => m.name).map((m) => [m.name, m]))
    const idleMembers = st.members.filter((m) => m.status === 'idle' && !holdsOpenAttempt(m.name, st.tasks))
    const readyUnowned = st.tasks.filter((t) => t.status === 'pending' && !t.ownerName && computeReady(t, st.tasks)).sort((a, b) => orderNum(a.id) - orderNum(b.id))
    const used = new Set()
    const dispatched = []
    const recovered = []
    // 冷恢复：先释放死属主，再尝试认领
    for (const t of st.tasks) {
      if (t.status !== 'in_progress' || !t.ownerName) continue
      if (!strandedCold(t, byOwner)) continue
      const originalOwner = t.ownerName
      const original = byOwner.get(originalOwner)
      const claimer = (original && original.status === 'idle' && !holdsOpenAttempt(original.name, st.tasks)) ? original : idleMembers.find((m) => m.name !== originalOwner && !holdsOpenAttempt(m.name, st.tasks))
      try {
        if (claimer) {
          t.status = 'in_progress'; t.ownerName = claimer.name; t.revision++
          recomputeReady(st); save(lead, st)
          await subagents.sendMessage(caller, claimer.id, [{ type: 'text', text: wakeTail(t, 'lead', claimer.name) }], { signal: req.signal })
          recovered.push({ member: claimer.name, taskId: t.id, from: originalOwner, revision: t.revision })
        } else {
          t.status = 'pending'; t.ownerName = undefined; t.revision++
          recomputeReady(st); save(lead, st)
          recovered.push({ member: null, taskId: t.id, from: originalOwner, released: true, revision: t.revision })
        }
      } catch {}
    }
    // 派发：每空闲成员领一项就绪任务并唤醒
    for (const m of idleMembers) {
      const t = readyUnowned.find((x) => !used.has(String(x.id)))
      if (!t) break
      used.add(String(t.id))
      try {
        t.status = 'in_progress'; t.ownerName = m.name; t.revision++
        recomputeReady(st); save(lead, st)
        await subagents.sendMessage(caller, m.id, [{ type: 'text', text: wakeTail(t, 'lead', m.name) }], { signal: req.signal })
        dispatched.push({ member: m.name, taskId: t.id, revision: t.revision, subject: t.subject })
      } catch {}
    }
    // 有界等待：轮询成员状态变更
    let timedOut = true
    let aborted = false
    try {
      const waitMs = Math.min(Math.max(Number(req.waitMs) || 2000, 200), 60000)
      if (waitMs > 200) {
        const end = Date.now() + waitMs
        while (Date.now() < end) {
          await sleep(400)
          const prev = st.members.map((m) => m.status).join(',')
          await refreshStatus(st, req.signal)
          const nowS = st.members.map((m) => m.status).join(',')
          if (nowS !== prev) { timedOut = false; save(lead, st); break }
        }
        save(lead, st)
      }
    } catch { aborted = true }
    // S1 并发保护：等待期间成员可能并发 updateTask（完成/改派）。重读磁盘最新状态，
    // 只把「本次 claim 的任务仍是 pending」的回填为 in_progress，绝不回退成员已落盘的完成。
    const latest = load(lead) || st
    for (const d of dispatched) {
      const t = (latest.tasks || []).find((x) => x.id === d.taskId)
      if (t && t.status === 'pending') { t.status = 'in_progress'; t.ownerName = d.member }
    }
    save(lead, latest)
    // 后续展示/返回全部基于 latest（包含成员并发更新），不用陈旧 st
    const membersOut = latest.members.map((m) => ({ ...m }))
    const tasksOut = latest.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t }))
    snapshot(caller)
    const parked = membersOut.filter((m) => m.status === 'idle' && holdsOpenAttempt(m.name, tasksOut)).map((m) => m.name)
    const lastStep = { at: now(), dispatched, recovered, parked, timedOut, aborted, halted: false }
    latest.lastStep = lastStep
    save(lead, latest)
    return Object.assign({ dispatched, recovered, parked, timedOut, aborted, halted: false }, { lastStep, members: membersOut, tasks: tasksOut })
  }

  // 6) 汇总 + 归档
  async function report(caller, req = {}) {
    const lead = leadIdOf(caller)
    if (String((caller && caller.id) || '') === lead) rememberLead(caller)
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    await refreshStatus(st, req.signal)
    const inbox = readInbox(lead)
    const done = st.tasks.filter((t) => t.status === 'completed')
    const open = st.tasks.filter((t) => t.status !== 'completed' && t.status !== 'deleted')
    let reportText = ''
    if (callLlm && open.length === 0) {
      try {
        const blocks = inbox.map((m, i) => '### 成员成果 ' + (i + 1) + '（来自 ' + m.from + '）\n' + String(m.text || ''))
          .concat(st.tasks.filter((t) => t.status === 'completed').map((t) => '- [' + t.ownerName + '] ' + t.subject))
        reportText = await callLlm('你是团队领袖。整合成员成果为最终报告：结论先行、标注分歧、给下一步。', '团队任务：' + (req.task || '') + '\n\n成员成果：\n\n' + blocks.join('\n\n'))
      } catch { reportText = '' }
    }
    try {
      const dir = join(teamsDir, 'archive')
      mkdirSync(dir, { recursive: true })
      writeFileSync(join(dir, safety(lead) + '-' + now() + '.json'), JSON.stringify(Object.assign({ at: now(), leadId: lead, inbox }, { members: st.members.map((m) => ({ ...m })), tasks: st.tasks.map((t) => ({ ...t })) }, { report: reportText, openCount: open.length, doneCount: done.length }), null, 2), 'utf8')
    } catch {}
    save(lead, Object.assign(st, { lastReport: reportText, archivedAt: now(), openCount: open.length, doneCount: done.length }))
    return { report: reportText, done: done.length, open: open.length, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.map((t) => ({ ...t })), inbox, archived: true }
  }

  // 7) 只读视图（面板）：刷新成员状态后返回
  async function view(caller) {
    const lead = leadIdOf(caller)
    if (String((caller && caller.id) || '') === lead) rememberLead(caller)
    const st = load(lead)
    if (!st) return { members: [], tasks: [], halted: false, lastStep: null, messages: [], plan: readPlanDirect(lead) }
    await refreshStatus(st)
    save(lead, st)
    return {
      members: st.members.map((m) => ({ ...m })),
      tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })),
      halted: !!st.halted,
      lastStep: st.lastStep || null,
      messages: (st.messages || []).slice(-50),
      plan: readPlanDirect(lead),
    }
  }

  /* ============ Direct mutators（HTTP 路由调用，绕过 agent exec） ============
   * createTask / updateTask 走 CAS（caller.id），HTTP 路由必须拿真实 leadId 直接落盘。
   * 用一个假的 caller { id: lead } 走标准路径，行为完全等价。 */
  function directCaller(lead) { return { id: String(lead) } }
  function lookupLead(lead) {
    const l = String(lead || '').trim()
    if (!l) throw engineError('BAD_INPUT', '缺少 lead id')
    return l
  }
  async function addTaskDirect(lead, req) {
    const l = lookupLead(lead)
    return await createTask(directCaller(l), { subject: req.subject, description: req.description, blockedBy: req.blockedBy || [], writeScopes: req.writeScopes, kind: req.kind, reviewOf: req.reviewOf, acceptance: req.acceptance })
  }
  async function editTaskDirect(lead, req) {
    const l = lookupLead(lead)
    return await updateTask(directCaller(l), {
      taskId: req.taskId, expectedRevision: req.expectedRevision, action: req.action,
      owner: req.owner, subject: req.subject, description: req.description, blockedBy: req.blockedBy,
      writeScopes: req.writeScopes, changedPaths: req.changedPaths,
      acceptance: req.acceptance, acceptanceResults: req.acceptanceResults,
    })
  }
  async function deleteTaskDirect(lead, taskId, expectedRevision) {
    const l = lookupLead(lead)
    return await updateTask(directCaller(l), { taskId: String(taskId), expectedRevision: Number(expectedRevision), action: 'delete' })
  }
  function setHaltedDirect(lead, halted) {
    const l = lookupLead(lead)
    const st = load(l)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    st.halted = !!halted
    save(l, st)
    return { halted: st.halted }
  }

  /* ============ P2：计划先行草案（信任闸门）============
   * 草案是唯一的人工闸门：未确认前不 spawn 任何成员、不消耗成员 token。
   * 结构对齐 dsh-agent-teams 的 approval:"required"（草案落盘 → 人确认 → 才建会话/派单）。 */
  function planPath(lead) { return join(teamsDir, safety(lead) + '.plan.json') }
  function writePlanDirect(lead, plan) {
    const l = lookupLead(lead)
    const draft = Object.assign({ at: now(), leadId: l }, plan || {})
    mkdirSync(teamsDir, { recursive: true })
    atomicWrite(planPath(l), JSON.stringify(draft, null, 0))
    return draft
  }
  function readPlanDirect(lead) {
    const l = String(lead || '').trim()
    if (!l) return null
    try { return JSON.parse(readFileSync(planPath(l), 'utf8')) } catch { return null }
  }
  function discardPlanDirect(lead) {
    const l = lookupLead(lead)
    try { rmSync(planPath(l), { force: true }) } catch {}
    return { discarded: true }
  }
  /** 确认草案：按草案名册建团队 + 逐个建任务；plan 可传编辑后的版本覆盖磁盘草案。 */
  async function confirmPlanDirect(lead, plan, signal) {
    const l = lookupLead(lead)
    const draft = plan || readPlanDirect(l)
    if (!draft) throw engineError('NOT_FOUND', '没有待确认的计划草案（先用 agents_pixe_team 传 plan_only=true 出草案）')
    const team = await createTeam(directCaller(l), { roster: draft.roster || [], provider: draft.provider, signal: signal })
    const tasks = []
    for (const t of draft.tasks || []) {
      tasks.push(await addTaskDirect(l, { subject: t.subject, description: t.description, blockedBy: t.blockedBy || [], writeScopes: t.writeScopes, kind: t.kind, reviewOf: t.reviewOf, acceptance: t.acceptance }))
    }
    discardPlanDirect(l)
    return { confirmed: true, lead: l, created: team.created, members: team.members, tasks: tasks }
  }

  return { createTeam, createTask, updateTask, message, step, report, view, snapshot, addTaskDirect, editTaskDirect, deleteTaskDirect, setHaltedDirect, writePlanDirect, readPlanDirect, discardPlanDirect, confirmPlanDirect }
}
