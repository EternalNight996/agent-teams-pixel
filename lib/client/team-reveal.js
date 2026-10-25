/**
 * Reveal rules for the team workspace tab.
 *
 * Two independent signals can make a team appear while the user is looking at
 * the conversation: an explicit creation the quick-start dialog just announced,
 * and the monitor discovering a team created elsewhere. They are deliberately
 * asymmetric. An explicit creation always reveals the tab — the user just
 * clicked "生成草案", and reviewing that draft is the only next step — even when
 * the right column is already expanded on another page (the discard button
 * closes the tab but keeps the column open, which used to swallow the next
 * draft). A discovered team only claims a collapsed column, so polling can
 * never replace a file or terminal the user is reading.
 */
/** Window event dispatched after the quick-start dialog staged a team. */
export const TEAM_CREATED_EVENT = 'agent-teams:team-created';
/**
 * Whether the workspace tab must be opened for a team that just appeared.
 * @param input - the signal, both session identities, the team id, and the
 *   column's current expansion.
 * @returns `true` when the tab should be opened/focused.
 */
export function shouldRevealTeam(input) {
    if (input.sessionId === undefined || input.sessionId === '')
        return false;
    if (input.teamId === undefined || input.teamId === '')
        return false;
    // The column can only be opened for the session it is bound to; navigating a
    // background session would write into a surface nobody is drawing.
    if (input.onScreenSessionId !== input.sessionId)
        return false;
    return input.source === 'created' || !input.expanded;
}
