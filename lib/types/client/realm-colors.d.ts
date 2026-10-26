export interface RealmPalette {
    /** 等级牌边框 / 强调色。 */
    readonly border: string;
    /** 等级牌底色。 */
    readonly background: string;
    /** 等级文字颜色。 */
    readonly text: string;
    /** 升级进度条颜色。 */
    readonly bar: string;
}
/** 十五重境界，顺序与 CULTIVATION_REALMS / REALM_BANDS 一致。 */
export declare const REALM_PALETTES: readonly RealmPalette[];
/** 某个等级对应的境界调色板。 */
export declare function realmPaletteForLevel(level: number): RealmPalette;
