/**
 * Deterministic pixel-office canvas renderer for one AgentTeams snapshot.
 *
 * The scene is framework-agnostic: React owns the canvas element, sizing and
 * the model, while this module owns the animation loop and all drawing. Every
 * frame is defensive — a drawing error degrades to a plain backdrop and keeps
 * the loop alive so a single bad model can never blank the office.
 *
 * Layout contract: characters and desks are drawn in the first pass and every
 * label/bubble in a second pass, so badges never get painted over by a later
 * row. The world grows taller with the row count instead of squeezing rows.
 */
import { roleVisual } from "../role-visuals.js";
import { CHARACTER_DISPLAY_HEIGHT, CHARACTER_SCALE, SHOE_HEIGHT, TRAVEL_LIFT, characterRig, nextTravelForm, travelFormFor, } from "./travel.js";
import { FACILITIES, FACILITY_ORDER, WALL_HEIGHT } from "./office-actions.js";
import { mountModelFor, toneForTier, weaponShapeFor } from "../equipment-visuals.js";
import { realmPaletteForLevel } from "../realm-colors.js";
const WORLD_W = 520;
const WORLD_MIN_H = 300;
const CELL_H = 150;
const TOP_PAD = 104;
const MAX_COLUMNS = 4;
const DESK_W = 72;
/** 中庭可点物件：配置水晶。 */
// 保持在靠右的对称位，避免压到最右侧的修士。
const DIAL_AT = { x: WORLD_W - 132, y: WALL_HEIGHT + 46 };
const COLORS = {
    wall: '#2f3b33',
    wallShade: '#27322b',
    floor: '#e2d6b8',
    floorLine: '#d3c5a2',
    desk: '#7c5b3a',
    deskTop: '#a67c4f',
    monitor: '#8a6a3a',
    screen: '#7fd4ff',
    screenIdle: '#39445a',
    label: '#e8eef8',
    labelBg: 'rgba(20, 24, 32, 0.82)',
    bubble: 'rgba(24, 30, 42, 0.92)',
    captain: '#f2c14e',
    alert: '#ef6b6b',
    good: '#67d9a5',
    idle: '#8fa0bb',
};
const SKIN = ['#f3c9a3', '#e8b48b', '#d79a70', '#c68862', '#a96f4d'];
const SHIRT = ['#5b8def', '#8a6ff0', '#3fbf9a', '#e6a94d', '#e06b8d', '#63b5d8', '#9bbf57', '#c77dbf'];
function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        h ^= value.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
function pick(list, seed) {
    return list[seed % list.length] ?? list[0];
}
function truncate(text, max) {
    return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1))}…`;
}
/** Rounded rectangle helper (canvas has no built-in one). */
function roundRect(g, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + radius, y);
    g.arcTo(x + w, y, x + w, y + h, radius);
    g.arcTo(x + w, y + h, x, y + h, radius);
    g.arcTo(x, y + h, x, y, radius);
    g.arcTo(x, y, x + w, y, radius);
    g.closePath();
}
/** Hex color + alpha as a CSS rgba() string (canvas gradients). */
function rgba(hex, alpha) {
    return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
}
function stateTone(activity) {
    if (activity === 'working')
        return COLORS.good;
    if (activity === 'unknown')
        return COLORS.alert;
    return COLORS.idle;
}
export function createPixelScene(canvas, options = {}) {
    const context = canvas.getContext('2d');
    if (context === null) {
        return { render() { }, resize() { }, dispose() { }, setHover() { }, jump() { }, cycleMount() { }, setMount() { }, setEquip() { }, hitTest() { return undefined; } };
    }
    const g = context;
    let model;
    let disposed = false;
    let raf;
    let width = WORLD_W;
    let height = WORLD_MIN_H;
    let worldH = WORLD_MIN_H;
    let dpr = 1;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let hitAreas = [];
    let hovered;
    const zoom = options.zoom ?? 1;
    // 双击弹跳：按成员 id 记录起跳帧时间（-1 表示刚请求）。
    const jumps = new Map();
    // 出行形态（天机阁装备 / 双击切换）：默认步行，只有 sword/beast 才离地。
    const mountOverride = new Map();
    // 具体坐骑 id（灵兽/仙鹤/麒麟/龙/凤凰/道兽…），决定画哪套模型。
    const mountVariant = new Map();
    // 已装备的法器/技能（由「天机阁」物品栏写入），用于即时外观切换。
    const weaponEquip = new Map();
    const skillEquip = new Map();
    // 换装反馈：头顶飘出「⚔ 桃木剑」，脚下扩散一圈灵光（1.4 秒）。
    const equipFlash = new Map();
    const EQUIP_FLASH_MS = 1400;
    const nowMs = () => (typeof performance === 'undefined' ? Date.now() : performance.now());
    let cultivationFx = [];
    const lastXp = new Map();
    const lastLevel = new Map();
    function fit() {
        const ratio = Math.min(width / WORLD_W, height / worldH);
        scale = Math.max(0.2, ratio) * zoom;
        offsetX = (width - WORLD_W * scale) / 2;
        offsetY = (height - worldH * scale) / 2;
    }
    /** 悬停/打开态：描金边，让墙面设施看起来可点。 */
    function paintFacilityHover(rect, hovered, active) {
        if (!hovered && !active)
            return;
        g.strokeStyle = active ? 'rgba(212, 175, 55, 0.95)' : 'rgba(255, 233, 168, 0.8)';
        g.lineWidth = active ? 1.4 : 1;
        roundRect(g, rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, 5);
        g.stroke();
        if (hovered && !active) {
            g.fillStyle = '#d4af37';
            g.fillRect(rect.x - 3, rect.y - 3, 2, 2);
            g.fillRect(rect.x + rect.w + 1, rect.y - 3, 2, 2);
        }
    }
    /** 设施下的木牌标签：名字就是可点提示。 */
    function paintFacilityLabel(rect, label, hovered, active) {
        // A trailing chevron is the quiet "this opens something" cue on every tag.
        const text = `${truncate(label, 11)} ›`;
        g.font = hovered || active ? 'bold 9px "Segoe UI", sans-serif' : '9px "Segoe UI", sans-serif';
        const width = Math.ceil(g.measureText(text).width) + 10;
        const x = Math.round(rect.x + rect.w / 2 - width / 2);
        const y = 79;
        g.fillStyle = active ? 'rgba(212, 175, 55, 0.95)' : hovered ? 'rgba(42, 52, 44, 0.96)' : 'rgba(14, 18, 20, 0.7)';
        roundRect(g, x, y, width, 13, 3);
        g.fill();
        g.fillStyle = active ? '#241a08' : hovered ? '#ffe9a8' : '#e2ce92';
        g.fillText(text, x + 5, y + 10);
    }
    /** 配置入口：大水晶（2026-10-26 由「阵盘」改为水晶，更醒目）。 */
    function paintHallDial(cx, cy, time, hovered, active, label) {
        const bob = Math.sin(time / 1400) * 2.2;
        const pulse = 0.5 + 0.5 * Math.sin(time / 1100);
        g.save();
        g.translate(cx, cy + bob);
        // 地面投影 + 底光
        g.fillStyle = 'rgba(24, 40, 52, 0.35)';
        g.beginPath();
        g.ellipse(0, 20, 17, 6, 0, 0, Math.PI * 2);
        g.fill();
        const glow = g.createRadialGradient(0, 2, 3, 0, 2, 40);
        glow.addColorStop(0, `rgba(120, 210, 255, ${(0.26 + pulse * 0.16).toFixed(3)})`);
        glow.addColorStop(0.6, 'rgba(96, 180, 255, 0.10)');
        glow.addColorStop(1, 'rgba(96, 180, 255, 0)');
        g.fillStyle = glow;
        g.beginPath();
        g.ellipse(0, 6, 38, 22, 0, 0, Math.PI * 2);
        g.fill();
        // 六棱晶体
        const top = -34;
        const waist = -8;
        const bottom = 18;
        const bodyGrad = g.createLinearGradient(-12, top, 12, bottom);
        bodyGrad.addColorStop(0, active ? '#eaf7ff' : '#bfe8ff');
        bodyGrad.addColorStop(0.45, active ? '#9fd6ff' : '#6fb6e0');
        bodyGrad.addColorStop(1, active ? '#7fbde8' : '#3f7f9c');
        g.fillStyle = bodyGrad;
        g.beginPath();
        g.moveTo(0, top);
        g.lineTo(11, waist - 6);
        g.lineTo(8, bottom - 2);
        g.lineTo(-8, bottom - 2);
        g.lineTo(-11, waist - 6);
        g.closePath();
        g.fill();
        // 棱线 + 高光
        g.strokeStyle = active ? 'rgba(255, 255, 255, 0.85)' : 'rgba(226, 246, 255, 0.62)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, top);
        g.lineTo(0, bottom - 2);
        g.moveTo(-11, waist - 6);
        g.lineTo(11, waist - 6);
        g.stroke();
        g.fillStyle = 'rgba(255, 255, 255, 0.55)';
        g.beginPath();
        g.moveTo(-3, top + 7);
        g.lineTo(1, top + 9);
        g.lineTo(-1, waist - 3);
        g.lineTo(-5, waist - 6);
        g.closePath();
        g.fill();
        // 悬浮碎晶
        g.fillStyle = active ? 'rgba(230, 248, 255, 0.9)' : 'rgba(180, 228, 255, 0.75)';
        for (let i = 0; i < 3; i += 1) {
            const angle = time / 1500 + (i / 3) * Math.PI * 2;
            const px = Math.cos(angle) * 21;
            const py = -12 + Math.sin(angle) * 8;
            g.fillRect(px - 1.5, py - 1.5, 3, 3);
        }
        g.restore();
        paintFloorObjectLabel(cx, cy + 24, label, hovered || active);
    }
    /** 中庭物件的小标签，和墙面设施标签同一风格。 */
    function paintFloorObjectLabel(cx, y, label, highlighted) {
        if (label === '')
            return;
        const text = `${truncate(label, 11)} ›`;
        g.font = highlighted ? 'bold 9px "Segoe UI", sans-serif' : '9px "Segoe UI", sans-serif';
        const width = Math.ceil(g.measureText(text).width) + 10;
        const x = Math.round(cx - width / 2);
        g.fillStyle = highlighted ? 'rgba(42, 52, 44, 0.96)' : 'rgba(12, 16, 20, 0.62)';
        roundRect(g, x, Math.round(y), width, 13, 3);
        g.fill();
        g.fillStyle = highlighted ? '#ffe9a8' : '#e2ce92';
        g.fillText(text, x + 5, Math.round(y) + 10);
    }
    /** 藏经阁：道统、成员与计划。 */
    function paintLibrary(rect, hovered, active) {
        g.fillStyle = '#3a2718';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 3);
        g.fill();
        g.fillStyle = '#1b120b';
        g.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
        const books = ['#a34b3f', '#3f6aa3', '#a3873f', '#3f8a6a', '#7a3f8a'];
        for (let row = 0; row < 3; row += 1) {
            const shelfY = rect.y + 7 + row * 16;
            g.fillStyle = '#2c1d12';
            g.fillRect(rect.x + 5, shelfY + 12, rect.w - 10, 2);
            for (let i = 0; i < 10; i += 1) {
                g.fillStyle = books[(i + row * 2) % books.length];
                g.fillRect(rect.x + 7 + i * 8, shelfY + 1, 5, 11);
            }
        }
        // 卷轴搭在柜顶
        g.fillStyle = '#d8c48a';
        g.fillRect(rect.x + rect.w - 20, rect.y - 3, 14, 3);
        g.fillStyle = '#8a1c1c';
        g.fillRect(rect.x + rect.w - 21, rect.y - 3, 2, 3);
        paintFacilityHover(rect, hovered, active);
    }
    /** 开宗入口：木构山门（保留原造型），门洞中央加入旋转传输。 */
    function paintGate(rect, name, hovered, active, time) {
        // 檐顶
        g.fillStyle = '#1f2a25';
        g.beginPath();
        g.moveTo(rect.x - 8, rect.y + 11);
        g.lineTo(rect.x + rect.w / 2, rect.y - 3);
        g.lineTo(rect.x + rect.w + 8, rect.y + 11);
        g.closePath();
        g.fill();
        g.fillStyle = '#3b2a1e';
        g.fillRect(rect.x - 3, rect.y + 11, rect.w + 6, 4);
        // 门洞与灵气
        g.fillStyle = '#0d1512';
        g.fillRect(rect.x + 10, rect.y + 16, rect.w - 20, rect.h - 16);
        const glow = g.createLinearGradient(0, rect.y + rect.h - 8, 0, rect.y + 20);
        glow.addColorStop(0, 'rgba(103, 217, 165, 0.26)');
        glow.addColorStop(1, 'rgba(103, 217, 165, 0)');
        g.fillStyle = glow;
        g.fillRect(rect.x + 10, rect.y + 16, rect.w - 20, rect.h - 20);
        // 门洞中央：分层涡流 + 粒子 + 亮核，做成有质感的传输法阵
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + rect.h * 0.62;
        const pulse = 0.5 + 0.5 * Math.sin(time / 900);
        const doorX = rect.x + 10;
        const doorY = rect.y + 16;
        const doorW = rect.w - 20;
        const doorH = rect.h - 16;
        g.save();
        g.beginPath();
        g.rect(doorX, doorY, doorW, doorH);
        g.clip();
        // 深色底 + 中央辉光
        const base = g.createRadialGradient(cx, cy, 1, cx, cy, Math.max(26, doorW * 0.34));
        base.addColorStop(0, `rgba(170, 255, 228, ${(0.16 + pulse * 0.08).toFixed(3)})`);
        base.addColorStop(0.45, 'rgba(48, 128, 110, 0.16)');
        base.addColorStop(1, 'rgba(4, 12, 10, 0.9)');
        g.fillStyle = base;
        g.fillRect(doorX, doorY, doorW, doorH);
        // 内膜：纵向拉长的漩涡
        const membrane = g.createRadialGradient(cx, cy + 4, 2, cx, cy, Math.max(18, doorW * 0.2));
        membrane.addColorStop(0, `rgba(214, 255, 244, ${(0.55 + pulse * 0.2).toFixed(3)})`);
        membrane.addColorStop(0.35, 'rgba(120, 236, 200, 0.35)');
        membrane.addColorStop(0.75, 'rgba(30, 90, 78, 0.22)');
        membrane.addColorStop(1, 'rgba(8, 20, 18, 0)');
        g.fillStyle = membrane;
        g.beginPath();
        g.ellipse(cx, cy, Math.max(10, doorW * 0.13), Math.max(16, doorH * 0.42), 0, 0, Math.PI * 2);
        g.fill();
        // 多层正反旋转的弧线，叠出涡流层次
        for (let layer = 0; layer < 5; layer += 1) {
            const dir = layer % 2 === 0 ? 1 : -1;
            const spin = dir * time / (900 + layer * 260) + layer * 0.7;
            const rx = doorW * (0.1 + layer * 0.035);
            const ry = doorH * (0.16 + layer * 0.055);
            g.strokeStyle = `rgba(150, 245, 214, ${(0.24 - layer * 0.035 + pulse * 0.05).toFixed(3)})`;
            g.lineWidth = layer === 0 ? 1.6 : 1;
            g.beginPath();
            g.ellipse(cx, cy, rx, ry, spin, spin, spin + Math.PI * 1.25);
            g.stroke();
        }
        // 像素粒子：由外向内螺旋，大小与透明度分层
        for (let i = 0; i < 18; i += 1) {
            const seed = (hash('gate' + i) % 1000) / 1000;
            const life = ((time / (1400 + seed * 900)) + seed) % 1;
            const angle = life * Math.PI * 2.4 + seed * Math.PI * 2;
            const radius = (1 - life) * (doorW * 0.3) + 2;
            const px = cx + Math.cos(angle) * radius;
            const py = cy + Math.sin(angle) * radius * 0.85;
            const size = life > 0.82 ? 1 : life > 0.5 ? 2 : 3;
            g.fillStyle = `rgba(214, 255, 244, ${(0.15 + (1 - life) * 0.65).toFixed(3)})`;
            g.fillRect(px - size / 2, py - size / 2, size, size);
        }
        // 中心亮核 + 柔光
        const core = g.createRadialGradient(cx, cy, 0.5, cx, cy, 14);
        core.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        core.addColorStop(0.4, `rgba(200, 255, 236, ${(0.5 + pulse * 0.25).toFixed(3)})`);
        core.addColorStop(1, 'rgba(160, 255, 220, 0)');
        g.fillStyle = core;
        g.beginPath();
        g.ellipse(cx, cy, 10, 16, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255, 255, 255, 0.9)';
        g.fillRect(cx - 1, cy - 1, 2, 2);
        // 门洞内侧投影：左右压暗，突出门框厚度
        const inner = g.createLinearGradient(doorX, 0, doorX + doorW, 0);
        inner.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        inner.addColorStop(0.12, 'rgba(0, 0, 0, 0)');
        inner.addColorStop(0.88, 'rgba(0, 0, 0, 0)');
        inner.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        g.fillStyle = inner;
        g.fillRect(doorX, doorY, doorW, doorH);
        g.restore();
        // 门柱
        g.fillStyle = '#6b3a2a';
        g.fillRect(rect.x + 2, rect.y + 15, 9, rect.h - 15);
        g.fillRect(rect.x + rect.w - 11, rect.y + 15, 9, rect.h - 15);
        g.fillStyle = '#8a4b34';
        g.fillRect(rect.x + 2, rect.y + 15, 2, rect.h - 15);
        g.fillRect(rect.x + rect.w - 11, rect.y + 15, 2, rect.h - 15);
        // 牌匾
        const pw = Math.min(96, rect.w - 24);
        const px = rect.x + Math.round((rect.w - pw) / 2);
        const py = rect.y + 19;
        g.fillStyle = '#6b4a2a';
        roundRect(g, px - 3, py - 3, pw + 6, 22, 3);
        g.fill();
        g.fillStyle = '#d4af37';
        roundRect(g, px, py, pw, 16, 2);
        g.fill();
        const label = truncate(name, 7);
        g.fillStyle = '#3a2410';
        g.font = 'bold 9px "Segoe UI", sans-serif';
        g.fillText(label, px + (pw - g.measureText(label).width) / 2, py + 11);
        paintFacilityHover(rect, hovered, active);
    }
    function paintStele(rect, wall, hovered, active) {
        g.fillStyle = '#263630';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
        g.fill();
        g.fillStyle = '#5a6b60';
        roundRect(g, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 5);
        g.fill();
        g.fillStyle = '#1e2a24';
        roundRect(g, rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14, 3);
        g.fill();
        g.fillStyle = '#d4af37';
        g.font = 'bold 8px "Segoe UI", sans-serif';
        const title = truncate(wall?.title ?? '', 6);
        if (title !== '')
            g.fillText(title, rect.x + (rect.w - g.measureText(title).width) / 2, rect.y + 18);
        const ratio = wall === undefined || wall.total === 0 ? 0 : Math.min(1, wall.doneCount / wall.total);
        g.fillStyle = 'rgba(255, 255, 255, 0.18)';
        g.fillRect(rect.x + 12, rect.y + 22, rect.w - 24, 5);
        g.fillStyle = '#67d9a5';
        g.fillRect(rect.x + 12, rect.y + 22, Math.round((rect.w - 24) * ratio), 5);
        g.fillStyle = '#e8eef8';
        g.font = 'bold 13px "Segoe UI", sans-serif';
        const count = `${wall?.doneCount ?? 0}/${wall?.total ?? 0}`;
        g.fillText(count, rect.x + (rect.w - g.measureText(count).width) / 2, rect.y + 45);
        // 三色计数：行中 / 等前置 / 失败
        const dots = [
            [wall?.runningCount ?? 0, '#5b8def'],
            [wall?.waitingCount ?? 0, '#e0a94a'],
            [wall?.failedCount ?? 0, '#ef6b6b'],
        ];
        let dx = rect.x + 12;
        g.font = '7px "Segoe UI", sans-serif';
        for (const [value, tone] of dots) {
            g.fillStyle = tone;
            g.fillRect(dx, rect.y + 51, 4, 4);
            g.fillStyle = '#c9d5e3';
            g.fillText(String(value), dx + 6, rect.y + 55);
            dx += 20;
        }
        paintFacilityHover(rect, hovered, active);
    }
    /** 封神榜：墙上的一方金榜，刻着本宗留名，点开榜页面。 */
    function paintRanks(rect, hovered, active) {
        g.fillStyle = '#2a2418';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
        g.fill();
        g.fillStyle = '#6b5732';
        roundRect(g, rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6, 4);
        g.fill();
        g.fillStyle = '#16120c';
        roundRect(g, rect.x + 6, rect.y + 6, rect.w - 12, rect.h - 12, 2);
        g.fill();
        g.strokeStyle = '#d4af37';
        g.lineWidth = 1;
        g.strokeRect(rect.x + 7.5, rect.y + 7.5, rect.w - 15, rect.h - 15);
        // 竖排金色的留名笔画。
        g.fillStyle = '#e8c46a';
        for (let row = 0; row < 5; row += 1) {
            g.fillRect(rect.x + 13, rect.y + 15 + row * 6, 15 - (row % 2) * 4, 1);
            g.fillRect(rect.x + 36, rect.y + 15 + row * 6, 17 - (row % 3) * 3, 1);
        }
        // 朱印。
        g.fillStyle = '#b83a3a';
        g.fillRect(rect.x + rect.w - 20, rect.y + rect.h - 20, 10, 10);
        g.fillStyle = '#f2c14e';
        g.fillRect(rect.x + rect.w - 18, rect.y + rect.h - 18, 6, 1);
        g.fillRect(rect.x + rect.w - 16, rect.y + rect.h - 16, 1, 4);
        if (active || hovered) {
            g.globalAlpha = active ? 0.26 : 0.14;
            g.fillStyle = '#f2c14e';
            g.beginPath();
            g.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
            g.fill();
            g.globalAlpha = 1;
        }
        paintFacilityHover(rect, hovered, active);
    }
    /** 天机阁：法器/坐骑/技能的陈列柜，点开装备页。 */
    function paintGear(rect, hovered, active) {
        g.fillStyle = '#263630';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
        g.fill();
        g.fillStyle = '#4f5f55';
        roundRect(g, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 5);
        g.fill();
        g.fillStyle = '#1e2a24';
        roundRect(g, rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14, 3);
        g.fill();
        g.fillStyle = '#7a6a4a';
        g.fillRect(rect.x + 10, rect.y + 22, rect.w - 20, 2);
        g.fillRect(rect.x + 10, rect.y + 38, rect.w - 20, 2);
        g.fillStyle = '#8fe3ff';
        g.fillRect(rect.x + 14, rect.y + 14, 5, 7);
        g.fillRect(rect.x + 24, rect.y + 15, 4, 6);
        g.fillStyle = '#f2c14e';
        g.fillRect(rect.x + rect.w - 22, rect.y + 15, 5, 6);
        const cx = rect.x + rect.w / 2;
        const cy = rect.y + 31;
        const glow = g.createRadialGradient(cx, cy, 1, cx, cy, 13);
        glow.addColorStop(0, 'rgba(143, 227, 255, 0.9)');
        glow.addColorStop(0.6, 'rgba(143, 227, 255, 0.25)');
        glow.addColorStop(1, 'rgba(143, 227, 255, 0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(cx, cy, 13, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#e8fbff';
        g.beginPath();
        g.arc(cx, cy, 4, 0, Math.PI * 2);
        g.fill();
        paintFacilityHover(rect, hovered, active);
    }
    /** 宗门志：墙最右侧的一方石志（打开赞助/交流群/关于/反馈）。 */
    function paintAbout(rect, hovered, active) {
        // 石座与卷轴
        g.fillStyle = '#3b3326';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
        g.fill();
        g.fillStyle = '#6d5b3d';
        roundRect(g, rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6, 4);
        g.fill();
        g.fillStyle = '#e7dab4';
        roundRect(g, rect.x + 7, rect.y + 8, rect.w - 14, rect.h - 16, 2);
        g.fill();
        g.fillStyle = '#f6edd2';
        g.fillRect(rect.x + 9, rect.y + 10, rect.w - 18, rect.h - 20);
        // 竖排墨迹
        g.fillStyle = '#5a4a32';
        for (let row = 0; row < 5; row += 1) {
            g.fillRect(rect.x + 13, rect.y + 14 + row * 6, 20 - (row % 2) * 5, 1);
            g.fillRect(rect.x + 37, rect.y + 14 + row * 6, 7, 1);
        }
        // 朱印
        g.fillStyle = '#b83a3a';
        g.fillRect(rect.x + rect.w - 17, rect.y + rect.h - 17, 8, 8);
        g.fillStyle = '#f2c14e';
        g.fillRect(rect.x + rect.w - 15, rect.y + rect.h - 15, 4, 1);
        // 顶部挂绳
        g.strokeStyle = '#8a6a3a';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(rect.x + rect.w / 2 - 8, rect.y + 2);
        g.lineTo(rect.x + rect.w / 2, rect.y + 8);
        g.lineTo(rect.x + rect.w / 2 + 8, rect.y + 2);
        g.stroke();
        if (active || hovered) {
            g.globalAlpha = active ? 0.24 : 0.13;
            g.fillStyle = '#f2e6c4';
            g.beginPath();
            g.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
            g.fill();
            g.globalAlpha = 1;
        }
        paintFacilityHover(rect, hovered, active);
    }
    /** 传音阁：掌门收件箱，红点表示未读。 */
    function paintPost(rect, badge, hovered, active) {
        g.fillStyle = '#3a2718';
        roundRect(g, rect.x, rect.y, rect.w, rect.h, 3);
        g.fill();
        g.fillStyle = '#1b120b';
        g.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
        for (let i = 0; i < 3; i += 1) {
            const bx = rect.x + 9 + i * 22;
            g.fillStyle = '#4a3524';
            roundRect(g, bx, rect.y + 14, 18, 24, 2);
            g.fill();
            g.fillStyle = '#e8e2ce';
            g.fillRect(bx + 3, rect.y + 19, 12, 9);
            g.fillStyle = '#b9ae90';
            g.beginPath();
            g.moveTo(bx + 3, rect.y + 19);
            g.lineTo(bx + 9, rect.y + 24);
            g.lineTo(bx + 15, rect.y + 19);
            g.closePath();
            g.fill();
            g.fillStyle = '#8a1c1c';
            g.fillRect(bx + 7, rect.y + 25, 4, 4);
        }
        g.fillStyle = '#6b4a2a';
        g.fillRect(rect.x + 4, rect.y + 9, rect.w - 8, 3);
        g.fillStyle = '#d4af37';
        g.beginPath();
        g.arc(rect.x + rect.w / 2, rect.y + 7, 3.5, 0, Math.PI * 2);
        g.fill();
        if (badge > 0) {
            g.fillStyle = '#ef6b6b';
            g.beginPath();
            g.arc(rect.x + rect.w - 7, rect.y + 8, 6.5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#fff';
            g.font = 'bold 7px "Segoe UI", monospace';
            g.fillText(String(Math.min(9, badge)), rect.x + rect.w - 10, rect.y + 11);
        }
        paintFacilityHover(rect, hovered, active);
    }
    /** 中庭飘浮的灵气尘：纯氛围，让大块地面不显得空。 */
    function paintQiMotes(time) {
        const floorH = worldH - WALL_HEIGHT;
        if (floorH < 260)
            return;
        for (let i = 0; i < 12; i += 1) {
            const phase = ((time / 9000) + i / 12) % 1;
            const x = 24 + ((i * 137) % (WORLD_W - 48)) + Math.sin(time / 3200 + i * 1.7) * 14;
            const y = WALL_HEIGHT + 40 + (1 - phase) * (floorH - 60);
            const alpha = 0.16 * Math.sin(phase * Math.PI);
            if (alpha <= 0.01)
                continue;
            g.fillStyle = `rgba(236, 220, 160, ${alpha.toFixed(3)})`;
            g.fillRect(Math.round(x), Math.round(y), 1.5, 1.5);
        }
    }
    /** 地面聚灵阵：给高房间的空地面一点内容，纯装饰、不可点。 */
    function paintFloorFormation(time) {
        const floorH = worldH - WALL_HEIGHT;
        if (floorH < 220)
            return;
        const cx = WORLD_W / 2;
        const cy = WALL_HEIGHT + floorH * 0.56;
        const radius = Math.min(WORLD_W * 0.44, floorH * 0.46);
        const pulse = 0.55 + Math.abs(Math.sin(time / 2600)) * 0.45;
        g.lineWidth = 1;
        g.strokeStyle = `rgba(122, 102, 58, ${(0.24 * pulse).toFixed(3)})`;
        for (const ratio of [1, 0.66, 0.34]) {
            g.beginPath();
            g.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
            g.stroke();
        }
        for (let i = 0; i < 8; i += 1) {
            const angle = (i / 8) * Math.PI * 2;
            g.beginPath();
            g.moveTo(cx + Math.cos(angle) * radius * 0.36, cy + Math.sin(angle) * radius * 0.36);
            g.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            g.stroke();
        }
        // 阵眼与四枚符石
        // 内圈与外圈符纹
        g.strokeStyle = `rgba(103, 217, 165, ${(0.1 * pulse).toFixed(3)})`;
        for (let i = 0; i < 16; i += 1) {
            const angle = (i / 16) * Math.PI * 2;
            g.beginPath();
            g.moveTo(cx + Math.cos(angle) * radius * 0.86, cy + Math.sin(angle) * radius * 0.86);
            g.lineTo(cx + Math.cos(angle) * radius * 0.94, cy + Math.sin(angle) * radius * 0.94);
            g.stroke();
        }
        g.fillStyle = `rgba(103, 217, 165, ${(0.2 * pulse).toFixed(3)})`;
        g.fillRect(cx - 3, cy - 3, 6, 6);
        g.fillStyle = 'rgba(150, 126, 70, 0.3)';
        for (let i = 0; i < 4; i += 1) {
            const angle = Math.PI / 4 + (i / 4) * Math.PI * 2;
            g.fillRect(cx + Math.cos(angle) * radius * 0.66 - 2, cy + Math.sin(angle) * radius * 0.66 - 2, 4, 4);
        }
    }
    /** 庭院摆了石灯与香炉，让高面板下方的空地像宗门中庭而不是留白。 */
    function paintYardProps(time, lastDeskY) {
        const floorH = worldH - WALL_HEIGHT;
        if (floorH < 520)
            return;
        const base = worldH - 24;
        paintStoneLantern(26, base, time);
        paintStoneLantern(WORLD_W - 26, base, time);
        // 有池塘时香炉挪到左岸，不压在水面上。
        const pondDrawn = floorH >= 760 && lastDeskY + 60 < worldH - 227;
        if (pondDrawn)
            paintCenser(WORLD_W / 2 - 150, worldH - 150, time);
        else
            paintCenser(WORLD_W / 2, base, time);
    }
    /** 中庭莲池：给高面板的底部一块真实景物，纯装饰。 */
    function paintPond(time, lastDeskY) {
        const floorH = worldH - WALL_HEIGHT;
        // Never let the pond (or the censer on its bank) sit under the last desk row.
        if (floorH < 760 || lastDeskY + 60 >= worldH - 227)
            return;
        const cx = WORLD_W / 2;
        const cy = worldH - 145;
        const rx = 122;
        const ry = 72;
        // 石岸：外圈两层，压住水面
        g.fillStyle = '#8a8574';
        g.beginPath();
        g.ellipse(cx, cy, rx + 10, ry + 10, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#5f5b4e';
        g.beginPath();
        g.ellipse(cx, cy, rx + 4, ry + 4, 0, 0, Math.PI * 2);
        g.fill();
        // 水面
        const water = g.createLinearGradient(0, cy - ry, 0, cy + ry);
        water.addColorStop(0, '#3f727a');
        water.addColorStop(0.55, '#2f5d68');
        water.addColorStop(1, '#22444f');
        g.fillStyle = water;
        g.beginPath();
        g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        g.fill();
        // 涟漪
        for (let i = 0; i < 3; i += 1) {
            const phase = ((time / 4200) + i / 3) % 1;
            g.strokeStyle = `rgba(180, 226, 224, ${(0.16 * (1 - phase)).toFixed(3)})`;
            g.lineWidth = 1;
            g.beginPath();
            g.ellipse(cx, cy + 8, 24 + phase * 80, 12 + phase * 36, 0, 0, Math.PI * 2);
            g.stroke();
        }
        // 荷叶与莲花
        const pads = [
            [-70, -18, 16], [-28, 20, 13], [34, -24, 15], [72, 12, 12], [8, 34, 11],
        ];
        for (const [dx, dy, size] of pads) {
            g.fillStyle = '#3f7d4e';
            g.beginPath();
            g.ellipse(cx + dx, cy + dy, size, size * 0.62, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#599f61';
            g.beginPath();
            g.ellipse(cx + dx - 2, cy + dy - 2, size * 0.7, size * 0.42, 0, 0, Math.PI * 2);
            g.fill();
        }
        const flowerBob = Math.round(Math.sin(time / 1500) * 1);
        g.fillStyle = '#e8a0b4';
        for (const [dx, dy] of [[-28, 12], [40, -28]]) {
            g.fillRect(cx + dx - 2, cy + dy - 6 + flowerBob, 4, 4);
            g.fillStyle = '#f4c6d4';
            g.fillRect(cx + dx - 1, cy + dy - 7 + flowerBob, 2, 2);
            g.fillStyle = '#e8a0b4';
        }
        // 锦鲤
        for (let i = 0; i < 2; i += 1) {
            const angle = time / (3200 + i * 900) + i * Math.PI;
            const kx = cx + Math.cos(angle) * (58 + i * 16);
            const ky = cy + Math.sin(angle * 1.3) * 26;
            g.fillStyle = i === 0 ? '#e08a4a' : '#e6d2a8';
            g.fillRect(Math.round(kx), Math.round(ky), 5, 2);
            g.fillStyle = 'rgba(255, 255, 255, 0.55)';
            g.fillRect(Math.round(kx) + 3, Math.round(ky), 2, 1);
            g.fillStyle = 'rgba(224, 138, 74, 0.5)';
            g.fillRect(Math.round(kx) - 2, Math.round(ky) - 1, 2, 4);
        }
        // 岸边碎石与芦苇
        g.fillStyle = '#6b6656';
        for (const [dx, dy, w, h] of [[-rx - 4, 22, 10, 5], [rx - 2, -20, 9, 5], [-40, ry + 2, 12, 4], [66, ry, 8, 4]]) {
            g.fillRect(cx + dx, cy + dy, w, h);
        }
        g.strokeStyle = '#4f7d4e';
        g.lineWidth = 1;
        for (let i = 0; i < 4; i += 1) {
            const bx = cx - rx + 18 + i * 9;
            g.beginPath();
            g.moveTo(bx, cy + ry - 2);
            g.lineTo(bx + Math.sin(time / 2200 + i) * 2, cy + ry - 16 - i % 2 * 4);
            g.stroke();
        }
    }
    function paintStoneLantern(cx, baseY, time) {
        g.fillStyle = '#3b3a32';
        g.fillRect(cx - 8, baseY - 2, 16, 3);
        g.fillStyle = '#5c5a4d';
        g.fillRect(cx - 3, baseY - 22, 6, 20);
        g.fillStyle = '#7a7666';
        g.fillRect(cx - 8, baseY - 26, 16, 4);
        g.fillStyle = '#3b3a32';
        g.fillRect(cx - 5, baseY - 36, 10, 10);
        const pulse = 0.6 + Math.abs(Math.sin(time / 700 + cx)) * 0.4;
        g.fillStyle = `rgba(240, 190, 90, ${(0.55 * pulse).toFixed(3)})`;
        g.fillRect(cx - 2, baseY - 33, 4, 4);
        g.fillStyle = '#8a8574';
        g.fillRect(cx - 7, baseY - 39, 14, 3);
    }
    function paintCenser(cx, baseY, time) {
        g.fillStyle = '#5b4630';
        g.fillRect(cx - 12, baseY - 18, 24, 12);
        g.fillStyle = '#7a5b3a';
        g.fillRect(cx - 14, baseY - 22, 28, 5);
        g.fillStyle = '#a67c4f';
        g.fillRect(cx - 14, baseY - 22, 28, 2);
        g.fillStyle = '#3a2a1a';
        g.fillRect(cx - 10, baseY - 6, 4, 6);
        g.fillRect(cx + 6, baseY - 6, 4, 6);
        g.fillRect(cx - 2, baseY - 7, 4, 7);
        // 香火：三缕青烟
        for (let i = 0; i < 3; i += 1) {
            const phase = (time / 1800 + i / 3) % 1;
            g.fillStyle = `rgba(150, 200, 170, ${(0.22 * (1 - phase)).toFixed(3)})`;
            const sx = cx - 8 + i * 8 + Math.round(Math.sin(time / 600 + i) * 2);
            g.fillRect(sx, Math.round(baseY - 26 - phase * 30), 2, 2);
        }
        const pulse = 0.55 + Math.abs(Math.sin(time / 900)) * 0.45;
        g.fillStyle = `rgba(224, 169, 74, ${(0.55 * pulse).toFixed(3)})`;
        g.fillRect(cx - 3, baseY - 19, 6, 2);
    }
    /** 木板墙：梁、灯、四件可点设施，以及下方的工位地面。 */
    function paintRoom(time, wall, hovered, lastDeskY) {
        g.fillStyle = COLORS.wall;
        g.fillRect(0, 0, WORLD_W, WALL_HEIGHT);
        // 竖向木纹、墙裙与横梁
        g.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let x = 0; x < WORLD_W; x += 64)
            g.fillRect(x, 0, 1, 82);
        g.fillStyle = COLORS.wallShade;
        g.fillRect(0, 82, WORLD_W, 14);
        g.fillStyle = '#1d2723';
        g.fillRect(0, 0, WORLD_W, 4);
        // 地面
        g.fillStyle = COLORS.floor;
        g.fillRect(0, WALL_HEIGHT, WORLD_W, worldH - WALL_HEIGHT);
        g.strokeStyle = COLORS.floorLine;
        g.lineWidth = 1;
        for (let x = 0; x < WORLD_W; x += 32) {
            g.beginPath();
            g.moveTo(x, WALL_HEIGHT);
            g.lineTo(x, worldH);
            g.stroke();
        }
        for (let y = 120; y < worldH; y += 32) {
            g.beginPath();
            g.moveTo(0, y);
            g.lineTo(WORLD_W, y);
            g.stroke();
        }
        paintFloorFormation(time);
        paintQiMotes(time);
        // 一盏灯笼：只作氛围，不占交互
        for (const lx of [124]) {
            const swing = Math.sin(time / 720 + lx) * 2;
            g.fillStyle = '#3a2a1a';
            g.fillRect(lx - 1, 5, 2, 9);
            g.fillStyle = '#8a1c1c';
            g.beginPath();
            g.ellipse(lx + swing, 25, 7, 10, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#d4af37';
            g.fillRect(lx + swing - 7, 23, 14, 2);
            g.fillRect(lx + swing - 1, 35, 2, 4);
        }
        // 左侧盆栽已移除（2026-10-26 用户反馈：太丑）
        paintYardProps(time, lastDeskY);
        // 六件设施
        const facilityIndex = new Map();
        for (const facility of model?.facilities ?? [])
            facilityIndex.set(facility.action, facility);
        const hoverAction = hovered?.kind === 'action' ? hovered.action : undefined;
        const active = model?.activeAction;
        paintLibrary(FACILITIES.config, hoverAction === 'config', active === 'config');
        paintGate(FACILITIES.teams, model?.teamName ?? '', hoverAction === 'teams', active === 'teams', time);
        paintStele(FACILITIES.board, wall, hoverAction === 'board', active === 'board');
        paintRanks(FACILITIES.ranks, hoverAction === 'ranks', active === 'ranks');
        paintGear(FACILITIES.gear, hoverAction === 'gear', active === 'gear');
        paintAbout(FACILITIES.about, hoverAction === 'about', active === 'about');
        // 标签后画，压在墙裙上
        for (const action of FACILITY_ORDER) {
            const facility = facilityIndex.get(action);
            if (facility === undefined)
                continue;
            paintFacilityLabel(FACILITIES[action], facility.label, hoverAction === action, active === action);
        }
    }
    /** 境界：按任务完成度映射五境（与 realm.ts 一致），剑修的光剑随境界增强。 */
    function realmIndex(progress) {
        return Math.min(4, Math.floor(Math.max(0, Math.min(100, progress ?? 0)) / 20));
    }
    /** 本命法器：摆在矮案上方，与道途立绘一致。 */
    function paintWeapon(visual, cx, deskY, realm, working, time) {
        const base = deskY - 22;
        const accent = visual.accent;
        const trim = visual.trim;
        // 结丹以上：本命法器自发灵光；元婴以上再加绕器灵屑。
        if (realm >= 2) {
            const radius = 18 + realm * 5;
            const halo = g.createRadialGradient(cx, base - 16, 2, cx, base - 16, radius);
            halo.addColorStop(0, rgba(accent, 0.2 + realm * 0.05));
            halo.addColorStop(0.6, rgba(accent, 0.08 + realm * 0.02));
            halo.addColorStop(1, rgba(accent, 0));
            g.fillStyle = halo;
            g.beginPath();
            g.arc(cx, base - 16, radius, 0, Math.PI * 2);
            g.fill();
            g.save();
            g.shadowColor = rgba(accent, 0.9);
            g.shadowBlur = 4 + realm * 2;
            g.fillStyle = rgba(accent, 0.55);
            g.fillRect(cx - 1, base - 24, 2, 2);
            g.restore();
        }
        if (realm >= 3) {
            g.fillStyle = rgba(accent, 0.9);
            for (let i = 0; i < 3; i += 1) {
                const angle = time / 900 + i * 2.1;
                g.fillRect(cx + Math.cos(angle) * 16 - 1, base - 16 + Math.sin(angle) * 9 - 1, 2, 2);
            }
        }
        switch (visual.weapon) {
            case 'sword': {
                // 剑架
                g.fillStyle = '#6b4a2a';
                g.fillRect(cx - 22, base - 16, 3, 16);
                g.fillRect(cx + 19, base - 16, 3, 16);
                g.fillStyle = '#8a6a3a';
                g.fillRect(cx - 22, base - 18, 44, 2);
                // 光剑：境界越高剑光越盛
                const length = 17 + realm * 2;
                const pulse = working ? 0.82 + Math.sin(time / 90) * 0.18 : 0.66;
                g.save();
                g.shadowColor = 'rgba(126, 232, 255, ' + pulse.toFixed(2) + ')';
                g.shadowBlur = 6 + realm * 4;
                g.strokeStyle = 'rgba(150, 240, 255, ' + pulse.toFixed(2) + ')';
                g.lineWidth = 5;
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(cx - length, base - 15);
                g.lineTo(cx + length, base - 15);
                g.stroke();
                g.strokeStyle = '#ffffff';
                g.lineWidth = 2;
                g.beginPath();
                g.moveTo(cx - length + 2, base - 15);
                g.lineTo(cx + length - 2, base - 15);
                g.stroke();
                g.restore();
                // 剑柄与剑首
                g.fillStyle = '#333a46';
                g.fillRect(cx - length - 10, base - 18, 10, 6);
                g.fillStyle = '#d4af37';
                g.fillRect(cx - length - 2, base - 19, 2, 8);
                if (working) {
                    g.fillStyle = 'rgba(180, 245, 255, 0.95)';
                    g.fillRect(cx + length + 2, base - 18 - Math.round(Math.sin(time / 140) * 2), 2, 2);
                    g.fillRect(cx - length - 4, base - 12 - Math.round(Math.cos(time / 170) * 2), 2, 2);
                }
                break;
            }
            case 'fan': {
                g.fillStyle = '#8a5a3a';
                g.fillRect(cx - 2, base - 8, 3, 12);
                g.fillStyle = accent;
                g.fillRect(cx - 12, base - 23, 20, 3);
                g.fillRect(cx - 14, base - 20, 24, 3);
                g.fillRect(cx - 12, base - 17, 20, 3);
                g.fillStyle = trim;
                g.fillRect(cx - 14, base - 20, 24, 1);
                break;
            }
            case 'pill': {
                g.fillStyle = accent;
                g.fillRect(cx - 8, base - 18, 16, 12);
                g.fillStyle = trim;
                g.fillRect(cx - 3, base - 22, 6, 4);
                g.fillStyle = '#ffffff';
                g.fillRect(cx - 5, base - 16, 3, 6);
                if (working) {
                    g.fillStyle = 'rgba(230, 217, 255, 0.85)';
                    g.fillRect(cx + 10, base - 26 - Math.round(Math.sin(time / 300) * 2), 2, 2);
                }
                break;
            }
            case 'scroll': {
                g.fillStyle = accent;
                g.fillRect(cx - 14, base - 18, 28, 10);
                g.fillStyle = '#8a6a3a';
                g.fillRect(cx - 16, base - 20, 3, 14);
                g.fillRect(cx + 13, base - 20, 3, 14);
                g.fillStyle = '#8a1c1c';
                g.fillRect(cx - 2, base - 18, 4, 2);
                break;
            }
            case 'gourd': {
                g.fillStyle = accent;
                g.beginPath();
                g.ellipse(cx, base - 8, 9, 7, 0, 0, Math.PI * 2);
                g.fill();
                g.beginPath();
                g.ellipse(cx, base - 19, 5, 5, 0, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = trim;
                g.fillRect(cx - 3, base - 24, 6, 2);
                break;
            }
            case 'compass': {
                g.fillStyle = '#2f4a4a';
                g.beginPath();
                g.arc(cx, base - 12, 10, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = trim;
                g.beginPath();
                g.arc(cx, base - 12, 6, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = '#d4af37';
                g.fillRect(cx - 1, base - 18, 2, 8);
                break;
            }
            case 'brush': {
                g.fillStyle = '#4a3a2a';
                g.fillRect(cx - 8, base - 10, 16, 10);
                g.fillStyle = '#8a5a3a';
                g.fillRect(cx - 1, base - 26, 2, 18);
                g.fillStyle = accent;
                g.fillRect(cx - 2, base - 30, 4, 5);
                break;
            }
            case 'lantern': {
                g.fillStyle = trim;
                g.fillRect(cx - 1, base - 30, 2, 6);
                g.fillStyle = accent;
                g.fillRect(cx - 7, base - 24, 14, 12);
                g.fillStyle = 'rgba(255, 242, 196, 0.95)';
                g.fillRect(cx - 5, base - 22, 10, 8);
                if (working) {
                    g.fillStyle = 'rgba(255, 220, 140, 0.22)';
                    g.beginPath();
                    g.arc(cx, base - 18, 12, 0, Math.PI * 2);
                    g.fill();
                }
                break;
            }
            case 'array': {
                g.fillStyle = '#1f3a3a';
                g.fillRect(cx - 12, base - 20, 24, 14);
                g.fillStyle = accent;
                for (const dot of [[-8, -16], [0, -16], [8, -16], [-4, -11], [4, -11]]) {
                    g.fillRect(cx + dot[0] - 1, base + dot[1] - 1, 2, 2);
                }
                break;
            }
            case 'fist': {
                g.fillStyle = accent;
                g.fillRect(cx - 10, base - 12, 9, 8);
                g.fillRect(cx + 2, base - 12, 9, 8);
                g.fillStyle = trim;
                g.fillRect(cx - 10, base - 12, 9, 2);
                g.fillRect(cx + 2, base - 12, 9, 2);
                break;
            }
            case 'book': {
                g.fillStyle = accent;
                g.fillRect(cx - 12, base - 10, 24, 5);
                g.fillStyle = trim;
                g.fillRect(cx - 10, base - 16, 22, 5);
                g.fillStyle = '#8a6a3a';
                g.fillRect(cx - 12, base - 10, 2, 5);
                break;
            }
            case 'hammer': {
                g.fillStyle = '#8a5a3a';
                g.fillRect(cx - 1, base - 18, 3, 18);
                g.fillStyle = accent;
                g.fillRect(cx - 9, base - 24, 18, 8);
                g.fillStyle = trim;
                g.fillRect(cx - 9, base - 24, 18, 2);
                break;
            }
            case 'crown': {
                // 掌门令旗：旗杆 + 宗门旗
                g.fillStyle = '#6b4a2a';
                g.fillRect(cx - 16, base - 30, 2, 30);
                g.fillStyle = '#d4af37';
                g.fillRect(cx - 17, base - 31, 4, 3);
                g.fillStyle = accent;
                g.fillRect(cx - 14, base - 29, 16, 9);
                g.fillStyle = '#8a1c1c';
                g.fillRect(cx - 14, base - 25, 16, 2);
                g.fillStyle = '#1b1510';
                g.fillRect(cx - 8, base - 27, 4, 4);
                break;
            }
            case 'talisman': {
                // 符箓：黄纸朱印
                g.fillStyle = '#f2e6c4';
                g.fillRect(cx - 6, base - 30, 12, 18);
                g.fillStyle = '#fff6dd';
                g.fillRect(cx - 5, base - 29, 10, 16);
                g.fillStyle = trim;
                g.fillRect(cx - 5, base - 26, 10, 1);
                g.fillRect(cx - 5, base - 23, 6, 1);
                g.fillStyle = '#c23a3a';
                g.fillRect(cx - 3, base - 20, 6, 5);
                g.fillStyle = '#f2d97a';
                g.fillRect(cx - 1, base - 18, 2, 1);
                break;
            }
            case 'needle': {
                // 银针与针囊
                g.fillStyle = '#dfe9f2';
                g.fillRect(cx - 7, base - 30, 1, 16);
                g.fillRect(cx - 1, base - 28, 1, 14);
                g.fillRect(cx + 5, base - 30, 1, 16);
                g.fillStyle = '#ffffff';
                g.fillRect(cx - 7, base - 30, 1, 2);
                g.fillRect(cx + 5, base - 30, 1, 2);
                g.fillStyle = trim;
                g.fillRect(cx - 6, base - 14, 12, 4);
                g.fillStyle = accent;
                g.fillRect(cx - 2, base - 13, 4, 2);
                break;
            }
            case 'whistle': {
                // 兽骨哨
                g.fillStyle = accent;
                g.fillRect(cx - 9, base - 20, 12, 7);
                g.fillStyle = '#ffffff';
                g.fillRect(cx - 9, base - 20, 12, 1);
                g.fillStyle = trim;
                g.fillRect(cx - 12, base - 22, 3, 11);
                g.fillRect(cx + 5, base - 18, 2, 5);
                g.fillStyle = visual.robeDark;
                g.fillRect(cx - 5, base - 18, 2, 2);
                g.fillRect(cx - 1, base - 18, 2, 2);
                break;
            }
            case 'puppet': {
                // 傀儡与提线
                g.fillStyle = '#d8d2c8';
                g.fillRect(cx - 3, base - 34, 1, 9);
                g.fillRect(cx + 2, base - 34, 1, 9);
                g.fillStyle = accent;
                g.fillRect(cx - 4, base - 25, 8, 7);
                g.fillStyle = visual.robeDark;
                g.fillRect(cx - 2, base - 23, 1, 1);
                g.fillRect(cx + 1, base - 23, 1, 1);
                g.fillStyle = visual.robeLight;
                g.fillRect(cx - 5, base - 17, 10, 7);
                g.fillStyle = accent;
                g.fillRect(cx - 5, base - 10, 3, 3);
                g.fillRect(cx + 2, base - 10, 3, 3);
                break;
            }
            case 'flute': {
                // 竹笛
                g.fillStyle = '#8a6a3a';
                g.fillRect(cx - 14, base - 22, 28, 4);
                g.fillStyle = '#b07a52';
                g.fillRect(cx - 14, base - 22, 28, 1);
                g.fillStyle = trim;
                g.fillRect(cx - 16, base - 23, 2, 6);
                g.fillRect(cx + 14, base - 23, 2, 6);
                g.fillStyle = visual.robeDark;
                g.fillRect(cx - 8, base - 21, 2, 2);
                g.fillRect(cx - 1, base - 21, 2, 2);
                g.fillRect(cx + 6, base - 21, 2, 2);
                break;
            }
            case 'vial': {
                // 毒瓶
                g.fillStyle = accent;
                g.fillRect(cx - 7, base - 20, 14, 10);
                g.fillStyle = '#ffffff';
                g.fillRect(cx - 7, base - 20, 14, 1);
                g.fillStyle = trim;
                g.fillRect(cx - 3, base - 25, 6, 5);
                g.fillStyle = visual.robeDark;
                g.fillRect(cx - 4, base - 17, 2, 2);
                if (working) {
                    g.fillStyle = 'rgba(212, 255, 154, 0.85)';
                    g.fillRect(cx + 9, base - 26 - Math.round(Math.sin(time / 280) * 2), 2, 2);
                }
                break;
            }
            case 'beads': {
                // 佛珠
                g.fillStyle = accent;
                for (let i = 0; i < 8; i += 1) {
                    const angle = i / 8 * Math.PI * 2;
                    g.fillRect(cx + Math.round(Math.cos(angle) * 9) - 1, base - 18 + Math.round(Math.sin(angle) * 7) - 1, 3, 3);
                }
                g.fillStyle = trim;
                g.fillRect(cx - 1, base - 10, 2, 6);
                break;
            }
            case 'blade': {
                // 魔剑：宽阔锯齿剑身 + 品红锋焰 + 地面法阵（高阶）
                if (realm >= 2) {
                    g.save();
                    g.strokeStyle = 'rgba(95, 208, 168, 0.55)';
                    g.lineWidth = 1.5;
                    g.beginPath();
                    g.ellipse(cx + 2, deskY - 10, 16 + realm * 2, 5, 0, 0, Math.PI * 2);
                    g.stroke();
                    g.strokeStyle = 'rgba(95, 208, 168, 0.25)';
                    g.beginPath();
                    g.ellipse(cx + 2, deskY - 10, 11 + realm * 2, 3.5, 0, 0, Math.PI * 2);
                    g.stroke();
                    g.restore();
                }
                g.save();
                g.shadowColor = 'rgba(255, 79, 176, 0.9)';
                g.shadowBlur = 7 + realm * 3;
                g.fillStyle = '#4a1f9a';
                g.fillRect(cx + 2, base - 54, 9, 11);
                g.fillRect(cx + 1, base - 43, 9, 9);
                g.fillRect(cx, base - 34, 8, 8);
                g.fillRect(cx - 1, base - 26, 6, 6);
                g.fillStyle = '#ff4fb0';
                g.fillRect(cx + 10, base - 54, 2, 11);
                g.fillRect(cx + 9, base - 43, 2, 9);
                g.fillRect(cx + 7, base - 34, 2, 8);
                g.fillRect(cx + 4, base - 26, 2, 6);
                g.restore();
                // 剑身符纹
                g.fillStyle = '#ffd27a';
                g.fillRect(cx + 5, base - 49, 2, 2);
                g.fillRect(cx + 6, base - 39, 2, 2);
                g.fillRect(cx + 4, base - 30, 2, 2);
                // 护手 + 剑柄 + 剑首
                g.fillStyle = '#f2c14e';
                g.fillRect(cx - 9, base - 20, 15, 3);
                g.fillStyle = '#ffe9a8';
                g.fillRect(cx - 9, base - 20, 15, 1);
                g.fillStyle = '#2a1a2a';
                g.fillRect(cx - 4, base - 17, 4, 10);
                g.fillStyle = '#7a3f52';
                g.fillRect(cx - 3, base - 17, 1, 10);
                g.fillStyle = '#c23a3a';
                g.fillRect(cx - 5, base - 7, 6, 4);
                g.fillStyle = '#ff9aa8';
                g.fillRect(cx - 4, base - 6, 2, 2);
                if (working) {
                    g.fillStyle = 'rgba(255, 79, 176, 0.95)';
                    g.fillRect(cx + 12, base - 58 - Math.round(Math.sin(time / 160) * 3), 2, 2);
                    g.fillRect(cx + 2, base - 62 - Math.round(Math.cos(time / 200) * 2), 2, 2);
                }
                break;
            }
            default: break;
        }
    }
    /** mini 修士：整幅美术按 CHARACTER_SCALE 缩小，鞋底仍钉在 baseY。 */
    function paintCharacter(cx, baseY, member, time, walking = false) {
        g.save();
        g.translate(cx, baseY);
        g.scale(CHARACTER_SCALE, CHARACTER_SCALE);
        paintCharacterArt(0, 0, member, time, walking);
        g.restore();
    }
    /** 修士美术：按 92px 完整身形作画（头顶 baseY−92、鞋底 baseY），外层再缩成 mini。 */
    function paintCharacterArt(cx, baseY, member, time, walking = false) {
        const seed = hash(member.id || member.name);
        const visual = roleVisual(member.isLeader === true ? 'captain' : member.role);
        const skin = visual?.skin ?? pick(SKIN, seed);
        const robe = visual?.robe ?? (member.isLeader ? COLORS.captain : pick(SHIRT, seed >> 3));
        const trim = visual?.trim ?? '#e8eef8';
        const hair = visual?.hair ?? '#2a2f3a';
        const working = member.activity === 'working';
        // 步态：走路时双腿交替、手臂反摆；静立/伏案只有呼吸。
        const gait = walking ? Math.sin(time / 95 + (seed % 7)) : 0;
        const stride = Math.round(gait * 3);
        const bob = walking
            ? -Math.abs(Math.round(gait))
            : working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
        // 头顶、肩线、腰带、袍角、鞋面：整条身形都按 baseY 落地（脚不再悬空）。
        const rig = characterRig(baseY);
        const headY = rig.headY + bob;
        const bodyY = rig.bodyY + bob;
        const waistY = rig.waistY + bob;
        const hemY = rig.hemY + bob;
        const shoeY = rig.shoeY;
        // 灵气：以颜色常驻标示状态（修炼/静修/异常），修炼中带上升灵屑。
        const tone = stateTone(member.activity);
        const auraPulse = 0.5 + Math.abs(Math.sin(time / (working ? 420 : 900))) * 0.5;
        const auraY = bodyY + 14;
        const auraR = (member.isLeader ? 40 : 34) + auraPulse * 4;
        const aura = g.createRadialGradient(cx, auraY, 4, cx, auraY, auraR);
        aura.addColorStop(0, rgba(tone, 0.26 + (working ? 0.1 : 0.02)));
        aura.addColorStop(0.55, rgba(tone, 0.12));
        aura.addColorStop(1, rgba(tone, 0));
        g.fillStyle = aura;
        g.beginPath();
        g.arc(cx, auraY, auraR, 0, Math.PI * 2);
        g.fill();
        if (working) {
            for (let i = 0; i < 3; i += 1) {
                const phase = (time / 1200 + i / 3) % 1;
                g.fillStyle = rgba(tone, 0.75 * (1 - phase));
                g.fillRect(cx - 16 + i * 12, Math.round(auraY + 14 - phase * 46), 2, 2);
            }
        }
        // 腿与鞋：站立时踩在地面，走路时前后交替、前脚微抬。
        const legLift = walking ? Math.max(0, Math.round(gait * 2)) : 0;
        const legs = [
            { x: cx - 8 + stride, lift: walking ? Math.max(0, -Math.round(gait * 2)) : 0 },
            { x: cx + 2 - stride, lift: legLift },
        ];
        for (const leg of legs) {
            // 内袍与皂靴：靴底浅色、靴头上翘，遮住“西式长靴”的感觉。
            g.fillStyle = visual?.robeDark ?? '#3a3128';
            g.fillRect(leg.x, hemY - 2, 6, shoeY - (hemY - 2) - leg.lift);
            g.fillStyle = '#241a12';
            g.fillRect(leg.x - 1, shoeY - leg.lift, 8, SHOE_HEIGHT);
            g.fillStyle = '#d8cfc0';
            g.fillRect(leg.x - 1, shoeY - leg.lift + SHOE_HEIGHT - 1, 8, 1);
            g.fillRect(leg.x + (leg.x < cx ? -2 : 7), shoeY - 2 - leg.lift, 2, 2);
        }
        // 下摆：遮住裤腿上半段，走路时轻轻摆动。
        const hemSway = walking ? Math.round(gait * 1.5) : 0;
        g.fillStyle = '#1b1510';
        g.fillRect(cx - 12, waistY + 1, 24, hemY - waistY);
        g.fillStyle = robe;
        g.fillRect(cx - 11, waistY + 2, 22, hemY - waistY - 2);
        g.fillStyle = visual?.robeDark ?? 'rgba(0, 0, 0, 0.22)';
        g.fillRect(cx + 5 + hemSway, waistY + 2, 5, hemY - waistY - 2);
        g.fillStyle = visual?.robeLight ?? 'rgba(255, 255, 255, 0.16)';
        g.fillRect(cx - 11, waistY + 2, 3, hemY - waistY - 2);
        g.fillStyle = trim;
        g.fillRect(cx - 11, hemY - 3, 22, 2);
        g.fillStyle = 'rgba(0, 0, 0, 0.3)';
        g.fillRect(cx - 1 + Math.round(hemSway / 2), waistY + 4, 2, hemY - waistY - 8);
        // 两侧开衩与下摆云纹。
        g.fillStyle = '#1b1510';
        g.fillRect(cx - 13, hemY - 6, 2, 6);
        g.fillRect(cx + 11, hemY - 6, 2, 6);
        g.fillStyle = trim;
        g.fillRect(cx - 8, hemY - 8, 4, 1);
        g.fillRect(cx + 5, hemY - 6, 3, 1);
        // 躯干：暗描边 + 亮/中/暗三档道袍。
        g.fillStyle = '#1b1510';
        g.fillRect(cx - 11, bodyY - 1, 22, waistY - bodyY + 2);
        g.fillStyle = robe;
        g.fillRect(cx - 9, bodyY, 18, waistY - bodyY);
        g.fillStyle = visual?.robeLight ?? 'rgba(255, 255, 255, 0.16)';
        g.fillRect(cx - 9, bodyY, 3, waistY - bodyY);
        g.fillStyle = visual?.robeDark ?? 'rgba(0, 0, 0, 0.22)';
        g.fillRect(cx + 5, bodyY, 4, waistY - bodyY);
        // 交领右衽：内衬 + 两条斜襟；腰带、绦带与玉佩。
        const innerCollar = visual?.robeLight ?? '#e8eef8';
        g.fillStyle = innerCollar;
        g.beginPath();
        g.moveTo(cx - 7, bodyY);
        g.lineTo(cx + 7, bodyY);
        g.lineTo(cx + 2, bodyY + 9);
        g.lineTo(cx - 2, bodyY + 9);
        g.closePath();
        g.fill();
        g.fillStyle = trim;
        g.beginPath();
        g.moveTo(cx - 9, bodyY);
        g.lineTo(cx - 1, bodyY + 10);
        g.lineTo(cx - 4, bodyY + 11);
        g.lineTo(cx - 11, bodyY + 2);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(cx + 9, bodyY);
        g.lineTo(cx + 1, bodyY + 10);
        g.lineTo(cx + 4, bodyY + 11);
        g.lineTo(cx + 11, bodyY + 2);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(0, 0, 0, 0.28)';
        g.fillRect(cx - 1, bodyY + 10, 2, waistY - bodyY - 12);
        g.fillStyle = '#6e2a24';
        g.fillRect(cx - 11, waistY - 4, 22, 5);
        g.fillStyle = trim;
        g.fillRect(cx - 11, waistY - 4, 22, 1);
        g.fillStyle = '#f2c14e';
        g.fillRect(cx - 3, waistY - 4, 6, 4);
        g.fillStyle = '#a8433a';
        g.fillRect(cx + 2, waistY + 1, 2, 12);
        g.fillRect(cx + 6, waistY + 1, 2, 9);
        g.fillStyle = '#7fd6c0';
        g.fillRect(cx - 7, waistY + 2, 3, 3);
        g.fillStyle = '#f2c14e';
        g.fillRect(cx - 7, waistY + 1, 3, 1);
        // 手臂：袖口 + 手，走路时与腿反向摆动。
        const armSwing = walking ? -stride : 0;
        for (const side of [-1, 1]) {
            const x = side < 0 ? cx - 16 : cx + 9;
            const y = bodyY + 3 + (side < 0 ? armSwing : -armSwing);
            // 宽袖：袖身加宽，袖口一圈浅色镶边。
            g.fillStyle = robe;
            g.fillRect(x, y, 7, 17);
            g.fillStyle = visual?.robeDark ?? 'rgba(0, 0, 0, 0.22)';
            g.fillRect(x + (side < 0 ? 0 : 5), y + 10, 2, 7);
            g.fillStyle = trim;
            g.fillRect(x - 1, y + 14, 9, 2);
            g.fillStyle = skin;
            g.fillRect(x + 1, y + 17, 5, 4);
        }
        // 头部与发式：不戴冠的修士默认披长发，只有束发角色才做发髻。
        const tiedHair = visual?.hairStyle === 'topknot';
        if (!tiedHair) {
            // 先铺一层比脸宽的发幕，脸画上去后两侧自然露出长发。
            g.fillStyle = hair;
            g.fillRect(cx - 9, headY + 2, 18, 20);
        }
        g.fillStyle = skin;
        g.fillRect(cx - 2, bodyY - 2, 4, 3);
        g.fillRect(cx - 7, headY + 3, 14, 13);
        g.fillStyle = hair;
        g.fillRect(cx - 7, headY, 14, 5);
        if (tiedHair) {
            g.fillRect(cx - 2, headY - 6, 4, 6);
            g.fillStyle = trim;
            g.fillRect(cx - 1, headY - 8, 2, 2);
        }
        else {
            // 鬓发 + 肩后长发。
            g.fillRect(cx - 9, headY + 5, 2, 17);
            g.fillRect(cx + 7, headY + 5, 2, 17);
            g.fillRect(cx - 10, bodyY - 1, 2, 9);
            g.fillRect(cx + 8, bodyY - 1, 2, 9);
        }
        if (visual?.beard === true) {
            g.fillStyle = '#d8d2c8';
            g.fillRect(cx - 3, headY + 12, 6, 4);
        }
        // 发冠/发簪只给戴冠的掌门与束发修士，披发的人不戴头饰。
        if (member.isLeader || tiedHair) {
            g.fillStyle = '#f2c14e';
            g.fillRect(cx - 5, headY - 2, 10, 2);
            g.fillStyle = trim;
            g.fillRect(cx - 1, headY - 7, 2, 5);
            g.fillStyle = '#f2c14e';
            g.fillRect(cx + 3, headY - 8, 6, 1);
            g.fillRect(cx + 8, headY - 8, 1, 2);
        }
        // 眼。
        g.fillStyle = '#24303f';
        g.fillRect(cx - 4, headY + 8, 2, 2);
        g.fillRect(cx + 2, headY + 8, 2, 2);
        if (member.isLeader) {
            g.fillStyle = COLORS.captain;
            g.beginPath();
            g.moveTo(cx - 8, headY - 3);
            g.lineTo(cx - 8, headY - 9);
            g.lineTo(cx - 4, headY - 5);
            g.lineTo(cx, headY - 10);
            g.lineTo(cx + 4, headY - 5);
            g.lineTo(cx + 8, headY - 9);
            g.lineTo(cx + 8, headY - 3);
            g.closePath();
            g.fill();
        }
        if (member.activity === 'idle' && !walking) {
            g.fillStyle = 'rgba(232, 238, 248, 0.75)';
            g.font = '8px monospace';
            g.fillText('z', cx + 12, headY - 2 - Math.round(Math.sin(time / 500) * 3));
        }
    }
    /** 工位家具：矮案、蒲团、香炉与本命法器；主人离开时仍留在原位。 */
    function paintFurniture(cx, deskY, member, time) {
        const visual = roleVisual(member.isLeader === true ? 'captain' : member.role);
        const working = member.activity === 'working';
        const realm = realmIndex(member.progress);
        const deskX = cx - DESK_W / 2;
        // 矮案与蒲团（按 mini 身形收窄，别把小人压成大桌子）
        g.fillStyle = COLORS.desk;
        roundRect(g, deskX, deskY - 15, DESK_W, 15, 3);
        g.fill();
        g.fillStyle = COLORS.deskTop;
        g.fillRect(deskX, deskY - 17, DESK_W, 3);
        g.fillStyle = '#8a6a4a';
        g.beginPath();
        g.ellipse(cx, deskY - 5, 20, 7, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#b08a5a';
        g.beginPath();
        g.ellipse(cx, deskY - 7, 17, 5, 0, 0, Math.PI * 2);
        g.fill();
        // 案上香炉：坐在案面上，别悬在半空。
        g.fillStyle = '#8a6a3a';
        g.beginPath();
        g.ellipse(cx + 24, deskY - 20, 6, 3, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = working ? '#e0a94a' : '#7a6a4a';
        g.fillRect(cx + 21, deskY - 23, 5, 2);
        if (working) {
            g.fillStyle = 'rgba(222, 226, 238, 0.35)';
            g.beginPath();
            g.arc(cx + 24, deskY - 29, 3.5, 0, Math.PI * 2);
            g.fill();
            g.beginPath();
            g.arc(cx + 28, deskY - 36, 2.5, 0, Math.PI * 2);
            g.fill();
        }
        // 本命法器：和 mini 修士同比例缩放，摆在案几左端。
        if (visual !== undefined) {
            g.save();
            g.translate(cx - DESK_W / 2 + 10, deskY - 17);
            g.scale(CHARACTER_SCALE, CHARACTER_SCALE);
            paintWeapon(visual, 0, 0, realm, working, time);
            g.restore();
        }
    }
    /** 矮案前沿：伏案修士的下半身压在案后，脚不会踩在案面上。 */
    function paintDeskFront(cx, deskY) {
        const deskX = cx - DESK_W / 2;
        g.fillStyle = COLORS.desk;
        roundRect(g, deskX, deskY - 15, DESK_W, 15, 3);
        g.fill();
        g.fillStyle = COLORS.deskTop;
        g.fillRect(deskX, deskY - 17, DESK_W, 3);
        g.fillStyle = 'rgba(0, 0, 0, 0.14)';
        g.fillRect(deskX + 6, deskY - 12, DESK_W - 12, 1);
    }
    /** 悬停工位：四角描金 + 轻微呼吸，和工作台一体。 */
    function paintDeskHover(cx, deskY, time) {
        const x = cx - 40;
        const y = deskY - 62;
        const w = 80;
        const h = 82;
        const len = 8;
        const pulse = 0.55 + Math.abs(Math.sin(time / 500)) * 0.35;
        g.strokeStyle = `rgba(255, 233, 168, ${pulse.toFixed(3)})`;
        g.lineWidth = 1.2;
        for (const [dx, dy, sx, sy] of [
            [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1],
        ]) {
            g.beginPath();
            g.moveTo(dx + sx * len, dy);
            g.lineTo(dx, dy);
            g.lineTo(dx, dy + sy * len);
            g.stroke();
        }
    }
    /** 当前打开的对话所属修士：身后柔光 + 地面光晕（比四角框更耐看）。 */
    function paintViewingAura(cx, baseY, member, time) {
        const rgb = member.isLeader === true ? '242, 193, 78' : '111, 214, 200';
        const pulse = 0.5 + 0.5 * Math.sin(time / 900);
        g.save();
        const glow = g.createRadialGradient(cx, baseY - 30, 2, cx, baseY - 30, 34);
        glow.addColorStop(0, `rgba(${rgb}, ${(0.26 + pulse * 0.08).toFixed(3)})`);
        glow.addColorStop(0.55, `rgba(${rgb}, ${(0.10 + pulse * 0.05).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        g.fillStyle = glow;
        g.beginPath();
        g.ellipse(cx, baseY - 30, 30, 40, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = `rgba(${rgb}, ${(0.18 + pulse * 0.1).toFixed(3)})`;
        g.lineWidth = 1.2;
        g.beginPath();
        g.ellipse(cx, baseY - 2, 22, 7, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
    }
    /** 双击弹跳高度（抛物线，520ms）。 */
    function jumpHeight(id, time) {
        const start = jumps.get(id);
        if (start === undefined)
            return 0;
        if (start < 0) {
            jumps.set(id, time);
            return 0;
        }
        const progress = (time - start) / 520;
        if (progress >= 1) {
            jumps.delete(id);
            return 0;
        }
        return Math.sin(progress * Math.PI) * 14;
    }
    /** 当前出行形态：默认步行，只有显式装备飞剑/神兽且等级够格才离地。 */
    function travelForm(member) {
        if (member.activity === 'working')
            return 'walk';
        return travelFormFor(member.level ?? 0, mountOverride.get(member.id || member.name));
    }
    /** 落影：飞起时影子留在原地并缩小变淡，人才像“离地”而不是“漂着”。 */
    function paintGroundShadow(cx, groundY, form, time) {
        const lifted = form !== 'walk';
        const pulse = lifted ? 0.5 + 0.5 * Math.sin(time / 900) : 1;
        g.fillStyle = `rgba(56, 44, 30, ${(lifted ? 0.10 * pulse + 0.04 : 0.18).toFixed(3)})`;
        g.beginPath();
        g.ellipse(cx, groundY - 3, lifted ? 12 : 16, lifted ? 4 : 6, 0, 0, Math.PI * 2);
        g.fill();
    }
    /** 御剑：剑身横在脚下，剑格/剑穗/拖尾都画细，不再是一根悬空的白线。 */
    function paintSwordMount(cx, feetY, time) {
        const bob = Math.sin(time / 380) * 1.4;
        g.save();
        g.translate(cx, feetY + bob);
        // 剑气拖尾：向后流动的三道流光。
        for (let i = 0; i < 3; i += 1) {
            const shift = (time / 6 + i * 11) % 30;
            g.globalAlpha = 0.20 - i * 0.05;
            g.fillStyle = '#9fe9ff';
            g.fillRect(-30 - shift, -3 + i * 2, 16, 1);
        }
        g.globalAlpha = 1;
        // 剑光。
        const glow = g.createRadialGradient(0, -2, 2, 0, -2, 34);
        glow.addColorStop(0, 'rgba(140, 232, 255, 0.30)');
        glow.addColorStop(0.6, 'rgba(120, 210, 255, 0.10)');
        glow.addColorStop(1, 'rgba(120, 210, 255, 0)');
        g.fillStyle = glow;
        g.beginPath();
        g.ellipse(0, -2, 34, 11, 0, 0, Math.PI * 2);
        g.fill();
        // 剑身：剑尖锐利、剑脊高光。
        g.fillStyle = '#eafbff';
        g.beginPath();
        g.moveTo(-26, -2);
        g.lineTo(20, -2);
        g.lineTo(31, -4);
        g.lineTo(31, 0);
        g.lineTo(20, 2);
        g.lineTo(-26, 2);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(255, 255, 255, 0.92)';
        g.fillRect(-24, -1.5, 42, 1);
        g.fillStyle = '#7cd8ff';
        g.fillRect(-24, 1, 42, 1);
        // 剑格 + 剑柄 + 剑首。
        g.fillStyle = '#f2c14e';
        g.fillRect(-30, -4.5, 4, 9);
        g.fillStyle = '#ffe9a8';
        g.fillRect(-30, -4.5, 4, 1);
        g.fillStyle = '#5a3b2a';
        g.fillRect(-38, -1, 8, 2);
        g.fillStyle = '#f2c14e';
        g.fillRect(-41, -2, 3, 4);
        // 剑穗随飞行的风摆动。
        const sway = Math.sin(time / 300) * 1.5;
        g.fillStyle = '#c23a3a';
        g.fillRect(-39 + sway, 2, 2, 7);
        g.fillStyle = '#e86a6a';
        g.fillRect(-39 + sway, 7, 2, 2);
        g.restore();
    }
    /** 神兽：鞍座托着骑手、四足悬空，整只兽浮在案面上方。 */
    function paintBeastMount(cx, feetY, time, variant) {
        const kind = mountModelFor(variant);
        if (kind !== 'beast') {
            paintSpecialMount(cx, feetY, time, kind);
            return;
        }
        const bob = Math.sin(time / 460) * 1.1;
        const body = '#3d5c52';
        const bodyLit = '#4d7266';
        const dark = '#2e4740';
        const gold = '#f2c14e';
        g.save();
        g.translate(cx, feetY + bob);
        // 四足与蹄：悬空而行，蹄底仍高于案面。
        g.fillStyle = dark;
        g.fillRect(-11, 11, 3, 9);
        g.fillRect(-4, 12, 3, 8);
        g.fillRect(5, 11, 3, 9);
        g.fillRect(12, 12, 3, 8);
        g.fillStyle = '#1f2f2b';
        g.fillRect(-12, 20, 5, 2);
        g.fillRect(4, 20, 5, 2);
        // 躯干与背线。
        g.fillStyle = body;
        g.beginPath();
        g.ellipse(0, 11, 17, 8, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = bodyLit;
        g.beginPath();
        g.ellipse(-2, 7, 13, 4, 0, 0, Math.PI * 2);
        g.fill();
        // 鞍与鞯带：骑手脚尖正好踩在鞍面。
        g.fillStyle = '#7a3f52';
        g.fillRect(-6, 0, 12, 5);
        g.fillStyle = gold;
        g.fillRect(-6, 0, 12, 1);
        g.fillRect(-7, 5, 2, 5);
        g.fillRect(5, 5, 2, 5);
        // 颈、头、吻：抬头在前。
        g.fillStyle = body;
        g.fillRect(12, -4, 7, 14);
        g.beginPath();
        g.ellipse(20, -7, 7, 5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = bodyLit;
        g.fillRect(24, -8, 4, 3);
        // 角与耳。
        g.fillStyle = gold;
        g.fillRect(17, -14, 2, 5);
        g.fillRect(20, -12, 2, 4);
        // 鬃毛。
        for (let i = 0; i < 4; i += 1) {
            g.fillStyle = i % 2 === 0 ? gold : '#e0a94a';
            g.fillRect(11 + i, -10 + i * 2, 2, 2);
        }
        // 眼。
        g.fillStyle = '#ffe9a8';
        g.fillRect(21, -9, 2, 2);
        // 尾：摆动的长尾。
        const sway = Math.sin(time / 320) * 2;
        g.strokeStyle = body;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(-17, 6);
        g.quadraticCurveTo(-25, 8 + sway, -23, 15 + sway);
        g.stroke();
        g.fillStyle = gold;
        g.fillRect(-25, 15 + sway, 3, 3);
        g.restore();
    }
    /** 仙鹤/麒麟/凤凰/蛟龙/真龙/道兽：每种坐骑一套独立模型。 */
    function paintSpecialMount(cx, feetY, time, kind) {
        const bob = Math.sin(time / 430) * 1.2;
        g.save();
        g.translate(cx, feetY + bob);
        if (kind === 'crane') {
            g.fillStyle = 'rgba(160, 220, 220, 0.18)';
            g.beginPath();
            g.ellipse(0, 8, 24, 8, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2f5f0';
            g.beginPath();
            g.ellipse(0, 9, 15, 7, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#dbe7e5';
            g.beginPath();
            g.ellipse(-7, 8, 9, 5, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2f5f0';
            g.fillRect(9, -7, 3, 16);
            g.beginPath();
            g.ellipse(12, -9, 5, 4, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2c14e';
            g.fillRect(16, -9, 5, 2);
            g.fillStyle = '#d43a3a';
            g.fillRect(10, -13, 3, 3);
            g.fillStyle = '#2e4740';
            g.fillRect(-9, 15, 2, 8);
            g.fillRect(-4, 16, 2, 7);
            g.fillStyle = '#7a3f52';
            g.fillRect(-5, 1, 10, 4);
            g.fillStyle = '#f2c14e';
            g.fillRect(-5, 1, 10, 1);
        }
        else if (kind === 'qilin') {
            g.fillStyle = 'rgba(255, 160, 80, 0.16)';
            g.beginPath();
            g.ellipse(0, 10, 24, 8, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#c9a24a';
            g.beginPath();
            g.ellipse(0, 9, 17, 8, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#e8c46a';
            g.beginPath();
            g.ellipse(-2, 6, 12, 4, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#2e4740';
            g.fillRect(-11, 15, 3, 8);
            g.fillRect(-4, 16, 3, 7);
            g.fillRect(5, 15, 3, 8);
            g.fillRect(12, 16, 3, 7);
            g.fillStyle = '#c9a24a';
            g.fillRect(12, -3, 7, 13);
            g.beginPath();
            g.ellipse(19, -6, 7, 5, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2c14e';
            g.fillRect(17, -14, 2, 7);
            g.fillRect(21, -12, 2, 5);
            g.fillStyle = '#d43a3a';
            for (let i = 0; i < 5; i += 1)
                g.fillRect(9 + i, -9 + i * 2, 2, 2);
            g.fillStyle = '#ffe9a8';
            g.fillRect(21, -7, 2, 2);
            g.fillStyle = '#d43a3a';
            g.beginPath();
            g.moveTo(-16, 4);
            g.quadraticCurveTo(-26, 2, -25, 12);
            g.quadraticCurveTo(-20, 8, -17, 8);
            g.closePath();
            g.fill();
            g.fillStyle = '#7a3f52';
            g.fillRect(-5, 1, 10, 4);
            g.fillStyle = '#f2c14e';
            g.fillRect(-5, 1, 10, 1);
        }
        else if (kind === 'phoenix') {
            g.fillStyle = 'rgba(255, 120, 50, 0.2)';
            g.beginPath();
            g.ellipse(0, 8, 28, 10, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#e06a2a';
            g.beginPath();
            g.ellipse(0, 8, 15, 7, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2a23a';
            g.beginPath();
            g.ellipse(-3, 5, 11, 4, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#d43a3a';
            g.beginPath();
            g.moveTo(-6, 6);
            g.quadraticCurveTo(-26, -8, -30, 2);
            g.quadraticCurveTo(-20, 8, -8, 10);
            g.closePath();
            g.fill();
            g.beginPath();
            g.moveTo(6, 6);
            g.quadraticCurveTo(24, -6, 28, 2);
            g.quadraticCurveTo(18, 8, 8, 10);
            g.closePath();
            g.fill();
            g.fillStyle = '#f2c14e';
            for (let i = 0; i < 3; i += 1) {
                const sway = Math.sin(time / 240 + i) * 2;
                g.fillRect(-22 + i * 3 + sway, 12, 2, 10);
            }
            g.fillStyle = '#e06a2a';
            g.fillRect(11, -4, 6, 12);
            g.beginPath();
            g.ellipse(17, -7, 5, 4, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#f2c14e';
            g.fillRect(20, -8, 5, 2);
            g.fillRect(13, -12, 2, 4);
            g.fillRect(17, -11, 2, 3);
            g.fillStyle = '#7a3f52';
            g.fillRect(-5, 1, 10, 4);
            g.fillStyle = '#f2c14e';
            g.fillRect(-5, 1, 10, 1);
        }
        else if (kind === 'dao') {
            const glow = g.createRadialGradient(0, 8, 3, 0, 8, 30);
            glow.addColorStop(0, 'rgba(180, 160, 255, 0.35)');
            glow.addColorStop(1, 'rgba(180, 160, 255, 0)');
            g.fillStyle = glow;
            g.beginPath();
            g.ellipse(0, 8, 30, 12, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#cfc6ff';
            g.beginPath();
            g.ellipse(0, 9, 19, 7, 0, 0, Math.PI * 2);
            g.fill();
            g.strokeStyle = '#f2c14e';
            g.lineWidth = 1;
            g.beginPath();
            g.ellipse(0, 9, 13, 4.5, 0, 0, Math.PI * 2);
            g.stroke();
            g.fillStyle = '#9a8cff';
            for (let i = 0; i < 4; i += 1) {
                const angle = time / 900 + (i / 4) * Math.PI * 2;
                g.fillRect(Math.cos(angle) * 16 - 1, 9 + Math.sin(angle) * 6 - 1, 2, 2);
            }
            g.fillStyle = '#f2c14e';
            g.beginPath();
            g.ellipse(0, 2, 6, 3, 0, 0, Math.PI * 2);
            g.fill();
        }
        else {
            const dragon = kind === 'dragon';
            const body = dragon ? '#8a6a2a' : '#2f6a6a';
            const lit = dragon ? '#c9a24a' : '#4d9a8a';
            g.strokeStyle = body;
            g.lineWidth = 6;
            g.beginPath();
            g.moveTo(-22, 12);
            g.quadraticCurveTo(-10, -2, 0, 10);
            g.quadraticCurveTo(10, 18, 20, 4);
            g.stroke();
            g.strokeStyle = lit;
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(-20, 11);
            g.quadraticCurveTo(-10, 0, 0, 10);
            g.quadraticCurveTo(10, 17, 19, 4);
            g.stroke();
            g.fillStyle = body;
            g.beginPath();
            g.ellipse(21, 0, 8, 6, -0.2, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = lit;
            g.fillRect(25, 2, 6, 3);
            g.fillStyle = '#f2c14e';
            g.fillRect(18, -6, 2, 6);
            g.fillRect(23, -5, 2, 4);
            g.beginPath();
            g.moveTo(26, 1);
            g.lineTo(34, -2);
            g.lineTo(30, 4);
            g.closePath();
            g.fill();
            g.fillStyle = '#ffe9a8';
            g.fillRect(24, -1, 2, 2);
            g.fillStyle = body;
            g.beginPath();
            g.moveTo(-22, 12);
            g.quadraticCurveTo(-30, 18, -34, 14);
            g.quadraticCurveTo(-28, 22, -20, 16);
            g.closePath();
            g.fill();
            g.fillStyle = '#7a3f52';
            g.fillRect(-5, 1, 10, 4);
            g.fillStyle = '#f2c14e';
            g.fillRect(-5, 1, 10, 1);
        }
        g.restore();
    }
    /** 坐骑按形态挂在骑手脚底：剑脊/鞍面就是脚线，人踩着飞。 */
    function paintMount(cx, feetY, form, time, variant) {
        // 坐骑与 mini 修士同比例缩放，骑手与剑/兽的比例保持不变。
        g.save();
        g.translate(cx, feetY);
        g.scale(CHARACTER_SCALE, CHARACTER_SCALE);
        if (form === 'sword')
            paintSwordMount(0, 0, time);
        else if (form === 'beast')
            paintBeastMount(0, 0, time, variant);
        g.restore();
    }
    /** 当前对话者头顶的悬浮标签，比只有光圈更容易一眼看到。 */
    function paintViewingBadge(cx, baseY, member, time) {
        const text = model?.labels?.viewing ?? '对话中';
        const color = member.isLeader === true ? '#f2c14e' : '#6fd6c8';
        const bob = Math.sin(time / 520) * 2;
        g.save();
        g.font = 'bold 8px "Segoe UI", sans-serif';
        const w = g.measureText(text).width + 12;
        const x = cx + 18;
        const y = baseY - CHARACTER_DISPLAY_HEIGHT - 16 + bob;
        g.fillStyle = 'rgba(12, 18, 22, 0.88)';
        roundRect(g, x, y, w, 15, 4);
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 1;
        roundRect(g, x, y, w, 15, 4);
        g.stroke();
        g.fillStyle = color;
        g.fillText(text, x + 6, y + 10.5);
        g.beginPath();
        g.moveTo(x + 1, y + 6);
        g.lineTo(x - 5, y + 10);
        g.lineTo(x + 1, y + 12);
        g.closePath();
        g.fill();
        g.restore();
    }
    /** 修为变化：冒 +N；升级：冒横幅 + 金环特效。 */
    function trackCultivationFx(spot, time) {
        const id = spot.member.id || spot.member.name;
        const level = spot.member.level;
        let leveled = false;
        if (level !== undefined) {
            const previous = lastLevel.get(id);
            if (previous !== undefined && level > previous) {
                // 升级横幅抬高，避免和等级框/经验飘字叠在一起。
                cultivationFx.push({ x: spot.cx, y: spot.baseY - 96, groundY: spot.baseY, text: `Lv.${level}`, start: time, kind: 'level' });
                leveled = true;
            }
            lastLevel.set(id, level);
        }
        const xp = spot.member.xp;
        if (xp !== undefined) {
            const previous = lastXp.get(id);
            if (previous !== undefined && xp - previous >= 1 && !leveled) {
                cultivationFx.push({ x: spot.cx, y: spot.baseY - 74, groundY: spot.baseY, text: `+${Math.round(xp - previous)}`, start: time, kind: 'xp' });
            }
            lastXp.set(id, xp);
        }
        if (cultivationFx.length > 40)
            cultivationFx = cultivationFx.slice(-40);
    }
    function drawCultivationFx(time) {
        const keep = [];
        for (const fx of cultivationFx) {
            const progress = (time - fx.start) / 1400;
            if (progress >= 1)
                continue;
            keep.push(fx);
            const alpha = 1 - progress;
            const y = fx.y - progress * 30;
            g.save();
            g.globalAlpha = alpha;
            if (fx.kind === 'level') {
                const ring = 12 + progress * 32;
                const ringY = fx.groundY - 2;
                g.strokeStyle = '#f2c14e';
                g.lineWidth = 2;
                g.beginPath();
                g.ellipse(fx.x, ringY, ring, ring * 0.32, 0, 0, Math.PI * 2);
                g.stroke();
                for (let i = 0; i < 8; i += 1) {
                    const angle = (i / 8) * Math.PI * 2 + progress * 2;
                    g.fillStyle = '#ffe9a8';
                    g.fillRect(fx.x + Math.cos(angle) * ring - 1.5, ringY + Math.sin(angle) * ring * 0.32 - 1.5, 3, 3);
                }
                g.font = 'bold 9px "Segoe UI", sans-serif';
                const text = `${model?.labels?.levelUp ?? 'Level up'} ${fx.text}`;
                const w = g.measureText(text).width;
                g.fillStyle = 'rgba(12, 18, 22, 0.88)';
                roundRect(g, fx.x - w / 2 - 6, y - 10, w + 12, 16, 4);
                g.fill();
                g.strokeStyle = '#f2c14e';
                g.lineWidth = 1;
                roundRect(g, fx.x - w / 2 - 6, y - 10, w + 12, 16, 4);
                g.stroke();
                g.fillStyle = '#f2c14e';
                g.fillText(text, fx.x - w / 2, y + 3);
            }
            else {
                g.font = 'bold 9px "Segoe UI", sans-serif';
                const w = g.measureText(fx.text).width;
                g.fillStyle = 'rgba(12, 18, 22, 0.78)';
                roundRect(g, fx.x - w / 2 - 5, y - 9, w + 10, 14, 4);
                g.fill();
                g.fillStyle = '#9be36f';
                g.fillText(fx.text, fx.x - w / 2, y + 2);
            }
            g.restore();
        }
        cultivationFx = keep;
    }
    /** 境界灵光：Lv.2 起周身灵光，Lv.10 起脚下金环。 */
    function paintCultivationAura(cx, baseY, member, time) {
        const level = member.level ?? 0;
        if (level < 2)
            return;
        g.save();
        const count = level >= 10 ? 6 : 3;
        for (let i = 0; i < count; i += 1) {
            const angle = time / 1200 + (i / count) * Math.PI * 2;
            const x = cx + Math.cos(angle) * 17;
            const y = baseY - 34 + Math.sin(angle * 1.4) * 11;
            g.globalAlpha = 0.32 + 0.24 * Math.sin(time / 500 + i);
            g.fillStyle = level >= 10 ? '#f2c14e' : '#9be36f';
            g.fillRect(x - 1, y - 1, 2, 2);
        }
        if (level >= 10) {
            g.globalAlpha = 0.22 + 0.1 * Math.sin(time / 700);
            g.strokeStyle = '#f2c14e';
            g.lineWidth = 1;
            g.beginPath();
            g.ellipse(cx, baseY - 2, 20, 6, 0, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
    }
    /** 已装备法器：按物品 id 换外形，按品阶换灵光。 */
    function paintEquippedWeapon(cx, baseY, shape, tone, time) {
        const bob = Math.sin(time / 620) * 2;
        const tilt = Math.sin(time / 900) * 0.1;
        g.save();
        // 放在持器手外侧，别压到身体（mini 身形只有 ~20 宽）。
        g.translate(cx + 24, baseY - 34 + bob);
        g.rotate(tilt);
        g.scale(tone.scale, tone.scale);
        // 灵光
        const glow = g.createRadialGradient(0, 0, 1, 0, 0, 16);
        glow.addColorStop(0, `rgba(${tone.glow}, 0.34)`);
        glow.addColorStop(1, `rgba(${tone.glow}, 0)`);
        g.fillStyle = glow;
        g.beginPath();
        g.arc(0, 0, 16, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = tone.color;
        g.strokeStyle = tone.color;
        switch (shape) {
            case 'sword': {
                g.fillRect(-1, -12, 2, 16);
                g.fillRect(-4, -6, 8, 2);
                g.fillRect(-1, -4, 2, 6);
                g.fillRect(-2, 2, 4, 2);
                break;
            }
            case 'saber': {
                g.lineWidth = 3;
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(-2, -12);
                g.quadraticCurveTo(6, -5, 3, 2);
                g.stroke();
                g.fillRect(-4, -3, 8, 2);
                g.fillRect(-1, -1, 2, 6);
                break;
            }
            case 'orb': {
                g.globalAlpha = 0.95;
                g.beginPath();
                g.arc(0, -2, 6, 0, Math.PI * 2);
                g.fill();
                g.globalAlpha = 0.5;
                g.beginPath();
                g.ellipse(0, -2, 10, 3.5, -0.4, 0, Math.PI * 2);
                g.stroke();
                break;
            }
            case 'staff': {
                g.fillRect(-1, -12, 2, 24);
                g.beginPath();
                g.arc(0, -13, 3.5, 0, Math.PI * 2);
                g.fill();
                g.fillStyle = 'rgba(255, 255, 255, 0.7)';
                g.fillRect(-1, -14, 2, 2);
                break;
            }
            case 'bolt': {
                g.beginPath();
                g.moveTo(-3, -12);
                g.lineTo(4, -3);
                g.lineTo(0, -2);
                g.lineTo(5, 7);
                g.lineTo(-3, -1);
                g.lineTo(1, -2);
                g.lineTo(-5, -9);
                g.closePath();
                g.fill();
                break;
            }
            case 'trident': {
                g.fillRect(-1, -8, 2, 20);
                g.fillRect(-5, -13, 2, 7);
                g.fillRect(-1, -15, 2, 9);
                g.fillRect(3, -13, 2, 7);
                g.fillRect(-5, -7, 10, 2);
                break;
            }
            case 'star': {
                g.beginPath();
                for (let i = 0; i < 10; i += 1) {
                    const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
                    const radius = i % 2 === 0 ? 8 : 3.4;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius - 2;
                    if (i === 0)
                        g.moveTo(x, y);
                    else
                        g.lineTo(x, y);
                }
                g.closePath();
                g.fill();
                break;
            }
            case 'planet': {
                g.beginPath();
                g.arc(0, -2, 6, 0, Math.PI * 2);
                g.fill();
                g.lineWidth = 1.4;
                g.beginPath();
                g.ellipse(0, -2, 11, 4, -0.35, 0, Math.PI * 2);
                g.stroke();
                g.fillStyle = 'rgba(255, 255, 255, 0.65)';
                g.fillRect(-2, -4, 2, 2);
                break;
            }
        }
        // 两粒环绕灵屑，让换装后的法器有存在感。
        for (let i = 0; i < 2; i += 1) {
            const angle = time / 700 + i * Math.PI;
            g.globalAlpha = 0.55 + 0.25 * Math.sin(time / 420 + i);
            g.fillRect(Math.cos(angle) * 12 - 1, Math.sin(angle) * 12 - 1, 2, 2);
        }
        g.restore();
    }
    /** 换装反馈：脚下灵光扩散 + 头顶飘出装备名。 */
    function paintEquipFlash(cx, baseY, member, time) {
        const key = member.id || member.name;
        const flash = equipFlash.get(key);
        if (flash === undefined)
            return;
        const age = time - flash.at;
        if (age < 0)
            return;
        if (age > EQUIP_FLASH_MS) {
            equipFlash.delete(key);
            return;
        }
        const progress = age / EQUIP_FLASH_MS;
        const color = flash.kind === 'mount' ? '#6fd6c8' : flash.kind === 'skill' ? '#9be36f' : '#f2c14e';
        g.save();
        // 脚下灵光
        g.globalAlpha = Math.max(0, 1 - progress) * 0.85;
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        const radius = 8 + progress * 26;
        g.beginPath();
        g.ellipse(cx, baseY - 2, radius, radius * 0.32, 0, 0, Math.PI * 2);
        g.stroke();
        // 头顶飘字
        g.globalAlpha = Math.min(1, (1 - progress) * 2.4);
        const text = truncate(flash.text, 10);
        g.font = 'bold 7px "Segoe UI", sans-serif';
        const width = g.measureText(text).width + 10;
        const x = Math.max(2, Math.min(WORLD_W - width - 2, cx - width / 2));
        const y = baseY - CHARACTER_DISPLAY_HEIGHT - 40 - progress * 10;
        g.fillStyle = 'rgba(12, 18, 22, 0.9)';
        roundRect(g, x, y, width, 13, 3);
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 1;
        roundRect(g, x, y, width, 13, 3);
        g.stroke();
        g.fillStyle = color;
        g.fillText(text, x + 5, y + 9);
        g.restore();
    }
    /** 已装备外观：法器悬浮在身侧，技能多一层灵环。 */
    function paintEquipFx(cx, baseY, member, time) {
        const key = member.id || member.name;
        const weapon = weaponEquip.get(key);
        const skillTier = skillEquip.get(key);
        if (weapon !== undefined) {
            paintEquippedWeapon(cx, baseY, weaponShapeFor(weapon.itemId), toneForTier(weapon.tier), time);
        }
        if (skillTier !== undefined) {
            const color = toneForTier(skillTier).color;
            g.save();
            g.globalAlpha = 0.5 + 0.15 * Math.sin(time / 480);
            g.strokeStyle = color;
            g.lineWidth = 1.4;
            g.beginPath();
            g.ellipse(cx, baseY - 2, 22, 8, 0, 0, Math.PI * 2);
            g.stroke();
            for (let i = 0; i < 3; i += 1) {
                const angle = time / 900 + (i / 3) * Math.PI * 2;
                g.fillStyle = color;
                g.fillRect(cx + Math.cos(angle) * 24 - 1.5, baseY - 2 + Math.sin(angle) * 8 - 1.5, 3, 3);
            }
            g.restore();
        }
    }
    /** Name plate, state dot, progress bar, task bubble and unread badge. */
    function paintOverlay(cx, deskY, member, time, lift = 0) {
        const seed = hash(member.id || member.name);
        const working = member.activity === 'working';
        const bob = working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
        // 名牌/进度条钉在地面，只有头顶的等级框和任务气泡跟着身形一起离地。
        const headY = deskY - lift - CHARACTER_DISPLAY_HEIGHT + bob;
        // Name plate under the desk edge: name + persistent state word.
        const labels = model?.labels;
        const stateText = member.viewing === true
            ? (labels?.viewing ?? '对话中')
            : member.activity === 'working'
                ? labels?.working
                : member.activity === 'idle' ? labels?.idle : labels?.unknownState;
        const label = stateText === undefined || stateText === ''
            ? truncate(member.name, 10)
            : `${truncate(member.name, 8)} · ${stateText}`;
        g.font = '9px "Segoe UI", monospace';
        const textW = g.measureText(label).width;
        g.fillStyle = COLORS.labelBg;
        roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3);
        g.fill();
        g.fillStyle = member.isLeader ? COLORS.captain : COLORS.label;
        g.fillText(label, cx - textW / 2, deskY + 13);
        // 当前对话：名牌描边 + 外圈呼吸光，比额外图形更克制。
        if (member.viewing === true) {
            const accent = member.isLeader === true ? '#f2c14e' : '#6fd6c8';
            g.save();
            g.strokeStyle = accent;
            g.lineWidth = 1;
            g.globalAlpha = 0.9;
            roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3);
            g.stroke();
            g.globalAlpha = 0.28 + 0.14 * Math.sin(time / 700);
            roundRect(g, cx - textW / 2 - 9, deskY + 1, textW + 18, 18, 4);
            g.stroke();
            g.restore();
        }
        // State dot.
        g.fillStyle = member.viewing === true
            ? (member.isLeader === true ? '#f2c14e' : '#6fd6c8')
            : stateTone(member.activity);
        g.beginPath();
        g.arc(cx - textW / 2 - 10, deskY + 10, 2.6, 0, Math.PI * 2);
        g.fill();
        // 头顶等级 + 境界：Lv.N 炼气/筑基/…
        const levelText = member.level === undefined || member.level <= 0
            ? undefined
            : `Lv.${member.level}${member.realm === undefined || member.realm === '' ? '' : ` ${member.realm}`}`;
        if (levelText !== undefined) {
            g.font = 'bold 6.5px "Segoe UI", monospace';
            const lw = Math.max(44, g.measureText(levelText).width + 10);
            const lx = Math.max(2, Math.min(WORLD_W - lw - 2, cx - lw / 2));
            const ly = headY - 16;
            // 境界色等级框：每跨一重境界换一套底色/描边/进度条色。
            const palette = realmPaletteForLevel(member.level ?? 1);
            g.fillStyle = palette.background;
            roundRect(g, lx, ly, lw, 16, 4);
            g.fill();
            g.strokeStyle = palette.border;
            g.lineWidth = 1;
            roundRect(g, lx, ly, lw, 16, 4);
            g.stroke();
            g.fillStyle = palette.text;
            g.fillText(levelText, lx + 5, ly + 8);
            const trackX = lx + 4;
            const trackY = ly + 11;
            const trackW = lw - 8;
            g.save();
            g.globalAlpha = 0.22;
            g.fillStyle = palette.border;
            g.fillRect(trackX, trackY, trackW, 2.5);
            g.restore();
            const ratio = Math.min(1, Math.max(0, member.xpRatio ?? 0));
            g.fillStyle = palette.bar;
            g.fillRect(trackX, trackY, Math.max(1, Math.round(trackW * ratio)), 2.5);
        }
        // Per-member progress bar.
        if (member.total !== undefined && member.total > 0) {
            const ratio = Math.min(1, Math.max(0, (member.done ?? 0) / member.total));
            g.fillStyle = 'rgba(255,255,255,0.18)';
            g.fillRect(cx - 18, deskY + 20, 36, 3);
            g.fillStyle = COLORS.good;
            g.fillRect(cx - 18, deskY + 20, Math.round(36 * ratio), 3);
        }
        // Task bubble above the head.
        if (member.currentTask !== undefined && member.currentTask !== '') {
            const text = truncate(member.currentTask, 15);
            g.font = '8px "Segoe UI", monospace';
            const bw = g.measureText(text).width + 12;
            const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2));
            const by = Math.max(4, headY - 22 - (member.level === undefined ? 0 : 18));
            g.fillStyle = COLORS.bubble;
            roundRect(g, bx, by, bw, 15, 4);
            g.fill();
            g.beginPath();
            g.moveTo(cx - 3, by + 15);
            g.lineTo(cx + 1, by + 19);
            g.lineTo(cx + 4, by + 15);
            g.closePath();
            g.fill();
            g.fillStyle = COLORS.label;
            g.fillText(text, bx + 6, by + 11);
        }
        // 闲置闲聊：与任务气泡互斥，只在静修且没有任务时冒一句设定好的话。
        const chatter = model?.chatter;
        if (member.activity === 'idle' && chatter !== undefined && chatter.length > 0
            && (member.currentTask === undefined || member.currentTask === '')) {
            const cycle = 11000 + (seed % 6) * 1300;
            const t0 = time + (seed % 5000);
            if (t0 % cycle < 2600) {
                const line = chatter[Math.floor(t0 / cycle + seed) % chatter.length];
                g.font = '8px "Segoe UI", monospace';
                const text = truncate(line, 18);
                const bw = g.measureText(text).width + 12;
                const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2));
                const by = Math.max(4, headY - 22 - (member.level === undefined ? 0 : 18));
                g.fillStyle = 'rgba(28, 36, 48, 0.94)';
                roundRect(g, bx, by, bw, 15, 4);
                g.fill();
                g.strokeStyle = 'rgba(127, 212, 255, 0.35)';
                g.lineWidth = 1;
                roundRect(g, bx, by, bw, 15, 4);
                g.stroke();
                g.beginPath();
                g.moveTo(cx - 3, by + 15);
                g.lineTo(cx + 1, by + 19);
                g.lineTo(cx + 4, by + 15);
                g.closePath();
                g.fill();
                g.fillStyle = COLORS.label;
                g.fillText(text, bx + 6, by + 11);
            }
        }
        // Unread badge.
        if ((member.unread ?? 0) > 0) {
            g.fillStyle = COLORS.alert;
            g.beginPath();
            g.arc(cx + 13, headY - 1, 5, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#fff';
            g.font = 'bold 6.5px "Segoe UI", monospace';
            g.fillText(String(Math.min(9, member.unread ?? 0)), cx + 11, headY + 1);
        }
    }
    /** 缓入缓出，让走动不像平移。 */
    function smooth01(t) {
        return t * t * (3 - 2 * t);
    }
    /** 中庭里的落脚点：按修士 seed 与时间槽确定，画面可复现。 */
    function wanderPoint(seed, slot, top, bottom) {
        const width = WORLD_W - 120;
        const height = Math.max(1, bottom - top);
        return {
            x: 60 + ((seed * 37 + slot * 131) % width),
            y: top + ((seed * 53 + slot * 97) % height),
        };
    }
    function paint(time) {
        const members = model?.members ?? [];
        // A wide, short pane (the right-side team tab) gains a lot from fewer rows:
        // pick the column count whose world fits the canvas with the largest scale.
        let columns = 1;
        let worldHeight = WORLD_MIN_H;
        let bestScale = -1;
        const maxColumns = members.length === 0 ? 1 : Math.min(MAX_COLUMNS, members.length);
        for (let candidate = 1; candidate <= maxColumns; candidate++) {
            const candidateRows = Math.max(1, Math.ceil(members.length / candidate));
            const candidateHeight = Math.max(WORLD_MIN_H, TOP_PAD + candidateRows * CELL_H + 8);
            const candidateScale = Math.min(width / WORLD_W, height / candidateHeight);
            // Equal scale means the pane is width-limited: prefer more columns so a
            // tall, narrow tab fills its width instead of stacking one thin column.
            if (candidateScale > bestScale + 1e-6 || (Math.abs(candidateScale - bestScale) <= 1e-6 && candidate > columns)) {
                bestScale = candidateScale;
                columns = candidate;
                worldHeight = candidateHeight;
            }
        }
        scale = Math.max(0.2, bestScale) * zoom;
        // A tall pane (the full-height team tab) should paint floor to the bottom
        // edge instead of floating a short world in the middle with dead bands.
        const stretch = height / scale;
        worldH = stretch > worldHeight ? stretch : worldHeight;
        offsetX = (width - WORLD_W * scale) / 2;
        offsetY = Math.max(0, (height - worldH * scale) / 2);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, width, height);
        g.save();
        g.translate(offsetX, offsetY);
        g.scale(scale, scale);
        g.imageSmoothingEnabled = false;
        const cellW = WORLD_W / columns;
        const rowCount = Math.max(1, Math.ceil(members.length / columns));
        const firstDeskY = TOP_PAD + 128;
        const available = Math.max(0, worldH - 24 - firstDeskY);
        // Spread and centre the rows over the available hall instead of pinning
        // everyone to the wall, so a tall tab reads as a courtyard, not dead floor.
        const spacing = rowCount > 1 ? Math.min(280, available / (rowCount - 1)) : 0;
        // Anchor the first row under the wall: a tall hall should read menu -> people
        // -> courtyard, not float a small cluster in the middle of dead floor.
        const blockTop = firstDeskY + (rowCount === 1 ? Math.min(150, available * 0.18) : 0);
        const layout = members.map((member, index) => {
            const row = Math.floor(index / columns);
            const inRow = Math.min(columns, members.length - row * columns);
            // Centre an incomplete last row instead of leaving a gap on the right.
            const column = (index % columns) + (columns - inRow) / 2;
            const cx = cellW * (column + 0.5);
            const deskY = blockTop + spacing * row;
            return { member, cx, deskY };
        });
        const lastDeskY = layout.length === 0 ? 0 : layout[layout.length - 1].deskY;
        // 闲置修士在中庭里自行走动：每人一个 seed，按时间槽在庭院里换落脚点，
        // 走动 62% 的时间，剩下的是驻足/闲谈。案几与法器留在原位。
        const spots = layout.map(item => ({ ...item, deskCx: item.cx, baseY: item.deskY, walking: false }));
        const courtyardTop = lastDeskY + 132;
        const pondGap = worldH - WALL_HEIGHT >= 760 ? 250 : 70;
        const courtyardBottom = worldH - pondGap;
        if (courtyardBottom - courtyardTop >= 60) {
            for (const spot of spots) {
                if (spot.member.activity !== 'idle')
                    continue;
                const seed = hash(spot.member.id || spot.member.name);
                const cycle = 15000 + (seed % 5) * 1400;
                const t0 = time + (seed % 9000);
                const slot = Math.floor(t0 / cycle);
                const phase = (t0 % cycle) / cycle;
                const eased = phase < 0.62 ? smooth01(phase / 0.62) : 1;
                const from = wanderPoint(seed, slot, courtyardTop, courtyardBottom);
                const to = wanderPoint(seed, slot + 1, courtyardTop, courtyardBottom);
                spot.cx = from.x + (to.x - from.x) * eased;
                spot.baseY = from.y + (to.y - from.y) * eased;
                spot.walking = phase < 0.62;
            }
        }
        else {
            // 面板不够高、没有中庭时，也别把闲置修士钉在座位上：让他们在案几旁踱步。
            for (const spot of spots) {
                if (spot.member.activity !== 'idle')
                    continue;
                const seed = hash(spot.member.id || spot.member.name);
                const sway = Math.sin(time / (2400 + (seed % 1200)) + (seed % 7));
                spot.cx = Math.max(36, Math.min(WORLD_W - 36, spot.deskCx + sway * 24));
                spot.walking = Math.abs(sway) > 0.25;
            }
        }
        // 修为飘字跟着脚线走：御剑/骑兽时横幅在人头顶，而不是留在原地面上。
        for (const spot of spots) {
            trackCultivationFx({ ...spot, baseY: spot.baseY - TRAVEL_LIFT[travelForm(spot.member)] }, time);
        }
        paintRoom(time, model?.wall, hovered, lastDeskY);
        paintPond(time, lastDeskY);
        // Wall facilities first (they live above the desks); desk areas are larger
        // than the art so a cultivator stays easy to click in a scaled pane.
        hitAreas = [];
        const labelled = new Set((model?.facilities ?? []).map(facility => facility.action));
        for (const action of FACILITY_ORDER) {
            if (!labelled.has(action))
                continue;
            const rect = FACILITIES[action];
            hitAreas.push({
                x: rect.x,
                y: rect.y,
                w: rect.w,
                h: 92 - rect.y,
                hit: { kind: 'action', action },
            });
        }
        for (const spot of spots) {
            const lift = TRAVEL_LIFT[travelForm(spot.member)];
            // 案几本身也可点（修士离开时仍能点到他）。
            hitAreas.push({
                x: spot.deskCx - 42,
                y: spot.deskY - 58,
                w: 84,
                h: 78,
                hit: { kind: 'member', id: spot.member.id },
            });
            // mini 身形 + 坐骑的整体热区：飞起时跟着脚线一起抬升。
            hitAreas.push({
                x: spot.cx - 26,
                y: spot.baseY - lift - CHARACTER_DISPLAY_HEIGHT - 6,
                w: 52,
                h: CHARACTER_DISPLAY_HEIGHT + lift + 12,
                hit: { kind: 'member', id: spot.member.id },
            });
        }
        // 头顶等级框也可点：打开该修士的装备页。
        for (const spot of spots) {
            if ((spot.member.level ?? 0) <= 0)
                continue;
            const lift = TRAVEL_LIFT[travelForm(spot.member)];
            hitAreas.push({
                x: Math.max(2, Math.min(WORLD_W - 62, spot.cx - 31)),
                y: spot.baseY - lift - CHARACTER_DISPLAY_HEIGHT - 18,
                w: 62,
                h: 18,
                hit: { kind: 'level', id: spot.member.id || spot.member.name },
            });
        }
        // 中庭物件最后入表：它排在点击命中的最前面，不被案几热区吞掉。
        if (model?.sceneObjects?.settings === true) {
            hitAreas.push({
                x: DIAL_AT.x - 28,
                y: DIAL_AT.y - 32,
                w: 56,
                h: 66,
                hit: { kind: 'settings' },
            });
        }
        if (layout.length === 0) {
            g.fillStyle = COLORS.label;
            g.font = '12px "Segoe UI", sans-serif';
            const text = model?.labels?.empty ?? 'No members yet';
            g.fillText(text, 24, 150);
        }
        else {
            // 落影先画：矮案会把伏案修士的影子挡住，人才像站在地上。
            for (const spot of spots)
                paintGroundShadow(spot.cx, spot.baseY, travelForm(spot.member), time);
            for (const spot of spots)
                paintFurniture(spot.deskCx, spot.deskY, spot.member, time);
            for (const spot of spots)
                if (spot.member.viewing === true)
                    paintViewingAura(spot.cx, spot.baseY, spot.member, time);
            // 坐骑挂在脚线下方，修士整体离地：御剑/骑兽是飞起来，而不是踩在案面上。
            for (const spot of spots) {
                const form = travelForm(spot.member);
                const lift = TRAVEL_LIFT[form];
                if (form !== 'walk')
                    paintMount(spot.cx, spot.baseY - lift, form, time, mountVariant.get(spot.member.id || spot.member.name));
                const hop = jumpHeight(spot.member.id || spot.member.name, time);
                // 御剑/骑兽时双腿保持不动，只有步行才播步态。
                paintCharacter(spot.cx, spot.baseY - lift - hop, spot.member, time, spot.walking && form === 'walk');
                paintCultivationAura(spot.cx, spot.baseY - lift, spot.member, time);
            }
            // 案沿统一压在修士之后：伏案与在案前驻足的人都不会“站在桌子里”。
            for (const spot of spots)
                paintDeskFront(spot.deskCx, spot.deskY);
            for (const spot of spots) {
                const lift = TRAVEL_LIFT[travelForm(spot.member)];
                paintOverlay(spot.cx, spot.baseY, spot.member, time, lift);
                paintEquipFx(spot.cx, spot.baseY - lift, spot.member, time);
                paintEquipFlash(spot.cx, spot.baseY - lift, spot.member, time);
            }
            for (const spot of spots) {
                if (spot.member.viewing !== true)
                    continue;
                const lift = TRAVEL_LIFT[travelForm(spot.member)];
                paintViewingBadge(spot.cx, spot.baseY - lift, spot.member, time);
            }
            drawCultivationFx(time);
            // 鼠标停在修士上：四角描金，明确这是可点的会话入口。
            const hoveredMemberId = hovered?.kind === 'member' ? hovered.id : undefined;
            if (hoveredMemberId !== undefined) {
                const target = spots.find(spot => spot.member.id === hoveredMemberId);
                if (target !== undefined)
                    paintDeskHover(target.cx, target.baseY, time);
            }
        }
        // 中庭物件：挡在人物之后画，保证最上层可点。
        if (model?.sceneObjects?.settings === true) {
            paintHallDial(DIAL_AT.x, DIAL_AT.y, time, hovered?.kind === 'settings', model.sceneObjects.settingsActive === true, model?.sceneLabels?.settings ?? '');
        }
        if (model?.phase === 'staged') {
            g.fillStyle = 'rgba(16, 20, 28, 0.55)';
            g.fillRect(0, 0, WORLD_W, worldH);
            g.fillStyle = '#f6f8ff';
            g.font = 'bold 13px "Segoe UI", sans-serif';
            const text = model.labels?.awaiting ?? 'Waiting for approval';
            const textW = g.measureText(text).width;
            g.fillText(text, (WORLD_W - textW) / 2, worldH / 2);
        }
        if (model?.halted === true) {
            g.fillStyle = COLORS.alert;
            g.fillRect(0, 0, WORLD_W, 18);
            g.fillStyle = '#1a1010';
            g.font = 'bold 10px "Segoe UI", sans-serif';
            const text = model.labels?.stalled ?? 'Team stopped';
            const textW = g.measureText(text).width;
            g.fillText(text, (WORLD_W - textW) / 2, 13);
        }
        g.restore();
    }
    function fallback(error) {
        try {
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.fillStyle = '#1b2029';
            g.fillRect(0, 0, canvas.width, canvas.height);
            g.fillStyle = '#f0a0a0';
            g.font = '12px monospace';
            g.fillText(`office render error: ${String(error)}`, 12, 24);
        }
        catch {
            // Nothing else can be drawn.
        }
    }
    function loop(time) {
        if (disposed)
            return;
        try {
            paint(time);
        }
        catch (error) {
            fallback(error);
        }
        raf = window.requestAnimationFrame(loop);
    }
    fit();
    raf = window.requestAnimationFrame(loop);
    return {
        render(next) {
            model = next;
        },
        resize(nextWidth, nextHeight) {
            width = Math.max(1, Math.floor(nextWidth));
            height = Math.max(1, Math.floor(nextHeight));
            dpr = typeof window === 'undefined' ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1));
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            fit();
        },
        hitTest(x, y) {
            const wx = (x - offsetX) / scale;
            const wy = (y - offsetY) / scale;
            for (let index = hitAreas.length - 1; index >= 0; index--) {
                const area = hitAreas[index];
                if (wx >= area.x && wx <= area.x + area.w && wy >= area.y && wy <= area.y + area.h)
                    return area.hit;
            }
            return undefined;
        },
        setHover(hit) {
            hovered = hit;
        },
        jump(id) {
            jumps.set(id, -1);
        },
        cycleMount(id) {
            const member = model?.members.find(item => (item.id || item.name) === id);
            if (member === undefined || member.activity === 'working')
                return;
            const key = member.id || member.name;
            const next = nextTravelForm(member.level ?? 0, travelForm(member));
            mountOverride.set(key, next === 'walk' ? 'off' : next);
        },
        setMount(id, form, variant, label) {
            mountOverride.set(id, form);
            if (variant !== undefined)
                mountVariant.set(id, variant);
            if (label !== undefined)
                equipFlash.set(id, { at: nowMs(), text: label, kind: 'mount' });
            jumps.set(id, -1);
        },
        setEquip(id, kind, tier, itemId, label) {
            if (kind === 'weapon')
                weaponEquip.set(id, { tier, itemId, label });
            else
                skillEquip.set(id, tier);
            if (label !== undefined)
                equipFlash.set(id, { at: nowMs(), text: label, kind });
            jumps.set(id, -1);
        },
        dispose() {
            disposed = true;
            if (raf !== undefined)
                window.cancelAnimationFrame(raf);
            raf = undefined;
        },
    };
}
