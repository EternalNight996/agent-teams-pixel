/** Window event used by the hall overlay to open one of its content sheets. */
export declare const OPEN_HALL_SHEET_EVENT = "agent-teams:open-sheet";
/** Sheet kinds the hall can open: wall actions, panel settings, and the 开宗 wizard. */
export type HallSheetAction = 'teams' | 'board' | 'config' | 'inbox' | 'settings' | 'start' | 'ranks' | 'about';
