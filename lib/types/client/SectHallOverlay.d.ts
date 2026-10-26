import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ActivityTeam } from './activity-monitor.ts';
import type { AgentTeamsTranslate } from './locales.ts';
export declare function SectHallOverlay({ team, history, t, sessionId, modelDirectories, openMember, openCaptain, }: {
    /** 无队伍时缺省：浮层仍常驻，渲染一座只有掌门的空洞府。 */
    readonly team?: ActivityTeam;
    /** 本掌门会话下已归档的历史宗门（名册页展示）。 */
    readonly history?: readonly ActivityTeam[];
    readonly t: AgentTeamsTranslate;
    /** 当前会话；应用级浮层在个别宿主上可能拿不到，此时只能渲染空洞府。 */
    readonly sessionId?: SessionId;
    readonly modelDirectories: ModelDirectoryResolver;
    readonly openMember: (parentId: SessionId, childId: SessionId) => void;
    /** 回到掌门所在的主对话（点击场景里的掌门）。 */
    readonly openCaptain?: (captainSessionId: SessionId) => void;
}): import("react").JSX.Element | null;
