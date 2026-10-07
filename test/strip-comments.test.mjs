// 构建期注释剥离器的行为门禁。
// 为什么值得单独测：剥离器切错时产物是「语法通过、行为错误」，线上最难查。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripComments } from '../scripts/strip-comments.mjs'

const S = stripComments

test('行注释被剥离，换行保留', () => {
  assert.equal(S('var a = 1; // hi\nvar b = 2;\n'), 'var a = 1; \nvar b = 2;\n')
})

test('字符串里的 // 与 /* */ 绝不能被当成注释', () => {
  assert.equal(S("var s = '// not a comment';\n"), "var s = '// not a comment';\n")
  assert.equal(S('var s = "/* not */";\n'), 'var s = "/* not */";\n')
  // 转义引号后紧跟 //：字符串必须整体保留
  assert.equal(S("var s = 'a\\'//b';\n"), "var s = 'a\\'//b';\n")
})

test('模板字符串整体保留（含跨行）', () => {
  assert.equal(S('var t = `a // b`;\n'), 'var t = `a // b`;\n')
  assert.equal(S('var t = `l1 /* x */\nl2`;\n'), 'var t = `l1 /* x */\nl2`;\n')
})

test('正则字面量里的 // 不被误切', () => {
  assert.equal(S('var re = /a\\/\\/b/g;\n'), 'var re = /a\\/\\/b/g;\n')
  assert.equal(S('var x = s.replace(/^\\/\\//, "");\n'), 'var x = s.replace(/^\\/\\//, "");\n')
})

test('除法不能被当成正则起点', () => {
  assert.equal(S('var x = a / b; // c\n'), 'var x = a / b; \n')
  assert.equal(S('var x = (a + b) / 2;\n'), 'var x = (a + b) / 2;\n')
})

test('关键字后的正则仍被识别（tailBuf 存在的理由）', () => {
  assert.equal(S('function f() { return /x/.test(s) } // c\n'), 'function f() { return /x/.test(s) } \n')
  assert.equal(S('var y = typeof /z/;\n'), 'var y = typeof /z/;\n')
})

test('块注释剥离但保留换行（行号不变）', () => {
  const inSrc = 'var a = 1;\n/* one\ntwo */\nvar b = 2;\n'
  const out = S(inSrc)
  assert.equal(out.split('\n').length, inSrc.split('\n').length, '行数必须不变')
  assert.ok(out.includes('var a = 1;') && out.includes('var b = 2;'), '注释外的代码不能丢')
  assert.ok(!out.includes('one') && !out.includes('two'), '块注释内容必须被剥离')
})

test('单行块注释不吞掉同一行的代码', () => {
  assert.equal(S('var a = 1; /* c */ var b = 2;\n'), 'var a = 1;  var b = 2;\n')
})

test('真实源码：行数不变、代码与中文串一字不差、体积确实变小', () => {
  const src = readFileSync('src/client.main.js', 'utf8')
  const out = S(src)
  assert.equal(out.split('\n').length, src.split('\n').length, '行号必须与源码对齐（否则堆栈对不上）')
  assert.ok(out.length < src.length * 0.95, '剥离后应至少省 5%，实际省 ' + (100 - out.length * 100 / src.length).toFixed(1) + '%')
  for (const keep of ["'tp.sum.blockedAndRunning'", 'function teamSummary(team, t)', "id: 'agents-pixe-office'", 'agents-pixe.overlay.v1']) {
    assert.ok(out.includes(keep), '剥离后丢了代码：' + keep)
  }
  assert.equal(out.includes('/* ---------- 注释剥离'), false, '源码里的块注释应被剥离')
})

test('真实 bundle：剥离后必须是可解析的 JS（交给 node --check 之外的第一道自检）', () => {
  const bundle = readFileSync('lib/client.js', 'utf8')
  assert.ok(bundle.includes('exports.inject = '), 'inject 声明必须还在')
  assert.ok(!bundle.includes('/* inject 是**硬依赖**'), '构建脚本尾部的说明注释应已被剥离')
  assert.ok(bundle.length > 1000)
})

/* ---------- 行首缩进压缩（构建期省体积的第二把刀） ---------- */

test('行首缩进被压缩：只动行首空白，换行与行内空白原样', () => {
  assert.equal(S('  var a = 1;\n  var b = 2;\n'), 'var a = 1;\nvar b = 2;\n')
  assert.equal(S('var a = 1 +  2;\n'), 'var a = 1 +  2;\n', '行内空白不得压缩')
  assert.equal(S('if (x) {\n\t\ty();\n}\n'), 'if (x) {\ny();\n}\n', 'Tab 缩进同样压')
  assert.equal(S('var a = 1; /* c\n   d */\n  var b = 2;\n'), 'var a = 1; \n\nvar b = 2;\n')
})

test('缩进压缩绝不碰字符串与模板内容（这条错了产物就是行为错误）', () => {
  const tpl = 'var s = `a\n   b`;\nvar c = 1;\n'
  assert.equal(S(tpl), tpl, '模板内容必须逐字保留（含多行与行首缩进）')
  assert.equal(S("  var s = '  x  ';\n"), "var s = '  x  ';\n")
  /* 模板闭合后仍处于行中：不得把后续代码误判成行首 */
  assert.equal(S('  var s = `a\nb` + x;\n'), 'var s = `a\nb` + x;\n')
})

test('换行总数不变（ASI 判据不受影响）', () => {
  const src = readFileSync('src/client.main.js', 'utf8')
  const out = S(src)
  assert.equal((out.match(/\n/g) || []).length, (src.match(/\n/g) || []).length, '换行数必须一致')
})

test('真实 bundle 已被压缩掉行首缩进（否则体积门禁迟早撞墙）', () => {
  const bundle = readFileSync('lib/client.js', 'utf8')
  const indented = bundle.match(/\n[ \t]{2,}\S/g) || []
  assert.equal(indented.length, 0, '产物里仍有 ' + indented.length + ' 处行首缩进：' + indented.slice(0, 3).join(' / '))
})
