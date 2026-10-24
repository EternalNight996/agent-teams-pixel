# 桌面端与 AgentTeams 前端独立审计

范围：Harness `dsh-v0.1.7-rc.2 → 21638c5631`；AgentTeams 当前工作区 0.1.21。只读审计生产源码，报告文件除外。未自行构建、安装或操作 UI，真实浏览器安装验证由主审计负责。0.2.0 是用户预期，不是已经确认的版本；master 的 app-boot/package.json 仍标记 0.1.7-rc.2。

## 结论

当前 master 的桌面/Web 前端契约未发现 AgentTeams 新增阻断，但未来若将运行时版本提升到 0.2.0，现有精确 peer 声明会确定触发版本门禁。GitHub URL 安装还有未构建 lib 产物风险，需真实安装检验。不可把这些静态结论写成完整桌面产品验收通过。

## REMOVED

本次检查的 AgentTeams 使用面未发现删除。rc.2 到 master 的 ui-layout、ui-sidebar-right、ui-slots、ui-session、client-modules 无文件差异。session-controller 的客户端方法没有删除。

## CHANGED

### P1：条件性确定的 0.2.0 版本门禁阻断（npm installers）

AgentTeams package.json:110 起的 21 个 DSH peer 采用精确版本并列，未包含 0.2.0。Harness packages/boot/app-boot/src/plugin-compatibility.ts:61–88 对全部 DSH peer 做 semver 检查；peerDependenciesMeta.optional 不会使其免检。packages/boot/plugin-manager/src/index.ts:546–547 拒绝未豁免的不兼容插件。当前运行时版本仍为 0.1.7-rc.2，因此当前 master 通过并不证明将来的版本通过。该 evaluator 在本次范围内没有改动，风险来自将来的版本号提升，不应错误归类成 master 新增 API break。

实际在 Harness 根目录执行了以下命令，没有修改 package.json 或加入豁免：

```sh
node --import tsx/esm --input-type=module -e 'import fs from "node:fs"; import { evaluatePluginCompatibility } from "./packages/boot/app-boot/src/plugin-compatibility.ts"; const pkg=JSON.parse(fs.readFileSync("/Users/nanmi/.codex/worktrees/e986/dsh-agent-teams/package.json","utf8")); for (const version of ["0.1.7-rc.2","0.2.0","0.2.0-rc.1"]) {const result=evaluatePluginCompatibility(pkg,{},version); console.log(JSON.stringify({version,compatible:result===undefined,peerCount:Object.keys(result?.peers??{}).length,exempted:result?.exempted}));}'
```

结果：

```json
{"version":"0.1.7-rc.2","compatible":true,"peerCount":0}
{"version":"0.2.0","compatible":false,"peerCount":21,"exempted":false}
{"version":"0.2.0-rc.1","compatible":false,"peerCount":21,"exempted":false}
```

Adapt：等待精确发布候选版本确认，完成该版本实际运行验证后，在新插件版本中更新精确支持声明和兼容矩阵。放宽 peer 或加入豁免本身不能证明适配。

### ModelDirectory 构造变化不影响现有调用（web UI）

packages/client/ui-model-selection/src/client/directory.ts 构造增加 isBlank 参数和可选 track，service.ts 的 resolver 已提供它们。AgentTeams src/client/StagingPlanEditor.tsx:123–142 只消费宿主返回的 ModelDirectory.store；没有 new ModelDirectory，不能将该变化误报成插件故障。sessions 的 fork 只新增可选 onCreated 回调，现有成员导航路径没有受影响。

## ADDED

本次宿主新增产品分析和桌面更新相关行为，但没有发现它们要求 AgentTeams 新增必需前端注入。AgentTeams 的 runtime inject、slot、model directory 消费方式仍匹配。

## RENAMED

在检查范围未发现影响 AgentTeams 的服务或槽位重命名。

## 安装入口与产物风险

### GitHub URL：支持格式，但缺失 lib 是待 UI 验证风险

packages/boot/plugin-manager/src/install-spec.ts:77 接受 https://github.com/NanmiCoder/dsh-agent-teams；index.ts:482 先作 GitHub 连通性检查，:505 原样交给 pnpm add。宿主没有在这里转成 GitHub Release 附件或 npm 产物。

AgentTeams 的 .gitignore:2 忽略 lib/，git ls-files lib 无结果；package.json 入口指向 lib/index.js 和 lib/client.js，scripts 只有 build/prepublishOnly，没有 prepare/prepack。故 Git URL 安装不能假定会自动产生 lib。此处是依据源码的风险推断，必须与实际 UI/安装日志区分；未报告已经发生安装失败。

