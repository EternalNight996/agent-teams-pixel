// 防 silent failure 回归：slot 注册链任何抛错必须能在 F12 控制台看到。
//
// 历史教训：DSH 的 slots.inject 回调 throw 会被静默吞，slot 整条丢失但不报错。
// 这个文件卡死 apply() 里所有 slots.inject 必须走 safeSlotInject 兜底，
// 以及所有 silent try/catch 必须 console.warn/error 暴露根因。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync('src/client.main.js', 'utf8')

test('apply() 里的所有 slots.inject 必须走 safeSlotInject 兜底', () => {
  // 抓出所有 slots.inject 调用，逐一确认它们的 callback 参数是 safeSlotInject(...) 调用
  const injects = [...src.matchAll(/(?:scoped\.)?slots\.inject\(\s*'([^']+)'\s*,\s*([\s\S]*?)\n\s*\)\s*;?/g)]
  assert.ok(injects.length >= 3, 'apply() 至少要给 conversation.view / shell.overlay / settings.section 各 inject 一次')
  for (const m of injects) {
    const slotKey = m[1]
    const callback = m[2].trim()
    assert.ok(/^safeSlotInject\(\s*'/.test(callback) || /^function\s*\(\)\s*\{\s*try\s*\{[\s\S]*?\}[\s\S]*?catch/.test(callback),
      `slots.inject('${slotKey}', ...) 必须走 safeSlotInject 兜底，或 callback 自身包 try/catch；当前 callback 起始：${callback.slice(0, 80)}`)
  }
})

test('safeLabel / safeInject / safeSlotInject 必须存在并 console.warn/error 暴露根因', () => {
  assert.match(src, /function\s+safeLabel\s*\(/, '缺 safeLabel')
  assert.match(src, /function\s+safeInject\s*\(/, '缺 safeInject')
  assert.match(src, /function\s+safeSlotInject\s*\(/, '缺 safeSlotInject')

  // safeLabel catch 必须 console.warn
  const safeLabelBody = src.match(/function\s+safeLabel\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(safeLabelBody, 'safeLabel 函数体没找到')
  assert.match(safeLabelBody[1], /console\.warn/, 'safeLabel 失败必须 console.warn 暴露 key 与错误，不能静默')

  // safeInject catch 必须 console.warn
  const safeInjectBody = src.match(/function\s+safeInject\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/)
  assert.ok(safeInjectBody, 'safeInject 函数体没找到')
  assert.match(safeInjectBody[1], /console\.warn/, 'safeInject 失败必须 console.warn 暴露错误')

  // safeSlotInject catch 必须 console.error + 包含完整 stack
  const safeSlotInjectBody = src.match(/function\s+safeSlotInject\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\}\s*\n/);
  assert.ok(safeSlotInjectBody, 'safeSlotInject 函数体没找到')
  assert.match(safeSlotInjectBody[1], /console\.error/, 'safeSlotInject 失败必须 console.error 暴露 slot key')
  assert.match(safeSlotInjectBody[1], /e\.stack\s*\|\|\s*e\.message/, 'safeSlotInject 必须打印完整 stack，否则 F12 看不到根因')
})

test('settings.section catch 必须 console.error 暴露根因（不能 console.warn 降级）', () => {
  // 找 apply() 末尾的 try/catch 块
  const tail = src.match(/try\s*\{[\s\S]*?var\s+pixeScope[\s\S]*?\}\s*catch\s*\(e\)\s*\{([\s\S]*?)\n\s*\}\s*\n\s*\}[\s\S]*?$/);
  if (tail) {
    assert.match(tail[1], /console\.error/, 'settings catch 必须 console.error（关键路径，降级 console.warn 会让用户忽略）')
  }
})

test('writeLang localStorage 写入失败必须 console.warn', () => {
  // 之前是静默 try/catch；现在必须把失败暴露
  const writeLang = src.match(/var\s+writeLang\s*=\s*function\s*\(\)\s*\{([\s\S]*?)\n\s*\}\s*;/);
  assert.ok(writeLang, 'writeLang 函数体没找到')
  assert.match(writeLang[1], /console\.warn/, 'writeLang 失败必须 console.warn 不能再静默')
})
