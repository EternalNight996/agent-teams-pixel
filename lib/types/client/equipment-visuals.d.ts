/**
 * 装备外观映射：把「天机阁」里的物品 id 换成场景里真正画得出来的形状 / 配色。
 *
 * 场景只认识形状，不认识业务；这层纯函数让武器切换有可见差异，也方便测试。
 */
/** 本命法器的外形。 */
export type WeaponShape = 'sword' | 'saber' | 'orb' | 'staff' | 'bolt' | 'trident' | 'star' | 'planet';
/** 坐骑模型族。 */
export type MountModel = 'beast' | 'crane' | 'qilin' | 'dragon' | 'jiao' | 'phoenix' | 'dao';
/** 装备灵光色调。 */
export interface EquipTone {
    readonly name: 'mortal' | 'spirit' | 'immortal' | 'dao';
    /** 主色（线条 / 填充）。 */
    readonly color: string;
    /** 光晕色（rgba 用，逗号分隔）。 */
    readonly glow: string;
    /** 场景里的缩放，越贵气越大一点。 */
    readonly scale: number;
}
/** 物品 id -> 武器外形。未知 id 退化成普通剑。 */
export declare function weaponShapeFor(itemId: string | undefined): WeaponShape;
/** 等级 -> 灵光色调；越晚解锁越亮。 */
export declare function toneForTier(tier: number): EquipTone;
/** 坐骑物品 id -> 模型族（只有 beast 形态会用到）。 */
export declare function mountModelFor(variant: string | undefined): MountModel;
