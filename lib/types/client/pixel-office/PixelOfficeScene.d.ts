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
/** One character shown at a desk. */
export interface SceneMember {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly activity: 'working' | 'idle' | 'unknown';
    readonly currentTask?: string;
    readonly progress?: number;
    readonly done?: number;
    readonly total?: number;
    readonly model?: string;
    readonly unread?: number;
    readonly isLeader?: boolean;
    /** The conversation currently open in the host (painted as active). */
    readonly viewing?: boolean;
    /** Cultivation level; gates which travel forms are unlocked (never auto-flies). */
    readonly level?: number;
    /** Localized realm name shown with the level above the head. */
    readonly realm?: string;
    /** Progress toward the next cultivation level (0..1). */
    readonly xpRatio?: number;
    /** Absolute global cultivation XP (drives +N popups). */
    readonly xp?: number;
}
/** Copy the scene needs but must not translate itself. */
export interface SceneLabels {
    readonly captain?: string;
    readonly stalled?: string;
    readonly awaiting?: string;
    readonly empty?: string;
    /** 常驻状态词：修炼中 / 静修 / 未知，显示在名牌上并驱动灵气颜色。 */
    readonly working?: string;
    readonly idle?: string;
    readonly unknownState?: string;
    /** 当前打开对话时名牌上的状态词（如：对话中）。 */
    readonly viewing?: string;
    /** 升级横幅文案（如：升级！）。 */
    readonly levelUp?: string;
}
/** 墙面数据碑：宗门气运的关键数字，标签由调用方本地化。 */
export interface SceneWall {
    readonly title: string;
    readonly doneCount: number;
    readonly total: number;
    readonly runningCount: number;
    readonly waitingCount: number;
    readonly failedCount: number;
}
/** One wall facility the scene should label and make clickable. */
export interface SceneFacility {
    readonly action: SceneAction;
    readonly label: string;
    /** Unread / attention count painted on the facility (e.g. the message rack). */
    readonly badge?: number;
}
/** One immutable snapshot of the office to draw. */
export interface SceneModel {
    readonly teamName: string;
    readonly phase: 'staged' | 'running';
    readonly halted?: boolean;
    readonly members: readonly SceneMember[];
    readonly labels?: SceneLabels;
    readonly wall?: SceneWall;
    /** Facilities to label and hit-test; omitted draws the wall decor only. */
    readonly facilities?: readonly SceneFacility[];
    /** Facility whose panel is currently open (drawn as selected). */
    readonly activeAction?: SceneAction;
    /** 闲置修士随机说的一句话（由调用方本地化），空数组则不显示闲聊。 */
    readonly chatter?: readonly string[];
    /** 中庭可点物件：面板配置阵盘。 */
    readonly sceneObjects?: {
        readonly settings?: boolean;
        readonly settingsActive?: boolean;
    };
    /** 物件的标签（调用方本地化）。 */
    readonly sceneLabels?: {
        readonly settings?: string;
    };
}
export type { SceneAction } from './office-actions.ts';
export interface SceneHandle {
    /** Replace the model; the running loop picks it up on the next frame. */
    render(model: SceneModel): void;
    /** Resize in CSS pixels; devicePixelRatio is handled internally. */
    resize(width: number, height: number): void;
    /** Hit-test a pointer in CSS pixels; resolves a desk or a wall facility. */
    hitTest(x: number, y: number): SceneHit | undefined;
    /** Mark the element under the pointer so the scene can highlight it. */
    setHover(hit: SceneHit | undefined): void;
    /** Make one member hop (double-click feedback). */
    jump(id: string): void;
    /** Cycle one member's travel form: walking → flying sword → divine beast → walking. */
    cycleMount(id: string): void;
    /** Force one member's travel form (equipment sheet); auto/off mean walking. */
    setMount(id: string, form: 'auto' | 'sword' | 'beast' | 'off', variant?: string, label?: string): void;
    /** Equip one member's artifact/skill (equipment sheet). */
    setEquip(id: string, kind: 'weapon' | 'skill', tier: number, itemId?: string, label?: string): void;
    /** Cancel the loop and release the context. */
    dispose(): void;
}
import { type SceneAction, type SceneHit } from './office-actions.ts';
export declare function createPixelScene(canvas: HTMLCanvasElement, options?: {
    readonly zoom?: number;
}): SceneHandle;
