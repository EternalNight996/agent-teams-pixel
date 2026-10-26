/**
 * 「反馈异常」的纯函数层：拼 GitHub issue 链接、诊断信息与给 AI 的提示词。
 *
 * 为什么不是点一下自动提交：GitHub 不允许匿名建 issue，插件里也不能内置 token
 * （asar/JS 反编译即可提取）。所以这里只把标题 / 正文 / 诊断预填进新建 issue 的
 * 链接，用户点一次 Submit 才算真正提交。
 */
/** 本项目仓库地址（反馈与 Star 都指这里）。 */
export const PLUGIN_REPO = 'https://github.com/EternalNight996/dsh-pixel-team';
/** issue 标题：取用户描述的第一行，限制长度；没写就给个兜底标题。 */
export function buildIssueTitle(description, fallback = 'dsh-pixel-team 异常反馈') {
    const first = description.trim().split('\n')[0]?.trim() ?? '';
    const title = first === '' ? fallback : first;
    return title.length <= 60 ? title : `${title.slice(0, 59)}…`;
}
/** issue 正文：发生了什么 + 诊断代码块。 */
export function buildIssueBody(input) {
    const description = input.description.trim() === '' ? '（未填写）' : input.description.trim();
    const diagnostics = input.diagnostics.trim() === '' ? '（未采集到）' : input.diagnostics.trim();
    return [
        '## 发生了什么',
        '',
        description,
        '',
        '## 诊断信息',
        '',
        '~~~',
        diagnostics,
        '~~~',
    ].join('\n');
}
/** 新建 issue 的预填链接。 */
export function buildIssueUrl(input) {
    const repo = input.repo ?? PLUGIN_REPO;
    const title = `[Bug] ${buildIssueTitle(input.description)}`;
    const body = buildIssueBody(input);
    return `${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
/** 给 AI 排障用的提示词：用户可以直接粘给任意模型。 */
export function buildAgentPrompt(input) {
    const description = input.description.trim() === '' ? '（未填写）' : input.description.trim();
    const diagnostics = input.diagnostics.trim() === '' ? '（未采集到）' : input.diagnostics.trim();
    if (input.locale === 'en') {
        return [
            'You are debugging the DeepSeek Harness plugin "dsh-pixel-team" (pixel sect office for AgentTeams).',
            'Reproduce and locate the problem from the report and diagnostics below, then propose a minimal fix.',
            '',
            '## Report',
            description,
            '',
            '## Diagnostics',
            diagnostics,
        ].join('\n');
    }
    return [
        '你是 DeepSeek Harness 插件 dsh-pixel-team（AgentTeams 的像素宗门洞府）的排障助手。',
        '请根据下面的用户反馈与诊断信息复现问题、定位根因，并给出最小修复。',
        '',
        '## 用户反馈',
        description,
        '',
        '## 诊断信息',
        diagnostics,
    ].join('\n');
}
/** 采集诊断：版本 / 运行环境 / 当前宗门概况。不包含会话内容与路径。 */
export function collectDiagnostics(input) {
    const nav = typeof navigator === 'undefined' ? undefined : navigator;
    const win = typeof window === 'undefined' ? undefined : window;
    const lines = [
        `plugin: dsh-pixel-team@${input.version}`,
        `host: DeepSeek Harness`,
        `user agent: ${nav?.userAgent ?? 'unknown'}`,
        `locale: ${nav?.language ?? 'unknown'}`,
        `origin: ${typeof location === 'undefined' ? 'unknown' : location.origin}`,
        `viewport: ${win?.innerWidth ?? 0}x${win?.innerHeight ?? 0} @${win?.devicePixelRatio ?? 1}x`,
        `time: ${new Date().toISOString()}`,
    ];
    if (input.team !== undefined) {
        const { name, phase, members, tasks } = input.team;
        lines.push(`team: ${name} [${phase}] members=${members} tasks=${tasks.done}/${tasks.total} running=${tasks.running} failed=${tasks.failed}`);
    }
    else {
        lines.push('team: none');
    }
    return lines.join('\n');
}
