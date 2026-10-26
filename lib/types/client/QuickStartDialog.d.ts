import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
/** 打开「开宗立派」弹窗的窗口事件：对话头部按钮与洞府里的开宗入口共用。 */
export declare const OPEN_QUICKSTART_EVENT = "agent-teams:open-quickstart";
export declare function TeamQuickStart({ sessionId, t }: PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'agentTeams'>): import("react").JSX.Element;
