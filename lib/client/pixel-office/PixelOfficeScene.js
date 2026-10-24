/**
 * Deterministic pixel-office canvas renderer for one AgentTeams snapshot.
 *
 * The scene is framework-agnostic: React owns the canvas element, sizing and
 * the model, while this module owns the animation loop and all drawing. Every
 * frame is defensive — a drawing error degrades to a plain backdrop and keeps
 * the loop alive so a single bad model can never blank the office.
 */
const WORLD_W = 520;
const WORLD_H = 300;
const DESK_W = 92;
const DESK_H = 46;
const MAX_COLUMNS = 4;
const COLORS = {
    wall: '#3a4152',
    wallShade: '#323848',
    floor: '#dcc9a4',
    floorLine: '#cdb891',
    desk: '#9c7651',
    deskTop: '#c39668',
    monitor: '#242a36',
    screen: '#7fd4ff',
    screenIdle: '#39445a',
    label: '#e8eef8',
    labelBg: 'rgba(20, 24, 32, 0.78)',
    bubble: 'rgba(24, 30, 42, 0.9)',
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
        return { render() { }, resize() { }, dispose() { } };
    }
    const g = context;
    let model;
    let disposed = false;
    let raf;
    let width = WORLD_W;
    let height = WORLD_H;
    let dpr = 1;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    const zoom = options.zoom ?? 1;
    function fit() {
        const ratio = Math.min(width / WORLD_W, height / WORLD_H);
        scale = Math.max(0.2, ratio) * zoom;
        offsetX = (width - WORLD_W * scale) / 2;
        offsetY = (height - WORLD_H * scale) / 2;
    }
    function paintRoom(time) {
        // Wall + floor.
        g.fillStyle = COLORS.wall;
        g.fillRect(0, 0, WORLD_W, 96);
        g.fillStyle = COLORS.wallShade;
        g.fillRect(0, 84, WORLD_W, 12);
        g.fillStyle = COLORS.floor;
        g.fillRect(0, 96, WORLD_W, WORLD_H - 96);
        g.strokeStyle = COLORS.floorLine;
        g.lineWidth = 1;
        for (let x = 0; x < WORLD_W; x += 32) {
            g.beginPath();
            g.moveTo(x, 96);
            g.lineTo(x, WORLD_H);
            g.stroke();
        }
        for (let y = 120; y < WORLD_H; y += 32) {
            g.beginPath();
            g.moveTo(0, y);
            g.lineTo(WORLD_W, y);
            g.stroke();
        }
        // Windows with a slow light drift so the office never looks frozen.
        for (const wx of [60, 250, 420]) {
            g.fillStyle = '#26303f';
            roundRect(g, wx, 18, 62, 44, 5);
            g.fill();
            const glow = 0.55 + 0.15 * Math.sin(time / 900 + wx);
            g.fillStyle = `rgba(127, 212, 255, ${glow.toFixed(3)})`;
            roundRect(g, wx + 4, 22, 54, 36, 4);
            g.fill();
            g.fillStyle = COLORS.wall;
            g.fillRect(wx + 30, 22, 3, 36);
            g.fillRect(wx + 4, 38, 54, 3);
        }
        // Plant + whiteboard for scene identity.
        g.fillStyle = '#7a5b3c';
        g.fillRect(14, 216, 22, 26);
        g.fillStyle = '#4f8f54';
        for (const [px, py, pw, ph] of [[8, 186, 30, 18], [14, 172, 18, 18], [2, 200, 16, 12]]) {
            g.fillRect(px, py, pw, ph);
        }
        g.fillStyle = '#f4f6fb';
        roundRect(g, WORLD_W - 118, 24, 100, 58, 4);
        g.fill();
        g.fillStyle = '#b9c4d8';
        for (let i = 0; i < 4; i += 1)
            g.fillRect(WORLD_W - 110, 34 + i * 11, 60 + (i % 2) * 20, 3);
    }
    function paintDesk(cx, deskY, member, time) {
        const seed = hash(member.id || member.name);
        const skin = pick(SKIN, seed);
        const shirt = member.isLeader ? COLORS.captain : pick(SHIRT, seed >> 3);
        const working = member.activity === 'working';
        const bob = working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
        const deskX = cx - DESK_W / 2;
        const topY = deskY - DESK_H + 6;
        // Character first, then desk in front (sitting behind the desk).
        const headY = topY - 30 + bob;
        const bodyY = headY + 16;
        g.fillStyle = shirt;
        g.fillRect(cx - 9, bodyY, 18, 18);
        g.fillStyle = skin;
        g.fillRect(cx - 6, headY, 12, 13);
        g.fillStyle = '#2a2f3a';
        g.fillRect(cx - 6, headY - 2, 12, 4);
        // Eyes look toward the monitor; working characters type.
        g.fillStyle = '#24303f';
        g.fillRect(cx - 3, headY + 5, 2, 2);
        g.fillRect(cx + 2, headY + 5, 2, 2);
        g.fillStyle = skin;
        if (working) {
            const arm = Math.round(Math.sin(time / 90 + seed) * 2);
            g.fillRect(cx - 13, bodyY + 8 + arm, 5, 4);
            g.fillRect(cx + 8, bodyY + 8 - arm, 5, 4);
        }
        else {
            g.fillRect(cx - 13, bodyY + 12, 5, 6);
            g.fillRect(cx + 8, bodyY + 12, 5, 6);
        }
        if (member.isLeader) {
            // Crown.
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
        if (member.activity === 'idle') {
            // A tiny z-z-z drift for the idle.
            g.fillStyle = 'rgba(232, 238, 248, 0.7)';
            g.font = '8px monospace';
            g.fillText('z', cx + 12, headY - 4 - Math.round(Math.sin(time / 500) * 3));
        }
        // Desk and monitor.
        g.fillStyle = COLORS.desk;
        roundRect(g, deskX, topY + 20, DESK_W, DESK_H - 20, 3);
        g.fill();
        g.fillStyle = COLORS.deskTop;
        g.fillRect(deskX, topY + 20, DESK_W, 6);
        g.fillStyle = COLORS.monitor;
        roundRect(g, cx - 15, topY - 2, 30, 22, 3);
        g.fill();
        g.fillStyle = working ? COLORS.screen : COLORS.screenIdle;
        g.fillRect(cx - 12, topY + 1, 24, 15);
        if (working) {
            // Reading lines scroll with time.
            const shift = Math.floor(time / 240) % 4;
            g.fillStyle = 'rgba(20, 26, 36, 0.55)';
            for (let i = 0; i < 4; i += 1) {
                const w = 6 + ((i + shift) % 3) * 5;
                g.fillRect(cx - 9, topY + 4 + i * 3, w, 1);
            }
        }
        g.fillStyle = '#11151c';
        g.fillRect(cx - 2, topY + 20, 4, 3);
        // Name plate.
        const label = truncate(member.name, 10);
        g.font = '9px "Segoe UI", monospace';
        const textW = g.measureText(label).width;
        g.fillStyle = COLORS.labelBg;
        roundRect(g, cx - textW / 2 - 5, deskY + 2, textW + 10, 13, 3);
        g.fill();
        g.fillStyle = member.isLeader ? COLORS.captain : COLORS.label;
        g.fillText(label, cx - textW / 2, deskY + 11);
        // State dot + per-member progress bar.
        g.fillStyle = stateTone(member.activity);
        g.beginPath();
        g.arc(cx - textW / 2 - 9, deskY + 8, 2.5, 0, Math.PI * 2);
        g.fill();
        if (member.total !== undefined && member.total > 0) {
            const ratio = Math.min(1, Math.max(0, (member.done ?? 0) / member.total));
            g.fillStyle = 'rgba(255,255,255,0.16)';
            g.fillRect(cx - 18, deskY + 17, 36, 3);
            g.fillStyle = COLORS.good;
            g.fillRect(cx - 18, deskY + 17, Math.round(36 * ratio), 3);
        }
        // Task bubble.
        if (member.currentTask !== undefined && member.currentTask !== '') {
            const text = truncate(member.currentTask, 14);
            g.font = '8px "Segoe UI", monospace';
            const bw = g.measureText(text).width + 10;
            const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2));
            const by = headY - 22;
            g.fillStyle = COLORS.bubble;
            roundRect(g, bx, by, bw, 14, 4);
            g.fill();
            g.beginPath();
            g.moveTo(cx - 3, by + 14);
            g.lineTo(cx + 1, by + 18);
            g.lineTo(cx + 4, by + 14);
            g.closePath();
            g.fill();
            g.fillStyle = COLORS.label;
            g.fillText(text, bx + 5, by + 10);
        }
        // Unread badge.
        if ((member.unread ?? 0) > 0) {
            g.fillStyle = COLORS.alert;
            g.beginPath();
            g.arc(cx + 15, headY - 2, 6, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = '#fff';
            g.font = 'bold 7px "Segoe UI", monospace';
            g.fillText(String(Math.min(9, member.unread ?? 0)), cx + 12, headY + 1);
        }
    }
    function paint(time) {
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, width, height);
        g.save();
        g.translate(offsetX, offsetY);
        g.scale(scale, scale);
        g.imageSmoothingEnabled = false;
        paintRoom(time);
        const members = model?.members ?? [];
        if (members.length === 0) {
            g.fillStyle = COLORS.label;
            g.font = '12px "Segoe UI", sans-serif';
            const text = model?.labels?.empty ?? 'No members yet';
            g.fillText(text, 24, 150);
        }
        else {
            const columns = Math.min(MAX_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(members.length))), members.length);
            const rows = Math.max(1, Math.ceil(members.length / columns));
            const cellW = WORLD_W / columns;
            const usableTop = 112;
            const usableH = WORLD_H - usableTop - 24;
            const cellH = usableH / rows;
            members.forEach((member, index) => {
                const column = index % columns;
                const row = Math.floor(index / columns);
                const cx = cellW * (column + 0.5);
                const deskY = usableTop + cellH * (row + 0.9);
                paintDesk(cx, Math.min(WORLD_H - 10, deskY), member, time);
            });
        }
        // Phase / halted overlays.
        if (model?.phase === 'staged') {
            g.fillStyle = 'rgba(16, 20, 28, 0.55)';
            g.fillRect(0, 0, WORLD_W, WORLD_H);
            g.fillStyle = '#f6f8ff';
            g.font = 'bold 13px "Segoe UI", sans-serif';
            const text = model.labels?.awaiting ?? 'Waiting for approval';
            const textW = g.measureText(text).width;
            g.fillText(text, (WORLD_W - textW) / 2, 152);
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
        dispose() {
            disposed = true;
            if (raf !== undefined)
                window.cancelAnimationFrame(raf);
            raf = undefined;
        },
    };
}
