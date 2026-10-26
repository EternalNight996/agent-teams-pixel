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
    /** Clicking the captain returns to the main conversation. */
    readonly onOpenCaptain?: () => void;
    /** Session whose conversation is open; its cultivator is painted as active. */
    readonly viewingSessionId?: string;
    /** Clicking a member's level badge opens their equipment sheet. */
    readonly onOpenCharacter?: (memberId: string) => void;
    /** A member without a conversation was clicked (nothing to open yet). */
    readonly onUnavailable?: (name: string) => void;
    /** A wall facility was picked: the parent decides which panel to open. */
    readonly onAction?: (action: SceneAction) => void;
    /** Facility whose panel is currently open (painted as selected). */
    readonly activeAction?: SceneAction | null;
    /** Facilities this surface can actually open (the floater only has the board). */
    readonly enabledActions?: readonly SceneAction[];
    /** 场景里的阵盘：打开面板配置。 */
    readonly onSettings?: () => void;
    /** 面板配置是否打开（阵盘高亮，和底部按钮双向联动）。 */
    readonly settingsOpen?: boolean;
    /** 还没有队伍：山门在场景里改作「开宗」入口，与底部按钮一致。 */
    readonly teamless?: boolean;
}
export declare function PixelOffice({ team, t, onOpenMember, onOpenCaptain, onOpenCharacter, viewingSessionId, onUnavailable, onAction, activeAction, enabledActions, onSettings, settingsOpen, teamless, }: PixelOfficeProps): import("react").JSX.Element;
