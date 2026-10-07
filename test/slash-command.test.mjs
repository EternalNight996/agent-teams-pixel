// `/teams` 斜杠命令的注册契约门禁。
//
// 背景：宿主 `commands.register(definition)` 的 CommandDefinition 里 `handler` 是**必填**，
// 而此前只填了 name/description。不填的后果是「命令不出现」或「register 抛错被 catch 吞掉」，
// 两种都只表现为「打了斜杠没反应」，最难排查。这里把契约钉死。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const hostSrc = readFileSync('lib/index.js', 'utf8')

test('/teams 命令注册：必填字段齐全（name / description / handler）', () => {
  const m = hostSrc.match(/cmds\.register\(\{[\s\S]*?\n\s*\}\)/)
  assert.ok(m, '找不到 cmds.register 调用')
  const def = m[0]
  assert.match(def, /name: 'teams'/, '命令名必须是 teams')
  assert.match(def, /description: '[^']+'/, '缺 description（斜杠菜单要显示它）')
  assert.match(def, /handler:\s*\([^)]*\)\s*=>/, '缺 handler：CommandDefinition 的必填字段，之前就是缺它')
})

test('/teams 命令：recordInput 打开、input.hint 存在（否则等于没接上模型）', () => {
  const m = hostSrc.match(/cmds\.register\(\{[\s\S]*?\n\s*\}\)/)
  const def = m[0]
  assert.match(def, /recordInput: true/, 'recordInput 必须为 true：这一行要靠原文进会话记录，模型才知道目标')
  assert.match(def, /input: \{ hint: '[^']+' \}/, '缺 input.hint：斜杠菜单里没有输入提示')
})

test('/teams 命令：handler 不回 text（原文已作为用户消息可见，再回文字就是重复一行）', () => {
  const m = hostSrc.match(/cmds\.register\(\{[\s\S]*?\n\s*\}\)/)
  const def = m[0]
  assert.match(def, /handler:\s*\(\)\s*=>\s*\(\{\s*kind:\s*'success'\s*\}\)/, 'handler 应是 () => ({ kind: \'success\' })，不带 text')
  assert.equal(/handler:[\s\S]{0,80}text:/.test(def), false, 'handler 不应返回 text')
})

test('/teams 命令：注册失败要留痕（console.warn + disposeCmd 置空），不静默', () => {
  assert.match(hostSrc, /console\.warn\('\[agents-pixe\] 注册 \/teams 斜杠命令失败/, '注册失败必须 console.warn 暴露根因')
  assert.match(hostSrc, /catch \(e\) \{[\s\S]{0,200}disposeCmd = null/, '注册失败后 disposeCmd 必须置空，避免留下半残状态')
  assert.match(hostSrc, /if \(disposeCmd\) \{ try \{ disposeCmd\(\) \} catch \(_\) \{\} disposeCmd = null \}/, '重注册前必须先释放旧命令')
})
