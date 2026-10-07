// 客户端包的真实加载 + 渲染测试台。
//
// 为什么需要它：此前所有「UI 验证」都是对源码做正则断言，那种测试**永远抓不到
// 「点了没反应」** —— 因为病灶在运行时的状态机里（sid 为空、守卫拒绝写入、分支优先序）。
// 这里用 vm 把真实的 lib/client.js 跑起来，给它一套最小可用的宿主编排面，
// 然后用迷你 React 真的渲染浮层、真的点按钮、真的断言界面变了。
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createReact } from './mini-react.mjs'

/* 宿主给 shell.overlay 注入的 useSessions —— **必须照宿主的真实快照形状**：
 *   { phase, byId: { [sid]: { id, retainedBy: { mainView: n }, ... } }, projectionsBySession }
 * 快照里**没有** `current` 字段。我们曾经臆造过 `s.current`，结果浮层永远拿不到会话、
 * 点角色静默无效。测试台若喂一个不存在的形状，就会「验证」出错误结论 —— 所以这里
 * 的形状必须有据可依（证据：DSH shell 源码里找主会话的写法）。 */
export function fakeUseSessions(current) {
  return function (selector) {
    const snap = {
      phase: 'ready',
      byId: current ? { [current]: { id: current, retainedBy: { mainView: 1 }, cwd: 'C:/', blank: false } } : {},
      projectionsBySession: {},
    }
    return selector ? selector(snap) : snap
  }
}

const DEFAULT_INDEX = {
  zh: {
    divisions: { engineering: { label: '工程' }, 'project-management': { label: '项目管理' } },
    roles: [
      { id: 'engineering-frontend-developer', div: 'engineering', name: '前端开发者', emoji: '🖥', color: '#3b82f6', desc: '性能优先开发' },
      { id: 'engineering-backend-architect', div: 'engineering', name: '后端架构师', emoji: '🧱', color: '#8b5cf6', desc: '接口与数据建模' },
      { id: 'project-manager-senior', div: 'project-management', name: '高级项目经理', emoji: '👑', color: '#f59e0b', desc: '范围控制与拆解' },
    ],
  },
  en: { divisions: { engineering: { label: 'Engineering' } }, roles: [{ id: 'engineering-frontend-developer', div: 'engineering', name: 'Frontend Developer', emoji: '🖥', color: '#3b82f6', desc: 'performance first' }] },
}

function ctx2dStub() {
  const base = { measureText: () => ({ width: 12 }), canvas: { width: 900, height: 600 } }
  return new Proxy(base, {
    get(t, k) { if (k in t) return t[k]; return () => {} },
    set(t, k, v) { t[k] = v; return true },
  })
}

export function bootClient(options = {}) {
  const bundlePath = options.bundle || 'lib/client.js'
  const code = readFileSync(bundlePath, 'utf8')
  const mini = createReact()
  const store = new Map()

  const index = options.rolesIndex || DEFAULT_INDEX
  store.set('agents-pixe.rolesIndex.v1', JSON.stringify({ version: 'test', at: Date.now(), data: index }))
  if (options.state) store.set('agents-pixe.state.v4', JSON.stringify(options.state))
  Object.keys(options.extraStore || {}).forEach((k) => store.set(k, options.extraStore[k]))

  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)) },
    removeItem: (k) => { store.delete(k) },
  }

  const fetchCalls = []
  const sandbox = {
    console,
    setTimeout, clearTimeout, setInterval, clearInterval,
    localStorage,
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    fetch: (url, init) => {
      fetchCalls.push(String(url))
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(
          String(url).indexOf('/teams/view') >= 0
            ? { ok: true, available: false, source: 'engine', members: [], tasks: [], halted: false, lastStep: null, messages: [], plan: null }
            : { ok: true }
        ),
      })
    },
    document: {
      hidden: false,
      addEventListener() {}, removeEventListener() {},
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({
        tagName: 'canvas', style: {}, width: 900, height: 600,
        getContext: () => ctx2dStub(),
        appendChild() {}, addEventListener() {}, removeEventListener() {},
        getBoundingClientRect: () => ({ width: 900, height: 600, left: 0, top: 0 }),
      }),
      body: { appendChild() {}, removeChild() {} },
    },
  }
  sandbox.window = {
    addEventListener() {}, removeEventListener() {},
    innerWidth: 1400, innerHeight: 900, devicePixelRatio: 1,
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    localStorage,
  }
  let captured = null
  sandbox.window.__ModuleLoader__ = { load: (def) => { captured = def } }
  sandbox.globalThis = sandbox

  vm.createContext(sandbox)
  vm.runInContext(code, sandbox, { filename: 'client.js' })

  if (!captured) throw new Error('bundle 没有向 window.__ModuleLoader__ 注册自己')
  const exports = captured.factory((name) => {
    if (name === 'react') return mini.React
    throw new Error('测试台未提供模块：' + name)
  })

  /* ---- 假宿主 ctx：只要 apply 真正需要的那几样 ---- */
  const registry = []          // { key, def, component }
  const dictionaries = {}
  const slots = {
    inject(key, fn) {
      const r = fn()
      if (r && r.def && r.component) registry.push({ key: key, def: r.def, component: r.component })
      return () => {}
    },
    register(def, component) { return { def: def, component: component } },
    injectChain() { return () => {} },
  }
  const services = {
    slots,
    locale: {
      getSnapshot: () => ({ active: options.lang || 'zh' }),
      subscribe: () => () => {},
      register: (ns, dict) => { dictionaries[ns] = dict },
    },
    sessions: options.sessions,
    timer: { setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (h) => clearTimeout(h), setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: (h) => clearInterval(h) },
  }
  let effectCount = 0
  const ctx = {
    get: (name) => services[name],
    effect: (fn) => { effectCount++; try { fn() } catch (e) { throw new Error('effect 内抛错：' + (e && e.message)) } return () => {} },
  }
  exports.apply(ctx)

  function slot(key, id) {
    const hit = registry.filter((r) => r.key === key && (!id || r.def.id === id))
    return hit.length ? hit[hit.length - 1] : null
  }

  /* 模拟宿主给 slot 注入的 standardProps（shell.overlay 的真实 standardProps 里就有 useSessions） */
  function overlayProps(extra) {
    return Object.assign({ t: makeT(), useSessions: options.useSessions }, extra || {})
  }

  function makeT() {
    const dict = (dictionaries['agents-pixe'] || {})[options.lang || 'zh'] || {}
    return function (key, vars) {
      let s = dict[key] !== undefined ? dict[key] : key
      if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(String(vars[k])) })
      return s
    }
  }

  return {
    exports, mini, sandbox, registry, fetchCalls, store, dictionaries, src: code,
    React: mini.React,
    t: makeT(),
    effectCount,
    slot,
    overlay: () => slot('shell.overlay', 'agents-pixe-office'),
    mountOverlay(extraProps) {
      const s = slot('shell.overlay', 'agents-pixe-office')
      if (!s) throw new Error('浮层没注册进 shell.overlay（注册表：' + registry.map((r) => r.key + '#' + r.def.id).join(', ') + '）')
      return mini.mount(mini.React.createElement(s.component, overlayProps(extraProps)))
    },
  }
}
