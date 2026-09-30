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
    /* inject 是**硬依赖**：任一服务不存在，cordis 就永远不会调用 apply()，
     * 表现是「页签 + 浮层 + 设置分区整块静默消失」（无报错、F12 也无线索）。
     * dsh 0.2.0-rc.2 的客户端服务目录只有：layout / locale / sessions / slots / theme / timer / uiWorkspace / workspaces。
     * 历史坑：旧版本声明过 'settingsScope'，而该客户端服务在新版已不存在 → 客户端半边长期装死。
     * 这里只声明确实存在且启动期必需的两个；其余一律用 ctx.get() 容错读取（缺服务只降级）。 */
    exports.inject = ['slots', 'locale'];
    return module.exports;
  }
});
`

const bundle = prelude + '\n' + main + '\n' + tail
mkdirSync(join(root, 'lib'), { recursive: true })
writeFileSync(join(root, 'lib', 'client.js'), bundle)
console.log(`built lib/client.js (${(bundle.length / 1024).toFixed(1)} KB)`)
