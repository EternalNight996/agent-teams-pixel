/** 境界：按修士当前任务完成度映射凡人流五境。 */
export const REALM_KEYS = ['realm.qi', 'realm.foundation', 'realm.golden', 'realm.nascent', 'realm.spirit'] as const

export function realmKey(progress: number): (typeof REALM_KEYS)[number] {
  const clamped = Math.max(0, Math.min(100, progress))
  const index = Math.min(REALM_KEYS.length - 1, Math.floor(clamped / 20))
  return REALM_KEYS[index] as (typeof REALM_KEYS)[number]
}
