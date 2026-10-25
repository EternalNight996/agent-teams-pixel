/** Read-only configuration view: roster, routing and task contracts. */
import type { AgentTeamsTranslate } from './locales.ts';
import type { ActivityTeam } from './activity-monitor.ts';
export declare function TeamConfigPanel({ team, t }: {
    team: ActivityTeam;
    t: AgentTeamsTranslate;
}): import("react").JSX.Element;
