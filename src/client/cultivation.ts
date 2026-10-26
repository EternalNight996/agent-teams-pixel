/**
 * 修炼体系：修为全局持久化，任务完成快、挂机慢；等级上限 9999。
 *
 * 这里负责“修为 -> 等级/境界/装备/技能解锁”，修为累积由 cultivation-store 负责。
 */
export const CULTIVATION_REALMS = [
  'realm.mortal',
  'realm.qi',
  'realm.foundation',
  'realm.golden',
  'realm.nascent',
  'realm.spirit',
  'realm.void',
  'realm.integration',
  'realm.mahayana',
  'realm.tribulation',
  'realm.trueImmortal',
  'realm.goldenImmortal',
  'realm.taiyi',
  'realm.daluo',
  'realm.dao',
] as const

export type CultivationRealmKey = (typeof CULTIVATION_REALMS)[number]

export type CultivationSkillKey =
  | 'skill.aura'
  | 'skill.shield'
  | 'skill.swordArray'
  | 'skill.gale'
  | 'skill.law'
  | 'skill.swordQi'
  | 'skill.pillFire'
  | 'skill.infantFire'
  | 'skill.divinePower'
  | 'skill.domain'
  | 'skill.dharma'
  | 'skill.immortalArt'
  | 'skill.daoArt'

export type CultivationItemKind = 'weapon' | 'mount' | 'skill'

export interface CultivationItem {
  readonly id: string
  readonly kind: CultivationItemKind
  readonly level: number
  readonly key: string
  readonly icon: string
  /** 坐骑对应的场景形态。 */
  readonly form?: 'auto' | 'sword' | 'beast' | 'off'
}

/** 装备物品栏：等级里程碑解锁。 */
export const CULTIVATION_ITEMS: readonly CultivationItem[] = [
  { id: 'weapon-tao', kind: 'weapon', level: 1, key: 'item.weapon.tao', icon: '🗡' },
  { id: 'weapon-spirit', kind: 'weapon', level: 3, key: 'item.weapon.spirit', icon: '⚔' },
  { id: 'weapon-treasure', kind: 'weapon', level: 10, key: 'item.weapon.treasure', icon: '🔮' },
  { id: 'weapon-immortal', kind: 'weapon', level: 50, key: 'item.weapon.immortal', icon: '🪄' },
  { id: 'weapon-divine', kind: 'weapon', level: 500, key: 'item.weapon.divine', icon: '⚡' },
  { id: 'weapon-core', kind: 'weapon', level: 150, key: 'item.weapon.core', icon: '🔱' },
  { id: 'weapon-spirit-treasure', kind: 'weapon', level: 700, key: 'item.weapon.spiritTreasure', icon: '🔮' },
  { id: 'weapon-immortal-high', kind: 'weapon', level: 2800, key: 'item.weapon.immortalHigh', icon: '🪄' },
  { id: 'weapon-true-immortal', kind: 'weapon', level: 5200, key: 'item.weapon.trueImmortal', icon: '🌟' },
  { id: 'weapon-dao', kind: 'weapon', level: 9000, key: 'item.weapon.dao', icon: '🪐' },
  { id: 'mount-auto', kind: 'mount', level: 1, key: 'office.mountAuto', icon: '✦', form: 'auto' },
  { id: 'mount-walk', kind: 'mount', level: 1, key: 'office.mountWalk', icon: '🚶', form: 'off' },
  { id: 'mount-sword', kind: 'mount', level: 5, key: 'item.mount.sword', icon: '🗡', form: 'sword' },
  { id: 'mount-beast', kind: 'mount', level: 8, key: 'item.mount.beast', icon: '🐉', form: 'beast' },
  { id: 'mount-crane', kind: 'mount', level: 20, key: 'item.mount.crane', icon: '🕊', form: 'beast' },
  { id: 'mount-qilin', kind: 'mount', level: 50, key: 'item.mount.qilin', icon: '🦄', form: 'beast' },
  { id: 'mount-dragon', kind: 'mount', level: 100, key: 'item.mount.dragon', icon: '🐲', form: 'beast' },
  { id: 'mount-jiao', kind: 'mount', level: 350, key: 'item.mount.jiao', icon: '🐍', form: 'beast' },
  { id: 'mount-immortal-crane', kind: 'mount', level: 1200, key: 'item.mount.immortalCrane', icon: '🕊', form: 'beast' },
  { id: 'mount-kirin', kind: 'mount', level: 2800, key: 'item.mount.kirin', icon: '🦄', form: 'beast' },
  { id: 'mount-true-dragon', kind: 'mount', level: 5200, key: 'item.mount.trueDragon', icon: '🐉', form: 'beast' },
  { id: 'mount-phoenix', kind: 'mount', level: 8000, key: 'item.mount.phoenix', icon: '🔥', form: 'beast' },
  { id: 'mount-dao-beast', kind: 'mount', level: 9800, key: 'item.mount.daoBeast', icon: '🦣', form: 'beast' },
  { id: 'skill-aura', kind: 'skill', level: 2, key: 'skill.aura', icon: '✨' },
  { id: 'skill-shield', kind: 'skill', level: 7, key: 'skill.shield', icon: '🛡' },
  { id: 'skill-swordarray', kind: 'skill', level: 15, key: 'skill.swordArray', icon: '🌀' },
  { id: 'skill-gale', kind: 'skill', level: 30, key: 'skill.gale', icon: '🌪' },
  { id: 'skill-law', kind: 'skill', level: 100, key: 'skill.law', icon: '🪷' },
  { id: 'skill-swordqi', kind: 'skill', level: 50, key: 'skill.swordQi', icon: '🗡' },
  { id: 'skill-pillfire', kind: 'skill', level: 150, key: 'skill.pillFire', icon: '🔥' },
  { id: 'skill-infantfire', kind: 'skill', level: 350, key: 'skill.infantFire', icon: '👶' },
  { id: 'skill-divinepower', kind: 'skill', level: 700, key: 'skill.divinePower', icon: '✨' },
  { id: 'skill-domain', kind: 'skill', level: 1200, key: 'skill.domain', icon: '🌌' },
  { id: 'skill-dharma', kind: 'skill', level: 2800, key: 'skill.dharma', icon: '🪷' },
  { id: 'skill-immortalart', kind: 'skill', level: 5200, key: 'skill.immortalArt', icon: '🌟' },
  { id: 'skill-daoart', kind: 'skill', level: 9000, key: 'skill.daoArt', icon: '🪐' },
]

