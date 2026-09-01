/**
 * Browser client bundle for agent-teams-pixel. Mirrors the protocol used by
 * `@nanmicoder/dsh-agent-teams` (CJS closure-factory artifact registered via
 * `window.__ModuleLoader__.load`). The bundle id is the package name itself;
 * reading it from package.json at build time keeps the wire registration
 * stable across renames.
 *
 * Purity gate: every other `@deepseek-ai` value import is rejected, because
 * cross-plugin value imports would either inline a duplicate runtime or
 * require a specifier the frozen module table cannot answer. Collaborate
 * through cordis services; type-only imports are erased and never reach this
 * gate.
 */
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, resolve as resolvePath, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'
import { defineConfig, type UserConfig } from 'tsdown'

const PLATFORM_MODULES = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]

const PRELOADED_CLIENT_EXTERNALS: string[] = []

const CLIENT_EXTERNALS: readonly string[] = [
  ...PLATFORM_MODULES,
  ...PRELOADED_CLIENT_EXTERNALS,
  // Peer services our client imports type-only or runtime; never inline.
  '@deepseek-ai/dsh-api-session-controller/client',
  '@deepseek-ai/dsh-client-ui-settings/client',
  '@deepseek-ai/dsh-client-ui-settings-plugins/client',
  '@deepseek-ai/dsh-client-store',
]

const INLINE_SAFE = /^@deepseek-ai\/dsh-(session|llm|tools|brand)(\/|$)/
const VENDORED_LIBRARY = /^@deepseek-ai\/(cosmokit|schemastery)(\/|$)/
const GENERATED_REMOTE = /^@deepseek-ai\/dsh-[a-z0-9]+(?:-[a-z0-9]+)*\/remote$/

const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

const PLUGIN_ID: string = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
).name

const config: UserConfig = {
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'lib/client/index.js' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: (id: string) => CLIENT_EXTERNALS.includes(id),
    alwaysBundle: (id: string) => !CLIENT_EXTERNALS.includes(id),
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  plugins: [{
    name: 'dsh-client-bundle-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (CLIENT_EXTERNALS.includes(source)) return null
      if (VENDORED_LIBRARY.test(source)) return null
      if (INLINE_SAFE.test(source) || GENERATED_REMOTE.test(source)) return null
      throw new Error(
        `client bundle purity: "${source}" is not a platform module (CLIENT_EXTERNALS), an inline-safe wire layer, or a generated /remote contribution — `
        + 'cross-plugin value imports are forbidden; collaborate through cordis services (type-only imports are erased and never reach this gate)',
      )
    },
  }, {
    name: 'dsh-css-modules-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      const abs = importer !== undefined ? sourceAssetPath(source, importer) : source
      return CSS_VIRTUAL_PREFIX + abs + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      this.addWatchFile(fileId)
      const source = readFileSync(fileId)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: source,
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      const sorted = Object.entries(cssExports ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      for (const [local, exp] of sorted) classMap[local] = exp.name
      return [
        `const css = ${JSON.stringify(code.toString())};`,
        `const tagId = ${JSON.stringify(`${PLUGIN_ID}/${basename(fileId)}`)};`,
        'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
        '  const tag = document.createElement(\'style\');',
        `  tag.dataset.plugin = ${JSON.stringify(PLUGIN_ID)};`,
        '  tag.dataset.pluginCss = tagId;',
        '  tag.textContent = css;',
        '  document.head.appendChild(tag);',
        '}',
        `export default ${JSON.stringify(classMap)};`,
      ].join('\n')
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

function sourceAssetPath(source: string, importer: string): string {
  const emitted = resolvePath(dirname(importer), source)
  if (existsSync(emitted)) return emitted
  const marker = `${sep}lib${sep}`
  const srcIndex = emitted.indexOf(marker)
  if (srcIndex !== -1) {
    const srcPath = `${emitted.slice(0, srcIndex)}${sep}src${sep}${emitted.slice(srcIndex + marker.length)}`
    if (existsSync(srcPath)) return srcPath
  }
  return source
}

export default config