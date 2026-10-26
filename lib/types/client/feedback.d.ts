/**
 * 「反馈异常」的纯函数层：拼 GitHub issue 链接、诊断信息与给 AI 的提示词。
 *
 * 为什么不是点一下自动提交：GitHub 不允许匿名建 issue，插件里也不能内置 token
 * （asar/JS 反编译即可提取）。所以这里只把标题 / 正文 / 诊断预填进新建 issue 的
 * 链接，用户点一次 Submit 才算真正提交。
 */
/** 本项目仓库地址（反馈与 Star 都指这里）。 */
export declare const PLUGIN_REPO = "https://github.com/EternalNight996/dsh-pixel-team";
/** 反馈内容：用户描述 + 诊断 + 版本。 */
export interface FeedbackInput {
    readonly description: string;
    readonly diagnostics: string;
    readonly version: string;
    readonly repo?: string;
}
/** issue 标题：取用户描述的第一行，限制长度；没写就给个兜底标题。 */
export declare function buildIssueTitle(description: string, fallback?: string): string;
/** issue 正文：发生了什么 + 诊断代码块。 */
export declare function buildIssueBody(input: FeedbackInput): string;
/** 新建 issue 的预填链接。 */
export declare function buildIssueUrl(input: FeedbackInput): string;
/** 给 AI 排障用的提示词：用户可以直接粘给任意模型。 */
export declare function buildAgentPrompt(input: {
    readonly description: string;
    readonly diagnostics: string;
    readonly locale?: 'zh' | 'en';
}): string;
/** 采集诊断：版本 / 运行环境 / 当前宗门概况。不包含会话内容与路径。 */
export declare function collectDiagnostics(input: {
    readonly version: string;
    readonly team?: {
        readonly name: string;
        readonly phase: string;
        readonly members: number;
        readonly tasks: {
            readonly total: number;
            readonly done: number;
            readonly failed: number;
            readonly running: number;
        };
    };
}): string;
