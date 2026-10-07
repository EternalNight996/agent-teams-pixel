// 交付产物（lib/client.js）的**真加载**门禁。
//
// 为什么需要它：其它 bundle 测试都是「grep 字符串」。字符串还在，不代表产物能跑。
// 构建期的注释剥离一旦把某个字符串/正则切坏，产物会是「语法通过、行为错误」，
// node --check 与字符串 grep 都抓不到。这里把 bundle 真跑一遍：
//   ① 模块必须要被 __ModuleLoader__ 收走（id 正确）；
//   ② factory 必须返回一个带 apply / inject 的模块对象。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function makeReact() {
  const noop = () => {}
  const hook = (initial) => [typeof initial === 'function' ? initial() : initial, noop]
  return {
    createElement: function () { return { type: arguments[0], props: arguments[1] || {} } },
    Fragment: 'Fragment',
    useState: hook,
    useRef: (v) => ({ current: v }),
    useEffect: noop,
    useLayoutEffect: noop,
    useCallback: (fn) => fn,
    useMemo: (fn) => (typeof fn === 'function' ? fn() : undefined),
    useSyncExternalStore: (sub, get) => get(),
    Component: function () {},
    PureComponent: function () {},
    memo: (c) => c,
  }
}

function loadBundle() {
  const src = readFileSync('lib/client.js', 'utf8')
  let captured = null
  const store = new Map()

  globalThis.window = {
    __ModuleLoader__: { load: (def) => { captured = def } },
    innerWidth: 1280,
    innerHeight: 800,
    devicePixelRatio: 1,
    addEventListener() {},
    removeEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', pointerEvents: 'auto' }),
    HTMLTextAreaElement: function () {},
    localStorage: null,
  }
  globalThis.document = {
    hidden: false,
    addEventListener() {},
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {} }),
    activeElement: null,
    body: { appendChild() {} },
  }
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  }
  globalThis.window.localStorage = globalThis.localStorage
  globalThis.fetch = () => Promise.resolve({ json: () => Promise.resolve({ ok: true, data: { zh: { divisions: {}, roles: [] }, en: { divisions: {}, roles: [] } } }) })
  globalThis.requestAnimationFrame = () => 0
  globalThis.cancelAnimationFrame = () => {}
  globalThis.setTimeout = globalThis.setTimeout
  if (!globalThis.performance) globalThis.performance = { now: () => 0 }

  // eslint-disable-next-line no-new-func
  new Function(src)()
  assert.ok(captured, 'bundle 没有被 window.__ModuleLoader__.load 收走')
  assert.equal(captured.id, 'agent-teams-pixel', 'bundle id 必须与包名一致')
  assert.equal(typeof captured.factory, 'function', 'bundle 必须提供 factory')
  return captured.factory((name) => (name === 'react' ? makeReact() : {}))
}

test('bundle 真加载：能被 ModuleLoader 收走，并导出 apply / inject', () => {
  const mod = loadBundle()
  assert.equal(typeof mod.apply, 'function', 'apply 必须是函数（否则客户端半边整块不挂载）')
  assert.deepEqual([...mod.inject], ['slots', 'locale'], 'inject 必须只声明本机真实存在的服务')
})

test('bundle 真加载：模块级代码不抛（注释剥离若切坏字符串会在这里炸）', () => {
  /* loadBundle 内部已经把整个 bundle 跑了一遍：ROLES_STORE 初始化、配置镜像、
   * 各种 store 的 localStorage 读取都执行了。能走到这里就说明模块级没有崩。 */
  const mod = loadBundle()
  assert.ok(mod && typeof mod === 'object')
})