### npm 网页 URL：真实 parser 拒绝

执行：

```sh
node --import tsx/esm --input-type=module -e 'import {parseInstallSpec} from "./packages/boot/plugin-manager/src/install-spec.ts"; for (const spec of ["https://github.com/NanmiCoder/dsh-agent-teams","https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams","https://registry.npmjs.org/@nanmicoder/dsh-agent-teams/-/dsh-agent-teams-0.1.21.tgz","@nanmicoder/dsh-agent-teams@0.1.21"]) {try {console.log(parseInstallSpec(spec))} catch(e) {console.log(e.message)}}'
```

结果：GitHub URL 返回 kind=git、host=github.com；npm 网页 URL 抛 `plugin-manager: a URL must point at a git repository or a tarball: https://www.npmjs.com/package/@nanmicoder/dsh-agent-teams`；registry tgz URL 返回 kind=tarball、host=registry.npmjs.org；精确 npm 包 ID 返回 kind=registry、name=@nanmicoder/dsh-agent-teams、range=0.1.21。

位置：packages/boot/plugin-manager/src/install-spec.ts:79–82。此为宿主输入格式限制，不是 AgentTeams 运行 API 破坏。UI 应同时测用户给的网页 URL 和正确 npm ID/产物 URL，并明确区分结果。

### 桌面 profile 安装文档不能直接沿用 CLI

apps/desktop/src/paths.ts:19 使用独立 .dsh/profiles/desktop。apps/cli/src/args.ts:84–85 明确拒绝 --profile desktop，桌面由 Electron 管理。AgentTeams README_ZH.md:78 的“将 web 换成实际使用的 profile”不能照搬到桌面；应补插件管理 UI 指引。此处是文档缺口，不是声称桌面无法装插件。

## Confirmed unchanged

- platform:web 是正确声明。apps/desktop-host/src/index.ts:25–30 通过 runProfile 启动 desktop；packages/client/modules/src/index.ts:841 仍只接受 web client 声明。不能因 Electron 桌面就要求 platform:desktop。
- apps/desktop/src/main.ts:635–647 将 dsh-app://app 非静态路径统一 forwardWebRequest 到本地 Host；web-document.ts:77–88 保留 path/query/method/body 并加入 hostCookie。因此 src/index.ts:215 起注册的 /plugins/dsh-agent-teams/state 以及计划、停止、图片相对 URL 源码上可达。还需真实浏览器交互确认。
- AgentTeams src/client/index.tsx:88–138 的 sidebarRightTabs、header actions、turnTail、sidebar pane、shell.overlay、commandview、conversation node 服务与槽位仍存在，相关提供者包在此次区间无变动。
- AgentTeams src/client/session-navigation.ts:53–55 优先使用 uiWorkspace.openSession；本次 sessions 变化只加 fork 可选回调，没有破坏该分支。

## 边界签名

| API/安装面 | rc.2 | master | 判定 |
| --- | --- | --- | --- |
| dsh.client.platform | web | web | 不变，适用于桌面 Web renderer |
| sidebarRight/slots/layout | 现有接口 | 无文件变化 | 未发现破坏 |
| sessions.fork | 原参数 | 新增可选 onCreated | 兼容现有消费者 |
| ModelDirectory constructor | 无 isBlank | 新增 isBlank/track | 直接构造者需改；AgentTeams 不直接构造 |
| 相对 /plugins/* HTTP | Web 服务 | 桌面协议转发 Host | 源码兼容，待 UI 验证 |
| 版本 evaluator | 精确 peer 检查 | 相同实现 | 当前 rc.2 通过；假设 0.2.0 拒绝 |
| GitHub URL | pnpm Git spec | pnpm Git spec | lib 产物待实测 |
| npm 网页 URL | 非安装 spec | 非安装 spec | parser 确定拒绝 |

## 后续验收

1. 完成主线程 UI GitHub URL、npm 网页 URL、正确 npm 包标识/产物 URL 安装测试，保存错误或加载证据。
2. 查看浏览器插件激活、团队入口、计划模型选择、团队启动/停止与成员会话跳转。
3. 运行真实桌面 profile，确认 dsh-app 协议下读取和写入路由成功。
4. 在确定发布版本后重新运行兼容 evaluator、实际宿主加载与 AgentTeams 生命周期探针，再决定新插件版本支持声明。

没有依此报告修改生产源码、豁免规则、用户 profile 或依赖。
