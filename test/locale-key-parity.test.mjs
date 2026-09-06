// 校验 src/client.main.js 里 LOCALE.zh 与 LOCALE.en 的键完全一致。
// 任何缺失都会让 ctx.locale.register 抛键集校验错，所以提前拦截。
import { readFileSync } from 'node:fs'

const src = readFileSync('src/client.main.js', 'utf8')
const startZh = src.indexOf('zh: {')
const startEn = src.indexOf('en: {')
function extract(start) {
  const bodyStart = src.indexOf('{', start)
  let depth = 0, end = -1
  for (let i = bodyStart; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  return src.slice(bodyStart + 1, end)
}
const zhBody = extract(startZh)
const enBody = extract(startEn)
const reKey = /'([\w.\-]+)'\s*:/g
function keys(body) { const out = []; let m; while ((m = reKey.exec(body))) out.push(m[1]); return out }
const zhKeys = new Set(keys(zhBody))
const enKeys = new Set(keys(enBody))
const missingInEn = [...zhKeys].filter(k => !enKeys.has(k))
const missingInZh = [...enKeys].filter(k => !zhKeys.has(k))
const out = { zh: zhKeys.size, en: enKeys.size, missingInEn, missingInZh }
console.log(JSON.stringify(out, null, 2))
if (missingInEn.length || missingInZh.length) process.exit(1)
