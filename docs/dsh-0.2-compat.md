# DSH 更新后兼容性修复记录（0.2.0-rc.2）

> 适用版本：`agent-teams-pixel@0.2.1`（修）↔ DSH 桌面壳 `0.2.0-rc.2` / `@deepseek-ai/dsh*@0.2.0-rc.2`
> 参考实现：[`memory-eternal`](https://github.com/EternalNight996/memory-eternal)（同样经历过 DSH 版本门禁与 profile 迁移，其做法是「宽区间 peer + 显式 compatibility/permissions/lifecycle 元数据」）。

## 1. 症状

DSH 更新到 `0.2.0-rc.2` 后：

- GUI 里「工作角色」页签、对话区像素办公室浮层、`agents_pixe_*` 工具**全部消失**；
- 插件包仍在 profile 的 `dependencies` 里，但 `dsh plugin` / 插件市场装不上或激活不了；
- 终端报 `Plugin agent-teams-pixel@<ver> is incompatible with dsh 0.2.0-rc.2: peerDependencies {...}`。

## 2. 根因（三条，按危害排序）

### 根因 A：peer 区间被 DSH 兼容门禁判死（真正卡住安装/激活的那一步）

DSH 的安装/激活前置校验在 `@deepseek-ai/dsh-app-boot`（`lib/index.js` 的 `evaluatePluginCompatibility`），语义是：

```js
// 对 manifest.peerDependencies 里每个 name === '@deepseek-ai/dsh' 或 name.startsWith('@deepseek-ai/dsh-') 的条目：
if (!semver.satisfies(runtimeVersion, range, { includePrerelease: true })) → 判定 incompatible-version，拒绝安装/激活
// 除非按 `包名@精确版本` + `精确运行时版本` 授予豁免（dsh plugin allow-version / 插件管理器）
```

本项目 `0.2.0` 声明的是：

```jsonc
"@deepseek-ai/dsh-llm":   "^0.1.0-rc.7 || ^0.1.1-rc.2",
"@deepseek-ai/dsh-tools": "^0.1.0-rc.7 || ^0.1.1-rc.2"
```

caret 会把上界规范化为 **`<0.2.0-0`**（专门用来排除下一个版本的预发布），而 `0.2.0-rc.2 < 0.2.0-0` 为 **假** —— 所以不管加不加 `includePrerelease`，`0.2.0-rc.*` 都落在区间外。实测：

| 区间 | `satisfies('0.2.0-rc.2')` strict | `includePrerelease: true`（DSH 用的就是这个） |
| --- | --- | --- |
| `^0.1.0-rc.7 \|\| ^0.1.1-rc.2`（旧） | false | **false** ❌ |
| `>=0.1.0-rc.2 <0.2.0`（memory-eternal 写法） | false | true ✅ |
| `>=0.1.0-rc.2 <0.3.0` | false | true ✅ |
| `>=0.2.0-rc.1 <0.3.0` | true | true ✅ |
| `>=0.1.0-rc.2 <0.2.0 \|\| >=0.2.0-rc.1 <0.3.0`（本修复采用） | **true** | **true** ✅ |

> 采纳最后一行：显式包含 `0.2.0` 这一 tuple 的预发布比较器，因此在「严格 semver」和「DSH 的 includePrerelease」两种判据下都通过，同时不牺牲 `0.1.x` 老运行时。

### 根因 B：插件没被挂进当前 profile 的 `bundles`（两条独立路径都通到「不存在」）

DSH 的插件树**完全**由 `dsh.profile.bundles` 组合（`cordis.yml` 恒为 `[]`），不在 bundles 里 = 不存在。当前宿主是**桌面壳**（`DeepSeek Harness.exe`，`resources/runtime/primary-runtime/runtime.json` 的 `desktopVersion: 0.2.0-rc.2`），它用的 profile 是 `~/.dsh/profiles/desktop`：

```jsonc
// ~/.dsh/profiles/desktop/package.json（修复前）
"dsh": { "profile": { "bundles": [
  "@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app",
  "@deepseek-ai/dsh-experimental-agent-team-profile",   // ← 原生 Agent Teams，更新后默认开启
  "@deepseek-ai/dsh-experimental-auto-review",
  "@deepseek-ai/dsh-experimental-voice-input-bundle",
  "memory-eternal"
] } }
```

`agent-teams-pixel` 只在 `~/.dsh/profiles/web` 的 `dependencies` 里，**且 web 的 `bundles` 也漏了它**。实测 `plugin_manager.list_plugins` 的 195 条装载记录里**没有任何 `agent-teams-pixel` 行**，而 `memory-eternal` 有。

漏掉它有两套机制（都已核对运行时源码）：

| 机制 | 位置 | 行为 |
| --- | --- | --- |
| **启动期静默跳过** | `@deepseek-ai/dsh-app-boot` `loadProfileDirectory()` | 逐个 bundle 解析 → 缺 `dsh.bundle`、解析不到、**或 `evaluatePluginCompatibility` 不通过**，就 `catch` 进 `skippedBundles` 并**跳过**；manifest 不改、启动不崩，只在 stderr 打一行 `dsh: skipping profile bundle "…": …`。所以「peer 不通」在旧声明下**必然**表现为插件整体消失，而不是报错弹窗。 |
| **包操作期剔除条目** | `@deepseek-ai/dsh-plugin-manager` `reconcile()` / `reconcileProfilePlugins()` | `bundles.filter(name => !(beforeDeps.has(name) || deps.includes(name)) || bundleNames.has(name))`——名字一旦出现在 `dependencies` 里，就**只在该包当前仍能声明 `dsh.bundle` 时保留**；解析失败即被移出 bundles 列表。 |

**判定运行 profile 的快速方法**：看装载记录里有没有桌面壳专属的 `include:auto-review`（desktop 有、web 没有），或者看 `dsh-ui-three-body` / `dshmarket` 是否在场（web 的 bundles 里有它们）。

> ⚠️ 逃生舱别乱用：`dsh plugin allow-version <包@版本> <运行时>` 会给 profile 的 `compatibility.json` 写精确版本豁免，让 DSH 不再拦。但本项目的正确修法是**把 peer 区间改对**（本次已做）——豁免会把「真的有 API 断层」的情况一起放行，风险由用户承担。


### 根因 C：manifest 缺少商店/市场需要的元数据

`dshmarket` 的 `discovery-compatibility` 会从 `engines.dsh` 与 `peerDependencies` 推导「宿主要求」；`engines.dsh` 缺失时界面显示 `hostRequirementUndeclared`。DSH STORE 侧还要求 `dsh.compatibility` / `dsh.permissions` / `dsh.lifecycle` 声明（这一条是本项目历史踩坑记录里 memory-eternal 已经付过学费的：清单被标 `catalog-blocked`）。修复后这些字段齐备。

### 根因 D：`ctx.settings` 服务形状变了 —— 「装了但没功能」（比 A/B/C 更深）

A/B/C 修完并成功挂进 desktop profile 之后，插件**确实活着**了，但实机查诊断端点仍然是：

```json
{ "hasScope": false, "registerErr": "settings.register is not a function", "settingsAvailable": true }
```

即：插件在场，但「角色工具」开关绑不上、`agents_pixe_*` 工具永不注册 —— 用户看到的是**「装了但没功能」，而且 UI 上完全静默**。

`@deepseek-ai/dsh-settings@0.2.0-rc.2` 的公开契约（`cordis_inspect_query host Service settings`）里**根本没有 `register`**：

| 宿主 | `ctx.settings` 形状 | 配置从哪来 | 怎么写 |
| --- | --- | --- | --- |
| dsh ≤0.1.5 | 设置命名空间注册表：`register(ns, Config, {base})` → `SettingsScope`（get/watch/update） | `settings.yaml` | `scope.update()` |
| dsh ≥0.1.7（含 0.2.0-rc.2） | **只剩表单服务**：`configure(presentation, owner)` / `prepareDocument()` / `describe(options)` / `update(ns, patch, rev)` / `replace(ns, section, rev)` / `mutate(ns, ops, rev)` | cordis/loader 按 schema 校验后把 **Config 作为活引用**传进 `apply(ctx, config)`；**只有 `schema.meta.volatile` 为真的字段**会被投影成可编辑表单、才允许写入 | `settings.update(<loader 条目 id>, patch, revision)`（`describe()` 的 `ns` 就是 `entry.options.id`） |

这条演进是 [`memory-eternal`](https://github.com/EternalNight996/memory-eternal) 早在 `dsh 0.1.7` 时就适配过的（它的 `bindSettings` 注释里逐条写清了两个版本的行为差异），本项目当时没跟。

**参考实现的关键点（本项目按同样做法移植）**：

1. **不要用链式 `.volatile()`**：`schemastery ≥3.18.4` 才有该方法，而插件在宿主里可能解析到 `3.18.1`（本机 profile 实测），链式调用会在 **import 期**抛 `volatile is not a function`，把整包打挂。改为构造后遍历 `schema.dict` 逐字段写 `meta.volatile = true`。
2. **Config 活引用的形状不固定**：`schemastery ≥3.18.4` 把 volatile 字段解析成 cosmokit 活引用（`{ get(): snapshot }`，品牌是 `Symbol.for('cosmokit.volatile.write')`），`≤3.18.1` 给普通值 —— 业务代码必须**深解引用**后再用，否则 `cfg.enabled` 是对象、`JSON.stringify` 出 `{}`。
3. **volatile 回流可能滞后**：写成功后把 patch 叠加在本地视图上，等宿主快照追上再摘除；并且**写成功后主动对一次开关**（本项目的 `syncFace()`），不依赖事件时序。
4. **页面策略 `configure({auto:false})`**：本项目自带「角色办公室」设置页（client 侧 `slots.register('settings.section', …)`），不声明的话宿主会再按 schema 自动生成一张重复表单。
5. **客户端不再有 `settingsScope` 服务**：`cordis_inspect_query client Service` 查无此服务（`no catalogued Service named "settingsScope"`），所以客户端不能靠 `settingsScope.bind({namespace})` 落盘。memory-eternal 的做法是**自带 HTTP API + 宿主侧 `settings.update`**；本项目照此新增 `GET/POST /agents-pixe/config`，客户端把 localStorage 降级为离线镜像。


## 3. 修复内容

| 位置 | 变更 |
| --- | --- |
| `package.json` `version` | `0.2.0` → `0.2.2` |
| `package.json` `peerDependencies` | `@deepseek-ai/dsh-llm/-tools` → `>=0.1.0-rc.2 <0.2.0 \|\| >=0.2.0-rc.1 <0.3.0`；新增 `@deepseek-ai/cordis: ^4.0.1` |
| `package.json` `engines` | 新增 `"dsh": ">=0.1.0-rc.2 <0.3.0"` |
| `package.json` `dsh.compatibility` | 新增；`dshReleases` 覆盖 `0.1.0-rc.7 / 0.1.1-rc.2 / 0.1.7-rc.2 / 0.2.0-rc.1 / 0.2.0-rc.2`，`profiles: ["web","desktop"]` |
| `package.json` `dsh.marketplace` | 新增（`profiles` / `requiresRestart` / 无构建审批） |
| `package.json` `dsh.permissions` | 新增（只读写 `~/.dsh/agents-pixe/**`、无外网、无子进程、只注册 loopback 端点） |
| `package.json` `dsh.lifecycle` | 新增（无 install/postinstall、无远程下载、无原生编译） |
| `lib/index.js`（0.2.1 部分） | 原生 Agent Teams 探测（`ctx.get('agentTeams')`）+ 系统提示段「原生优先、两套不混用」路由；`/agents-pixe/settings` 诊断扩容 |
| `lib/index.js`（0.2.2 部分） | `export const Config`（全字段 volatile）+ 跨版本 `bindSettings`（老宿主 `register` / 新宿主活引用 + `loader/volatile-update` + `settings.update`）+ `settings.configure({auto:false})` + `GET/POST /agents-pixe/config` + 写成功后 `syncFace()` 立刻对开关 |
| `src/client.main.js` + `lib/client.js` | 设置作用域由「纯 localStorage」改为「宿主端点读写 + localStorage 离线镜像」；`settingsScope` 缺失不再按错误上报；客户端 bundle 已重新构建（375 KB） |
| `test/dsh-0.2-compat.test.mjs` | 新增 9 项门禁（peer 区间/元数据自洽/与原生零撞名/路由提示） |
| `test/settings-compat.test.mjs` | 新增 11 项（新宿主无 `register` 的行为、配置端点读写、revision 冲突重试、跨源 403、写后立刻注册工具、老宿主行为不变） |
| `devDependencies` | 新增 `semver`（用于按 DSH 的规则复算 peer 区间） |

### API 漂移核查结论：**引擎没断，设置服务断了**

用真实的 `@deepseek-ai/dsh-llm@0.2.0-rc.2` + `@deepseek-ai/dsh-tools@0.2.0-rc.2` + `@deepseek-ai/cordis@4.0.4` 替换开发依赖后，**原有 78 项测试全绿**。逐项核对：

| 本项目用到 | 0.2.0-rc.2 状态 | 证据 |
| --- | --- | --- |
| `defineTool`（`@deepseek-ai/dsh-tools`） | ✅ 仍在导出表 | `Object.keys(dsh-tools)` |
| `BlockAssembler` / `createUserMessage`（`@deepseek-ai/dsh-llm`） | ✅ 仍在导出表 | `Object.keys(dsh-llm)` |
| `ctx.subagents.start` / `startContinuable` / `sendMessage` / `listChildren` / `getProvider` | ✅ 全部存在 | `dsh-subagent@0.2.0-rc.2/lib/index.js` |
| 子代理结果 `result.output[]` / `stopReason === 'completed'` | ✅ 语义不变 | 同上（`stopReason: "completed"` 仍在用） |
| 客户端 slot `shell.overlay`、`settings.section` | ✅ 仍在 slot 拓扑里 | 运行时 `client.Slots.listSubTree` |
| **`settings.register(ns, schema, {base})`** | ❌ **已移除**（只剩 configure/describe/update/replace/mutate） | `cordis_inspect_query host Service settings`；实机 `registerErr: "settings.register is not a function"` |
| **客户端 `settingsScope` 服务** | ❌ **不存在** | `cordis_inspect_query client Service settingsScope` → `no catalogued Service named "settingsScope"` |

**结论**：`0.2.0-rc.2` 把「团队引擎 + subagent 续聊 + slot」都保留了，**只砍掉了设置命名空间注册这条路**。所以修复不需要重写引擎，但要按新契约改设置读写（根因 D）。

## 4. 验证

```powershell
# 1. 全量回归（98 项：原有 78 + 兼容门禁 9 + 设置兼容 11）
npm test

# 2. 只跑新增的两组兼容门禁
node --test test/dsh-0.2-compat.test.mjs test/settings-compat.test.mjs

# 3. 对真实的 0.2.0-rc.2 宿主 API 跑一遍（关键：证明不是「靠 mock 过」）
npm view @deepseek-ai/dsh-llm dist-tags           # next = 0.2.0-rc.2
npm install --no-save --no-package-lock `
  @deepseek-ai/dsh-llm@0.2.0-rc.2 @deepseek-ai/dsh-tools@0.2.0-rc.2 @deepseek-ai/cordis@4.0.4
npm test

# 4. 发布前门禁（语法 + 全量测试）
npm run check
```

**实机验收（重启 DSH 后）** —— 这两个端点就是「插件是否真的活着且有功能」的自检：

```powershell
# 设置绑定是否成功：hasScope 应为 true、registerErr 应为 null、
# settingsLegacy 在 dsh 0.2.0-rc.2 上应为 false、settingsWritable 应为 true
Invoke-RestMethod http://127.0.0.1:19387/agents-pixe/settings | ConvertTo-Json

# 原生 Agent Teams 探测 + 引擎接线
# → nativeAgentTeams=true；teamEngine/subagentsStart/subagentsContinuable=true
Invoke-RestMethod http://127.0.0.1:19387/agents-pixe/settings | Select-Object nativeAgentTeams,teamEngine,subagentsContinuable

# 配置读写（打开「角色工具」开关的等价调用）
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:19387/agents-pixe/config `
  -ContentType 'application/json' -Body '{"patch":{"enabled":true}}' | ConvertTo-Json
```

## 5. 部署（把插件重新挂进正在用的 profile）

> **两条硬约束（实测）**：
> 1. CLI **不能碰 desktop profile**：`dsh plugin --profile desktop …` 直接报
>    `profile "desktop" is managed exclusively by the Electron application`；
>    `dsh --profile desktop --dump-config` 同样被拒。desktop profile 只能由**桌面应用自己的插件管理**（GUI 插件页，或 Agent 侧的 `plugin_manager` 工具）来改。
> 2. `file:` 依赖**不能删源文件**：本次踩过 —— 删掉旧 tgz 后再装新 tgz，pnpm 解析既有依赖时 `ENOENT`，安装失败（`application: failed`）。所以本次把 tgz **复制进 profile 目录**再安装，profile 自包含、不依赖工作区。

```powershell
# 1) 备份（profile 的 package.json 是可回滚的唯一状态）
$prof = "$env:USERPROFILE\.dsh\profiles\desktop"
Copy-Item "$prof\package.json" "$prof\package.json.bak-atp-$(Get-Date -f yyyyMMddHHmmss)"

# 2) 打包并放进 profile（避免 file: 依赖被源文件删除搞坏）
npm pack --pack-destination .
Copy-Item .\agent-teams-pixel-0.2.2.tgz $prof\ -Force

# 3) 安装（会先跑兼容校验；peer 不合格会直接拒绝，不会写坏 profile）
#    Agent 侧：plugin_manager(action="install_bundle", target="<上面复制进去的 tgz 绝对路径>")
#    人 侧：设置 → 插件 → 安装包，选该 tgz
```

**重启 DSH 桌面壳**后生效（安装返回 `application: "restart-required"`：宿主半边是进程启动时加载的，不重启仍是旧代码）。`web` profile（`dsh web`）可用 CLI：`dsh plugin --profile web add <tgz 或版本号>`。

**回滚**：把备份的 `package.json` 盖回去，再重启。

> **正式发布路径**：把修复后的版本（≥0.2.2）发到 npm 后，profile 里改用版本号依赖（`dsh plugin add agent-teams-pixel@0.2.2`），就不再有 `file:` tarball 的脆弱性。本次**未执行发布**（需要你的 npm 凭据/2FA 决策）。

## 6. 防复发

1. **CI/发布前跑 `npm run check`**（语法 + 98 项测试）。两组门禁各守一条：
   - `test/dsh-0.2-compat.test.mjs`：peer 写回 `^0.1.x`、新增运行时却没更新 `dshReleases`、与原生 Agent Teams 撞名 → 直接红。
   - `test/settings-compat.test.mjs`：设置层被改回只支持 `settings.register`、或 Config 字段忘了标 volatile → 直接红。
2. **升级 DSH 后固定三步**：`npm view @deepseek-ai/dsh-llm dist-tags` → 新版本加进 `dshReleases` 与 peer 区间 → `npm install --no-save <新版本>` 跑 `npm test`。
3. **不要再用 caret 声明跨 minor 的 dsh peer**：`^0.1.x` 的隐含上界是 `<0.2.0-0`，跨 minor 升级必被门禁挡。用 `>=x <y` 显式区间，并为每个新增的预发布 tuple 补一个 `>=a.b.c-rc.1 <a.(b+1).0` 分支。
4. **升级 DSH 后必查宿主服务契约再动代码**：`cordis_inspect_query` 的 `host Service <key>` 是权威形状来源（本次就是靠它一次拿到 `settings` 的真实方法表，从而定位根因 D）。第三方插件最容易断的四个面：`settings`、`tools`、`subagents`、客户端 slot。
5. **profile 迁移要跟着做**：DSH 桌面壳从「web profile 里挂 dsh-desktop-shell」演进到「独立 desktop profile」时，第三方 bundle **不会自动跟过去**（`memory-eternal`、`dsh-ui-three-body`、`dshmarket`、`agent-teams-pixel` 都掉过）。
6. **不要再把 bundle 只写进 `dependencies`**：DSH 插件树只看 `dsh.profile.bundles`；而 `reconcile()` 会把「在 dependencies 里但声明不出 `dsh.bundle`」的名字从 bundles 中剔除。装完插件后请顺手确认 `bundles` 里有它。

