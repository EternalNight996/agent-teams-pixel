/**
 * 装备外观映射：把「天机阁」里的物品 id 换成场景里真正画得出来的形状 / 配色。
 *
 * 场景只认识形状，不认识业务；这层纯函数让武器切换有可见差异，也方便测试。
 */

/** 本命法器的外形。 */
export type WeaponShape = 'sword' | 'saber' | 'orb' | 'staff' | 'bolt' | 'trident' | 'star' | 'planet'

/** 坐骑模型族。 */
export type MountModel = 'beast' | 'crane' | 'qilin' | 'dragon' | 'jiao' | 'phoenix' | 'dao'

/** 装备灵光色调。 */
export interface EquipTone {
  readonly name: 'mortal' | 'spirit' | 'immortal' | 'dao'
  /** 主色（线条 / 填充）。 */
  readonly color: string
  /** 光晕色（rgba 用，逗号分隔）。 */
  readonly glow: string
  /** 场景里的缩放，越贵气越大一点。 */
  readonly scale: number
}

/** 物品 id -> 武器外形。未知 id 退化成普通剑。 */
export function weaponShapeFor(itemId: string | undefined): WeaponShape {
  switch (itemId) {
    case 'weapon-spirit': return 'saber'
    case 'weapon-treasure': return 'orb'
    case 'weapon-spirit-treasure': return 'orb'
    case 'weapon-core': return 'trident'
    case 'weapon-divine': return 'bolt'
    case 'weapon-immortal': return 'staff'
    case 'weapon-immortal-high': return 'staff'
    case 'weapon-true-immortal': return 'star'
    case 'weapon-dao': return 'planet'
    case 'weapon-tao':
    default: return 'sword'
  }
}

/** 等级 -> 灵光色调；越晚解锁越亮。 */
export function toneForTier(tier: number): EquipTone {
  if (tier >= 2800) return { name: 'dao', color: '#f2c14e', glow: '242, 193, 78', scale: 1.22 }
  if (tier >= 500) return { name: 'immortal', color: '#c39bff', glow: '195, 155, 255', scale: 1.12 }
  if (tier >= 50) return { name: 'spirit', color: '#8fe3ff', glow: '143, 227, 255', scale: 1.02 }
  return { name: 'mortal', color: '#d8cfc0', glow: '216, 207, 192', scale: 0.92 }
}

/** 坐骑物品 id -> 模型族（只有 beast 形态会用到）。 */
export function mountModelFor(variant: string | undefined): MountModel {
  if (variant === undefined) return 'beast'
  if (variant.includes('crane')) return 'crane'
  if (variant.includes('qilin') || variant.includes('kirin')) return 'qilin'
  if (variant.includes('phoenix')) return 'phoenix'
  if (variant.includes('dao')) return 'dao'
  if (variant.includes('jiao')) return 'jiao'
  if (variant.includes('dragon')) return 'dragon'
  return 'beast'
}
