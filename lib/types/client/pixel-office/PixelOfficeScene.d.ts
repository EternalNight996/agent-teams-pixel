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
}
/** Copy the scene needs but must not translate itself. */
export interface SceneLabels {
    readonly captain?: string;
    readonly stalled?: string;
    readonly awaiting?: string;
    readonly empty?: string;
}
/** One immutable snapshot of the office to draw. */
export interface SceneModel {
    readonly teamName: string;
    readonly phase: 'staged' | 'running';
    readonly halted?: boolean;
    readonly members: readonly SceneMember[];
    readonly labels?: SceneLabels;
}
export interface SceneHandle {
    /** Replace the model; the running loop picks it up on the next frame. */
    render(model: SceneModel): void;
    /** Resize in CSS pixels; devicePixelRatio is handled internally. */
    resize(width: number, height: number): void;
    /** Hit-test a pointer in CSS pixels; returns the member id under it. */
    hitTest(x: number, y: number): string | undefined;
    /** Cancel the loop and release the context. */
    dispose(): void;
}
export declare function createPixelScene(canvas: HTMLCanvasElement, options?: {
    readonly zoom?: number;
}): SceneHandle;
