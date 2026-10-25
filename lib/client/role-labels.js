/** Built-in roles, in picker order. */
export const ROLE_META = [
    { id: 'planner', nameKey: 'role.planner.name', abilityKey: 'role.planner.ability' },
    { id: 'implementer', nameKey: 'role.implementer.name', abilityKey: 'role.implementer.ability' },
    { id: 'verifier', nameKey: 'role.verifier.name', abilityKey: 'role.verifier.ability' },
    { id: 'reviewer', nameKey: 'role.reviewer.name', abilityKey: 'role.reviewer.ability' },
    { id: 'researcher', nameKey: 'role.researcher.name', abilityKey: 'role.researcher.ability' },
    { id: 'analyst', nameKey: 'role.analyst.name', abilityKey: 'role.analyst.ability' },
    { id: 'writer', nameKey: 'role.writer.name', abilityKey: 'role.writer.ability' },
    { id: 'auditor', nameKey: 'role.auditor.name', abilityKey: 'role.auditor.ability' },
    { id: 'architect', nameKey: 'role.architect.name', abilityKey: 'role.architect.ability' },
    { id: 'tester', nameKey: 'role.tester.name', abilityKey: 'role.tester.ability' },
    { id: 'documenter', nameKey: 'role.documenter.name', abilityKey: 'role.documenter.ability' },
    { id: 'operator', nameKey: 'role.operator.name', abilityKey: 'role.operator.ability' },
];
const ROLE_INDEX = new Map(ROLE_META.map(role => [role.id, role]));
/**
 * Localized label for one role id.
 * @param id - the wire role id (for example `implementer`).
 * @param memberName - the member's display name, used to avoid repeating the
 *   role word for members that were named after their role.
 * @param t - the AgentTeams translator.
 * @returns the localized role name, the role's duty when the name already is
 *   that name, or the untouched id for a custom role.
 */
export function roleLabel(id, memberName, t) {
    const meta = ROLE_INDEX.get(id);
    if (meta === undefined)
        return id;
    const name = t(meta.nameKey);
    return memberName.trim() === name ? t(meta.abilityKey) : name;
}
