import type { ActivityTeam } from './activity-monitor.ts';
import type { AgentTeamsTranslate } from './locales.ts';
import { type SceneAction } from './pixel-office/PixelOffice.tsx';
export declare function SectHallOverlay({ team, t, onOpenMember, onAction }: {
    readonly team: ActivityTeam;
    readonly t: AgentTeamsTranslate;
    readonly onOpenMember: (memberId: string) => void;
    readonly onAction: (action: SceneAction) => void;
}): import("react").ReactPortal | null;
export declare const OPEN_HALL_SHEET_EVENT = "agent-teams:open-sheet";
