/** Built-in roles, in picker order. */
export const ROLE_META = [
    { id: 'planner', nameKey: 'role.planner.name', abilityKey: 'role.planner.ability' },
    { id: 'implementer', nameKey: 'role.implementer.name', abilityKey: 'role.implementer.ability' },
    { id: 'frontend', nameKey: 'role.frontend.name', abilityKey: 'role.frontend.ability' },
    { id: 'backend', nameKey: 'role.backend.name', abilityKey: 'role.backend.ability' },
    { id: 'integrator', nameKey: 'role.integrator.name', abilityKey: 'role.integrator.ability' },
    { id: 'security', nameKey: 'role.security.name', abilityKey: 'role.security.ability' },
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
    { id: 'talisman', nameKey: 'role.talisman.name', abilityKey: 'role.talisman.ability' },
    { id: 'healer', nameKey: 'role.healer.name', abilityKey: 'role.healer.ability' },
    { id: 'beastmaster', nameKey: 'role.beastmaster.name', abilityKey: 'role.beastmaster.ability' },
    { id: 'puppeteer', nameKey: 'role.puppeteer.name', abilityKey: 'role.puppeteer.ability' },
    { id: 'musician', nameKey: 'role.musician.name', abilityKey: 'role.musician.ability' },
    { id: 'poisoner', nameKey: 'role.poisoner.name', abilityKey: 'role.poisoner.ability' },
    { id: 'monk', nameKey: 'role.monk.name', abilityKey: 'role.monk.ability' },
    { id: 'demon', nameKey: 'role.demon.name', abilityKey: 'role.demon.ability' },
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
