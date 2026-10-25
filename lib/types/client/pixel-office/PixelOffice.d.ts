import type { ActivityTeam } from '../activity-monitor.ts';
import type { AgentTeamsTranslate } from '../locales.ts';
export interface PixelOfficeProps {
    readonly team: ActivityTeam;
    /** Translation bound by the panel; keys are owned by the AgentTeams namespace. */
    readonly t: AgentTeamsTranslate;
    /** Open one member's subagent transcript. */
    readonly onOpenMember?: (memberId: string) => void;
    /** A member without a conversation was clicked (nothing to open yet). */
    readonly onUnavailable?: (name: string) => void;
    /** Switch the floater back to the board view. */
    readonly onShowBoard?: () => void;
    /** Collapse the office back to its bottom bar. */
    readonly onCollapse?: () => void;
}
export declare function PixelOffice({ team, t, onOpenMember, onUnavailable, onShowBoard, onCollapse }: PixelOfficeProps): import("react").JSX.Element;
