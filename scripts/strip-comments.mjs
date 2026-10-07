// 构建期注释剥离 + 行首缩进压缩（状态机实现，不是正则）。
//
// 为什么单独成模块：剥离器一旦切错（把字符串里的 // 当注释、把正则当除号），
// 产物是**语法通过、行为错误**的，最难查。所以它必须能被单独测试。
//
// 三条安全设计：
//   ① 原样保留所有换行 → 剥离后报错行号与源码一致，堆栈还能对着源码看；
//   ② 逐字符推进，字符串 / 模板 / 正则各自在自己的状态里整体复制，绝不解析其内容；
//   ③ 只压**行首缩进**（行首的空白），不压行内空白、不删换行 —— 换行是 ASI 的判据，
//      动了它就可能悄悄改变语义；缩进不是。
export function stripComments(src) {
  const s = String(src)
  const n = s.length
  let out = ''
  let i = 0
  let state = 'code'          // code | line | block | squote | dquote | template | regex
  let tailBuf = ''            // 最近 16 个非空白代码字符（区分正则与除号，并识别 return 之类的关键字）
  let lineStart = true        // 是否处于「行首空白可压」的位置

  const REGEX_OK_AFTER = /[([{,;:=!&|?+\-*%~^<>]/
  function pushCode(ch) { if (!/\s/.test(ch)) tailBuf = (tailBuf + ch).slice(-16) }
  function regexAllowed() {
    if (tailBuf === '') return true
    const last = tailBuf[tailBuf.length - 1]
    if (REGEX_OK_AFTER.test(last)) return true
    /* 关键字后也可以跟正则：return /re/ 、typeof /re/ 、case /re/ 等。
     * 只留一个字符的判定做不到这件事。 */
    return /(?:^|[^\w$])(return|typeof|instanceof|in|of|new|delete|void|do|else|case|yield|await)$/.test(tailBuf)
  }

  while (i < n) {
    const c = s[i]
    const c2 = i + 1 < n ? s[i + 1] : ''

    if (state === 'code') {
      if (lineStart && (c === ' ' || c === '\t')) { i++; continue }   // 行首缩进：丢掉
      if (c === '/' && c2 === '/') { state = 'line'; i += 2; continue }
      if (c === '/' && c2 === '*') { state = 'block'; i += 2; continue }
      if (c === "'") { state = 'squote'; out += c; lineStart = false; i++; continue }
      if (c === '"') { state = 'dquote'; out += c; lineStart = false; i++; continue }
      if (c === '`') { state = 'template'; out += c; lineStart = false; i++; continue }
      if (c === '/' && regexAllowed()) { state = 'regex'; out += c; lineStart = false; i++; continue }
      if (c === '\n') { out += c; lineStart = true; i++; continue }   // 换行原样保留：行号与 ASI 都不变
      out += c
      pushCode(c)
      lineStart = false
      i++
      continue
    }

    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += c; tailBuf = ''; lineStart = true }
      i++
      continue
    }

    if (state === 'block') {
      if (c === '*' && c2 === '/') { state = 'code'; i += 2; continue }
      if (c === '\n') { out += c; lineStart = true }   // 保换行：行号不变（块注释内的换行也保留）
      i++
      continue
    }

    // 字符串 / 模板 / 正则：整体复制，尊重转义
    if (state === 'squote' || state === 'dquote' || state === 'template' || state === 'regex') {
      const quote = state === 'squote' ? "'" : state === 'dquote' ? '"' : state === 'template' ? '`' : '/'
      if (c === '\\') { out += c + c2; i += 2; continue }
      if (c === quote) {
        out += c; i++
        state = 'code'
        lineStart = false                          // 刚闭合了一个字面量：此刻在行中，不是行首
        pushCode(quote === '/' ? '(' : 'x')    // 字面量结束后不可能紧跟另一个字面量
        continue
      }
      if (c === '\n' && state !== 'template') {  // 普通字符串不跨行：容错退出，避免一个笔误吞掉整个文件
        state = 'code'; out += c; i++; tailBuf = ''; lineStart = true
        continue
      }
      out += c; i++
      continue
    }

    out += c; i++   // 不可达兜底
  }
  return out
}
