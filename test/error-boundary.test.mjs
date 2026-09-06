// 剩余 silent failure 兜底：React 错误边界 + host 关键路径 console 暴露。
//
// 历史教训：
//   1. 子组件 render throw → React 错误边界默认不挂 → 整个浮层（甚至整个设置入口）消失
//      但 console 只有一行黄色 React 警告。修法：PixErrorBoundary 隔离故障 + console.error 完整 stack。
//   2. host 关键路径（listModelCatalog / createTask / step / register-err 写盘）原本 catch{}
//      静默吞，用户看到"模型目录空白 / 团队少任务 / 注册失败没线索"都没法排查。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const clientSrc = readFileSync('src/client.main.js', 'utf8')
const hostSrc = readFileSync('lib/index.js', 'utf8')

test('client PixErrorBoundary 类组件必须存在（getDerivedStateFromError + componentDidCatch）', () => {
  // PixErrorBoundary 必须用 ES6 class + 标准 React 16+ 错误边界 API
  assert.match(clientSrc, /function\s+PixErrorBoundary\s*\(/, '缺 PixErrorBoundary 构造函数')
  assert.match(clientSrc, /PixErrorBoundary\.prototype\s*=\s*Object\.create\(\s*React\.Component\.prototype/,
    'PixErrorBoundary 必须继承 React.Component（不能是 React.createClass）')
  assert.match(clientSrc, /PixErrorBoundary\.getDerivedStateFromError\s*=\s*function/,
    'PixErrorBoundary 必须有 getDerivedStateFromError（React 16+ 标准）')
  assert.match(clientSrc, /PixErrorBoundary\.prototype\.componentDidCatch\s*=\s*function/,
    'PixErrorBoundary 必须有 componentDidCatch')
  assert.match(clientSrc, /console\.error.*堆栈见下/,
    'PixErrorBoundary 必须 console.error 暴露完整 stack + componentStack')
})

test('pixBoundary 辅助函数 + OfficeOverlay 关键区域必须用 pixBoundary 包', () => {
  assert.match(clientSrc, /function\s+pixBoundary\s*\(\s*name/,
    '缺 pixBoundary(name, children) 辅助函数')
  // 三个关键子区域必须用 pixBoundary 包
  assert.match(clientSrc, /pixBoundary\(\s*['"]选人面板或办公室画布['"]/,
    '选人面板/画布 必须被 pixBoundary 包（pickerOpen ? <picker> : <canvas> 整个三元）')
  assert.match(clientSrc, /pixBoundary\(\s*['"]角色详情弹窗['"]/,
    '角色详情弹窗（renderRoleModal）必须被 pixBoundary 包')
  // 反向断言：renderRoleModal 不能直接裸露在 return 里
  const officeOverlayReturn = clientSrc.match(/function OfficeOverlay\(props\)[\s\S]*?renderRoleModal[\s\S]*?\);\s*\n\s*\}\s*\n\s*\/\* ---------- 工作角色页签/);
  assert.ok(officeOverlayReturn, '找不到 OfficeOverlay 末段')
  assert.match(officeOverlayReturn[0], /pixBoundary\(\s*['"]角色详情弹窗['"][\s\S]*?renderRoleModal/,
    'renderRoleModal 必须被 pixBoundary 包（不是裸调用）')
})

test('host listModelCatalog 必须 console.warn 单 provider 失败 + console.error listProviders 失败', () => {
  assert.match(hostSrc, /function\s+listModelCatalog[\s\S]*?listModels\([\s\S]*?catch\s*\(\s*e\s*\)\s*\{[\s\S]*?console\.warn/,
    'listModelCatalog 单 provider 失败必须 console.warn（之前是 catch {} 静默）')
  assert.match(hostSrc, /function\s+listModelCatalog[\s\S]*?listProviders[\s\S]*?catch\s*\(\s*e\s*\)\s*\{[\s\S]*?console\.error/,
    'listModelCatalog listProviders 失败必须 console.error（之前是 catch {} 静默）')
})

test('host createTask 单任务失败必须 console.warn（不让单任务失败拖垮整个编排）', () => {
  assert.match(hostSrc, /await\s+teamEngine\.createTask[\s\S]*?catch\s*\(\s*e\s*\)\s*\{[\s\S]*?console\.warn/,
    'createTask 失败必须 console.warn 暴露 subject + 错误（之前是 catch {} 静默）')
})

test('host teamEngine.step 失败必须 console.warn（核心调度失败时用户至少能看到）', () => {
  assert.match(hostSrc, /await\s+teamEngine\.step\([\s\S]*?catch\s*\(\s*e\s*\)\s*\{[\s\S]*?console\.warn/,
    'teamEngine.step 失败必须 console.warn（之前是 catch {} 静默）')
})

test('host register-err.txt 写盘失败必须 console.warn', () => {
  assert.match(hostSrc, /writeFileSync\(errPath[\s\S]*?catch\s*\(\s*we\s*\)\s*\{[\s\S]*?console\.warn/,
    'register-err.txt 写盘失败必须 console.warn（之前是 catch {} 静默，用户没任何线索）')
})
