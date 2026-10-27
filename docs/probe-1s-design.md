# 画阵定界：测试1秒（目标结构 / 边界 / 迁移步骤 / 风险）

状态：设计提案（t1）。下游 t2 依此改构，t3 依此验证，t4 依此审阵。
目标：`测试1秒` —— 一个 1 秒级、可重复、可度量的时间盒单元，用最小成本证明
"限时工作能启动、跑完、且耗时被量到"，并确保它真的会进 CI（不只是躺在仓库里）。

## 1. 目标结构

仓库现状（设计依据，已核实）：
- `scripts/smoke-5s.test.mjs` 已存在，用 node:test 对 5s 时间盒做上下界断言；
- 但全仓库 grep `smoke-5s` 无任何引用：`package.json`、CI、verify 链都没有它 —— 它是孤儿测试，
  实际从未被执行。这是本设计要避免的头号陷阱。

目标结构（本轮只新增这两个文件/入口，不动运行时）：

1. `scripts/smoke-1s.test.mjs`（新）—— 与 5s 版同构的单测：
   - `ROUND_MS = 1_000`，`CEILING_MS = 10_000`（上界取 10 倍余量：CI 机器可能超时抖动，
     但挂死的轮次必须失败）；
   - 用 `performance.now()`（单调时钟）计时，`setTimeout` 睡眠，断言
     `elapsed >= ROUND_MS` 且 `elapsed < CEILING_MS`；
   - 不读团队状态、不调 LLM、不依赖 host 运行时、不写任何文件 —— 纯内存，随处可跑。
2. `package.json`（改一行脚本，新入口）：
   - `"test:smoke:1s": "node --test scripts/smoke-1s.test.mjs"`；
   - 把该命令挂进 `verify` 链末尾（与 `verify:readme` / `verify:skill` 同级），
     保证 `pnpm verify` 与 CI 的 `verify.yml` 会真实执行它。

明确不做的事：不把 5s/1s 抽成共享 helper（会扩大改动面，且需要改 5s 现有断言），
不新增 lib/ 运行时模块，不加配置开关。

## 2. 边界（In / Out）

In scope（t2 允许改的路径，仅此三处）：
- `scripts/smoke-1s.test.mjs`（新建）
- `package.json` 的 `scripts` 段（只加 `test:smoke:1s`，并把命令追加进 `verify`）
- （可选）`docs/verification-guide.md`：若其中维护了验证命令清单，补一行，保持文档与脚本一致

Out of scope（t2/t3 不得触碰）：
- `scripts/smoke-5s.test.mjs` 的断言与阈值（其孤儿问题只登记，不在本轮修）
- `src/`、`lib/`、`src/client/` 任何运行时与 UI 代码
- 团队状态 `.agent-teams/`、调度器、mailbox、quality-gates 逻辑
- 真实 LLM / host 运行时 / 浏览器验证
- 任何"顺手"重构、格式化全仓、升依赖

## 3. 迁移步骤

1. 设计定稿（t1，本文件）。
2. 改构（t2）：
   a. 新建 `scripts/smoke-1s.test.mjs`，结构照抄 5s 版，仅改阈值与测试名
      （测试名建议：`a bounded 1-second round completes and is measurable`）。
   b. `package.json` 增加 `test:smoke:1s`，并把 `pnpm test:smoke:1s` 追加到 `verify` 链条尾部
      （放在最后，避免拖慢快速失败路径）。
   c. 不改 `build`，该测试不依赖 `lib/`，`tsc` 也不覆盖 `.mjs`。
3. 验阵（t3）：
   - `node --test scripts/smoke-1s.test.mjs` 连跑 3 次（查抖动）；
   - `node --test scripts/smoke-5s.test.mjs` 确认未回归；
   - `node -e "const p=require('./package.json'); ..."` 或 grep 确认 `verify` 链真的包含新命令
     （防孤儿）；
   - `pnpm typecheck`（应为零影响，确认没误改 ts 配置）。
4. 审阵（t4）：核对阈值、单调时钟、上界余量、wiring 证据、无越界改动。

## 4. 风险点

| 编号 | 风险 | 影响 | 缓解 |
| --- | --- | --- | --- |
| R1 | 计时抖动：CI 负载高或 VM 挂起/NTP 跳变 | 断言假失败 | 用 `performance.now()` 单调时钟；下界严格、上界 10 倍余量；不加重试掩盖 |
| R2 | 孤儿测试：加了文件却没进 `verify`/CI | 测试永不执行，交付"假绿"（5s 版现状） | 把 wiring 写进 t3 验收命令，必须给出 grep/脚本输出 |
| R3 | 1 秒轮次证明力有限 | 被误读为"团队流水线可用" | 文档与测试注释明确：这是 timer/harness 冒烟，不是团队交付证据 |
| R4 | 睡眠型测试拖慢快速反馈 | `pnpm verify` 变慢 | 追加在链条尾部；1s 体量可忽略 |
| R5 | 阈值复制粘贴错误（`5_000` 残留） | 测试名/实际不符 | t3 断言 `ROUND_MS === 1000` 可用 grep 校验；review 逐行看常量 |
| R6 | `node:test` 无 per-test timeout，挂死轮次靠上界断言而非框架 | 作业级超时才失败 | 上界断言即是守卫；CI job timeout 兜底 |
| R7 | 文档/命令清单漂移 | verify:readme 之外的文档不一致 | 仅当 `docs/verification-guide.md` 有命令清单时才补一行 |

## 5. 验收口径（给 t3/t4）

- 文件存在且只引用 `node:assert/strict`、`node:test`，无外部依赖；
- `elapsed >= 1000` 与 `elapsed < 10000` 两个方向都有断言；
- `package.json` 有 `test:smoke:1s`，且 `verify` 字符串包含它；
- 除上述三个 in-scope 路径外，git 变更集为空。
