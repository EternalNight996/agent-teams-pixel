/**
 * 掌门收件箱：洞府「收信」页的消息列表。
 *
 * 从 SectHallOverlay 里抽出来，一是集中处理空状态与键盘可达性，二是能在
 * SSR 测试里验证消息按文本渲染（不会被当成 HTML 执行）。
 */
import type { ActivityMessage } from './activity-monitor.ts';
import type { AgentTeamsTranslate } from './locales.ts';
export declare function HallInbox({ messages, t }: {
    readonly messages: readonly ActivityMessage[];
    readonly t: AgentTeamsTranslate;
}): import("react").JSX.Element;
