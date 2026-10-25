import type { ActivityTeam } from '../activity-monitor.ts';
import type { AgentTeamsTranslate } from '../locales.ts';
import { type SceneAction } from './office-actions.ts';
export type { SceneAction } from './office-actions.ts';
export interface PixelOfficeProps {
    readonly team: ActivityTeam;
    /** Translation bound by the panel; keys are owned by the AgentTeams namespace. */
    readonly t: AgentTeamsTranslate;
    /** Open one member's subagent transcript. */
    readonly onOpenMember?: (memberId: string) => void;
    /** A member without a conversation was clicked (nothing to open yet). */
    readonly onUnavailable?: (name: string) => void;
    /** A wall facility was picked: the parent decides which panel to open. */
    readonly onAction?: (action: SceneAction) => void;
    /** Facility whose panel is currently open (painted as selected). */
    readonly activeAction?: SceneAction | null;
    /** Facilities this surface can actually open (the floater only has the board). */
    readonly enabledActions?: readonly SceneAction[];
}
export declare function PixelOffice({ team, t, onOpenMember, onUnavailable, onAction, activeAction, enabledActions, }: PixelOfficeProps): import("react").JSX.Element;
