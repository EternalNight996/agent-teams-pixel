// 渲染循环 + host 持久化的 silent failure 兜底：
//   1. OfficeCanvas 60fps render 必须包 try/catch + RAF 调度移出渲染体（throw 不停 raf）
//   2. host 关键持久化路径（readPersist / writePersist / loadCustomRoles）的 catch 必须
//      console.error 暴露根因，不再静默吞
//
// 这些都是为了避免再次出现"小人卡死 / 内容丢失但不报错"的局面。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const clientSrc = readFileSync('src/client.main.js', 'utf8')
const hostSrc = readFileSync('lib/index.js', 'utf8')

test('OfficeCanvas 必须有 paint 调度器包 try/catch 包 renderFrame（不能让 renderFrame 的 throw 停 raf）', () => {
  // paint / renderFrame 调度分离：paint 外层调度 RAF + try/catch
  assert.match(clientSrc, /function\s+paint\s*\(\)\s*\{[\s\S]*?requestAnimationFrame\(paint\)/,
    'paint 函数必须自己调度 RAF（且放在 try/catch 外，让 throw 不停调度）')
  // paint 里有 try/catch 包 render 调用
  assert.match(clientSrc, /paint\s*\(\)\s*\{[\s\S]*?try\s*\{\s*render\(/,
    'paint 必须 try { render(...) } catch')
  // catch 里 console.error 暴露 stack + 单色降级背景
  assert.match(clientSrc, /catch\s*\(e\)\s*\{[\s\S]*?console\.error\([\s\S]*?e\.stack[\s\S]*?fillStyle\s*=\s*['"]#/,
    'paint 的 catch 必须 console.error 暴露 stack 并降级为单色背景（fillStyle #...）')
  // render 内部不再自带 raf = requestAnimationFrame(render)（否则 paint 调度会被覆盖、且 throw 后这行不执行 → raf 停）
  const renderStart = clientSrc.indexOf('function render(now)')
  const renderEnd = clientSrc.indexOf('\n    }\n', renderStart)
  const renderBody = clientSrc.slice(renderStart, renderEnd)
  assert.equal(
    /raf\s*=\s*requestAnimationFrame\(\s*render\s*\)/.test(renderBody),
    false,
    'render 内部不能再有 raf = requestAnimationFrame(render)（调度权交给 paint）'
  )
})

test('render 抛错时不能停 raf —— paint 的 raf 调度必须在 try/catch 外', () => {
  // paint 的结构必须是: raf=0 → try{render()}catch{...} → raf=requestAnimationFrame(paint)
  // 即 raf = requestAnimationFrame(paint) 在 try/catch 块之后（paint 函数尾部）
  const paintStart = clientSrc.indexOf('function paint()')
  const paintEnd = clientSrc.indexOf('\n    }\n', paintStart)
  const paintBody = clientSrc.slice(paintStart, paintEnd)
  // raf 调度必须在 try/catch 之后（最后一行的 raf=requestAnimationFrame(paint)）
  const tryEnd = paintBody.indexOf('catch (e)')
  const rafLine = paintBody.lastIndexOf('raf = requestAnimationFrame(paint)')
  assert.ok(rafLine > tryEnd, 'raf = requestAnimationFrame(paint) 必须在 try/catch 之后，否则 throw 后这一行不执行、raf 永远停')
})

test('client LOCALE_SVC.register 抛错必须 console.error（键集校验失败时也能定位）', () => {
  // find the locale.register call and assert the catch has console.error (not empty catch)
  const m = clientSrc.match(/LOCALE_SVC\.register\(\s*LOCALE_NS\s*,\s*LOCALE\s*\)\s*;?[\s\S]*?catch\s*\(\s*e\s*\)\s*\{([\s\S]*?)\}/);
  assert.ok(m, '找不到 LOCALE_SVC.register(LOCALE_NS, LOCALE) 的 catch 块')
  assert.match(m[1], /console\.error/, 'locale.register catch 必须 console.error 暴露根因（之前是 catch {} 静默吞）')
})

test('host 关键持久化路径必须 console.error 暴露根因', () => {
  // readPersist / writePersist / loadCustomRoles 都得 console.error
  assert.match(hostSrc, /function\s+readPersist\s*\(\)\s*\{[\s\S]*?JSON\.parse[\s\S]*?catch\s*\(e\)\s*\{[\s\S]*?console\.error/,
    'readPersist catch 必须 console.error 暴露根因（之前是 catch { return {} } 静默吞）')
  assert.match(hostSrc, /function\s+writePersist\s*\(\s*data\s*\)\s*\{[\s\S]*?catch\s*\(e\)\s*\{[\s\S]*?console\.error/,
    'writePersist catch 必须 console.error 暴露根因（之前是 catch {} 静默吞）')
  assert.match(hostSrc, /function\s+loadCustomRoles\s*\(\)\s*\{[\s\S]*?JSON\.parse[\s\S]*?catch\s*\(e\)\s*\{[\s\S]*?console\.error/,
    'loadCustomRoles catch 必须 console.error 暴露根因（之前是 catch { return [] } 静默吞）')
})

test('host 反向断言：关键路径的外层 catch(e) 不能是空的', () => {
  // 只检查外层错误捕获（catch(e){...}）—— 内层兜 console.error 的 catch(_) 是合法的（不能让 console.error throw 把整个写盘崩了）。
  function fnBody(src, fn) {
    const i = src.indexOf('function ' + fn);
    if (i < 0) return '';
    let depth = 0, end = -1, j = src.indexOf('{', i);
    for (; j < src.length; j++) {
      const c = src[j];
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { end = j; break } }
    }
    return src.slice(i, end + 1);
  }
  for (const fn of ['readPersist', 'writePersist', 'loadCustomRoles']) {
    const body = fnBody(hostSrc, fn);
    assert.ok(body, `找不到 ${fn} 函数体`)
    // 只匹配外层 catch (e) { } —— 内层 catch (_) {} 是合法的 console.error 兜底
    assert.equal(
      /catch\s*\(\s*e\s*\)\s*\{\s*\}/.test(body),
      false,
      `${fn} 的外层 catch(e){} 是空的 —— 真实错误会被静默吞，console.error 必须暴露根因`
    )
  }
})