/** 等级上限：9999。 */
export const LEVEL_CAP = 9999

/** 境界带宽：炼气/筑基/…一路扩到 9999。 */
const REALM_BANDS = [4, 49, 149, 349, 699, 1199, 1899, 2799, 3899, 5199, 6699, 7999, 8999, 9799, 9999]

/** 升到下一级还需要的修为（随等级线性增长）。 */
export function xpNeed(level: number): number {
  return 60 + (level - 1) * 45
}

/** 指定等级所需的累计修为（用于调试/直接提级）。 */
export function xpForLevel(level: number): number {
  const target = Math.min(LEVEL_CAP, Math.max(1, Math.floor(level)))
  let xp = 0
  for (let current = 1; current < target; current += 1) xp += xpNeed(current)
  return xp
}

export interface Cultivation {
  readonly level: number
  readonly xp: number
  readonly floor: number
  readonly next: number
  readonly ratio: number
  readonly rankKey: CultivationRealmKey
  readonly skills: readonly CultivationSkillKey[]
}

export function cultivationFromXp(xp: number): Cultivation {
  const safe = Math.max(0, xp)
  let level = 1
  let floor = 0
  let need = xpNeed(1)
  while (level < LEVEL_CAP && safe >= floor + need) {
    floor += need
    level += 1
    need = xpNeed(level)
  }
  let realmIndex = REALM_BANDS.findIndex(band => level <= band)
  if (realmIndex < 0) realmIndex = REALM_BANDS.length - 1
  const ratio = level >= LEVEL_CAP ? 1 : Math.min(1, Math.max(0, (safe - floor) / need))
  const skills = CULTIVATION_ITEMS
    .filter(item => item.kind === 'skill' && level >= item.level)
    .map(item => item.key as CultivationSkillKey)
  return {
    level,
    xp: safe,
    floor,
    next: floor + need,
    ratio,
    rankKey: CULTIVATION_REALMS[realmIndex] as CultivationRealmKey,
    skills,
  }
}

/** 当前等级下已解锁的全部装备/技能（用于物品栏与 tooltip）。 */
export function unlockedItems(level: number): readonly CultivationItem[] {
  return CULTIVATION_ITEMS.filter(item => level >= item.level)
}

/** 挂机修为：每 10 秒结算 1 点，主要靠任务。 */
export const IDLE_XP_PER_10S = 1
/** 完成一个任务获得的修为。 */
export const TASK_XP = 60
/** 掌门因宗门任务完成获得的带队修为。 */
export const CAPTAIN_TASK_XP = 40

export function memberKey(name: string): string {
  return `member:${name.trim()}`
}

export function captainKey(teamName: string): string {
  return `captain:${teamName.trim()}`
}
