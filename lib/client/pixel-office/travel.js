/**
 * 修士出行形态：默认步行，只有装上了飞剑或神兽才会离地飞行。
 *
 * 形态是纯函数，输入等级与玩家在「天机阁」里的选择，输出场景该画什么。
 * 放在独立模块里，是因为这条规则一度按等级自动御剑（Lv.5 起全队悬浮），
 * 既难察觉也难以回归——现在用测试把它钉死。
 */
/** 解锁飞剑的等级。 */
export const SWORD_LEVEL = 5;
/** 解锁神兽的等级。 */
export const BEAST_LEVEL = 8;
/**
 * 离地高度（世界像素）：骑手脚尖正好落在剑脊 / 兽鞍上。
 *
 * 数值要高于矮案案面（baseY−17）：御剑/骑兽是“飞起来”，不是站在案上的剑上。
 */
export const TRAVEL_LIFT = {
    walk: 0,
    sword: 24,
    beast: 38,
};
/**
 * 把「等级 + 装备选择」折算成场景形态。
 *
 * 关键约束：默认（未选/auto/off）一律步行；只有显式选了 sword/beast 且等级
 * 够格才离地。等级不够时退回步行，不偷偷飞起来。
 */
export function travelFormFor(level, override) {
    const safeLevel = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
    if (override === 'sword')
        return safeLevel >= SWORD_LEVEL ? 'sword' : 'walk';
    if (override === 'beast')
        return safeLevel >= BEAST_LEVEL ? 'beast' : 'walk';
    return 'walk';
}
/** 美术画布高度：头顶在 baseY − 92，鞋底正好落在 baseY。 */
export const CHARACTER_HEIGHT = 92;
/** 鞋高：脚不是悬空的，鞋底贴着地面。 */
export const SHOE_HEIGHT = 7;
/**
 * mini 缩放：像素人定位是可爱小手办，美术按 92px 画完整体缩到约 56px，
 * 汉服细节不丢，人也不会显得又高又怪。
 */
export const CHARACTER_SCALE = 0.61;
/** 场景里实际看到的身形高度（名牌、等级框、热区都按这个对齐）。 */
export const CHARACTER_DISPLAY_HEIGHT = Math.round(CHARACTER_HEIGHT * CHARACTER_SCALE);
/** 由脚底基准线推算整具身形；名字/等级框都按这套高度对齐。 */
export function characterRig(baseY) {
    const headY = baseY - CHARACTER_HEIGHT;
    const bodyY = headY + 17;
    const waistY = bodyY + 22;
    const hemY = waistY + 22;
    const shoeY = baseY - SHOE_HEIGHT;
    return { headY, bodyY, waistY, hemY, shoeY };
}
/** 双击循环：步行 → 御剑 → 神兽 → 步行，按等级裁剪可选形态。 */
export function nextTravelForm(level, current) {
    const safeLevel = Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
    if (current === 'walk')
        return safeLevel >= SWORD_LEVEL ? 'sword' : 'walk';
    if (current === 'sword')
        return safeLevel >= BEAST_LEVEL ? 'beast' : 'walk';
    return 'walk';
}
