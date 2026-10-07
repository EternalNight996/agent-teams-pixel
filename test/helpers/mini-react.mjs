// 迷你 React：只实现本插件用到的那部分（函数组件 + 这几个钩子），
// 目的是在 Node 里**真的把浮窗渲染出来并真的点它** ——
// 正则断言永远抓不到「点了没反应」这类状态机 bug，这个测试台就是为了补那一刀。
//
// 不追求 React 的全部语义，只保证：钩子按调用顺序稳定、setState 触发重渲染、
// effect 按依赖变化执行、返回一棵可遍历的纯对象树（不碰 DOM）。

export function createReact() {
  let cur = null                 // { frame, idx }
  const frames = new Map()       // path -> { hooks: [], effects: [] }
  let queue = []
  let dirty = false
  let errors = []

  function frameOf(path) {
    let f = frames.get(path)
    if (!f) { f = { hooks: [], effects: [] }; frames.set(path, f) }
    return f
  }
  function markDirty() { dirty = true }
  function sameDeps(a, b) {
    if (!a || !b || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return false
    return true
  }

  const React = {
    Fragment: Symbol('Fragment'),
    createElement(type, props) {
      const children = []
      for (let i = 2; i < arguments.length; i++) children.push(arguments[i])
      return { __el: true, type: type, props: props || {}, children: children }
    },
    useState(initial) {
      const f = cur.frame, i = cur.idx++
      if (f.hooks.length <= i) f.hooks[i] = typeof initial === 'function' ? initial() : initial
      const set = function (v) {
        const next = typeof v === 'function' ? v(f.hooks[i]) : v
        if (!Object.is(next, f.hooks[i])) { f.hooks[i] = next; markDirty() }
      }
      return [f.hooks[i], set]
    },
    useRef(initial) {
      const f = cur.frame, i = cur.idx++
      if (f.hooks.length <= i) f.hooks[i] = { current: initial }
      return f.hooks[i]
    },
    useMemo(fn, deps) {
      const f = cur.frame, i = cur.idx++
      const rec = f.hooks[i]
      if (!rec || !sameDeps(rec.deps, deps)) f.hooks[i] = { deps: deps, v: fn() }
      return f.hooks[i].v
    },
    useCallback(fn, deps) { return React.useMemo(function () { return fn }, deps) },
    useEffect(fn, deps) { queueEffect(fn, deps) },
    useLayoutEffect(fn, deps) { queueEffect(fn, deps) },
    useSyncExternalStore(subscribe, getSnapshot) {
      const pair = React.useState(getSnapshot())
      React.useEffect(function () {
        const sync = function () { pair[1](getSnapshot()) }
        let un = function () {}
        try { un = subscribe(sync) || (function () {}) } catch (e) { errors.push(e) }
        sync()   // 渲染与订阅之间可能已经变过
        return function () { try { un() } catch (e) {} }
      }, [subscribe, getSnapshot])
      return pair[0]
    },
  }

  function queueEffect(fn, deps) {
    const f = cur.frame, i = cur.idx++
    const rec = f.effects[i] || (f.effects[i] = { deps: null, cleanup: null, ran: false })
    if (rec.ran && sameDeps(rec.deps, deps)) return
    rec.deps = deps
    queue.push(function () {
      rec.ran = true
      if (typeof rec.cleanup === 'function') { try { rec.cleanup() } catch (e) {} }
      const c = fn()
      if (typeof c === 'function') rec.cleanup = c
    })
  }

  function renderNode(node, path) {
    if (node === null || node === undefined || node === false || node === true || node === '') return null
    if (typeof node === 'string' || typeof node === 'number') return { kind: 'text', text: String(node) }
    if (Array.isArray(node)) {
      const out = []
      node.forEach(function (c, i) { const r = renderNode(c, path + '#' + i); if (r) out.push(r) })
      return out
    }
    if (!node.__el) return null
    const type = node.type, props = node.props, children = node.children
    if (typeof type === 'function') {
      const prev = cur
      cur = { frame: frameOf(path), idx: 0 }
      let result
      try { result = type(Object.assign({}, props, children.length ? { children: children } : null)) }
      finally { cur = prev }
      return renderNode(result, path)
    }
    if (typeof type === 'symbol') {
      const out = []
      children.forEach(function (c, i) { const r = renderNode(c, path + '#' + i); if (r) out.push(r) })
      return out
    }
    const kids = []
    children.forEach(function (c, i) { const r = renderNode(c, path + '#' + i); if (r) kids.push(r) })
    return { kind: 'host', type: type, props: props, children: kids }
  }

  return {
    React: React,
    /* 挂载一棵树；返回操作句柄（每次 setState/事件后自动重跑渲染与 effect） */
    mount(element) {
      let tree = null
      function pass() {
        let guard = 0
        do {
          dirty = false
          queue = []
          errors = []
          tree = renderNode(element, 'root')
          const q = queue
          queue = []
          q.forEach(function (f) { try { f() } catch (e) { errors.push(e) } })
          guard++
        } while (dirty && guard < 80)
        if (guard >= 80) throw new Error('渲染未收敛（可能是 setState 无限循环）')
        return tree
      }
      pass()
      function all(pred) {
        const out = []
        const walk = function (n) {
          if (!n) return
          if (Array.isArray(n)) { n.forEach(walk); return }
          if (pred(n)) out.push(n)
          if (n.children) n.children.forEach(walk)
        }
        walk(tree)
        return out
      }
      function textOf(n) {
        let s = ''
        const walk = function (x) {
          if (!x) return
          if (Array.isArray(x)) { x.forEach(walk); return }
          if (x.kind === 'text') s += x.text
          if (x.children) x.children.forEach(walk)
        }
        walk(n || tree)
        return s
      }
      const api = {
        get tree() { return tree },
        get errors() { return errors },
        rerender() { return pass() },
        all: all,
        text: textOf,
        /* 按可见文字找元素（默认找最内层那个） */
        byText(s, kind) {
          const list = all(function (n) { return (!kind || n.kind === kind || n.type === kind) && textOf(n).indexOf(s) >= 0 })
          return list.length ? list[list.length - 1] : null
        },
        buttons() { return all(function (n) { return n.kind === 'host' && n.type === 'button' }) },
        button(s) {
          const list = api.buttons().filter(function (b) { return textOf(b).indexOf(s) >= 0 })
          if (!list.length) throw new Error('找不到按钮：' + s + '（现有：' + api.buttons().map(textOf).join(' | ') + '）')
          return list[0]
        },
        click(node) {
          const el = typeof node === 'string' ? api.button(node) : node
          const h = el && el.props && el.props.onClick
          if (typeof h !== 'function') throw new Error('该元素没有 onClick（' + (el ? el.type : 'null') + '）')
          h({ preventDefault() {}, stopPropagation() {}, button: 0, clientX: 0, clientY: 0, key: 'Enter' })
          pass()
          return api
        },
        change(node, value) {
          const h = node && node.props && node.props.onChange
          if (typeof h !== 'function') throw new Error('该元素没有 onChange')
          h({ target: { value: value } })
          pass()
          return api
        },
      }
      return api
    },
  }
}
