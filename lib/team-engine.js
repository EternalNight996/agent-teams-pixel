// agent-teams-pixel 团队引擎：驱动宿主 `subagents` 续聊原语 + 文件态团队/任务/attempt 模型，
// 实现「真正团队协助」——领袖建团队、可续聊成员、显式依赖任务、共享调度器、
// attempt(CAS) 生命周期、邮箱直投、文件快照落盘、活动面板视图与归档。
// 设计：纯服务注入（不 import 任何 DSH 包），仅用 node:fs 落盘（setTimeout 为 Node 全局），逻辑可单测。
//
// 行为对齐规范：
//  - 一领袖活动团队唯一（createTeam 幂等；成员是领袖的续聊子 Agent）
//  - 成员 = `subagents.startContinuable` 建立的驻留续聊子会话；状态经 `listChildren`（running/inactive）刷新
//  - 任务带 blockedBy 显式依赖，ready = 依赖全 completed
//  - 共享调度器：真实 running/idle/ready 原子领取（CAS expectedRevision）→ sendMessage(wakeup) 唤醒空闲成员 → 有界轮询
//  - attempt 生命周期：claim/complete/release/reassign/reopen 走 updateTask CAS；转派先 release 等待归静再 claim
//  - 冷停遗留：in_progress 但属主非 running（冷进程重启）→ 释放并重新 claim（新 attempt）恢复
//  - 状态文件持久化 + 单进程串行；面板读磁盘真相快照
import { mkdirSync, writeFileSync, readFileSync, renameSync } from 'node:fs'
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
    '完成后：调用 agents_pixe_task_update（action=complete，task_id=' + (task ? task.id : '') + '，expected_revision=' + (task ? task.revision : '') + '），并用 agents_pixe_team_message 把成果发给领袖 ' + (leadName || 'lead') + '。发消息时以「' + (memberName || '你的角色') + '：」开头，表明这是谁的发言。'
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
  function fresh(lead) { return { leadId: lead, at: now(), members: [], tasks: [], halted: false, lastStep: null } }
  function readInbox(lead) { try { const r = JSON.parse(readFileSync(inboxFile(lead), 'utf8')); return Array.isArray(r) ? r : [] } catch { return [] } }
  function pushInbox(lead, e) { const l = readInbox(lead); l.push(e); if (l.length > 500) l.splice(0, l.length - 500); mkdirSync(teamsDir, { recursive: true }); writeFileSync(inboxFile(lead), JSON.stringify(l, null, 2), 'utf8') }

  // 解析成员 → 其领袖 leadId（成员调 updateTask/message 也要落回领袖团队）
  function resolveLead(caller) {
    if (!caller || !caller.id) return null
    const idx = loadIdx()
    return (idx[caller.id] || caller.id)
  }
  const leadIdOf = (caller) => safety(String(resolveLead(caller) || 'anon'))

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

  // 1) 创建团队：spawn 可续聊成员（幂等）
  async function createTeam(caller, req) {
    const lead = caller && caller.id
    if (!lead) throw engineError('NO_LEAD', '需在 agent 会话中调用')
    let st = load(lead)
    if (st) { await refreshStatus(st, req.signal); save(lead, st); return { created: false, lead: lead, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })) } }
    const provider = req.provider || providerName()
    st = fresh(lead)
    const idx = loadIdx()
    const spawnErrors = []
    for (const r of req.roster || []) {
      try {
        const { childId } = await subagents.startContinuable({
          provider, label: r.name,
          request: { prompt: [{ type: 'text', text: String(r.full || r.desc || r.name) }], parent: caller },
          signal: req.signal,
        })
        st.members.push({ id: childId, name: r.name, desc: String(r.desc || ''), status: 'idle', provider })
        idx[childId] = lead
      } catch (e) { spawnErrors.push(String((e && e.message) || e)) }
    }
    if (st.members.length === 0) {
      throw engineError('NO_MEMBERS', '未能创建任何成员：' + (spawnErrors[0] || 'subagents 续聊（startContinuable）不可用') + '。请确认宿主 subagents 续聊驱动已挂载（参考 dsh-agent-teams 用同一个 subagents）。')
    }
    save(lead, st); saveIdx(idx)
    await refreshStatus(st, req.signal); save(lead, st)
    return { created: true, lead: lead, members: st.members.map((m) => ({ ...m })), tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })) }
  }

  // 2) 创建任务（带显式依赖）
  async function createTask(caller, req) {
    const lead = leadIdOf(caller)
    let st = load(lead)
    if (!st) { st = fresh(lead); save(lead, st) }
    const id = 'task-' + (st.tasks.length + 1)
    const t = { id, revision: 1, subject: String(req.subject || '').trim(), description: String(req.description || req.subject || '').trim(), status: 'pending', blockedBy: Array.isArray(req.blockedBy) ? req.blockedBy : [], ownerName: undefined, ready: false }
    st.tasks.push(t); recomputeReady(st); save(lead, st)
    return { ...t }
  }

  // 3) 任务状态迁移（CAS + 状态机）
  async function updateTask(caller, req) {
    const lead = leadIdOf(caller)
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    const t = st.tasks.find((x) => x.id === req.taskId)
    if (!t) throw engineError('NOT_FOUND', '任务不存在')
    if (Number(req.expectedRevision) !== t.revision) throw engineError('CONFLICT', 'CAS conflict：revision 已变')
    const action = String(req.action || '')
    if (!transitionAllowed(t, action)) throw engineError('ILLEGAL', '非法状态迁移：' + action + ' from ' + t.status)
    if (action === 'claim') { t.status = 'in_progress'; t.ownerName = req.owner }
    else if (action === 'complete') { t.status = 'completed' }
    else if (action === 'release') { t.status = 'pending'; t.ownerName = undefined }
    else if (action === 'reopen') { t.status = 'in_progress' }
    else if (action === 'edit') { if (req.subject !== undefined) t.subject = req.subject; if (req.description !== undefined) t.description = req.description }
    else if (action === 'set_dependencies') { t.blockedBy = Array.isArray(req.blockedBy) ? req.blockedBy : [] }
    else if (action === 'reassign') { t.ownerName = req.owner }
    else if (action === 'delete') { t.status = 'deleted' }
    recomputeReady(st); t.revision++; save(lead, st)
    return { ...t }
  }

  // 4) 邮箱直投（lead→member 或 member→lead）
  async function message(caller, req) {
    const lead = leadIdOf(caller)
    const isLead = String(caller && caller.id) === lead
    const st = load(lead)
    if (!st) throw engineError('NOT_FOUND', '团队不存在')
    const target = String(req.target || '').trim()
    // subagents.sendMessage 是严格邻接投递（父↔直系子）：成员→成员（兄弟）不邻接，必然失败。
    // 成员只能发 @lead（自己的父），发队友请由领袖转达。
    if (!isLead && target !== '@lead' && target !== 'lead') {
      const m = st.members.find((x) => x.name === target)
      if (m) throw engineError('ADJACENCY', '成员↔成员不邻接：请把消息发给 @lead（领袖），由领袖转达 ' + target)
    }
    let targetId = null
    if (target === '@lead' || target === 'lead') targetId = lead
    else { const m = st.members.find((x) => x.name === target); if (!m) throw engineError('NOT_FOUND', '成员不存在'); targetId = m.id }
    const messageId = await subagents.sendMessage(caller, targetId, [{ type: 'text', text: String(req.content || '') }], { signal: req.signal })
    // 成员 → 领袖的成果直投：落 inbox 供 report 聚合
    if (target === '@lead' || target === 'lead') pushInbox(lead, { from: (st.members.find((x) => x.id === caller.id) || {}).name || caller.id, text: String(req.content || ''), at: now() })
    return { messageId, status: 'accepted' }
  }

  // 5) 共享调度器：冷恢复 + 原子领取 + 唤醒 + 有界轮询
  async function step(caller, req = {}) {
    const lead = leadIdOf(caller)
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
    const st = load(lead)
    if (!st) return { members: [], tasks: [], halted: false, lastStep: null }
    await refreshStatus(st)
    save(lead, st)
    return {
      members: st.members.map((m) => ({ ...m })),
      tasks: st.tasks.filter((t) => t.status !== 'deleted').map((t) => ({ ...t })),
      halted: !!st.halted,
      lastStep: st.lastStep || null,
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
    return await createTask(directCaller(l), { subject: req.subject, description: req.description, blockedBy: req.blockedBy || [] })
  }
  async function editTaskDirect(lead, req) {
    const l = lookupLead(lead)
    return await updateTask(directCaller(l), {
      taskId: req.taskId, expectedRevision: req.expectedRevision, action: req.action,
      owner: req.owner, subject: req.subject, description: req.description, blockedBy: req.blockedBy,
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

  return { createTeam, createTask, updateTask, message, step, report, view, snapshot, addTaskDirect, editTaskDirect, deleteTaskDirect, setHaltedDirect }
}
