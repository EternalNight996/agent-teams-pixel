import type { ModelDirectoryResolver } from '@deepseek-ai/dsh-client-ui-model-selection/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { ActivityTeam } from './activity-monitor.ts';
import type { AgentTeamsTranslate } from './locales.ts';
/** 常驻洞府浮层里的墙面设施被点击时广播的事件（供监视器等复用）。 */
export declare const OPEN_HALL_SHEET_EVENT = "agent-teams:open-sheet";
export declare function SectHallOverlay({ team, t, sessionId, modelDirectories, openMember }: {
    readonly team: ActivityTeam;
    readonly t: AgentTeamsTranslate;
    readonly sessionId: SessionId;
    readonly modelDirectories: ModelDirectoryResolver;
    readonly openMember: (parentId: SessionId, childId: SessionId) => void;
}): import("react").JSX.Element | null;
