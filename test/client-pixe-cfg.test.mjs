// useSyncExternalStore getSnapshot 必须返回稳定引用 —— 否则 React 抛 "infinite loop"，
// OfficeOverlay 整层被错误边界吞掉，浮层不可见。
//
// 历史教训：readPixeCfg() 在 PIXE_SCOPE 为 null 时返回 `{}`（新对象），
// 连续调用产生不同引用 → 浮层消失。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync('src/client.main.js', 'utf8')

test('readPixeCfg 用了模块级空对象做 fallback（不让每次返回新对象）', () => {
  // 必须有 var _EMPTY_PIXE_CFG = {} 这种模块级常量
  assert.match(src, /var\s+_EMPTY_PIXE_CFG\s*=\s*\{\s*\}/, '缺 var _EMPTY_PIXE_CFG = {}（否则每次 fallback 返回新对象触发无限循环）')
})

test('readPixeCfg 的 fallback 路径必须 return _EMPTY_PIXE_CFG（不是字面 {}）', () => {
  // 把 readPixeCfg 函数体抠出来，检查最后一行 return 的是 _EMPTY_PIXE_CFG
  const m = src.match(/function\s+readPixeCfg\s*\(\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(m, '找不到 readPixeCfg 函数体')
  assert.match(m[1], /return\s+_EMPTY_PIXE_CFG\s*;?[\s\S]*$/, 'readPixeCfg 的 fallback 路径必须返回模块级常量 _EMPTY_PIXE_CFG，不能是 return {}')
  // 反向断言：不能出现 `return {};`（带分号）或 `return {}` 单独成行
  assert.equal(/\breturn\s+\{\s*\}\s*;?\s*$/.test(m[1].trim().split('\n').pop()), false,
    'readPixeCfg 末尾出现 return {} —— 会让 useSyncExternalStore 无限循环')
})

test('usePixeCfg 通过 useSyncExternalStore 订阅，且 PIXE_SCOPE 不可用时不抛', () => {
  assert.match(src, /React\.useSyncExternalStore\(/, '缺 useSyncExternalStore 调用')
  // subscribe 在 PIXE_SCOPE 不可用时必须返回 no-op 函数，不抛
  const subRe = /function\s*\(cb\)\s*\{\s*return\s*\(PIXE_SCOPE\s*&&\s*typeof\s*PIXE_SCOPE\.subscribe\s*===\s*'function'\)\s*\?\s*PIXE_SCOPE\.subscribe\(cb\)\s*:\s*function\s*\(\)\s*\{\s*\}\s*;/
  assert.match(src, subRe, 'usePixeCfg 的 subscribe 必须有 PIXE_SCOPE 不可用时的 no-op 兜底')
})
