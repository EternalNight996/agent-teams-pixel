/**
 * Display-only role labels.
 *
 * The role id is the wire value (tool arguments, plan APIs, task policies) and
 * must never be translated before it leaves the UI; every surface renders
 * `roleLabel()` instead so a Chinese session never leaks `implementer`.
 * Members staged by the quick-start dialog are named after their role, so the
 * label falls back to the role's duty there and the row does not repeat one word
 * twice; a renamed member still shows which role it holds.
 */
import type { AgentTeamsLocaleKey, AgentTeamsTranslate } from './locales.ts';
export interface RoleLabelMeta {
    readonly id: string;
    readonly nameKey: AgentTeamsLocaleKey;
    readonly abilityKey: AgentTeamsLocaleKey;
}
/** Built-in roles, in picker order. */
export declare const ROLE_META: readonly RoleLabelMeta[];
/**
 * Localized label for one role id.
 * @param id - the wire role id (for example `implementer`).
 * @param memberName - the member's display name, used to avoid repeating the
 *   role word for members that were named after their role.
 * @param t - the AgentTeams translator.
 * @returns the localized role name, the role's duty when the name already is
 *   that name, or the untouched id for a custom role.
 */
export declare function roleLabel(id: string, memberName: string, t: AgentTeamsTranslate): string;
