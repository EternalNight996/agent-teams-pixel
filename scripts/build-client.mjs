// 把 prelude + main 拼成可发布的 lib/client.js（无需构建工具）。
// 注意：角色精简清单**不再注入** bundle —— 它改为运行时向宿主
// `GET /agents-pixe/roles/index` 拉取 + localStorage 版本化缓存（原先占 160 KB / 包体 46%）。
// 用法：node scripts/build-client.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const prelude = readFileSync(join(root, 'src', 'client.prelude.js'), 'utf8')
const main = readFileSync(join(root, 'src', 'client.main.js'), 'utf8')

const tail = `
    exports.apply = apply;
    exports.inject = ['settingsScope', 'slots', 'locale'];
    return module.exports;
  }
});
`

const bundle = prelude + '\n' + main + '\n' + tail
mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib', 'client.js'), bundle)
console.log(`built lib/client.js (${(bundle.length / 1024).toFixed(1)} KB)`)
