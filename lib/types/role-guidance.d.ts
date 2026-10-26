/**
 * Role contracts for software-delivery members.
 *
 * These are deliberately short, stable blocks appended to the existing member
 * persona. They encode the patterns that show up repeatedly in high-star agent
 * projects: a role owns one layer, has explicit non-goals, must publish a
 * contract to the next role, and finishes only with verifiable evidence.
 *
 * Keep each block under ~1100 characters: the persona is a fixed prefix and
 * every extra paragraph is paid for by every task attempt.
 */
export interface RoleContract {
    readonly ownership: string;
    readonly must: readonly string[];
    readonly mustNot: readonly string[];
    readonly done: string;
}
/** Role guidance for a role id, or undefined for generic/custom roles. */
export declare function roleGuidance(role: string | undefined): string | undefined;
export declare const ROLE_CONTRACT_IDS: readonly string[];
