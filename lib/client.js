window.__ModuleLoader__.load({
	id: "agent-teams-pixel",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/client/icons.js
		/** Plugin-owned icons avoid depending on the host's generated design-export names. */
		const stroke = {
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.5,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		};
		function IconBranchOutline16() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				...stroke,
				children: [
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "4",
						cy: "3",
						r: "1.5"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "4",
						r: "1.5"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "4",
						cy: "13",
						r: "1.5"
					}),
					(0, react_jsx_runtime.jsx)("path", { d: "M4 4.5v7M4 9h3a5 5 0 0 0 5-3.5" })
				]
			});
		}
		function IconChevronDownOutline14() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 14 14",
				"aria-hidden": "true",
				...stroke,
				children: (0, react_jsx_runtime.jsx)("path", { d: "m3 5 4 4 4-4" })
			});
		}
		function IconPanelLeftOutline16() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				...stroke,
				children: [(0, react_jsx_runtime.jsx)("rect", {
					x: "2",
					y: "2.5",
					width: "12",
					height: "11",
					rx: "2"
				}), (0, react_jsx_runtime.jsx)("path", { d: "M6 2.5v11" })]
			});
		}
		function IconStopFill16() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("rect", {
					x: "4",
					y: "4",
					width: "8",
					height: "8",
					rx: "1",
					fill: "currentColor"
				})
			});
		}
		function IconWarningOutline16() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				...stroke,
				children: [(0, react_jsx_runtime.jsx)("path", { d: "m7 2-5.5 10a1 1 0 0 0 1 1.5h11a1 1 0 0 0 1-1.5L9 2a1.1 1.1 0 0 0-2 0Z" }), (0, react_jsx_runtime.jsx)("path", { d: "M8 6v3m0 2v.1" })]
			});
		}
		//#endregion
		//#region lib/client/pixel-office/PixelOfficeScene.js
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
		const WORLD_W = 520;
		const WORLD_MIN_H = 300;
		const CELL_H = 150;
		const TOP_PAD = 104;
		const MAX_COLUMNS = 4;
		const DESK_W = 92;
		const COLORS = {
			wall: "#3a4152",
			wallShade: "#323848",
			floor: "#dcc9a4",
			floorLine: "#cdb891",
			desk: "#9c7651",
			deskTop: "#c39668",
			monitor: "#242a36",
			screen: "#7fd4ff",
			screenIdle: "#39445a",
			label: "#e8eef8",
			labelBg: "rgba(20, 24, 32, 0.82)",
			bubble: "rgba(24, 30, 42, 0.92)",
			captain: "#f2c14e",
			alert: "#ef6b6b",
			good: "#67d9a5",
			idle: "#8fa0bb"
		};
		const SKIN = [
			"#f3c9a3",
			"#e8b48b",
			"#d79a70",
			"#c68862",
			"#a96f4d"
		];
		const SHIRT = [
			"#5b8def",
			"#8a6ff0",
			"#3fbf9a",
			"#e6a94d",
			"#e06b8d",
			"#63b5d8",
			"#9bbf57",
			"#c77dbf"
		];
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
			if (activity === "working") return COLORS.good;
			if (activity === "unknown") return COLORS.alert;
			return COLORS.idle;
		}
		function createPixelScene(canvas, options = {}) {
			const context = canvas.getContext("2d");
			if (context === null) return {
				render() {},
				resize() {},
				dispose() {},
				hitTest() {}
			};
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
			const zoom = options.zoom ?? 1;
			function fit() {
				const ratio = Math.min(width / WORLD_W, height / worldH);
				scale = Math.max(.2, ratio) * zoom;
				offsetX = (width - WORLD_W * scale) / 2;
				offsetY = (height - worldH * scale) / 2;
			}
			function paintRoom(time) {
				g.fillStyle = COLORS.wall;
				g.fillRect(0, 0, WORLD_W, 96);
				g.fillStyle = COLORS.wallShade;
				g.fillRect(0, 84, WORLD_W, 12);
				g.fillStyle = COLORS.floor;
				g.fillRect(0, 96, WORLD_W, worldH - 96);
				g.strokeStyle = COLORS.floorLine;
				g.lineWidth = 1;
				for (let x = 0; x < WORLD_W; x += 32) {
					g.beginPath();
					g.moveTo(x, 96);
					g.lineTo(x, worldH);
					g.stroke();
				}
				for (let y = 120; y < worldH; y += 32) {
					g.beginPath();
					g.moveTo(0, y);
					g.lineTo(WORLD_W, y);
					g.stroke();
				}
				for (const wx of [
					60,
					250,
					420
				]) {
					g.fillStyle = "#26303f";
					roundRect(g, wx, 18, 62, 44, 5);
					g.fill();
					const glow = .55 + .15 * Math.sin(time / 900 + wx);
					g.fillStyle = `rgba(127, 212, 255, ${glow.toFixed(3)})`;
					roundRect(g, wx + 4, 22, 54, 36, 4);
					g.fill();
					g.fillStyle = COLORS.wall;
					g.fillRect(wx + 30, 22, 3, 36);
					g.fillRect(wx + 4, 38, 54, 3);
				}
				g.fillStyle = "#7a5b3c";
				g.fillRect(14, 216, 22, 26);
				g.fillStyle = "#4f8f54";
				for (const [px, py, pw, ph] of [
					[
						8,
						186,
						30,
						18
					],
					[
						14,
						172,
						18,
						18
					],
					[
						2,
						200,
						16,
						12
					]
				]) g.fillRect(px, py, pw, ph);
				g.fillStyle = "#f4f6fb";
				roundRect(g, WORLD_W - 118, 24, 100, 58, 4);
				g.fill();
				g.fillStyle = "#b9c4d8";
				for (let i = 0; i < 4; i += 1) g.fillRect(WORLD_W - 110, 34 + i * 11, 60 + i % 2 * 20, 3);
			}
			/** Character + desk + monitor. Overlays are painted by paintOverlay. */
			function paintDesk(cx, deskY, member, time) {
				const seed = hash(member.id || member.name);
				const skin = pick(SKIN, seed);
				const shirt = member.isLeader ? COLORS.captain : pick(SHIRT, seed >> 3);
				const working = member.activity === "working";
				const bob = working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
				const deskX = cx - DESK_W / 2;
				const headY = deskY - 92 + bob;
				const bodyY = headY + 16;
				g.fillStyle = shirt;
				g.fillRect(cx - 9, bodyY, 18, 18);
				g.fillStyle = skin;
				g.fillRect(cx - 6, headY, 12, 13);
				g.fillStyle = "#2a2f3a";
				g.fillRect(cx - 6, headY - 2, 12, 4);
				g.fillStyle = "#24303f";
				g.fillRect(cx - 3, headY + 5, 2, 2);
				g.fillRect(cx + 2, headY + 5, 2, 2);
				g.fillStyle = skin;
				if (working) {
					const arm = Math.round(Math.sin(time / 90 + seed) * 2);
					g.fillRect(cx - 13, bodyY + 8 + arm, 5, 4);
					g.fillRect(cx + 8, bodyY + 8 - arm, 5, 4);
				} else {
					g.fillRect(cx - 13, bodyY + 12, 5, 6);
					g.fillRect(cx + 8, bodyY + 12, 5, 6);
				}
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
				if (member.activity === "idle") {
					g.fillStyle = "rgba(232, 238, 248, 0.75)";
					g.font = "8px monospace";
					g.fillText("z", cx + 12, headY - 2 - Math.round(Math.sin(time / 500) * 3));
				}
				g.fillStyle = COLORS.desk;
				roundRect(g, deskX, deskY - 30, DESK_W, 30, 3);
				g.fill();
				g.fillStyle = COLORS.deskTop;
				g.fillRect(deskX, deskY - 34, DESK_W, 6);
				g.fillStyle = COLORS.monitor;
				roundRect(g, cx - 16, deskY - 58, 32, 24, 3);
				g.fill();
				g.fillStyle = working ? COLORS.screen : COLORS.screenIdle;
				g.fillRect(cx - 12, deskY - 55, 24, 16);
				if (working) {
					const shift = Math.floor(time / 240) % 4;
					g.fillStyle = "rgba(20, 26, 36, 0.55)";
					for (let i = 0; i < 4; i += 1) {
						const w = 6 + (i + shift) % 3 * 5;
						g.fillRect(cx - 9, deskY - 52 + i * 3, w, 1);
					}
				}
				g.fillStyle = "#11151c";
				g.fillRect(cx - 2, deskY - 36, 4, 3);
			}
			/** Name plate, state dot, progress bar, task bubble and unread badge. */
			function paintOverlay(cx, deskY, member, time) {
				const seed = hash(member.id || member.name);
				const bob = member.activity === "working" ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
				const headY = deskY - 92 + bob;
				const label = truncate(member.name, 10);
				g.font = "9px \"Segoe UI\", monospace";
				const textW = g.measureText(label).width;
				g.fillStyle = COLORS.labelBg;
				roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3);
				g.fill();
				g.fillStyle = member.isLeader ? COLORS.captain : COLORS.label;
				g.fillText(label, cx - textW / 2, deskY + 13);
				g.fillStyle = stateTone(member.activity);
				g.beginPath();
				g.arc(cx - textW / 2 - 10, deskY + 10, 2.6, 0, Math.PI * 2);
				g.fill();
				if (member.total !== void 0 && member.total > 0) {
					const ratio = Math.min(1, Math.max(0, (member.done ?? 0) / member.total));
					g.fillStyle = "rgba(255,255,255,0.18)";
					g.fillRect(cx - 18, deskY + 20, 36, 3);
					g.fillStyle = COLORS.good;
					g.fillRect(cx - 18, deskY + 20, Math.round(36 * ratio), 3);
				}
				if (member.currentTask !== void 0 && member.currentTask !== "") {
					const text = truncate(member.currentTask, 15);
					g.font = "8px \"Segoe UI\", monospace";
					const bw = g.measureText(text).width + 12;
					const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2));
					const by = Math.max(4, headY - 26);
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
				if ((member.unread ?? 0) > 0) {
					g.fillStyle = COLORS.alert;
					g.beginPath();
					g.arc(cx + 16, headY - 2, 6.5, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#fff";
					g.font = "bold 7px \"Segoe UI\", monospace";
					g.fillText(String(Math.min(9, member.unread ?? 0)), cx + 13, headY + 1);
				}
			}
			function paint(time) {
				const members = model?.members ?? [];
				let columns = 1;
				let worldHeight = WORLD_MIN_H;
				let bestScale = -1;
				const maxColumns = members.length === 0 ? 1 : Math.min(MAX_COLUMNS, members.length);
				for (let candidate = 1; candidate <= maxColumns; candidate++) {
					const candidateRows = Math.max(1, Math.ceil(members.length / candidate));
					const candidateHeight = Math.max(WORLD_MIN_H, TOP_PAD + candidateRows * CELL_H + 8);
					const candidateScale = Math.min(width / WORLD_W, height / candidateHeight);
					if (candidateScale > bestScale + 1e-6) {
						bestScale = candidateScale;
						columns = candidate;
						worldHeight = candidateHeight;
					}
				}
				worldH = worldHeight;
				scale = Math.max(.2, bestScale) * zoom;
				offsetX = (width - WORLD_W * scale) / 2;
				offsetY = (height - worldH * scale) / 2;
				g.setTransform(dpr, 0, 0, dpr, 0, 0);
				g.clearRect(0, 0, width, height);
				g.save();
				g.translate(offsetX, offsetY);
				g.scale(scale, scale);
				g.imageSmoothingEnabled = false;
				paintRoom(time);
				const cellW = WORLD_W / columns;
				const layout = members.map((member, index) => {
					const column = index % columns;
					const row = Math.floor(index / columns);
					return {
						member,
						cx: cellW * (column + .5),
						deskY: TOP_PAD + CELL_H * row + 128
					};
				});
				hitAreas = layout.map((item) => ({
					id: item.member.id,
					x: item.cx - 62,
					y: item.deskY - 78,
					w: 124,
					h: 98
				}));
				if (layout.length === 0) {
					g.fillStyle = COLORS.label;
					g.font = "12px \"Segoe UI\", sans-serif";
					const text = model?.labels?.empty ?? "No members yet";
					g.fillText(text, 24, 150);
				} else {
					for (const item of layout) paintDesk(item.cx, item.deskY, item.member, time);
					for (const item of layout) paintOverlay(item.cx, item.deskY, item.member, time);
				}
				if (model?.phase === "staged") {
					g.fillStyle = "rgba(16, 20, 28, 0.55)";
					g.fillRect(0, 0, WORLD_W, worldH);
					g.fillStyle = "#f6f8ff";
					g.font = "bold 13px \"Segoe UI\", sans-serif";
					const text = model.labels?.awaiting ?? "Waiting for approval";
					const textW = g.measureText(text).width;
					g.fillText(text, (WORLD_W - textW) / 2, worldH / 2);
				}
				if (model?.halted === true) {
					g.fillStyle = COLORS.alert;
					g.fillRect(0, 0, WORLD_W, 18);
					g.fillStyle = "#1a1010";
					g.font = "bold 10px \"Segoe UI\", sans-serif";
					const text = model.labels?.stalled ?? "Team stopped";
					const textW = g.measureText(text).width;
					g.fillText(text, (WORLD_W - textW) / 2, 13);
				}
				g.restore();
			}
			function fallback(error) {
				try {
					g.setTransform(1, 0, 0, 1, 0, 0);
					g.fillStyle = "#1b2029";
					g.fillRect(0, 0, canvas.width, canvas.height);
					g.fillStyle = "#f0a0a0";
					g.font = "12px monospace";
					g.fillText(`office render error: ${String(error)}`, 12, 24);
				} catch {}
			}
			function loop(time) {
				if (disposed) return;
				try {
					paint(time);
				} catch (error) {
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
					dpr = typeof window === "undefined" ? 1 : Math.min(3, Math.max(1, window.devicePixelRatio || 1));
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
						if (wx >= area.x && wx <= area.x + area.w && wy >= area.y && wy <= area.y + area.h) return area.id;
					}
				},
				dispose() {
					disposed = true;
					if (raf !== void 0) window.cancelAnimationFrame(raf);
					raf = void 0;
				}
			};
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\pixel-office\PixelOffice.module.css.mjs
		const css$5 = ".qgBgta_office{box-sizing:border-box;flex-direction:column;gap:4px;height:100%;min-height:0;padding:0;display:flex}.qgBgta_head{flex-wrap:wrap;align-items:center;gap:8px;min-height:18px;display:flex}.qgBgta_title{letter-spacing:.2px;color:var(--dsw-alias-text-primary,#e8eef8);align-items:center;gap:6px;font-size:12px;font-weight:600;display:inline-flex}.qgBgta_count{opacity:.65;font-size:11px;font-weight:400}.qgBgta_meta{color:var(--dsw-alias-text-secondary,#a8b3c7);white-space:nowrap;margin-left:auto;font-size:11px}.qgBgta_meta[data-working]{color:var(--dsw-alias-state-success,#67d9a5)}.qgBgta_viewButton{border:1px solid var(--dsw-alias-border-subtle,#a0b0c847);color:var(--dsw-alias-text-secondary,#a8b3c7);cursor:pointer;background:0 0;border-radius:999px;padding:2px 8px;font-size:11px}.qgBgta_viewButton:hover{color:var(--dsw-alias-text-primary,#e8eef8);border-color:var(--dsw-alias-border-strong,#a0b0c880)}.qgBgta_canvasHost{background:#20252f;border-radius:10px;flex:auto;min-height:140px;position:relative;overflow:hidden}.qgBgta_canvas{display:block;position:absolute;inset:0}.qgBgta_tooltip{z-index:2;border:1px solid var(--dsw-alias-border-strong,#a0b0c880);color:#e8eef8;pointer-events:none;background:#12161ef2;border-radius:8px;flex-direction:column;gap:1px;min-width:90px;max-width:210px;padding:5px 8px;font-size:10px;line-height:1.45;display:flex;position:absolute;transform:translate(-50%,-118%);box-shadow:0 4px 14px #00000059}.qgBgta_tooltip strong{font-size:11px}.qgBgta_tooltip span{opacity:.8;overflow-wrap:anywhere}.qgBgta_tooltip span[data-activity=working]{color:#67d9a5}.qgBgta_tooltip span[data-activity=idle]{color:#9fb0c8}.qgBgta_chips{flex-wrap:wrap;gap:4px;margin:0;padding:0;list-style:none;display:flex}.qgBgta_chip{border:1px solid var(--dsw-alias-border-subtle,#a0b0c83d);max-width:190px;color:var(--dsw-alias-text-secondary,#a8b3c7);cursor:pointer;background:#ffffff0a;border-radius:999px;align-items:center;gap:5px;padding:2px 7px;font-size:11px;display:inline-flex;overflow:hidden}.qgBgta_chip:disabled{cursor:default}.qgBgta_chip:hover:not(:disabled){color:var(--dsw-alias-text-primary,#e8eef8);border-color:var(--dsw-alias-border-strong,#a0b0c880)}.qgBgta_dot{background:#8fa0bb;border-radius:50%;flex:none;width:6px;height:6px}.qgBgta_chip[data-activity=working] .qgBgta_dot{background:#67d9a5;box-shadow:0 0 6px #67d9a5b3}.qgBgta_chip[data-activity=unknown] .qgBgta_dot{background:#ef6b6b}.qgBgta_chipName{white-space:nowrap;text-overflow:ellipsis;font-weight:600;overflow:hidden}.qgBgta_chipTask{opacity:.6;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.qgBgta_chip[data-unread]{color:var(--dsw-alias-text-primary,#e8eef8);border-color:#ef6b6b99}";
		const tagId$5 = "agent-teams-pixel/PixelOffice.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var PixelOffice_module_css_default = {
			"canvas": "qgBgta_canvas",
			"canvasHost": "qgBgta_canvasHost",
			"chip": "qgBgta_chip",
			"chipName": "qgBgta_chipName",
			"chipTask": "qgBgta_chipTask",
			"chips": "qgBgta_chips",
			"count": "qgBgta_count",
			"dot": "qgBgta_dot",
			"head": "qgBgta_head",
			"meta": "qgBgta_meta",
			"office": "qgBgta_office",
			"title": "qgBgta_title",
			"tooltip": "qgBgta_tooltip",
			"viewButton": "qgBgta_viewButton"
		};
		//#endregion
		//#region lib/client/pixel-office/PixelOffice.js
		/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
		function sceneLabel(activity, t) {
			if (activity === "working") return t("office.working");
			if (activity === "unknown") return t("office.unknown");
			return t("office.idle");
		}
		function PixelOffice({ team, t, onOpenMember, onShowBoard, onCollapse }) {
			const canvasRef = (0, react.useRef)(null);
			const hostRef = (0, react.useRef)(null);
			const sceneRef = (0, react.useRef)(null);
			const [hover, setHover] = (0, react.useState)();
			const model = (0, react.useMemo)(() => {
				const live = team.members.filter((member) => member.status !== "removed");
				const members = [{
					id: team.captainSessionId,
					name: t("office.captain"),
					role: "captain",
					activity: team.phase === "running" ? "working" : "idle",
					unread: team.captainInbox.length,
					isLeader: true
				}, ...live.map((member) => ({
					id: member.id,
					name: member.name,
					role: member.role,
					activity: member.activity,
					currentTask: member.currentTask,
					progress: member.progress,
					done: member.done,
					total: member.total,
					model: member.model,
					unread: member.unread
				}))];
				return {
					teamName: team.name,
					phase: team.phase,
					halted: team.halted,
					members,
					labels: {
						captain: t("office.captain"),
						stalled: t("office.stalled"),
						awaiting: t("office.awaiting"),
						empty: t("office.empty")
					}
				};
			}, [team, t]);
			(0, react.useEffect)(() => {
				const canvas = canvasRef.current;
				const host = hostRef.current;
				if (canvas === null || host === null) return;
				const scene = createPixelScene(canvas);
				sceneRef.current = scene;
				const measure = () => {
					const rect = host.getBoundingClientRect();
					scene.resize(rect.width, rect.height);
				};
				measure();
				const observer = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(measure);
				observer?.observe(host);
				if (observer === void 0) window.addEventListener("resize", measure);
				return () => {
					observer?.disconnect();
					window.removeEventListener("resize", measure);
					scene.dispose();
					sceneRef.current = null;
				};
			}, []);
			(0, react.useEffect)(() => {
				sceneRef.current?.render(model);
			}, [model]);
			const total = team.tasks.length;
			const done = team.tasks.filter((task) => task.state === "completed").length;
			const live = team.members.filter((member) => member.status !== "removed");
			const working = live.filter((member) => member.activity === "working").length;
			const sceneMembers = (0, react.useMemo)(() => new Map(model.members.map((member) => [member.id, member])), [model]);
			const hitAt = (event) => {
				const canvas = canvasRef.current;
				if (canvas === null) return void 0;
				const rect = canvas.getBoundingClientRect();
				return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
			};
			const onPointerMove = (event) => {
				const id = hitAt(event);
				const canvas = canvasRef.current;
				if (id === void 0) {
					if (hover !== void 0) setHover(void 0);
					if (canvas !== null) canvas.style.cursor = "default";
					return;
				}
				if (canvas !== null) canvas.style.cursor = "pointer";
				const member = sceneMembers.get(id);
				if (member === void 0) return;
				const rect = event.currentTarget.getBoundingClientRect();
				setHover({
					id,
					name: member.name,
					role: member.role,
					activity: member.activity,
					task: member.currentTask ?? "",
					x: event.clientX - rect.left,
					y: event.clientY - rect.top
				});
			};
			const onPointerLeave = () => {
				setHover(void 0);
				if (canvasRef.current !== null) canvasRef.current.style.cursor = "default";
			};
			const onClick = (event) => {
				const id = hitAt(event);
				if (id !== void 0) onOpenMember?.(id);
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PixelOffice_module_css_default.office,
				"data-pixel-office": true,
				"data-phase": team.phase,
				"data-halted": team.halted === true || void 0,
				"aria-label": t("office.title"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: PixelOffice_module_css_default.head,
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: PixelOffice_module_css_default.title,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "⛩"
									}),
									t("office.title"),
									(0, react_jsx_runtime.jsx)("span", {
										className: PixelOffice_module_css_default.count,
										children: t("office.members", { count: live.length })
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: PixelOffice_module_css_default.meta,
								"data-working": working > 0 || void 0,
								children: team.halted === true ? t("office.stalled") : team.phase === "staged" ? t("office.awaiting") : t("office.progress", {
									done,
									total
								})
							}),
							onShowBoard !== void 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: PixelOffice_module_css_default.viewButton,
								onClick: onShowBoard,
								title: t("office.showBoard"),
								children: t("office.showBoard")
							}),
							onCollapse !== void 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: PixelOffice_module_css_default.viewButton,
								"data-control": "office-collapse",
								onClick: onCollapse,
								title: t("office.collapse"),
								"aria-label": t("office.collapse"),
								children: (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "▾"
								})
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						ref: hostRef,
						className: PixelOffice_module_css_default.canvasHost,
						children: [(0, react_jsx_runtime.jsx)("canvas", {
							ref: canvasRef,
							className: PixelOffice_module_css_default.canvas,
							role: "img",
							"aria-label": t("office.title"),
							title: t("office.hint"),
							onPointerMove,
							onPointerLeave,
							onClick
						}), hover !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: PixelOffice_module_css_default.tooltip,
							style: {
								left: hover.x,
								top: hover.y
							},
							role: "tooltip",
							children: [
								(0, react_jsx_runtime.jsx)("strong", { children: hover.name }),
								(0, react_jsx_runtime.jsx)("span", { children: hover.role }),
								(0, react_jsx_runtime.jsxs)("span", {
									"data-activity": hover.activity,
									children: [sceneLabel(hover.activity, t), hover.task === "" ? "" : ` · ${hover.task}`]
								})
							]
						})]
					}),
					live.length > 0 && (0, react_jsx_runtime.jsx)("ul", {
						className: PixelOffice_module_css_default.chips,
						"aria-label": t("office.members", { count: live.length }),
						children: live.map((member) => (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PixelOffice_module_css_default.chip,
							"data-activity": member.activity,
							"data-unread": member.unread > 0 || void 0,
							disabled: onOpenMember === void 0,
							onClick: () => {
								onOpenMember?.(member.id);
							},
							title: `${member.name} · ${member.role} · ${sceneLabel(member.activity, t)}`,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PixelOffice_module_css_default.dot,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: PixelOffice_module_css_default.chipName,
									children: member.name
								}),
								member.currentTask !== "" && (0, react_jsx_runtime.jsx)("span", {
									className: PixelOffice_module_css_default.chipTask,
									children: member.currentTask
								})
							]
						}) }, member.id))
					})
				]
			});
		}
		//#endregion
		//#region lib/client/session-navigation.js
		/** Version-tolerant navigation into durable AgentTeams member transcripts. */
		/** Newer sessions retain view ownership instead of publishing list.current. */
		function currentSessionId(state) {
			if ("current" in state) return state.current;
			return Object.values(state.byId).find((row) => (row.retainedBy?.mainView ?? 0) > 0)?.id;
		}
		/**
		* Open one member's persisted transcript.
		*
		* Harness rc.8 intentionally removed cold subagents from the ordinary session
		* list. They must first be rediscovered in their parent's catalog, then opened
		* with the exact parent/child/mode address. Older runtimes have only `open()`;
		* the fallback preserves ordinary-session navigation. New layouts also select
		* the Conversation panel and cancel catalog refreshes superseded by navigation.
		*/
		async function openAgentTeamMember(sessions, parentSessionId, childSessionId, layout, workspace) {
			if (sessions.open === void 0 && workspace !== void 0) {
				workspace.openSession({
					parentSessionId,
					childSessionId,
					mode: "continuable"
				});
				return "subagent";
			}
			const navigation = layout?.beginNavigation?.();
			if (sessions.openSubagent === void 0 || sessions.refreshSubagents === void 0) {
				if (sessions.open === void 0) throw new Error("Harness does not expose session navigation");
				sessions.open(childSessionId);
				layout?.selectPanel?.(null);
				return "session";
			}
			await sessions.refreshSubagents(parentSessionId);
			if (navigation?.aborted) return "cancelled";
			const retained = sessions.subagentAddress?.(childSessionId);
			sessions.openSubagent(retained?.parentSessionId === parentSessionId ? retained : {
				parentSessionId,
				childSessionId,
				mode: "continuable"
			});
			layout?.selectPanel?.(null);
			return "subagent";
		}
		/** Compact `provider/model` route, or just the model when the provider is absent. */
		function memberRouteLabel(member) {
			if (member === void 0) return "";
			const provider = member.provider?.trim() ?? "";
			const model = member.model?.trim() ?? "";
			if (provider !== "" && model !== "") return `${provider}/${model}`;
			return model;
		}
		/**
		* Compact route shown on a running task. Prefer the task's own snapshot
		* field; fall back to the assignee member when older hosts omit it.
		*/
		function taskModelLabel(task, members) {
			const direct = task.model?.trim() ?? "";
			if (direct !== "") return direct;
			return memberRouteLabel(members.find((candidate) => candidate.name === task.assignee));
		}
		/** Short model id for tight DAG/chip surfaces (`openai/gpt-5.6-sol` → `gpt-5.6-sol`). */
		function compactModelLabel(route) {
			const trimmed = route.trim();
			if (trimmed === "") return "";
			const slash = trimmed.lastIndexOf("/");
			return slash === -1 ? trimmed : trimmed.slice(slash + 1);
		}
		/**
		* Latest terminal-task `updatedAt` owned by one member.
		* @param memberName - member whose owned tasks are scanned.
		* @param tasks - team tasks carrying durable `updatedAt` stamps.
		* @returns the newest terminal stamp, or undefined when the member owns none.
		*/
		function memberFinishedAt(memberName, tasks) {
			let latest;
			for (const task of tasks) {
				if (task.assignee !== memberName) continue;
				if (task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled") continue;
				const stamp = task.updatedAt;
				if (typeof stamp !== "number" || !Number.isFinite(stamp)) continue;
				if (latest === void 0 || stamp > latest) latest = stamp;
			}
			return latest;
		}
		/** Whether a member still has live work (running activity or an open task). */
		function memberIsRunning(member, tasks) {
			if (member.activity === "working" || member.status === "working") return true;
			return tasks.some((task) => task.assignee === member.name && (task.status === "pending" || task.status === "claimed" || task.status === "in_progress"));
		}
		/**
		* Order the delegation member list for issue #192.
		*
		* Running members keep their incoming relative order and come first; finished
		* members follow sorted by finish time, newest first. Members without a
		* derivable finish time keep their incoming relative order after the stamped
		* ones, so an older host that omits stamps never reorders them randomly.
		* @param members - delegation roster in snapshot order.
		* @param tasks - team tasks carrying durable `updatedAt` stamps.
		* @returns the members in display order.
		*/
		function orderDelegationMembers(members, tasks) {
			const running = [];
			const finishedStamped = [];
			const finishedUnstamped = [];
			members.forEach((member, index) => {
				if (memberIsRunning(member, tasks)) {
					running.push({
						member,
						index
					});
					return;
				}
				const finishedAt = memberFinishedAt(member.name, tasks);
				if (finishedAt === void 0) finishedUnstamped.push({
					member,
					index
				});
				else finishedStamped.push({
					member,
					index,
					finishedAt
				});
			});
			finishedStamped.sort((left, right) => right.finishedAt - left.finishedAt || left.index - right.index);
			return [
				...running,
				...finishedStamped,
				...finishedUnstamped
			].map((entry) => entry.member);
		}
		/** Whether the captain chat should keep showing the in-progress banner. */
		function teamIsActive(team) {
			if (team.halted === true || team.phase === "staged") return false;
			if (team.members.some((member) => member.activity === "working" || member.status === "working")) return true;
			if (team.tasks.some((task) => task.status === "pending" || task.status === "claimed" || task.status === "in_progress")) return true;
			return team.members.length > 0 && team.tasks.length === 0;
		}
		/** Use a fill-width grid when the task graph has no real dependency edges. */
		function usesParallelTaskGrid(tasks) {
			if (tasks.length === 0) return false;
			const taskIds = new Set(tasks.map((task) => task.id));
			return tasks.every((task) => task.dependencies.every((dependency) => !taskIds.has(dependency)));
		}
		/**
		* Whether an expanded activity panel still belongs to the current session.
		*
		* The panel is mounted in the root-scoped shell overlay, so React does not
		* remount it when the conversation route changes. Ownership keeps an expanded
		* panel from leaking onto the new-session screen (or another conversation)
		* while its local open state is being reset.
		*/
		function activityPanelExpandedForSession(open, owner, current) {
			return open && owner !== void 0 && owner === current;
		}
		/**
		* Auto-expand only for live teams that appear after the current session's
		* initial restore pass. Replayed cards, archived teams, and live teams restored
		* while reopening a conversation must remain behind the collapsed badge.
		*/
		function activityPanelShouldAutoExpand({ alreadyAutoOpened, pageSettled, restoreComplete, previousLiveTeamIds, currentLiveTeamIds }) {
			return !alreadyAutoOpened && pageSettled && restoreComplete && currentLiveTeamIds.some((teamId) => !previousLiveTeamIds.has(teamId));
		}
		/**
		* Resolve the task whose dependency chain should be highlighted.
		*
		* A pinned task is an explicit user choice. Keyboard focus takes precedence
		* over delayed pointer intent so an older hover timer cannot steal the active
		* chain from someone navigating the task map with the keyboard.
		*/
		function dependencyFocusTaskId(pinnedTaskId, keyboardTaskId, hoverTaskId) {
			return pinnedTaskId ?? keyboardTaskId ?? hoverTaskId;
		}
		/** Group tasks by their precomputed dependency depth. */
		function taskStages(tasks) {
			const byDepth = /* @__PURE__ */ new Map();
			for (const task of tasks) {
				const depth = Number.isFinite(task.depth) ? Math.max(0, Math.floor(task.depth)) : 0;
				const stage = byDepth.get(depth) ?? [];
				stage.push(task);
				byDepth.set(depth, stage);
			}
			return [...byDepth.entries()].sort(([left], [right]) => left - right).map(([depth, stageTasks]) => ({
				depth,
				tasks: stageTasks.slice().sort((left, right) => left.id.localeCompare(right.id, "en", { numeric: true }))
			}));
		}
		/**
		* Lay tasks out as the reference panel's compact left-to-right DAG.
		*
		* Columns are dependency-depth stages. Rows are stable task-id order within
		* each stage. Edges use cubic curves so fan-in remains readable without
		* turning every task into a large card.
		*/
		function compactDagLayout(tasks, dimensions) {
			const nodeWidth = dimensions?.nodeWidth ?? 92;
			const nodeHeight = dimensions?.nodeHeight ?? 30;
			const columnGap = dimensions?.columnGap ?? 26;
			const rowGap = dimensions?.rowGap ?? 8;
			const stages = taskStages(tasks);
			const positions = /* @__PURE__ */ new Map();
			const nodes = [];
			for (const [column, stage] of stages.entries()) for (const [row, task] of stage.tasks.entries()) {
				const x = column * (nodeWidth + columnGap);
				const y = row * (nodeHeight + rowGap);
				positions.set(task.id, {
					x,
					y
				});
				nodes.push({
					task,
					x,
					y
				});
			}
			const edges = [];
			for (const task of tasks) {
				const target = positions.get(task.id);
				if (target === void 0) continue;
				for (const dependency of task.dependencies) {
					const source = positions.get(dependency);
					if (source === void 0) continue;
					const x1 = source.x + nodeWidth;
					const y1 = source.y + nodeHeight / 2;
					const x2 = target.x;
					const y2 = target.y + nodeHeight / 2;
					edges.push({
						from: dependency,
						to: task.id,
						path: `M${x1} ${y1}C${x1 + 14} ${y1},${x2 - 14} ${y2},${x2} ${y2}`
					});
				}
			}
			const rows = Math.max(1, ...stages.map((stage) => stage.tasks.length));
			return {
				width: stages.length === 0 ? 0 : stages.length * nodeWidth + (stages.length - 1) * columnGap,
				height: stages.length === 0 ? 0 : rows * nodeHeight + (rows - 1) * rowGap,
				nodes,
				edges
			};
		}
		/**
		* Return the complete upstream/downstream chain around one task.
		*
		* Traversal uses both dependency directions and remains cycle-safe, so the UI
		* can highlight every handoff related to the focused task even if malformed
		* durable data contains a cycle.
		*/
		function relatedTaskIds(taskId, tasks) {
			const byId = new Map(tasks.map((task) => [task.id, task]));
			if (!byId.has(taskId)) return /* @__PURE__ */ new Set();
			const dependents = /* @__PURE__ */ new Map();
			for (const task of tasks) for (const dependency of task.dependencies) {
				const targets = dependents.get(dependency) ?? [];
				targets.push(task.id);
				dependents.set(dependency, targets);
			}
			const related = /* @__PURE__ */ new Set();
			const upstreamSeen = /* @__PURE__ */ new Set();
			const downstreamSeen = /* @__PURE__ */ new Set();
			const visitUpstream = (id) => {
				if (upstreamSeen.has(id)) return;
				upstreamSeen.add(id);
				related.add(id);
				for (const dependency of byId.get(id)?.dependencies ?? []) visitUpstream(dependency);
			};
			const visitDownstream = (id) => {
				if (downstreamSeen.has(id)) return;
				downstreamSeen.add(id);
				related.add(id);
				for (const dependent of dependents.get(id) ?? []) visitDownstream(dependent);
			};
			visitUpstream(taskId);
			visitDownstream(taskId);
			return related;
		}
		//#endregion
		//#region lib/client/activity-monitor.js
		/** Shared, demand-driven state for the AgentTeams browser monitor. */
		const targets = /* @__PURE__ */ new Map();
		const targetListeners = /* @__PURE__ */ new Set();
		const snapshotListeners = /* @__PURE__ */ new Set();
		let targetSnapshot = [];
		let activitySnapshots = {
			teams: [],
			archivedTeams: []
		};
		function targetKey(sessionId, teamId) {
			return `${sessionId}\u0000${teamId}`;
		}
		function publishTargets() {
			targetSnapshot = [...targets.values()].filter((target) => target.active).map(({ key, sessionId, teamId }) => ({
				key,
				sessionId,
				teamId
			}));
			for (const listener of targetListeners) listener();
		}
		/** Subscribe to the active monitor-target list (React external-store shape). */
		function subscribeActivityMonitorTargets(listener) {
			targetListeners.add(listener);
			return () => {
				targetListeners.delete(listener);
			};
		}
		/** Read the stable active-target snapshot. */
		function getActivityMonitorTargetsSnapshot() {
			return targetSnapshot;
		}
		/**
		* Register one successful AgentTeams card as a monitoring demand.
		*
		* The returned cleanup is reference-counted so multiple cards and React
		* StrictMode remounts cannot stop another card's monitor.
		*/
		function monitorAgentTeam(sessionId, teamId) {
			const owner = sessionId.trim();
			const id = teamId.trim();
			if (owner === "" || id === "") return () => {};
			const key = targetKey(owner, id);
			const existing = targets.get(key);
			if (existing === void 0) {
				targets.set(key, {
					key,
					sessionId: owner,
					teamId: id,
					refs: 1,
					active: true
				});
				publishTargets();
			} else {
				existing.refs += 1;
				if (!existing.active) {
					existing.active = true;
					publishTargets();
				}
			}
			let released = false;
			return () => {
				if (released) return;
				released = true;
				const current = targets.get(key);
				if (current === void 0) return;
				current.refs -= 1;
				if (current.refs <= 0) {
					targets.delete(key);
					if (current.active) publishTargets();
				}
			};
		}
		/** Stop polling targets whose final archived snapshot has been captured. */
		function settleActivityMonitorTargets(keys) {
			let changed = false;
			for (const key of keys) {
				const target = targets.get(key);
				if (target?.active !== true) continue;
				target.active = false;
				changed = true;
			}
			if (changed) publishTargets();
		}
		/** Subscribe to the shared live/archive snapshot. */
		function subscribeActivitySnapshots(listener) {
			snapshotListeners.add(listener);
			return () => {
				snapshotListeners.delete(listener);
			};
		}
		/** Read the stable shared live/archive snapshot. */
		function getActivitySnapshotsSnapshot() {
			return activitySnapshots;
		}
		/** Publish one or both successful state-route responses. */
		function updateActivitySnapshots(update) {
			const next = {
				teams: update.teams ?? activitySnapshots.teams,
				archivedTeams: update.archivedTeams ?? activitySnapshots.archivedTeams
			};
			if (next.teams === activitySnapshots.teams && next.archivedTeams === activitySnapshots.archivedTeams) return;
			activitySnapshots = next;
			for (const listener of snapshotListeners) listener();
		}
		/** Poll cadence for the live host snapshot route. */
		const ACTIVITY_POLL_MS = 1e3;
		/**
		* Low-frequency probe cadence while a cardless discovery session still owns
		* no team. The probe keeps the panel able to pick up a team created later in
		* that session (e.g. a run_code-wrapped agent_teams_create) without turning
		* every ordinary session into a one-second filesystem scan.
		*/
		const ACTIVITY_PROBE_MS = 5e3;
		/** Host route serving live and archived team snapshots. */
		const ACTIVITY_STATE_URL = "/plugins/dsh-agent-teams/state";
		const ACTIVITY_HALT_URL = "/plugins/dsh-agent-teams/halt";
		/**
		* Start the single polling loop for the current session's requested targets.
		*
		* With neither targets nor a discovery session this is deliberately inert.
		* Explicit card targets poll at the live cadence from the start. A discovery
		* session performs an immediate live+archive restore pass, then — while it
		* still owns no team — probes on a low-frequency cadence, so a team created
		* later in that session (e.g. a run_code-wrapped agent_teams_create) is
		* discovered without a manual reload, without turning every ordinary session
		* into a one-second filesystem scan. The moment a team for the discovery
		* session appears, the controller upgrades to the live one-second cadence for
		* the rest of its lifetime. The caller — the session view, which stops the
		* controller when the session is no longer current — bounds the lifetime, and
		* archive state is refreshed when a target or a previously discovered live
		* team disappears.
		*/
		function startActivityPolling(monitorTargets, runtime = {}) {
			const discoverySessionId = runtime.discoverySessionId?.trim();
			if (monitorTargets.length === 0 && (discoverySessionId === void 0 || discoverySessionId === "")) return {
				firstTick: Promise.resolve(),
				stop: () => {}
			};
			const fetchState = runtime.fetchState ?? ((url, init) => fetch(url, init));
			const schedule = runtime.schedule ?? ((callback, intervalMs) => setInterval(callback, intervalMs));
			const cancel = runtime.cancel ?? ((timer) => {
				clearInterval(timer);
			});
			const publishSnapshots = runtime.publishSnapshots ?? updateActivitySnapshots;
			const settleTargets = runtime.settleTargets ?? settleActivityMonitorTargets;
			let cancelled = false;
			let inFlight = false;
			let hot = monitorTargets.length > 0;
			let discoveryComplete = false;
			let discoveredLiveKeys = /* @__PURE__ */ new Set();
			let controller;
			let timer;
			const intervalMs = () => hot ? ACTIVITY_POLL_MS : ACTIVITY_PROBE_MS;
			const reschedule = () => {
				cancel(timer);
				timer = schedule(() => {
					tick();
				}, intervalMs());
			};
			const tick = async () => {
				if (inFlight || cancelled) return;
				inFlight = true;
				controller = new AbortController();
				try {
					const liveResponse = await fetchState(ACTIVITY_STATE_URL, {
						cache: "no-store",
						signal: controller.signal
					});
					if (!liveResponse.ok) throw new Error("Activity unavailable");
					const body = await liveResponse.json();
					if (cancelled) return;
					if (!Array.isArray(body.teams)) throw new Error("Invalid activity response");
					runtime.onStatus?.("ready");
					const liveTeams = body.teams;
					publishSnapshots({ teams: liveTeams });
					const previousDiscoveredKeys = discoveredLiveKeys;
					discoveredLiveKeys = new Set(discoverySessionId === void 0 || discoverySessionId === "" ? [] : liveTeams.filter((team) => team.captainSessionId === discoverySessionId).map((team) => team.teamId));
					if (!hot && discoveredLiveKeys.size > 0) {
						hot = true;
						reschedule();
					}
					const discoveredTeamArchived = [...previousDiscoveredKeys].some((teamId) => !discoveredLiveKeys.has(teamId));
					const missing = monitorTargets.filter((target) => !liveTeams.some((team) => team.captainSessionId === target.sessionId && team.teamId === target.teamId));
					const needsDiscoveryArchive = discoverySessionId !== void 0 && discoverySessionId !== "" && !discoveryComplete;
					if (missing.length === 0 && !needsDiscoveryArchive && !discoveredTeamArchived) return;
					const archivedResponse = await fetchState(`${ACTIVITY_STATE_URL}?archived=1`, {
						cache: "no-store",
						signal: controller.signal
					});
					if (!archivedResponse.ok) throw new Error("Archive unavailable");
					const archivedBody = await archivedResponse.json();
					if (cancelled) return;
					if (!Array.isArray(archivedBody.teams)) throw new Error("Invalid archive response");
					publishSnapshots({ archivedTeams: archivedBody.teams });
					discoveryComplete = true;
					settleTargets(new Set(missing.map((target) => target.key)));
				} catch (error) {
					if (error?.name === "AbortError") return;
					if (!cancelled) runtime.onStatus?.("error");
				} finally {
					inFlight = false;
				}
			};
			const firstTick = tick();
			if (timer === void 0) timer = schedule(() => {
				tick();
			}, intervalMs());
			return {
				firstTick,
				stop: () => {
					if (cancelled) return;
					cancelled = true;
					controller?.abort();
					cancel(timer);
				}
			};
		}
		//#endregion
		//#region lib/client/artwork.js
		/**
		* Shared whale artwork lookup for the activity panel and the conversation
		* card: role keywords map to the packaged role images; the captain always
		* uses the lead whale.
		* @module dsh-agent-teams/client/artwork
		*/
		/** Artwork route prefix served by the plugin host half. */
		const ART_BASE = "/plugins/dsh-agent-teams/assets/";
		/** V2 whale role artwork per role keyword. */
		const ROLE_ART = [
			[/data|analys|metric|performance|数据|分析|指标|性能/, "member-data-v2.png"],
			[/resear|investig|explor|study|研究|调查|探索|调研/, "member-researcher-v2.png"],
			[/\bqa\b|test|verif|quality|测试|质量|验证/, "member-qa-v2.png"],
			[/engineer|dev\b|server|backend|\bapi\b|runtime|watcher|contract|工程|后端|服务|接口|开发|代码|编程/, "member-engineer-v2.png"],
			[/design|\bui\b|\bux\b|front|theme|accessib|设计|前端|主题|无障碍/, "member-designer-v2.png"],
			[/secur|audit|risk|threat|review|安全|审计|审查|风险/, "member-security-v2.png"],
			[/docs|writer|product|spec|撰写|文案|写作|文档|规范/, "member-docs-v2.png"],
			[/release|\bbuild\b|deploy|\bops\b|\bci\b|ship|coordin|发布|构建|部署|运维|协调/, "member-operator-v2.png"]
		];
		/** Captain artwork (always the lead whale). */
		const LEAD_ART = `${ART_BASE}team-lead-v2.png`;
		/** Status action artwork per member activity. */
		const ACTION_ART = {
			working: `${ART_BASE}action-working-v2.png`,
			idle: `${ART_BASE}action-sleeping-v2.png`,
			unknown: `${ART_BASE}action-thinking-v2.png`
		};
		/**
		* Member artwork URL, or null when no role matches (initial-letter fallback).
		* @param name - the member's display name.
		* @param role - the member's role text.
		* @returns the artwork URL, or null when unmatched.
		*/
		function memberArtUrl(name, role) {
			const identity = `${name} ${role}`.toLowerCase();
			for (const [pattern, art] of ROLE_ART) if (pattern.test(identity)) return `${ART_BASE}${art}`;
			return null;
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\AgentTeamsCard.module.css.mjs
		const css$4 = ".RraEla_root{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:10px;flex-direction:column;gap:8px;width:100%;min-width:0;padding:10px 12px;display:flex}.RraEla_head{align-items:center;gap:8px;min-width:0;display:flex}.RraEla_leadAvatar{object-fit:contain;filter:drop-shadow(0 1px 1px #122d4833);background:0 0;border:0;border-radius:0;flex:none;width:30px;height:30px}.RraEla_teamName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;flex:0 auto;font-size:13px;font-weight:600;line-height:20px;overflow:hidden}.RraEla_memberCount{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;margin-left:auto;font-size:11px;line-height:16px}.RraEla_panelButton{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;flex:none;padding:2px 8px;font-size:10.5px;font-weight:600;line-height:16px;transition:border-color .12s,color .12s}.RraEla_panelButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.RraEla_panelButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.RraEla_members{flex-wrap:wrap;gap:6px;min-width:0;display:flex}.RraEla_member{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);max-width:160px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;align-items:center;gap:5px;padding:3px 8px 3px 3px;font-size:11px;font-weight:500;line-height:16px;transition:border-color .12s,background-color .12s;display:inline-flex}.RraEla_member:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-button-ghost-active-fill)}.RraEla_member:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.RraEla_memberArt{object-fit:contain;filter:drop-shadow(0 1px 1px #122d482e);background:0 0;border:0;border-radius:0;width:24px;height:24px}.RraEla_memberInitial{background:var(--dsw-alias-state-business-primary);width:20px;height:20px;color:var(--dsw-alias-label-primary-inverted);border-radius:50%;justify-content:center;align-items:center;font-size:10px;font-weight:600;line-height:20px;display:inline-flex}.RraEla_memberName{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.RraEla_chatEntry{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border-radius:7px;align-items:center;gap:5px;padding:3px 8px;font-size:12px;display:inline-flex}.RraEla_chatEntry img{object-fit:contain;width:22px;height:22px}.RraEla_chatEntry:hover{background:var(--dsw-alias-bg-module-platform)}.RraEla_chatEntry:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RraEla_turnCards{gap:8px;margin-block:10px;display:grid}@media (width<=600px){.RraEla_head{flex-wrap:wrap}}";
		const tagId$4 = "agent-teams-pixel/AgentTeamsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var AgentTeamsCard_module_css_default = {
			"chatEntry": "RraEla_chatEntry",
			"head": "RraEla_head",
			"leadAvatar": "RraEla_leadAvatar",
			"member": "RraEla_member",
			"memberArt": "RraEla_memberArt",
			"memberCount": "RraEla_memberCount",
			"memberInitial": "RraEla_memberInitial",
			"memberName": "RraEla_memberName",
			"members": "RraEla_members",
			"panelButton": "RraEla_panelButton",
			"root": "RraEla_root",
			"teamName": "RraEla_teamName",
			"turnCards": "RraEla_turnCards"
		};
		//#endregion
		//#region lib/client/AgentTeamsCard.js
		/**
		* AgentTeams conversation card: the lightweight in-conversation summary for
		* one team — the captain's whale avatar and name, the member roster as
		* clickable whale avatars (opening the member's subagent transcript), and
		* an "activity panel" button that re-activates the top-right floater.
		*
		* The floater and this card share the `agent-teams:open-panel` window event
		* so the card can summon the panel even after it was closed (or when an old
		* session is re-opened for review).
		* @module dsh-agent-teams/client/card
		*/
		/** Window event name the floater listens for to open itself. */
		const OPEN_PANEL_EVENT = "agent-teams:open-panel";
		/** Open the matching team view, carrying this team's summary
		* so the panel can show it even when the team no longer exists on disk
		* (historical session review). */
		function openActivityPanel(data) {
			window.dispatchEvent(new CustomEvent(OPEN_PANEL_EVENT, { detail: {
				teamId: data.teamId,
				captainSessionId: data.captainSessionId,
				teamName: data.teamName,
				members: data.members
			} }));
		}
		/** Render one durable team as a compact conversation card. */
		const noWorkspace = () => void 0;
		const noSubscription = () => () => {};
		function AgentTeamsCard({ node, openMember, sessionId, t, workspaceBridge }) {
			const native = (0, react.useSyncExternalStore)(workspaceBridge?.subscribe ?? noSubscription, workspaceBridge?.getSnapshot ?? noWorkspace);
			const location = node.location;
			if (native && (location.kind === "turn" || location.kind === "step") && location.turn.status === "closed") return null;
			return (0, react_jsx_runtime.jsx)(AgentTeamsSummary, {
				data: node.data,
				openMember,
				sessionId,
				t
			});
		}
		function AgentTeamsSummary({ data, openMember, sessionId, t }) {
			const owner = data.captainSessionId || sessionId;
			const { teams, archivedTeams } = (0, react.useSyncExternalStore)(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
			(0, react.useEffect)(() => {
				return monitorAgentTeam(owner, data.teamId);
			}, [data.teamId, owner]);
			const snapshot = teams.find((team) => team.teamId === data.teamId && (owner === "" || team.captainSessionId === owner)) ?? archivedTeams.find((team) => team.teamId === data.teamId && (owner === "" || team.captainSessionId === owner));
			const resolved = (0, react.useMemo)(() => ({
				...data,
				captainSessionId: snapshot?.captainSessionId ?? owner,
				teamName: snapshot?.name ?? data.teamName,
				members: snapshot?.members.map((member) => ({
					id: member.id,
					name: member.name,
					role: member.role
				})) ?? data.members
			}), [
				data,
				owner,
				snapshot
			]);
			return (0, react_jsx_runtime.jsxs)("section", {
				className: AgentTeamsCard_module_css_default.root,
				"data-agent-teams-card": true,
				"data-team-id": resolved.teamId,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: AgentTeamsCard_module_css_default.head,
					children: [
						(0, react_jsx_runtime.jsx)("img", {
							className: AgentTeamsCard_module_css_default.leadAvatar,
							src: LEAD_ART,
							alt: "",
							"aria-hidden": true
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: AgentTeamsCard_module_css_default.teamName,
							title: resolved.teamName,
							children: resolved.teamName
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: AgentTeamsCard_module_css_default.memberCount,
							children: t("card.memberCount", { count: resolved.members.length })
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: AgentTeamsCard_module_css_default.panelButton,
							onClick: () => {
								openActivityPanel(resolved);
							},
							"aria-label": t("workspace.focus"),
							title: t("workspace.focus"),
							children: t("workspace.focus")
						})
					]
				}), resolved.members.length > 0 && (0, react_jsx_runtime.jsx)("div", {
					className: AgentTeamsCard_module_css_default.members,
					children: resolved.members.map((member) => (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: AgentTeamsCard_module_css_default.member,
						onClick: () => {
							if (member.id !== "") openMember(owner, member.id);
						},
						title: member.role === "" ? member.name : `${member.name} · ${member.role}`,
						children: [memberArtUrl(member.name, member.role) !== null ? (0, react_jsx_runtime.jsx)("img", {
							className: AgentTeamsCard_module_css_default.memberArt,
							src: memberArtUrl(member.name, member.role) ?? "",
							alt: "",
							"aria-hidden": true
						}) : (0, react_jsx_runtime.jsx)("span", {
							className: AgentTeamsCard_module_css_default.memberInitial,
							children: member.name.trim().slice(0, 1).toUpperCase() || "?"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: AgentTeamsCard_module_css_default.memberName,
							children: member.name
						})]
					}, member.id || member.name))
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\ActivityPanel.module.css.mjs
		const css$3 = "html{--agent-teams-panel-shift:420px}html[data-agent-teams-panel-open] [data-phase=active]{box-sizing:border-box;padding-right:var(--agent-teams-panel-shift)}.dM3Hkq_badge{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 92%, transparent);backdrop-filter:blur(16px);height:34px;box-shadow:0 8px 28px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 29%, transparent);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;align-items:center;gap:7px;padding:0 12px;font-size:12px;font-weight:600;line-height:20px;transition:border-color .15s,transform .12s;display:inline-flex;position:absolute;top:64px;right:18px}.dM3Hkq_badge:hover{border-color:var(--dsw-alias-border-l3);transform:translateY(-1px)}.dM3Hkq_badge:active{transform:translateY(0)scale(.98)}.dM3Hkq_badge:focus-visible,.dM3Hkq_iconButton:focus-visible,.dM3Hkq_memberRow:focus-visible,.dM3Hkq_membersToggle:focus-visible,.dM3Hkq_sectionToggleTitle:focus-visible,.dM3Hkq_dagNode:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.dM3Hkq_badgeDot,.dM3Hkq_panelDot{background:var(--dsw-alias-label-tertiary);border-radius:50%;width:7px;height:7px}.dM3Hkq_badgeDot[data-busy=true],.dM3Hkq_panelDot[data-busy=true]{background:var(--dsw-alias-state-business-primary);animation:1.25s ease-in-out infinite dM3Hkq_agentTeamsPulse}.dM3Hkq_badgeCount,.dM3Hkq_memberCount,.dM3Hkq_teamStats,.dM3Hkq_stageLabel,.dM3Hkq_taskId{font-variant-numeric:tabular-nums}.dM3Hkq_panel{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-border-l3) 58%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 95%, transparent);backdrop-filter:blur(20px)saturate(1.08);box-shadow:0 12px 32px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 25%, transparent), 0 32px 72px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 33%, transparent);will-change:transform;border-radius:16px;flex-direction:column;animation:.16s ease-out dM3Hkq_agentTeamsPanelIn;display:flex;position:absolute;top:0;left:0;overflow:hidden}.dM3Hkq_panel[data-dragging],.dM3Hkq_panel[data-resizing]{user-select:none;box-shadow:0 16px 38px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 29%, transparent), 0 36px 78px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 38%, transparent)}@keyframes dM3Hkq_agentTeamsPanelIn{0%{opacity:0}to{opacity:1}}@keyframes dM3Hkq_agentTeamsPulse{0%,to{opacity:.42}50%{opacity:1}}.dM3Hkq_panelHead{border-bottom:1px solid var(--dsw-alias-border-l2);cursor:grab;touch-action:none;flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:0 14px 0 16px;display:flex}.dM3Hkq_panelHead:active,.dM3Hkq_panel[data-dragging] .dM3Hkq_panelHead{cursor:grabbing}.dM3Hkq_panel[data-compact] .dM3Hkq_panelHead{cursor:default;touch-action:auto}.dM3Hkq_panelTitle{color:var(--dsw-alias-label-primary);align-items:center;gap:8px;font-size:14px;font-weight:600;line-height:20px;display:inline-flex}.dM3Hkq_panelControls{flex:none;align-items:center;gap:2px;display:inline-flex}.dM3Hkq_iconButton{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:7px;justify-content:center;align-items:center;padding:0;transition:background-color .12s,color .12s,transform .12s;display:inline-flex}.dM3Hkq_iconButton:hover{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_iconButton:active{transform:scale(.94)}.dM3Hkq_iconButton[data-control=dock][data-mode=docked] svg{transform:scaleX(-1)}.dM3Hkq_resizeHandle{z-index:5;touch-action:none;pointer-events:auto;position:absolute}.dM3Hkq_resizeHandle[data-resize-edge=left]{cursor:ew-resize;width:14px;top:44px;bottom:14px;left:0}.dM3Hkq_resizeHandle[data-resize-edge=left]:after{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 42%, transparent);content:\"\";opacity:.45;border-radius:999px;width:3px;height:48px;transition:background-color .12s,opacity .12s;position:absolute;top:50%;left:4px;transform:translateY(-50%)}.dM3Hkq_resizeHandle[data-resize-edge=bottom]{cursor:ns-resize;height:14px;bottom:0;left:20px;right:20px}.dM3Hkq_resizeHandle[data-resize-edge=bottom]:after{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 42%, transparent);content:\"\";opacity:.45;border-radius:999px;width:48px;height:3px;transition:background-color .12s,opacity .12s;position:absolute;bottom:4px;left:50%;transform:translate(-50%)}.dM3Hkq_resizeHandle[data-resize-edge=corner]{cursor:nwse-resize;width:28px;height:28px;bottom:0;right:0}.dM3Hkq_resizeHandle[data-resize-edge=corner]:after{border-right:2px solid var(--dsw-alias-label-tertiary);border-bottom:2px solid var(--dsw-alias-label-tertiary);content:\"\";opacity:.58;width:10px;height:10px;transition:border-color .12s,opacity .12s;position:absolute;bottom:6px;right:6px}.dM3Hkq_resizeHandle:hover:after,.dM3Hkq_panel[data-resizing] .dM3Hkq_resizeHandle:after{background-color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary);opacity:.95}.dM3Hkq_teams{overscroll-behavior:contain;scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent) transparent;scrollbar-width:thin;flex-direction:column;min-height:0;display:flex;overflow-y:auto}.dM3Hkq_teams::-webkit-scrollbar{width:6px}.dM3Hkq_teams::-webkit-scrollbar-track{background:0 0}.dM3Hkq_teams::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent);background-clip:padding-box;border:2px solid #0000;border-radius:999px}.dM3Hkq_teams:hover::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 44%, transparent);background-clip:padding-box}.dM3Hkq_team{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:12px;padding:12px 14px 16px;display:flex;container:dM3Hkq_agent-team/inline-size}.dM3Hkq_team:last-child{border-bottom:0}.dM3Hkq_teamHead{align-items:center;gap:10px;min-width:0;display:flex}.dM3Hkq_teamName{min-width:0;color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:13px;font-weight:600;line-height:18px;overflow:hidden}.dM3Hkq_teamStats{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;gap:8px;font-size:10.5px;line-height:16px;display:inline-flex}.dM3Hkq_teamStopButton{border:1px solid var(--dsw-alias-border-l2);width:26px;height:26px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border-radius:7px;flex:none;place-items:center;padding:0;transition:border-color .15s,background .15s,color .15s;display:grid}.dM3Hkq_teamStopButton:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent);color:var(--dsw-alias-state-error-primary)}.dM3Hkq_teamStopButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.dM3Hkq_stopModalActions{justify-content:flex-end;gap:8px;display:flex}.dM3Hkq_stopModalActions button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;border-radius:8px;justify-content:center;align-items:center;gap:6px;padding:6px 13px;font-size:12px;font-weight:600;display:inline-flex}.dM3Hkq_stopModalActions button[data-danger]{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_stopModalActions button:disabled{cursor:wait;opacity:.58}.dM3Hkq_stopModalError{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);color:var(--dsw-alias-state-error-primary);border-radius:8px;align-items:flex-start;gap:7px;margin:0;padding:9px 10px;font-size:12px;line-height:18px;display:flex}.dM3Hkq_stopModalError svg{flex:none;margin-top:1px}.dM3Hkq_sectionHead{justify-content:space-between;align-items:center;gap:8px;min-width:0;display:flex}.dM3Hkq_sectionTitle{color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;font-size:11px;font-weight:600;line-height:16px;display:inline-flex}.dM3Hkq_sectionHint{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_delegationSection{min-width:0}.dM3Hkq_captainNode{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 32%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 7%, var(--dsw-alias-bg-layer-1));border-radius:10px;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:9px;min-height:56px;padding:6px 10px;display:grid}.dM3Hkq_captainAvatar,.dM3Hkq_memberAvatar{flex:none;justify-content:center;align-items:center;display:inline-flex;position:relative}.dM3Hkq_captainAvatar{width:46px;height:46px}.dM3Hkq_leadAvatar,.dM3Hkq_memberArt{object-fit:contain;filter:drop-shadow(0 1px 1px #122d4833);background:0 0;border:0;border-radius:0}.dM3Hkq_leadAvatar{width:44px;height:44px}.dM3Hkq_memberArt{width:40px;height:40px}.dM3Hkq_captainInfo,.dM3Hkq_memberInfo{flex-direction:column;min-width:0;display:flex}.dM3Hkq_captainInfo{gap:2px}.dM3Hkq_captainLine,.dM3Hkq_memberLine{align-items:center;gap:6px;min-width:0;display:flex}.dM3Hkq_captainName,.dM3Hkq_memberName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:600;line-height:18px;overflow:hidden}.dM3Hkq_captainRole,.dM3Hkq_memberRole{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_captainSummary,.dM3Hkq_memberStatusLine{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;line-height:15px;overflow:hidden}.dM3Hkq_taskDetailModel{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:14px;overflow:hidden}.dM3Hkq_memberModel{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-width:0;max-width:132px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;border-radius:999px;flex:0 auto;align-items:center;padding:0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;font-weight:600;line-height:15px;display:inline-flex;overflow:hidden}.dM3Hkq_captainState,.dM3Hkq_memberState{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;align-items:center;gap:5px;font-size:10px;font-weight:500;line-height:15px;display:inline-flex}.dM3Hkq_captainState[data-busy=true],.dM3Hkq_memberState[data-activity=working]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_workGlyph rect{opacity:.5}.dM3Hkq_workGlyph[data-active=true] rect{animation:1.1s ease-in-out infinite dM3Hkq_agentTeamsDot}@keyframes dM3Hkq_agentTeamsDot{0%,to{opacity:.25}50%{opacity:1}}.dM3Hkq_progressOverview{flex-direction:column;gap:7px;display:flex}.dM3Hkq_progressTitle{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px}.dM3Hkq_progressSegments{gap:3px;display:flex}.dM3Hkq_progressSegments>span,.dM3Hkq_progressEmpty{background:var(--dsw-alias-border-l3);border-radius:2px;flex:1;height:5px}.dM3Hkq_progressEmpty{width:100%;display:block}.dM3Hkq_progressSegments>span[data-state=running]{background:var(--dsw-alias-state-business-primary)}.dM3Hkq_progressSegments>span[data-state=blocked]{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressSegments>span[data-state=completed]{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSegments>span[data-state=failed]{background:var(--dsw-alias-state-error-primary)}.dM3Hkq_progressSegments>span[data-state=cancelled]{opacity:.55}.dM3Hkq_progressLegend{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;gap:10px;font-size:9.5px;line-height:14px;display:flex}.dM3Hkq_progressLegend>span[data-state=running]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_progressLegend>span[data-state=blocked]{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressLegend>span[data-state=completed]{color:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSummary{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 7%, var(--dsw-alias-bg-layer-1));min-width:0;color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:center;gap:6px;padding:5px 8px;font-size:10px;font-weight:600;line-height:15px;display:flex}.dM3Hkq_progressSummary[data-state=warning]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_progressSummary[data-state=completed]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_progressSummary[data-state=discarded]{background:var(--dsw-alias-button-ghost-active-fill)}.dM3Hkq_progressSummary>span:last-child{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-business-primary);border-radius:50%;flex:none;width:5px;height:5px}.dM3Hkq_progressSummary[data-state=warning] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressSummary[data-state=completed] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSummary[data-state=discarded] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-label-tertiary)}.dM3Hkq_membersToggle{background:var(--dsw-alias-bg-module-platform);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border:0;border-radius:8px;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;font-size:10.5px;font-weight:600;line-height:15px;display:flex}.dM3Hkq_membersToggle:hover{background:var(--dsw-alias-button-ghost-active-fill)}.dM3Hkq_membersToggle>span{align-items:center;gap:5px;display:inline-flex}.dM3Hkq_membersToggle>span:last-child{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_chevron{flex:none;transition:transform .14s}.dM3Hkq_chevron[data-open=true]{transform:rotate(90deg)}.dM3Hkq_delegationTree{flex-direction:column;gap:2px;margin-left:18px;padding:9px 0 0 20px;display:flex;position:relative}.dM3Hkq_delegationTree:before{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, var(--dsw-alias-border-l2));content:\"\";width:1px;position:absolute;top:0;bottom:22px;left:0}.dM3Hkq_memberBlock{flex-direction:column;min-width:0;padding:3px 0 7px;display:flex;position:relative}.dM3Hkq_memberBranch{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, var(--dsw-alias-border-l2));width:20px;height:1px;display:block;position:absolute;top:27px;right:100%}.dM3Hkq_memberBranch:before{background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:50%;width:5px;height:5px;position:absolute;top:-2px;right:-1px}.dM3Hkq_memberRow{box-sizing:border-box;width:100%;min-width:0;min-height:48px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:8px;padding:4px 6px;transition:background-color .12s,transform .12s;display:grid}.dM3Hkq_memberRow:hover,.dM3Hkq_memberRow[data-activity=working]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_memberRow:active{transform:scale(.995)}.dM3Hkq_memberAvatar{width:42px;height:42px}.dM3Hkq_memberAvatar[data-unread=true]:after{box-sizing:border-box;border:1px solid var(--dsw-alias-bg-layer-1);background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:50%;width:6px;height:6px;animation:1.8s ease-in-out infinite dM3Hkq_agentTeamsUnreadPulse;position:absolute;top:0;right:-1px}@keyframes dM3Hkq_agentTeamsUnreadPulse{0%,to{opacity:.78;transform:scale(.92)}50%{opacity:1;transform:scale(1.16)}}.dM3Hkq_memberInitial{background:var(--dsw-alias-state-business-primary);width:34px;height:34px;color:var(--dsw-alias-label-primary-inverted);border-radius:50%;justify-content:center;align-items:center;font-size:14px;font-weight:600;line-height:20px;display:inline-flex}.dM3Hkq_stateArt{box-sizing:border-box;object-fit:contain;width:22px;height:22px;filter:drop-shadow(0 0 1px var(--dsw-alias-bg-layer-1)) drop-shadow(0 1px 1px #122d483d);background:0 0;border:0;border-radius:0;position:absolute;bottom:-3px;right:-5px}.dM3Hkq_stateArt[data-activity=working]{animation:2.4s ease-in-out infinite dM3Hkq_agentTeamsFloat}.dM3Hkq_stateArt[data-activity=idle]{animation:4.2s ease-in-out infinite dM3Hkq_agentTeamsBreathe}.dM3Hkq_stateArt[data-activity=unknown]{animation:2.8s ease-in-out infinite dM3Hkq_agentTeamsThink}@keyframes dM3Hkq_agentTeamsFloat{0%,to{transform:translateY(0)rotate(-4deg)}50%{transform:translateY(-2px)rotate(4deg)}}@keyframes dM3Hkq_agentTeamsBreathe{0%,to{opacity:.82;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}@keyframes dM3Hkq_agentTeamsThink{0%,to{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}.dM3Hkq_memberState{margin-left:auto}.dM3Hkq_memberCount{color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:16px}.dM3Hkq_assignmentLine{align-items:center;gap:7px;min-width:0;padding:0 6px 0 60px;display:flex}.dM3Hkq_assignmentLabel{color:var(--dsw-alias-label-tertiary);flex:none;font-size:9.5px;line-height:14px}.dM3Hkq_assignmentTasks{flex-wrap:wrap;flex:1;gap:4px;min-width:0;display:flex}.dM3Hkq_assignmentChip{background:var(--dsw-alias-button-ghost-active-fill);max-width:100%;min-height:16px;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;border-radius:4px;align-items:center;padding:0 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;font-weight:600;line-height:14px;display:inline-flex;overflow:hidden}.dM3Hkq_assignmentChip[data-state=running]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=completed]{background:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=blocked]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=failed]{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=cancelled]{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}.dM3Hkq_unreadPill{color:var(--dsw-alias-state-business-primary);white-space:nowrap;flex:none;font-size:9.5px;font-weight:600;line-height:14px}.dM3Hkq_taskEmpty{color:var(--dsw-alias-label-tertiary);font-size:9.5px;line-height:14px}.dM3Hkq_dependencySection{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:7px;min-width:0;padding-top:10px;display:flex}.dM3Hkq_sectionToggleTitle{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:0;font-size:11px;font-weight:600;line-height:16px;display:inline-flex}.dM3Hkq_dagViewport{scrollbar-width:thin;min-width:0;padding:2px 0 4px;overflow-x:auto}.dM3Hkq_dagCanvas{min-width:100%;position:relative}.dM3Hkq_dagCanvas[data-layout=parallel]{flex-wrap:wrap;gap:8px;display:flex}.dM3Hkq_dagCanvas[data-layout=parallel] .dM3Hkq_dagNode{flex:92px;min-width:92px;position:relative}.dM3Hkq_dagEdges{pointer-events:none;position:absolute;inset:0;overflow:visible}.dM3Hkq_dagEdges path{fill:none;stroke:var(--dsw-alias-border-l3);stroke-width:1px;transition:opacity .14s,stroke .14s,stroke-width .14s}.dM3Hkq_dagEdges path[data-active=true]{stroke:var(--dsw-alias-state-business-primary);stroke-width:1.6px}.dM3Hkq_dagEdges path[data-dimmed=true]{opacity:.24}.dM3Hkq_dagNode{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;border-radius:6px;flex-direction:column;justify-content:center;gap:1px;padding:0 6px;transition:border-color .14s,background-color .14s,opacity .14s;display:flex;position:absolute}.dM3Hkq_dagNode:hover,.dM3Hkq_dagNode[data-focused=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_dagNode[data-dimmed=true]{opacity:.3}.dM3Hkq_dagNode[data-state=running][data-dimmed=true]{opacity:.58}.dM3Hkq_dagNode[data-state=completed]{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 48%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-state=blocked]{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 52%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-state=failed]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 56%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-verdict-stale=true]{border-style:dashed;border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 62%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-verdict-stale=true] .dM3Hkq_dagNodeHead{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNodeHead{color:var(--dsw-alias-label-primary);align-items:center;gap:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;font-weight:700;display:flex}.dM3Hkq_dagNodeDot{background:var(--dsw-alias-border-l3);border-radius:1.5px;flex:none;width:5px;height:5px}.dM3Hkq_dagNode[data-state=running] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-business-primary)}.dM3Hkq_dagNode[data-state=running] .dM3Hkq_dagNodeHead{padding-right:12px}.dM3Hkq_dagRunningState{width:9px;height:9px;color:var(--dsw-alias-state-business-primary);pointer-events:none;justify-content:center;align-items:center;display:inline-flex;position:absolute;top:4px;right:5px}.dM3Hkq_dagRunningState .dM3Hkq_workGlyph{width:9px;height:9px}.dM3Hkq_dagNode[data-state=blocked] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=completed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_dagNode[data-state=failed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-error-primary)}.dM3Hkq_dagNodeLabel{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:11px;overflow:hidden}.dM3Hkq_taskDetail{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:9px;flex-direction:column;gap:3px;min-width:0;padding:7px 9px;display:flex}.dM3Hkq_taskDetailHead{align-items:center;gap:6px;min-width:0;display:flex}.dM3Hkq_taskDetailId{color:var(--dsw-alias-state-business-primary);flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700}.dM3Hkq_taskDetailSubject{min-width:0;color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;line-height:16px;overflow:hidden}.dM3Hkq_taskDetailBadge{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;padding:0 5px;font-size:8.5px;font-weight:600;line-height:14px}.dM3Hkq_taskDetailBadge[data-state=running]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=blocked]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=completed]{background:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=failed]{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailLine,.dM3Hkq_taskDetailMeta{color:var(--dsw-alias-label-secondary);font-size:9.5px;line-height:14px}.dM3Hkq_taskDetailMeta{color:var(--dsw-alias-label-tertiary)}.dM3Hkq_emptyHint{color:var(--dsw-alias-label-tertiary);padding:10px 12px;font-size:11px;line-height:16px}.dM3Hkq_planEditor{border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 30%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 94%, var(--dsw-alias-state-business-primary));box-shadow:inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);border-radius:10px;flex-direction:column;gap:12px;margin:0 10px 12px;padding:12px;display:flex}.dM3Hkq_planHeader>span{justify-content:space-between;align-items:center;gap:8px;display:flex}.dM3Hkq_planHeader>span>span{flex-direction:column;gap:2px;min-width:0;display:flex}.dM3Hkq_planHeader strong{color:var(--dsw-alias-label-primary);font-size:12px}.dM3Hkq_planHeader small{color:var(--dsw-alias-label-secondary);font-size:9px;font-weight:500;line-height:13px}.dM3Hkq_planHeader em{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted);border-radius:999px;flex:none;padding:1px 7px;font-size:9px;font-style:normal;line-height:16px}.dM3Hkq_planHeader p{color:var(--dsw-alias-label-secondary);margin:5px 0 0;font-size:10px;line-height:15px}.dM3Hkq_planFlow{grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none;display:grid}.dM3Hkq_planFlow li{min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;gap:5px;font-size:9px;font-weight:600;line-height:14px;display:flex;position:relative}.dM3Hkq_planFlow li:not(:last-child):after{background:var(--dsw-alias-border-l2);content:\"\";flex:1;min-width:8px;height:1px;margin-right:5px}.dM3Hkq_planFlow li>span{border:1px solid var(--dsw-alias-border-l2);border-radius:50%;flex:none;place-items:center;width:18px;height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;display:grid}.dM3Hkq_planFlow li[data-active]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_planFlow li[data-active]>span{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}.dM3Hkq_planSection{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:8px;overflow:hidden}.dM3Hkq_planSectionToggle,.dM3Hkq_planCardHeader{box-sizing:border-box;width:100%;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:0}.dM3Hkq_planSectionToggle{justify-content:space-between;align-items:center;gap:8px;min-height:42px;padding:7px 9px;display:flex}.dM3Hkq_planSectionToggle:hover,.dM3Hkq_planCardHeader:hover{background:color-mix(in srgb, var(--dsw-alias-button-ghost-active-fill) 46%, transparent)}.dM3Hkq_planSectionToggle>span{align-items:baseline;gap:7px;min-width:0;display:flex}.dM3Hkq_planSectionToggle strong{font-size:10.5px}.dM3Hkq_planSectionToggle small{color:var(--dsw-alias-label-tertiary);font-size:9px}.dM3Hkq_planList{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:0;display:flex}.dM3Hkq_planEmpty{color:var(--dsw-alias-label-tertiary);text-align:center;margin:0;padding:12px;font-size:10px}.dM3Hkq_planCard{background:0 0;border:0;border-radius:0;min-width:0;margin:0;padding:0;display:block;position:relative}.dM3Hkq_planCard+.dM3Hkq_planCard{border-top:1px solid var(--dsw-alias-border-l2)}.dM3Hkq_planCard[data-open=true]{background:color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent)}.dM3Hkq_planCardHeader{grid-template-columns:minmax(80px,.9fr) minmax(72px,1.15fr) auto 12px;align-items:center;gap:7px;min-height:40px;padding:6px 9px;display:grid}.dM3Hkq_planCardIdentity{flex-direction:column;gap:1px;min-width:0;display:flex}.dM3Hkq_planCardIdentity strong,.dM3Hkq_planTaskSummary{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:650;line-height:14px;overflow:hidden}.dM3Hkq_planCardIdentity>span,.dM3Hkq_planCardMeta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:12px;overflow:hidden}.dM3Hkq_planTaskId{background:var(--dsw-alias-button-ghost-active-fill);width:max-content;color:var(--dsw-alias-label-secondary);border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8.5px;font-weight:700;line-height:14px}.dM3Hkq_planDirty{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 13%, transparent);color:var(--dsw-alias-state-warn-primary);border-radius:999px;justify-self:end;padding:1px 5px;font-size:8px;font-style:normal;font-weight:650;line-height:14px}.dM3Hkq_planChevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .18s cubic-bezier(.2,.7,.2,1)}.dM3Hkq_planChevron[data-open=true]{transform:rotate(90deg)}.dM3Hkq_planCardBody{flex-direction:column;gap:8px;padding:0 9px 9px;display:flex}.dM3Hkq_planCardBody fieldset{border:0;flex-direction:column;gap:7px;min-width:0;margin:0;padding:0;display:flex}.dM3Hkq_planCardBody label,.dM3Hkq_planNewTask label{min-width:0;color:var(--dsw-alias-label-tertiary);flex-direction:column;flex:1;gap:4px;font-size:9px;display:flex}.dM3Hkq_planCardBody label small{color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:11px}.dM3Hkq_planCard input,.dM3Hkq_planCard textarea,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:6px;outline:none;font-size:10.5px;line-height:16px;transition:border-color .16s,box-shadow .16s}.dM3Hkq_planCard input,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{min-height:32px;padding:6px 8px}.dM3Hkq_planCard textarea{resize:vertical;min-height:58px;padding:7px 8px}.dM3Hkq_planCard input:focus-visible,.dM3Hkq_planCard textarea:focus-visible,.dM3Hkq_planCard select:focus-visible,.dM3Hkq_planNewTask input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent)}.dM3Hkq_planGrid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;display:grid}.dM3Hkq_planModelPicker{grid-template-columns:minmax(0,1fr);gap:5px;display:grid}.dM3Hkq_planModelMenu{width:100%;display:flex}.dM3Hkq_planModelTrigger{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;border-radius:7px;justify-content:space-between;align-items:center;gap:8px;padding:7px 9px;transition:border-color .16s,background-color .16s,transform .12s;display:flex}.dM3Hkq_planModelTrigger:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.dM3Hkq_planModelTrigger:active:not(:disabled){transform:translateY(1px)}.dM3Hkq_planModelTrigger:focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent);outline-offset:1px}.dM3Hkq_planModelTrigger:disabled{cursor:wait;opacity:.64}.dM3Hkq_planModelTriggerCopy{align-items:baseline;gap:6px;min-width:0;display:flex}.dM3Hkq_planModelTriggerCopy strong,.dM3Hkq_planModelTriggerCopy span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_planModelTriggerCopy strong{color:var(--dsw-alias-label-primary);font-size:10px;font-weight:650;line-height:15px}.dM3Hkq_planModelTriggerCopy span{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:14px}.dM3Hkq_planModelMenuRow{grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;min-width:0;display:grid}.dM3Hkq_planModelMenuRow>span:first-child{color:var(--dsw-alias-label-primary)}.dM3Hkq_planModelMenuRow strong{color:var(--dsw-alias-label-tertiary);text-align:right;text-overflow:ellipsis;white-space:nowrap;font-weight:450;overflow:hidden}.dM3Hkq_planModelMenuBack{align-items:center;gap:7px;display:inline-flex}.dM3Hkq_planModelMenuBack svg{transform:rotate(180deg)}.dM3Hkq_planModelEffortRow{flex-direction:column;align-items:flex-start;min-width:0;display:flex}.dM3Hkq_planModelEffortRow small{width:100%;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_planModelHint{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:12px;overflow:hidden}.dM3Hkq_planModelNotice{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 9%, transparent);color:var(--dsw-alias-label-secondary);border-radius:6px;grid-column:1/-1;justify-content:space-between;align-items:center;gap:8px;padding:6px 7px;font-size:8.5px;line-height:12px;display:flex}.dM3Hkq_planModelNotice button{color:var(--dsw-alias-state-business-primary);cursor:pointer;font:inherit;background:0 0;border:0;flex:none;padding:2px 6px;font-weight:650}.dM3Hkq_planActions,.dM3Hkq_planApproveRow,.dM3Hkq_planNewTask,.dM3Hkq_planConfirm,.dM3Hkq_planApproveActions,.dM3Hkq_planSecondaryActions{align-items:center;gap:7px;display:flex}.dM3Hkq_planReviewActions{grid-template-columns:minmax(0,1fr);gap:6px;width:100%;display:grid}.dM3Hkq_planSecondaryActions{grid-template-columns:minmax(0,1fr) auto;display:grid}.dM3Hkq_planActions{justify-content:flex-end}.dM3Hkq_planActions button,.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow button,.dM3Hkq_planConfirm button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-height:30px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:6px;flex:none;padding:5px 10px;font-size:9.5px;font-weight:600;transition:background .16s,border-color .16s,transform .16s}.dM3Hkq_planActions button:hover:not(:disabled),.dM3Hkq_planNewTask button:hover:not(:disabled),.dM3Hkq_planApproveRow button:hover:not(:disabled),.dM3Hkq_planConfirm button:hover:not(:disabled){border-color:var(--dsw-alias-label-tertiary)}.dM3Hkq_planActions button:active:not(:disabled),.dM3Hkq_planNewTask button:active:not(:disabled),.dM3Hkq_planApproveRow button:active:not(:disabled),.dM3Hkq_planConfirm button:active:not(:disabled){transform:scale(.98)}.dM3Hkq_planActions button[data-danger],.dM3Hkq_planConfirm button[data-danger]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planFeedback{min-width:0;color:var(--dsw-alias-label-secondary);flex:1;align-items:center;gap:5px;font-size:9px;line-height:13px;animation:.18s ease-out dM3Hkq_plan-feedback-in;display:inline-flex}.dM3Hkq_planFeedback[data-tone=success]{color:var(--dsw-alias-state-success-primary)}.dM3Hkq_planFeedback[data-tone=error]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planFeedback>span{border:1px solid;border-radius:50%;flex:none;place-items:center;width:15px;height:15px;display:grid}.dM3Hkq_planFeedback svg{width:11px;height:11px}@keyframes dM3Hkq_plan-feedback-in{0%{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}.dM3Hkq_planConfirm{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent);border-radius:7px;flex-wrap:wrap;justify-content:flex-end;padding:7px}.dM3Hkq_planConfirm>span{min-width:140px;color:var(--dsw-alias-label-secondary);flex:1;font-size:9px;line-height:13px}.dM3Hkq_planNewTask{align-items:flex-end}.dM3Hkq_planNewTask label{gap:4px}.dM3Hkq_planNewTask label>span{line-height:13px}.dM3Hkq_planApproveRow{z-index:1;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 94%, transparent);min-height:50px;box-shadow:0 -5px 16px color-mix(in srgb, var(--dsw-alias-bg-base) 35%, transparent);backdrop-filter:blur(8px);border-radius:8px;flex-direction:column;justify-content:flex-end;align-items:stretch;margin:0 -4px -4px;padding:8px;position:sticky;bottom:0}.dM3Hkq_planApproveRow[data-armed=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--dsw-alias-border-l2))}.dM3Hkq_planApproveRow[data-discard=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2))}.dM3Hkq_planApproveCopy{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.dM3Hkq_planApproveCopy strong{color:var(--dsw-alias-label-primary);font-size:9.5px;line-height:13px}.dM3Hkq_planApproveCopy small{color:var(--dsw-alias-label-tertiary);font-size:8.5px;line-height:12px}.dM3Hkq_planApproveRow button{background:var(--dsw-alias-state-business-primary);min-height:32px;color:var(--dsw-alias-label-primary-inverted);padding-inline:13px}.dM3Hkq_planReviewActions>button[data-plan-approve]{width:100%}.dM3Hkq_planApproveActions>button:first-child{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_planSecondaryActions>button,.dM3Hkq_planApproveActions>button[data-danger]{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_planSecondaryActions>button[data-danger],.dM3Hkq_planApproveActions>button[data-danger]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planSectionToggle:focus-visible,.dM3Hkq_planCardHeader:focus-visible,.dM3Hkq_planActions button:focus-visible,.dM3Hkq_planNewTask button:focus-visible,.dM3Hkq_planApproveRow button:focus-visible,.dM3Hkq_planConfirm button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.dM3Hkq_planActions button:disabled,.dM3Hkq_planNewTask button:disabled,.dM3Hkq_planApproveRow button:disabled{cursor:default;opacity:.55}.dM3Hkq_historicPill{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-tertiary);border-radius:4px;flex:none;margin-left:auto;padding:1px 7px;font-size:9.5px;font-weight:600;line-height:15px}.dM3Hkq_members{flex-direction:column;gap:3px;display:flex}.dM3Hkq_archiveLabel{color:var(--dsw-alias-label-tertiary);padding:5px 14px 0;font-size:9.5px;font-weight:600;line-height:14px;display:block}@media (prefers-reduced-motion:reduce){.dM3Hkq_panel,.dM3Hkq_badge,.dM3Hkq_badgeDot,.dM3Hkq_panelDot,.dM3Hkq_workGlyph rect,.dM3Hkq_stateArt,.dM3Hkq_memberAvatar[data-unread=true]:after,.dM3Hkq_planChevron,.dM3Hkq_planFeedback,.dM3Hkq_planActions button,.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow button,.dM3Hkq_planConfirm button,.dM3Hkq_planCard input,.dM3Hkq_planCard textarea,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{transition:none;animation:none}}@media (width<=960px){html[data-agent-teams-panel-open] [data-phase=active]{padding-right:0}}@media (width<=640px){.dM3Hkq_badge{top:56px;right:10px}.dM3Hkq_teamStats span[data-stat=messages]{display:none}.dM3Hkq_captainNode{grid-template-columns:48px minmax(0,1fr)}.dM3Hkq_captainState{display:none}.dM3Hkq_delegationTree{margin-left:12px;padding-left:15px}.dM3Hkq_memberBranch{width:15px}.dM3Hkq_assignmentLine{padding-left:53px}.dM3Hkq_planFlow li{gap:4px;font-size:8px}.dM3Hkq_planFlow li:not(:last-child):after{margin-right:3px}.dM3Hkq_planCardHeader{grid-template-columns:auto minmax(0,1fr) auto}.dM3Hkq_planCardHeader .dM3Hkq_planCardMeta{display:none}.dM3Hkq_planGrid,.dM3Hkq_planModelPicker{grid-template-columns:minmax(0,1fr)}.dM3Hkq_planNewTask,.dM3Hkq_planApproveRow{flex-direction:column;align-items:stretch}.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow>button,.dM3Hkq_planApproveActions,.dM3Hkq_planReviewActions{width:100%}.dM3Hkq_planApproveActions button,.dM3Hkq_planReviewActions button,.dM3Hkq_planSecondaryActions button{flex:1}}@container dM3Hkq_agent-team (width<=360px){.dM3Hkq_planEditor{margin-inline:0;padding-inline:10px}.dM3Hkq_planHeader>span{align-items:flex-start}.dM3Hkq_planFlow li{gap:3px;font-size:7.5px}.dM3Hkq_planFlow li:not(:last-child):after{min-width:4px;margin-right:2px}.dM3Hkq_planSecondaryActions,.dM3Hkq_planApproveActions{grid-template-columns:minmax(0,1fr);width:100%;display:grid}.dM3Hkq_planSecondaryActions button,.dM3Hkq_planApproveActions button{width:100%}}.dM3Hkq_dagOwner{text-overflow:ellipsis;max-width:64px;margin-left:auto;font-size:9px;font-weight:400;overflow:hidden}.dM3Hkq_team[data-workspace-team]{--workspace-surface:var(--dsw-alias-bg-layer-1);--workspace-line:color-mix(in srgb, var(--dsw-alias-border-l2) 75%, transparent);--workspace-shadow:0 3px 14px color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);background:0 0;border:0;gap:14px;padding:0;container:none}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamHead{flex-wrap:wrap;gap:8px;padding:0 2px 2px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamName{flex-basis:160px;font-size:14px;line-height:1.5}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStats{flex-wrap:wrap;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStopButton{border-radius:9px;width:32px;height:32px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_delegationSection,.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection,.dM3Hkq_completionCard,.dM3Hkq_inboxCard{border:1px solid var(--workspace-line);background:var(--workspace-surface);min-width:0;box-shadow:var(--workspace-shadow);box-sizing:border-box;border-radius:18px;margin:0;padding:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainNode{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 4%, var(--dsw-alias-bg-module-platform));border-color:var(--workspace-line);border-radius:12px;grid-template-columns:44px minmax(0,1fr);gap:8px;padding:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainState{grid-column:2;justify-self:start;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainName{font-size:14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainRole{font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainSummary{white-space:normal;font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressOverview{gap:9px;margin:16px 0}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSegments{gap:4px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSegments>span{border-radius:4px;height:6px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressLegend{gap:8px 12px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSummary{font-size:11px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSummary>span:last-child{white-space:normal}.dM3Hkq_team[data-workspace-team] .dM3Hkq_membersToggle{background:var(--dsw-alias-bg-module-platform);border-radius:9px;padding:10px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberBlock{padding-top:14px;padding-bottom:8px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRow{border-radius:9px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberLine{flex-wrap:wrap;gap:4px 6px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberName{font-size:13px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRole,.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberState,.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberCount{font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRole{background:var(--dsw-alias-bg-module-platform);border-radius:5px;padding:1px 5px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberStatusLine{white-space:normal;font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentLine{flex-wrap:wrap;row-gap:5px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentLabel{font-size:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentChip{border-radius:5px;font-size:10px;line-height:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberBlock[data-selected-member] .dM3Hkq_memberRow{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionHead{flex-wrap:wrap;gap:8px;margin-bottom:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionToggleTitle{font-size:12px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionHint{white-space:normal;font-size:11px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagViewport{padding:4px 2px 14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNode{background:var(--workspace-surface);border-radius:11px;padding:10px 11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNodeHead{margin-bottom:6px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNodeLabel{white-space:normal;-webkit-line-clamp:2;letter-spacing:0;-webkit-box-orient:vertical;font-size:12px;line-height:1.4;display:-webkit-box;overflow:hidden}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagOwner{white-space:nowrap;max-width:105px;font-size:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetail{border-radius:11px;margin-top:14px;padding:14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailSubject{white-space:normal;font-size:13px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailLine,.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailMeta{font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_planEditor{background:var(--workspace-surface);border-color:var(--workspace-line);border-radius:18px;margin:0;padding:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_planApproveRow{position:static}.dM3Hkq_workspaceSummary{grid-template-columns:minmax(0,1fr);gap:14px;min-width:0;display:grid}.dM3Hkq_completionCard h3,.dM3Hkq_inboxCard h3{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;font-weight:600;line-height:1.6}.dM3Hkq_completionBody{flex-wrap:wrap;align-items:center;gap:20px;margin-top:16px;display:flex}.dM3Hkq_completionRing{flex:none;width:132px;height:132px;position:relative}.dM3Hkq_completionRing svg{width:100%;height:100%;transform:rotate(-90deg)}.dM3Hkq_completionRing circle{fill:none;stroke-width:7px}.dM3Hkq_ringTrack{stroke:var(--dsw-alias-border-l2)}.dM3Hkq_ringValue{stroke:var(--dsw-alias-state-business-primary)}.dM3Hkq_completionRing>span{color:var(--dsw-alias-label-secondary);flex-direction:column;justify-content:center;align-items:center;gap:5px;font-size:11px;display:flex;position:absolute;inset:0}.dM3Hkq_completionRing strong{color:var(--dsw-alias-label-primary);letter-spacing:-.7px;font-variant-numeric:tabular-nums;font-size:26px;font-weight:600;line-height:1.2}.dM3Hkq_completionRing small{font-size:18px;font-weight:450}.dM3Hkq_completionTasks{flex:200px;min-width:0;max-height:216px;margin:0;padding:2px;list-style:none;overflow:auto}.dM3Hkq_completionTasks li{border-bottom:1px solid var(--workspace-line);grid-template-columns:18px auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:7px 0;font-size:11px;display:grid}.dM3Hkq_completionTasks li:last-child{border:0}.dM3Hkq_completionDot{background:var(--dsw-alias-bg-module-platform);width:16px;height:16px;color:var(--dsw-alias-label-secondary);border-radius:50%;place-items:center;display:grid}.dM3Hkq_completionTasks li[data-state=completed] .dM3Hkq_completionDot{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_completionTasks li[data-state=failed] .dM3Hkq_completionDot{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_completionTaskId{text-overflow:ellipsis;white-space:nowrap;max-width:6em;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden}.dM3Hkq_completionTaskSubject{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_completionTaskStatus{color:var(--dsw-alias-label-secondary);font-size:10px}.dM3Hkq_completionTasks li[data-verdict-stale] .dM3Hkq_completionDot{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary)}.dM3Hkq_completionTasks li[data-verdict-stale] .dM3Hkq_completionTaskStatus{font-weight:600}.dM3Hkq_completionTasks:focus-visible,.dM3Hkq_inboxMessages:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px;border-radius:4px}.dM3Hkq_inboxCard>header{flex-wrap:wrap;align-items:baseline;gap:6px 12px;display:flex}.dM3Hkq_inboxCard>header>span{color:var(--dsw-alias-label-secondary);font-size:10px}.dM3Hkq_inboxMessages{max-height:260px;margin:14px 0 0;padding:0;list-style:none;overflow:auto}.dM3Hkq_inboxMessages li{align-items:start;gap:9px;margin:0 0 12px;display:flex}.dM3Hkq_inboxMessages img,.dM3Hkq_inboxInitial{object-fit:contain;flex:none;width:30px;height:30px}.dM3Hkq_inboxInitial{background:var(--dsw-alias-bg-module-platform);border-radius:9px;place-items:center;font-size:12px;display:grid}.dM3Hkq_inboxMessages li>div{flex:1;min-width:0}.dM3Hkq_inboxMessages strong{overflow-wrap:anywhere;font-size:11px;font-weight:550}.dM3Hkq_inboxMessages p{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-module-platform));white-space:pre-wrap;overflow-wrap:anywhere;border-radius:0 10px 10px;margin:5px 0 0;padding:9px 11px;font-size:12px;line-height:1.6}.dM3Hkq_summaryEmpty{color:var(--dsw-alias-label-secondary);margin:14px 0 0;font-size:12px;line-height:1.8}@container (width>=800px){.dM3Hkq_team[data-workspace-team]{grid-template-columns:minmax(280px,.8fr) minmax(0,1.4fr);align-items:start;gap:16px;display:grid}.dM3Hkq_team[data-workspace-team]>.dM3Hkq_teamHead,.dM3Hkq_team[data-workspace-team]>[data-staging-editor],.dM3Hkq_workspaceSummary{grid-column:1/-1}.dM3Hkq_workspaceSummary{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection{align-self:stretch}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagCanvas[data-layout=parallel]{grid-template-columns:repeat(2,minmax(0,1fr))}}@container (width<=400px){.dM3Hkq_team[data-workspace-team] .dM3Hkq_delegationSection,.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection,.dM3Hkq_completionCard,.dM3Hkq_inboxCard{border-radius:14px;padding:12px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStats{gap:6px;font-size:10px}.dM3Hkq_completionBody{justify-content:center}}.dM3Hkq_progressSegments>span[data-state=claimed],.dM3Hkq_dagNode[data-state=claimed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressLegend>span[data-state=claimed]{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=claimed]{border-color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=claimed] .dM3Hkq_dagNodeHead{padding-right:38px}.dM3Hkq_dagClaimedState{color:var(--dsw-alias-state-warn-primary);font-size:8px;line-height:10px;position:absolute;top:4px;right:5px}.dM3Hkq_assignmentChip[data-state=claimed],.dM3Hkq_taskDetailBadge[data-state=claimed]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}";
		const tagId$3 = "agent-teams-pixel/ActivityPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var ActivityPanel_module_css_default = {
			"agent-team": "dM3Hkq_agent-team",
			"agentTeamsBreathe": "dM3Hkq_agentTeamsBreathe",
			"agentTeamsDot": "dM3Hkq_agentTeamsDot",
			"agentTeamsFloat": "dM3Hkq_agentTeamsFloat",
			"agentTeamsPanelIn": "dM3Hkq_agentTeamsPanelIn",
			"agentTeamsPulse": "dM3Hkq_agentTeamsPulse",
			"agentTeamsThink": "dM3Hkq_agentTeamsThink",
			"agentTeamsUnreadPulse": "dM3Hkq_agentTeamsUnreadPulse",
			"archiveLabel": "dM3Hkq_archiveLabel",
			"assignmentChip": "dM3Hkq_assignmentChip",
			"assignmentLabel": "dM3Hkq_assignmentLabel",
			"assignmentLine": "dM3Hkq_assignmentLine",
			"assignmentTasks": "dM3Hkq_assignmentTasks",
			"badge": "dM3Hkq_badge",
			"badgeCount": "dM3Hkq_badgeCount",
			"badgeDot": "dM3Hkq_badgeDot",
			"captainAvatar": "dM3Hkq_captainAvatar",
			"captainInfo": "dM3Hkq_captainInfo",
			"captainLine": "dM3Hkq_captainLine",
			"captainName": "dM3Hkq_captainName",
			"captainNode": "dM3Hkq_captainNode",
			"captainRole": "dM3Hkq_captainRole",
			"captainState": "dM3Hkq_captainState",
			"captainSummary": "dM3Hkq_captainSummary",
			"chevron": "dM3Hkq_chevron",
			"completionBody": "dM3Hkq_completionBody",
			"completionCard": "dM3Hkq_completionCard",
			"completionDot": "dM3Hkq_completionDot",
			"completionRing": "dM3Hkq_completionRing",
			"completionTaskId": "dM3Hkq_completionTaskId",
			"completionTaskStatus": "dM3Hkq_completionTaskStatus",
			"completionTaskSubject": "dM3Hkq_completionTaskSubject",
			"completionTasks": "dM3Hkq_completionTasks",
			"dagCanvas": "dM3Hkq_dagCanvas",
			"dagClaimedState": "dM3Hkq_dagClaimedState",
			"dagEdges": "dM3Hkq_dagEdges",
			"dagNode": "dM3Hkq_dagNode",
			"dagNodeDot": "dM3Hkq_dagNodeDot",
			"dagNodeHead": "dM3Hkq_dagNodeHead",
			"dagNodeLabel": "dM3Hkq_dagNodeLabel",
			"dagOwner": "dM3Hkq_dagOwner",
			"dagRunningState": "dM3Hkq_dagRunningState",
			"dagViewport": "dM3Hkq_dagViewport",
			"delegationSection": "dM3Hkq_delegationSection",
			"delegationTree": "dM3Hkq_delegationTree",
			"dependencySection": "dM3Hkq_dependencySection",
			"emptyHint": "dM3Hkq_emptyHint",
			"historicPill": "dM3Hkq_historicPill",
			"iconButton": "dM3Hkq_iconButton",
			"inboxCard": "dM3Hkq_inboxCard",
			"inboxInitial": "dM3Hkq_inboxInitial",
			"inboxMessages": "dM3Hkq_inboxMessages",
			"leadAvatar": "dM3Hkq_leadAvatar",
			"memberArt": "dM3Hkq_memberArt",
			"memberAvatar": "dM3Hkq_memberAvatar",
			"memberBlock": "dM3Hkq_memberBlock",
			"memberBranch": "dM3Hkq_memberBranch",
			"memberCount": "dM3Hkq_memberCount",
			"memberInfo": "dM3Hkq_memberInfo",
			"memberInitial": "dM3Hkq_memberInitial",
			"memberLine": "dM3Hkq_memberLine",
			"memberModel": "dM3Hkq_memberModel",
			"memberName": "dM3Hkq_memberName",
			"memberRole": "dM3Hkq_memberRole",
			"memberRow": "dM3Hkq_memberRow",
			"memberState": "dM3Hkq_memberState",
			"memberStatusLine": "dM3Hkq_memberStatusLine",
			"members": "dM3Hkq_members",
			"membersToggle": "dM3Hkq_membersToggle",
			"panel": "dM3Hkq_panel",
			"panelControls": "dM3Hkq_panelControls",
			"panelDot": "dM3Hkq_panelDot",
			"panelHead": "dM3Hkq_panelHead",
			"panelTitle": "dM3Hkq_panelTitle",
			"plan-feedback-in": "dM3Hkq_plan-feedback-in",
			"planActions": "dM3Hkq_planActions",
			"planApproveActions": "dM3Hkq_planApproveActions",
			"planApproveCopy": "dM3Hkq_planApproveCopy",
			"planApproveRow": "dM3Hkq_planApproveRow",
			"planCard": "dM3Hkq_planCard",
			"planCardBody": "dM3Hkq_planCardBody",
			"planCardHeader": "dM3Hkq_planCardHeader",
			"planCardIdentity": "dM3Hkq_planCardIdentity",
			"planCardMeta": "dM3Hkq_planCardMeta",
			"planChevron": "dM3Hkq_planChevron",
			"planConfirm": "dM3Hkq_planConfirm",
			"planDirty": "dM3Hkq_planDirty",
			"planEditor": "dM3Hkq_planEditor",
			"planEmpty": "dM3Hkq_planEmpty",
			"planFeedback": "dM3Hkq_planFeedback",
			"planFlow": "dM3Hkq_planFlow",
			"planGrid": "dM3Hkq_planGrid",
			"planHeader": "dM3Hkq_planHeader",
			"planList": "dM3Hkq_planList",
			"planModelEffortRow": "dM3Hkq_planModelEffortRow",
			"planModelHint": "dM3Hkq_planModelHint",
			"planModelMenu": "dM3Hkq_planModelMenu",
			"planModelMenuBack": "dM3Hkq_planModelMenuBack",
			"planModelMenuRow": "dM3Hkq_planModelMenuRow",
			"planModelNotice": "dM3Hkq_planModelNotice",
			"planModelPicker": "dM3Hkq_planModelPicker",
			"planModelTrigger": "dM3Hkq_planModelTrigger",
			"planModelTriggerCopy": "dM3Hkq_planModelTriggerCopy",
			"planNewTask": "dM3Hkq_planNewTask",
			"planReviewActions": "dM3Hkq_planReviewActions",
			"planSecondaryActions": "dM3Hkq_planSecondaryActions",
			"planSection": "dM3Hkq_planSection",
			"planSectionToggle": "dM3Hkq_planSectionToggle",
			"planTaskId": "dM3Hkq_planTaskId",
			"planTaskSummary": "dM3Hkq_planTaskSummary",
			"progressEmpty": "dM3Hkq_progressEmpty",
			"progressLegend": "dM3Hkq_progressLegend",
			"progressOverview": "dM3Hkq_progressOverview",
			"progressSegments": "dM3Hkq_progressSegments",
			"progressSummary": "dM3Hkq_progressSummary",
			"progressSummaryDot": "dM3Hkq_progressSummaryDot",
			"progressTitle": "dM3Hkq_progressTitle",
			"resizeHandle": "dM3Hkq_resizeHandle",
			"ringTrack": "dM3Hkq_ringTrack",
			"ringValue": "dM3Hkq_ringValue",
			"sectionHead": "dM3Hkq_sectionHead",
			"sectionHint": "dM3Hkq_sectionHint",
			"sectionTitle": "dM3Hkq_sectionTitle",
			"sectionToggleTitle": "dM3Hkq_sectionToggleTitle",
			"stageLabel": "dM3Hkq_stageLabel",
			"stateArt": "dM3Hkq_stateArt",
			"stopModalActions": "dM3Hkq_stopModalActions",
			"stopModalError": "dM3Hkq_stopModalError",
			"summaryEmpty": "dM3Hkq_summaryEmpty",
			"taskDetail": "dM3Hkq_taskDetail",
			"taskDetailBadge": "dM3Hkq_taskDetailBadge",
			"taskDetailHead": "dM3Hkq_taskDetailHead",
			"taskDetailId": "dM3Hkq_taskDetailId",
			"taskDetailLine": "dM3Hkq_taskDetailLine",
			"taskDetailMeta": "dM3Hkq_taskDetailMeta",
			"taskDetailModel": "dM3Hkq_taskDetailModel",
			"taskDetailSubject": "dM3Hkq_taskDetailSubject",
			"taskEmpty": "dM3Hkq_taskEmpty",
			"taskId": "dM3Hkq_taskId",
			"team": "dM3Hkq_team",
			"teamHead": "dM3Hkq_teamHead",
			"teamName": "dM3Hkq_teamName",
			"teamStats": "dM3Hkq_teamStats",
			"teamStopButton": "dM3Hkq_teamStopButton",
			"teams": "dM3Hkq_teams",
			"unreadPill": "dM3Hkq_unreadPill",
			"workGlyph": "dM3Hkq_workGlyph",
			"workspaceSummary": "dM3Hkq_workspaceSummary"
		};
		//#endregion
		//#region lib/client/StagingPlanEditor.js
		/**
		* Editable pre-run roster and DAG review for staged AgentTeams plans.
		*
		* This leaf owns only transient form/disclosure state. Durable truth remains
		* on the host and returns through the ordinary activity polling snapshot.
		* @module dsh-agent-teams/client/staging-plan
		*/
		const PLAN_URL = "/plugins/dsh-agent-teams/plan";
		function useDismissSuccess(feedback, setFeedback) {
			(0, react.useEffect)(() => {
				if (feedback?.tone !== "success") return;
				const timeout = window.setTimeout(() => {
					setFeedback(void 0);
				}, 3500);
				return () => {
					window.clearTimeout(timeout);
				};
			}, [feedback, setFeedback]);
		}
		async function mutatePlan(payload) {
			const response = await fetch(PLAN_URL, {
				method: "POST",
				cache: "no-store",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload)
			});
			if (response.ok) return;
			let message = `HTTP ${response.status}`;
			try {
				const body = await response.json();
				if (typeof body.error === "string" && body.error.trim() !== "") message = body.error;
			} catch {}
			throw new Error(message);
		}
		function errorMessage(error) {
			return error instanceof Error ? error.message : String(error);
		}
		function DisclosureChevron({ open }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: ActivityPanel_module_css_default.planChevron,
				"data-open": open,
				width: "12",
				height: "12",
				viewBox: "0 0 12 12",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsx)("path", { d: "M4 2.5 7.5 6 4 9.5" })
			});
		}
		function Feedback({ value }) {
			if (value === void 0) return null;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: ActivityPanel_module_css_default.planFeedback,
				"data-tone": value.tone,
				role: value.tone === "error" ? "alert" : "status",
				"aria-live": value.tone === "error" ? "assertive" : "polite",
				children: [(0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: value.tone === "success" ? (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 12 12",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.8",
						children: (0, react_jsx_runtime.jsx)("path", { d: "m2.5 6.2 2.2 2.2 4.8-5" })
					}) : (0, react_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 12 12",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "1.8",
						children: (0, react_jsx_runtime.jsx)("path", { d: "M6 2.3v4.1M6 8.8v.1" })
					})
				}), value.message]
			});
		}
		function routeKey(provider, model) {
			return JSON.stringify([provider, model]);
		}
		const MODEL_MENU_OPEN_MODELS = "open:models";
		const MODEL_MENU_OPEN_EFFORT = "open:effort";
		const MODEL_MENU_BACK = "navigate:back";
		const MODEL_MENU_RETRY = "action:retry";
		const MODEL_MENU_DEFAULT_EFFORT = "effort:default";
		function modelMenuId(provider, model) {
			return `model:${routeKey(provider, model)}`;
		}
		function effortMenuId(effort) {
			return `effort:${effort}`;
		}
		/**
		* Thin staged-plan adapter over the official model directory. It deliberately
		* reads only catalog metadata: choosing a member route must not change the
		* captain session's composer model.
		*/
		function StagedModelPicker({ directory, provider, model, reasoningEffort, busy, onChange, t }) {
			const state = (0, react.useSyncExternalStore)(directory.store.subscribe, directory.store.getSnapshot);
			const [open, setOpen] = (0, react.useState)(false);
			const [pane, setPane] = (0, react.useState)("root");
			const catalogRoutes = state.groups.flatMap((group) => group.models.map((candidate) => ({
				key: routeKey(group.id, candidate.id),
				provider: group.id,
				providerName: group.name,
				model: candidate
			})));
			const selectedKey = routeKey(provider, model);
			const selected = catalogRoutes.find((candidate) => candidate.key === selectedKey);
			const efforts = selected?.model.reasoning?.efforts ?? [];
			const currentMissing = provider !== "" && model !== "" && selected === void 0;
			const defaultEffort = selected?.model.reasoning?.defaultEffort;
			const effectiveEffort = reasoningEffort === "" || reasoningEffort === "default" ? defaultEffort : reasoningEffort;
			const selectedEffort = efforts.find((effort) => effort.id === effectiveEffort);
			const modelLabel = selected?.model.name ?? (model === "" ? t("plan.model.choose") : model);
			const effortLabel = selectedEffort?.name ?? (effectiveEffort === void 0 ? t("plan.model.providerDefault") : effectiveEffort);
			const unavailable = state.status === "error" || state.failures.length > 0;
			const close = () => {
				setOpen(false);
				setPane("root");
			};
			const rootItems = [{
				id: MODEL_MENU_OPEN_MODELS,
				label: (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.planModelMenuRow,
					children: [
						(0, react_jsx_runtime.jsx)("span", { children: t("plan.member.model") }),
						(0, react_jsx_runtime.jsx)("strong", { children: modelLabel }),
						(0, react_jsx_runtime.jsx)(DisclosureChevron, { open: false })
					]
				}),
				disabled: state.status === "loading" && catalogRoutes.length === 0
			}, {
				id: MODEL_MENU_OPEN_EFFORT,
				label: (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.planModelMenuRow,
					children: [
						(0, react_jsx_runtime.jsx)("span", { children: t("plan.member.reasoning") }),
						(0, react_jsx_runtime.jsx)("strong", { children: effortLabel }),
						(0, react_jsx_runtime.jsx)(DisclosureChevron, { open: false })
					]
				}),
				disabled: selected?.model.reasoning === void 0
			}];
			const modelItems = [{
				id: MODEL_MENU_BACK,
				label: (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.planModelMenuBack,
					children: [(0, react_jsx_runtime.jsx)(DisclosureChevron, { open: false }), t("plan.model.back")]
				})
			}, {
				type: "separator",
				id: "models:separator"
			}];
			if (catalogRoutes.length === 0) modelItems.push({
				id: "models:empty",
				label: state.status === "loading" ? t("plan.model.loading") : t("plan.model.empty"),
				disabled: true
			});
			else for (const group of state.groups) {
				modelItems.push({
					type: "label",
					id: `provider:${group.id}`,
					text: group.name
				});
				for (const candidate of group.models) modelItems.push({
					id: modelMenuId(group.id, candidate.id),
					label: candidate.name
				});
			}
			const effortItems = [
				{
					id: MODEL_MENU_BACK,
					label: (0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.planModelMenuBack,
						children: [(0, react_jsx_runtime.jsx)(DisclosureChevron, { open: false }), t("plan.model.back")]
					})
				},
				{
					type: "separator",
					id: "effort:separator"
				},
				{
					id: MODEL_MENU_DEFAULT_EFFORT,
					label: defaultEffort === void 0 ? t("plan.model.providerDefault") : t("plan.model.modelDefault", { effort: efforts.find((effort) => effort.id === defaultEffort)?.name ?? defaultEffort })
				},
				...efforts.map((effort) => ({
					id: effortMenuId(effort.id),
					label: (0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.planModelEffortRow,
						children: [(0, react_jsx_runtime.jsx)("span", { children: effort.name }), effort.description !== void 0 && (0, react_jsx_runtime.jsx)("small", { children: effort.description })]
					})
				}))
			];
			const items = pane === "models" ? modelItems : pane === "effort" ? effortItems : rootItems;
			const selectedId = pane === "models" ? modelMenuId(provider, model) : pane === "effort" ? reasoningEffort === "" || reasoningEffort === "default" ? MODEL_MENU_DEFAULT_EFFORT : effortMenuId(reasoningEffort) : void 0;
			const choose = (id) => {
				if (id === MODEL_MENU_OPEN_MODELS) {
					setPane("models");
					return;
				}
				if (id === MODEL_MENU_OPEN_EFFORT) {
					setPane("effort");
					return;
				}
				if (id === MODEL_MENU_BACK) {
					setPane("root");
					return;
				}
				if (id === MODEL_MENU_RETRY) {
					directory.load().catch(() => void 0);
					return;
				}
				const nextModel = catalogRoutes.find((candidate) => modelMenuId(candidate.provider, candidate.model.id) === id);
				if (nextModel !== void 0) {
					close();
					if (nextModel.provider === provider && nextModel.model.id === model) return;
					onChange({
						provider: nextModel.provider,
						model: nextModel.model.id,
						reasoningEffort: "default"
					});
					return;
				}
				if (id === MODEL_MENU_DEFAULT_EFFORT) {
					close();
					if (effectiveEffort === defaultEffort) return;
					onChange({
						provider,
						model,
						reasoningEffort: "default"
					});
					return;
				}
				const nextEffort = efforts.find((effort) => effortMenuId(effort.id) === id);
				if (nextEffort === void 0) return;
				close();
				if (nextEffort.id === reasoningEffort) return;
				onChange({
					provider,
					model,
					reasoningEffort: nextEffort.id
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.planModelPicker,
				"data-model-directory-status": state.status,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
						open,
						portal: true,
						align: "end",
						compact: true,
						className: ActivityPanel_module_css_default.planModelMenu,
						items,
						footer: unavailable ? [{
							id: MODEL_MENU_RETRY,
							label: t("plan.model.retry")
						}] : void 0,
						selectedId,
						onSelect: choose,
						onClose: close,
						anchor: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.planModelTrigger,
							"data-plan-model-trigger": true,
							"aria-label": t("plan.model.triggerAria", {
								model: modelLabel,
								effort: effortLabel
							}),
							"aria-haspopup": "menu",
							"aria-expanded": open,
							disabled: busy,
							onClick: () => {
								if (open) close();
								else {
									setPane("root");
									setOpen(true);
									directory.load().catch(() => void 0);
								}
							},
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.planModelTriggerCopy,
								children: [(0, react_jsx_runtime.jsx)("strong", { children: state.status === "loading" && catalogRoutes.length === 0 ? t("plan.model.loading") : modelLabel }), (0, react_jsx_runtime.jsx)("span", { children: effortLabel })]
							}), (0, react_jsx_runtime.jsx)(DisclosureChevron, { open })]
						})
					}),
					(0, react_jsx_runtime.jsx)("small", {
						className: ActivityPanel_module_css_default.planModelHint,
						children: currentMissing ? t("plan.model.currentUnavailable", {
							provider,
							model
						}) : selected?.model.description ?? t("plan.model.route", {
							provider,
							model
						})
					}),
					unavailable && (0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.planModelNotice,
						role: state.status === "error" ? "alert" : "status",
						children: [(0, react_jsx_runtime.jsx)("span", { children: state.error ?? t("plan.model.partialFailure", { count: state.failures.length }) }), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || state.status === "loading",
							onClick: () => {
								directory.load().catch(() => void 0);
							},
							children: t("plan.model.retry")
						})]
					})
				]
			});
		}
		function StagedMemberEditor({ team, member, modelDirectory, onPendingChange, t }) {
			const bodyId = (0, react.useId)();
			const [open, setOpen] = (0, react.useState)(false);
			const [role, setRole] = (0, react.useState)(member.role);
			const [provider, setProvider] = (0, react.useState)(member.provider ?? "");
			const [model, setModel] = (0, react.useState)(member.model ?? "");
			const [reasoningEffort, setReasoningEffort] = (0, react.useState)(member.reasoningEffort ?? "");
			const [executionPrompt, setExecutionPrompt] = (0, react.useState)(member.executionPrompt ?? "");
			const remoteSignature = JSON.stringify([
				member.role,
				member.provider ?? "",
				member.model ?? "",
				member.reasoningEffort ?? "",
				member.executionPrompt ?? ""
			]);
			const [savedSignature, setSavedSignature] = (0, react.useState)(remoteSignature);
			const [busy, setBusy] = (0, react.useState)(false);
			const [feedback, setFeedback] = (0, react.useState)();
			useDismissSuccess(feedback, setFeedback);
			const dirty = JSON.stringify([
				role,
				provider,
				model,
				reasoningEffort,
				executionPrompt
			]) !== savedSignature;
			(0, react.useEffect)(() => {
				onPendingChange(`member:${member.name}`, dirty || busy);
				return () => {
					onPendingChange(`member:${member.name}`, false);
				};
			}, [
				busy,
				dirty,
				member.name,
				onPendingChange
			]);
			(0, react.useEffect)(() => {
				setRole(member.role);
				setProvider(member.provider ?? "");
				setModel(member.model ?? "");
				setReasoningEffort(member.reasoningEffort ?? "");
				setExecutionPrompt(member.executionPrompt ?? "");
				setSavedSignature(remoteSignature);
			}, [
				member.role,
				member.provider,
				member.model,
				member.reasoningEffort,
				member.executionPrompt,
				remoteSignature
			]);
			const markEdited = () => {
				setFeedback(void 0);
			};
			const persist = async (selection = {
				provider,
				model,
				reasoningEffort
			}) => {
				const nextSignature = JSON.stringify([
					role,
					selection.provider,
					selection.model,
					selection.reasoningEffort,
					executionPrompt
				]);
				setProvider(selection.provider);
				setModel(selection.model);
				setReasoningEffort(selection.reasoningEffort);
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "update_member",
						memberName: member.name,
						role,
						provider: selection.provider,
						model: selection.model,
						reasoningEffort: selection.reasoningEffort,
						executionPrompt
					});
					setSavedSignature(nextSignature);
					setFeedback({
						tone: "success",
						message: t("plan.saved")
					});
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
				} finally {
					setBusy(false);
				}
			};
			const save = async (event) => {
				event.preventDefault();
				await persist();
			};
			const route = `${provider}/${model}`.replace(/^\//u, "");
			return (0, react_jsx_runtime.jsxs)("article", {
				className: ActivityPanel_module_css_default.planCard,
				"data-plan-member": member.name,
				"data-open": open,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ActivityPanel_module_css_default.planCardHeader,
					"aria-expanded": open,
					"aria-controls": bodyId,
					onClick: () => {
						setOpen((current) => !current);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.planCardIdentity,
							children: [(0, react_jsx_runtime.jsx)("strong", { children: member.name }), (0, react_jsx_runtime.jsx)("span", { children: role || t("plan.member.roleFallback") })]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.planCardMeta,
							title: route,
							children: route
						}),
						dirty && (0, react_jsx_runtime.jsx)("em", {
							className: ActivityPanel_module_css_default.planDirty,
							children: t("plan.unsaved")
						}),
						(0, react_jsx_runtime.jsx)(DisclosureChevron, { open })
					]
				}), open && (0, react_jsx_runtime.jsxs)("form", {
					id: bodyId,
					className: ActivityPanel_module_css_default.planCardBody,
					onSubmit: (event) => {
						save(event);
					},
					children: [(0, react_jsx_runtime.jsxs)("fieldset", {
						disabled: busy,
						children: [
							(0, react_jsx_runtime.jsxs)("label", { children: [t("plan.member.role"), (0, react_jsx_runtime.jsx)("input", {
								name: "role",
								value: role,
								onChange: (event) => {
									setRole(event.currentTarget.value);
									markEdited();
								}
							})] }),
							(0, react_jsx_runtime.jsx)(StagedModelPicker, {
								directory: modelDirectory,
								provider,
								model,
								reasoningEffort,
								busy,
								onChange: (selection) => {
									persist(selection);
								},
								t
							}),
							(0, react_jsx_runtime.jsxs)("label", { children: [t("plan.member.prompt"), (0, react_jsx_runtime.jsx)("textarea", {
								name: "executionPrompt",
								value: executionPrompt,
								onChange: (event) => {
									setExecutionPrompt(event.currentTarget.value);
									markEdited();
								},
								rows: 3
							})] })
						]
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.planActions,
						children: [(0, react_jsx_runtime.jsx)(Feedback, { value: feedback }), (0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || !dirty || provider.trim() === "" || model.trim() === "",
							children: busy ? t("plan.saving") : t("plan.save")
						})]
					})]
				})]
			});
		}
		function StagedTaskEditor({ team, task, onPendingChange, t }) {
			const bodyId = (0, react.useId)();
			const taskDependencies = task.dependencies.join(", ");
			const [open, setOpen] = (0, react.useState)(false);
			const [subject, setSubject] = (0, react.useState)(task.subject);
			const [description, setDescription] = (0, react.useState)(task.description ?? "");
			const [assignee, setAssignee] = (0, react.useState)(task.assignee);
			const [dependencies, setDependencies] = (0, react.useState)(taskDependencies);
			const remoteSignature = JSON.stringify([
				task.subject,
				task.description ?? "",
				task.assignee,
				taskDependencies
			]);
			const [savedSignature, setSavedSignature] = (0, react.useState)(remoteSignature);
			const [busy, setBusy] = (0, react.useState)(false);
			const [confirmingRemove, setConfirmingRemove] = (0, react.useState)(false);
			const [feedback, setFeedback] = (0, react.useState)();
			useDismissSuccess(feedback, setFeedback);
			const signature = JSON.stringify([
				subject,
				description,
				assignee,
				dependencies
			]);
			const dirty = signature !== savedSignature;
			(0, react.useEffect)(() => {
				onPendingChange(`task:${task.id}`, dirty || busy);
				return () => {
					onPendingChange(`task:${task.id}`, false);
				};
			}, [
				busy,
				dirty,
				onPendingChange,
				task.id
			]);
			(0, react.useEffect)(() => {
				setSubject(task.subject);
				setDescription(task.description ?? "");
				setAssignee(task.assignee);
				setDependencies(taskDependencies);
				setSavedSignature(remoteSignature);
			}, [
				task.subject,
				task.description,
				task.assignee,
				taskDependencies,
				remoteSignature
			]);
			const markEdited = () => {
				setFeedback(void 0);
				setConfirmingRemove(false);
			};
			const save = async (event) => {
				event.preventDefault();
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "update_task",
						taskId: task.id,
						subject,
						description,
						assignee,
						dependencies: dependencies.split(",").map((item) => item.trim()).filter(Boolean)
					});
					setSavedSignature(signature);
					setFeedback({
						tone: "success",
						message: t("plan.saved")
					});
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
				} finally {
					setBusy(false);
				}
			};
			const remove = async () => {
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "remove_task",
						taskId: task.id
					});
					setFeedback({
						tone: "success",
						message: t("plan.removed")
					});
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
					setBusy(false);
				}
			};
			const dependencySummary = task.dependencies.length === 0 ? t("plan.dependencies.none") : t("plan.dependencies.count", { count: task.dependencies.length });
			return (0, react_jsx_runtime.jsxs)("article", {
				className: ActivityPanel_module_css_default.planCard,
				"data-plan-task": task.id,
				"data-open": open,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ActivityPanel_module_css_default.planCardHeader,
					"aria-expanded": open,
					"aria-controls": bodyId,
					onClick: () => {
						setOpen((current) => !current);
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.planTaskId,
							children: task.id
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.planTaskSummary,
							title: subject,
							children: subject
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.planCardMeta,
							children: [
								assignee || t("plan.task.unassigned"),
								" · ",
								dependencySummary
							]
						}),
						dirty && (0, react_jsx_runtime.jsx)("em", {
							className: ActivityPanel_module_css_default.planDirty,
							children: t("plan.unsaved")
						}),
						(0, react_jsx_runtime.jsx)(DisclosureChevron, { open })
					]
				}), open && (0, react_jsx_runtime.jsxs)("form", {
					id: bodyId,
					className: ActivityPanel_module_css_default.planCardBody,
					onSubmit: (event) => {
						save(event);
					},
					children: [
						(0, react_jsx_runtime.jsxs)("fieldset", {
							disabled: busy,
							children: [
								(0, react_jsx_runtime.jsxs)("label", { children: [t("plan.task.subject"), (0, react_jsx_runtime.jsx)("input", {
									name: "subject",
									required: true,
									value: subject,
									onChange: (event) => {
										setSubject(event.currentTarget.value);
										markEdited();
									}
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("plan.task.description"), (0, react_jsx_runtime.jsx)("textarea", {
									name: "description",
									value: description,
									onChange: (event) => {
										setDescription(event.currentTarget.value);
										markEdited();
									},
									rows: 3
								})] }),
								(0, react_jsx_runtime.jsxs)("span", {
									className: ActivityPanel_module_css_default.planGrid,
									children: [(0, react_jsx_runtime.jsxs)("label", { children: [t("plan.task.assignee"), (0, react_jsx_runtime.jsxs)("select", {
										name: "assignee",
										value: assignee,
										onChange: (event) => {
											setAssignee(event.currentTarget.value);
											markEdited();
										},
										children: [(0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: t("plan.task.unassigned")
										}), team.members.map((member) => (0, react_jsx_runtime.jsx)("option", {
											value: member.name,
											children: member.name
										}, member.name))]
									})] }), (0, react_jsx_runtime.jsxs)("label", { children: [
										t("plan.task.dependencies"),
										(0, react_jsx_runtime.jsx)("input", {
											name: "dependencies",
											value: dependencies,
											onChange: (event) => {
												setDependencies(event.currentTarget.value);
												markEdited();
											}
										}),
										(0, react_jsx_runtime.jsx)("small", { children: t("plan.task.dependenciesHint") })
									] })]
								})
							]
						}),
						confirmingRemove && (0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.planConfirm,
							role: "alert",
							children: [
								(0, react_jsx_runtime.jsx)("span", { children: t("plan.removeWarning", { task: task.id }) }),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setConfirmingRemove(false);
									},
									children: t("plan.cancel")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-danger": true,
									"data-confirming": true,
									onClick: () => {
										remove();
									},
									children: t("plan.removeConfirm")
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.planActions,
							children: [
								(0, react_jsx_runtime.jsx)(Feedback, { value: feedback }),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-danger": true,
									onClick: () => {
										setConfirmingRemove(true);
										setFeedback(void 0);
									},
									disabled: busy || confirmingRemove,
									children: t("plan.remove")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: busy || !dirty || subject.trim() === "",
									children: busy ? t("plan.saving") : t("plan.save")
								})
							]
						})
					]
				})]
			});
		}
		function StagingPlanEditor({ team, modelDirectory, onContinuePlanning, onDiscarded, t }) {
			const membersId = (0, react.useId)();
			const tasksId = (0, react.useId)();
			const [membersOpen, setMembersOpen] = (0, react.useState)(false);
			const [tasksOpen, setTasksOpen] = (0, react.useState)(false);
			const [newTask, setNewTask] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [discardArmed, setDiscardArmed] = (0, react.useState)(false);
			const [pendingEditors, setPendingEditors] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [feedback, setFeedback] = (0, react.useState)();
			useDismissSuccess(feedback, setFeedback);
			const dependencyLinks = team.tasks.reduce((total, task) => total + task.dependencies.length, 0);
			const runnable = team.members.length > 0 && team.tasks.length > 0;
			const hasPendingEdits = pendingEditors.size > 0 || newTask.trim() !== "";
			const waitingForFeedback = team.planReviewState === "awaiting_feedback";
			(0, react.useEffect)(() => {
				modelDirectory.load().catch(() => void 0);
			}, [modelDirectory]);
			const onPendingChange = (0, react.useCallback)((key, pending) => {
				setPendingEditors((current) => {
					if (pending === current.has(key)) return current;
					const next = new Set(current);
					if (pending) next.add(key);
					else next.delete(key);
					return next;
				});
			}, []);
			const addTask = async (event) => {
				event.preventDefault();
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "add_task",
						subject: newTask,
						dependencies: []
					});
					setNewTask("");
					setFeedback({
						tone: "success",
						message: t("plan.taskAdded")
					});
					setTasksOpen(true);
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
				} finally {
					setBusy(false);
				}
			};
			const approve = async () => {
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "approve"
					});
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
					setBusy(false);
				}
			};
			const continueInChat = async () => {
				if (waitingForFeedback) {
					onContinuePlanning();
					return;
				}
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "continue"
					});
					onContinuePlanning();
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
					setBusy(false);
				}
			};
			const discard = async () => {
				setBusy(true);
				setFeedback(void 0);
				try {
					await mutatePlan({
						sessionId: team.captainSessionId,
						teamId: team.teamId,
						action: "discard"
					});
					onDiscarded();
				} catch (error) {
					setFeedback({
						tone: "error",
						message: t("plan.failed", { message: errorMessage(error) })
					});
					setBusy(false);
					setDiscardArmed(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.planEditor,
				"data-staging-editor": true,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: ActivityPanel_module_css_default.planHeader,
						children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("plan.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("plan.readySummary", {
							members: team.members.length,
							tasks: team.tasks.length,
							links: dependencyLinks
						}) })] }), (0, react_jsx_runtime.jsx)("em", { children: t("plan.badge") })] }), (0, react_jsx_runtime.jsx)("p", { children: t("plan.description") })]
					}),
					(0, react_jsx_runtime.jsxs)("ol", {
						className: ActivityPanel_module_css_default.planFlow,
						"aria-label": t("plan.flow.aria"),
						children: [
							(0, react_jsx_runtime.jsxs)("li", {
								"data-active": true,
								children: [(0, react_jsx_runtime.jsx)("span", { children: "1" }), t("plan.flow.review")]
							}),
							(0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("span", { children: "2" }), t("plan.flow.spawn")] }),
							(0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("span", { children: "3" }), t("plan.flow.run")] })
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ActivityPanel_module_css_default.planSection,
						children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.planSectionToggle,
							"aria-expanded": membersOpen,
							"aria-controls": membersId,
							onClick: () => {
								setMembersOpen((current) => !current);
							},
							children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("plan.members.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("plan.members.count", { count: team.members.length }) })] }), (0, react_jsx_runtime.jsx)(DisclosureChevron, { open: membersOpen })]
						}), membersOpen && (0, react_jsx_runtime.jsx)("div", {
							id: membersId,
							className: ActivityPanel_module_css_default.planList,
							children: team.members.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: ActivityPanel_module_css_default.planEmpty,
								children: t("plan.members.empty")
							}) : team.members.map((member) => (0, react_jsx_runtime.jsx)(StagedMemberEditor, {
								team,
								member,
								modelDirectory,
								onPendingChange,
								t
							}, member.name))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ActivityPanel_module_css_default.planSection,
						children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.planSectionToggle,
							"aria-expanded": tasksOpen,
							"aria-controls": tasksId,
							onClick: () => {
								setTasksOpen((current) => !current);
							},
							children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: t("plan.tasks.title") }), (0, react_jsx_runtime.jsx)("small", { children: t("plan.tasks.count", {
								count: team.tasks.length,
								links: dependencyLinks
							}) })] }), (0, react_jsx_runtime.jsx)(DisclosureChevron, { open: tasksOpen })]
						}), tasksOpen && (0, react_jsx_runtime.jsx)("div", {
							id: tasksId,
							className: ActivityPanel_module_css_default.planList,
							children: team.tasks.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: ActivityPanel_module_css_default.planEmpty,
								children: t("plan.tasks.empty")
							}) : team.tasks.map((task) => (0, react_jsx_runtime.jsx)(StagedTaskEditor, {
								team,
								task,
								onPendingChange,
								t
							}, task.id))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("form", {
						className: ActivityPanel_module_css_default.planNewTask,
						onSubmit: (event) => {
							addTask(event);
						},
						children: [(0, react_jsx_runtime.jsxs)("label", { children: [(0, react_jsx_runtime.jsx)("span", { children: t("plan.newTaskLabel") }), (0, react_jsx_runtime.jsx)("input", {
							name: "newTask",
							value: newTask,
							onChange: (event) => {
								setNewTask(event.currentTarget.value);
								setFeedback(void 0);
							},
							placeholder: t("plan.newTask"),
							disabled: busy
						})] }), (0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || newTask.trim() === "",
							children: busy ? t("plan.adding") : t("plan.addTask")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.planApproveRow,
						"data-armed": discardArmed || void 0,
						"data-discard": discardArmed || void 0,
						"data-review-state": waitingForFeedback ? "awaiting-feedback" : "awaiting-review",
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.planApproveCopy,
								children: [(0, react_jsx_runtime.jsx)("strong", { children: discardArmed ? t("plan.discardConfirmTitle") : waitingForFeedback ? t("plan.feedbackTitle") : t("plan.approveTitle") }), (0, react_jsx_runtime.jsx)("small", { children: discardArmed ? t("plan.discardWarning") : waitingForFeedback ? t("plan.feedbackHint") : hasPendingEdits ? t("plan.pendingEdits") : t("plan.approveHint", {
									members: team.members.length,
									tasks: team.tasks.length
								}) })]
							}),
							(0, react_jsx_runtime.jsx)(Feedback, { value: feedback }),
							discardArmed ? (0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.planApproveActions,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy,
									onClick: () => {
										setDiscardArmed(false);
									},
									children: t("plan.cancel")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-plan-discard": true,
									"data-danger": true,
									"data-confirming": true,
									disabled: busy,
									onClick: () => {
										discard();
									},
									children: busy ? t("plan.discarding") : t("plan.discardConfirm")
								})]
							}) : (0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.planReviewActions,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"data-plan-approve": true,
									disabled: busy || !runnable || hasPendingEdits,
									onClick: () => {
										approve();
									},
									children: t("plan.approve")
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: ActivityPanel_module_css_default.planSecondaryActions,
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"data-plan-continue": true,
										disabled: busy,
										onClick: () => {
											continueInChat();
										},
										children: t(waitingForFeedback ? "plan.returnToChat" : "plan.continue")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"data-plan-discard": true,
										"data-danger": true,
										disabled: busy,
										onClick: () => {
											setDiscardArmed(true);
											setFeedback(void 0);
										},
										children: t("plan.discard")
									})]
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/client/panel-geometry.js
		/** Pure persisted geometry rules for the AgentTeams shell-overlay panel. */
		const PANEL_LAYOUT_STORAGE_KEY = "dsh-agent-teams:activity-panel:v1";
		const DEFAULT_PANEL_LAYOUT = Object.freeze({
			mode: "docked",
			x: 0,
			y: 64,
			width: 388,
			height: 640,
			heightMode: "auto"
		});
		function clamp(value, minimum, maximum) {
			return Math.min(Math.max(value, minimum), maximum);
		}
		function finite(value) {
			return typeof value === "number" && Number.isFinite(value);
		}
		/** Decode one versioned localStorage value, rejecting partial/corrupt state. */
		function parsePanelLayout(value) {
			if (value === null) return DEFAULT_PANEL_LAYOUT;
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed !== "object" || parsed === null) return DEFAULT_PANEL_LAYOUT;
				const record = parsed;
				if (record.mode !== "docked" && record.mode !== "floating" || !finite(record.x) || !finite(record.y) || !finite(record.width) || !finite(record.height)) return DEFAULT_PANEL_LAYOUT;
				return {
					mode: record.mode,
					x: record.x,
					y: record.y,
					width: record.width,
					height: record.height,
					heightMode: record.mode === "floating" && record.heightMode === "manual" ? "manual" : "auto"
				};
			} catch {
				return DEFAULT_PANEL_LAYOUT;
			}
		}
		/** Whether the panel should become a simple inset overlay with no gestures. */
		function compactPanelForBounds(bounds) {
			return bounds.width <= 960;
		}
		/** Docked and compact panels always fit content; floating panels may be user-sized. */
		function panelUsesAutoHeight(layout, bounds) {
			return compactPanelForBounds(bounds) || layout.mode === "docked" || layout.heightMode === "auto";
		}
		/** CSS max-height ceiling that keeps an auto-height panel inside its shell. */
		function panelMaximumHeight(layout, bounds) {
			const bottomInset = compactPanelForBounds(bounds) || layout.mode === "floating" ? 12 : 48;
			return Math.max(1, bounds.height - layout.y - bottomInset);
		}
		/** Resolve persisted state into a visible rectangle inside the current shell. */
		function resolvePanelGeometry(layout, bounds) {
			const boundsWidth = Math.max(1, bounds.width);
			const boundsHeight = Math.max(1, bounds.height);
			if (compactPanelForBounds(bounds)) return {
				...layout,
				x: 12,
				y: 12,
				width: Math.max(1, boundsWidth - 24),
				height: Math.max(1, boundsHeight - 24)
			};
			const maximumWidth = Math.max(1, Math.min(640, boundsWidth - 24));
			const minimumWidth = Math.min(320, maximumWidth);
			const width = clamp(layout.width, minimumWidth, maximumWidth);
			const maximumHeight = Math.max(1, boundsHeight - 24);
			const minimumHeight = Math.min(360, maximumHeight);
			if (layout.mode === "docked") {
				const y = clamp(64, 12, Math.max(12, boundsHeight - minimumHeight - 12));
				const availableHeight = Math.max(1, boundsHeight - y - 48);
				const height = clamp(availableHeight, Math.min(minimumHeight, availableHeight), maximumHeight);
				const anchorRight = clamp(bounds.anchorRight, 0, boundsWidth);
				const maximumX = Math.max(12, boundsWidth - width - 12);
				return {
					mode: "docked",
					x: clamp(anchorRight - 18 - width, 12, maximumX),
					y,
					width,
					height,
					heightMode: layout.heightMode
				};
			}
			const height = clamp(layout.height, minimumHeight, maximumHeight);
			return {
				mode: "floating",
				x: clamp(layout.x, 12, Math.max(12, boundsWidth - width - 12)),
				y: clamp(layout.y, 12, Math.max(12, boundsHeight - height - 12)),
				width,
				height,
				heightMode: layout.heightMode
			};
		}
		/** Undock without a visual jump by adopting the panel's resolved rectangle. */
		function floatPanelLayout(geometry, bounds) {
			return resolvePanelGeometry({
				...geometry,
				mode: "floating"
			}, bounds);
		}
		/** Return to the right dock, preserving width and restoring content-fit height. */
		function dockPanelLayout(layout, bounds) {
			return resolvePanelGeometry({
				...layout,
				mode: "docked",
				heightMode: "auto"
			}, bounds);
		}
		/** Translate a floating panel and clamp it back into the visible shell. */
		function movePanelLayout(start, dx, dy, bounds) {
			return resolvePanelGeometry({
				...start,
				mode: "floating",
				x: start.x + dx,
				y: start.y + dy
			}, bounds);
		}
		/** Resize while keeping the edge opposite the active handle stationary. */
		function resizePanelLayout(start, edge, dx, dy, bounds) {
			if (start.mode === "docked") {
				if (edge !== "left") return resolvePanelGeometry(start, bounds);
				return resolvePanelGeometry({
					...start,
					width: start.width - dx
				}, bounds);
			}
			const resolved = resolvePanelGeometry(start, bounds);
			const minimumWidth = Math.min(320, resolved.x + resolved.width - 12);
			const minimumHeight = Math.min(360, bounds.height - resolved.y - 12);
			if (edge === "left") {
				const right = resolved.x + resolved.width;
				const maximumWidth = Math.max(1, Math.min(640, right - 12));
				const width = clamp(resolved.width - dx, Math.min(minimumWidth, maximumWidth), maximumWidth);
				return {
					...resolved,
					x: right - width,
					width
				};
			}
			const maximumHeight = Math.max(1, bounds.height - resolved.y - 12);
			const height = clamp(resolved.height + dy, Math.min(minimumHeight, maximumHeight), maximumHeight);
			if (edge === "bottom") return {
				...resolved,
				height,
				heightMode: "manual"
			};
			const maximumWidth = Math.max(1, Math.min(640, bounds.width - resolved.x - 12));
			const width = clamp(resolved.width + dx, Math.min(minimumWidth, maximumWidth), maximumWidth);
			return {
				...resolved,
				width,
				height,
				heightMode: "manual"
			};
		}
		//#endregion
		//#region lib/client/ActivityPanel.js
		/**
		* AgentTeams activity panel: the top-right floater monitoring every team.
		*
		* Modeled on the Claude Code desktop SessionActivityPanel: a shell-overlay
		* panel that docks at the conversation's top-right edge by default, can be
		* dragged into a floating window, resized, and folded into an activity badge.
		* On wide viewports the docked panel makes the conversation column yield
		* space; narrow viewports keep a simple inset overlay. It
		* polls the host `/plugins/dsh-agent-teams/state` route for
		* server-side snapshots (durable files + live subagent activity), with a
		* collapsed badge that auto-expands once when activity appears. Archived
		* teams stay available for the owning conversation after live work ends.
		*
		* The floater mounts in ui-layout's additive `shell.overlay`; it is not a
		* conversation node — the in-conversation panel was removed in favor of this
		* always-available monitor.
		* @module dsh-agent-teams/client/activity
		*/
		/** Grace before the panel collapses once no team remains. */
		const AUTOCLOSE_GRACE_MS = 2e3;
		/**
		* Page-settle window after mount: activity restored on page load only shows
		* the collapsed badge, so the panel never yanks the conversation column
		* right after load. New activity after this window auto-expands as usual.
		*/
		const AUTO_OPEN_SETTLE_MS = 4e3;
		/** Root marker shared with the panel CSS while the shell overlay is expanded. */
		const PANEL_OPEN_ATTRIBUTE = "data-agent-teams-panel-open";
		/** Shared width concession consumed by the conversation root CSS. */
		const PANEL_SHIFT_PROPERTY = "--agent-teams-panel-shift";
		const PANEL_CONVERSATION_GAP = 14;
		const MOVE_THRESHOLD = 4;
		const CAPTAIN_ASSIGNEE = "captain";
		/** Persisted floater preference: board view vs pixel-office view. */
		const OFFICE_VIEW_KEY = "agent-teams-pixel.officeView";
		function initialPanelLayout() {
			if (typeof window === "undefined") return DEFAULT_PANEL_LAYOUT;
			return parsePanelLayout(window.localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY));
		}
		function initialPanelBounds() {
			if (typeof window === "undefined") return {
				width: 1440,
				height: 900,
				anchorRight: 1440
			};
			return {
				width: window.innerWidth,
				height: window.innerHeight,
				anchorRight: window.innerWidth
			};
		}
		/** Initial-letter fallback for unmatched roles. */
		function memberInitial(name) {
			return name.trim().slice(0, 1).toUpperCase() || "?";
		}
		function stableHash(value) {
			let hash = 0;
			for (let index = 0; index < value.length; index += 1) hash = (hash << 5) - hash + value.charCodeAt(index) | 0;
			return Math.abs(hash);
		}
		const ACCENTS = [
			"var(--dsw-alias-state-business-primary)",
			"var(--dsw-alias-state-success-primary)",
			"var(--dsw-alias-state-error-primary)",
			"var(--dsw-alias-state-warn-primary)",
			"var(--dsw-alias-label-tertiary)"
		];
		function accentOf(id) {
			return ACCENTS[stableHash(id) % ACCENTS.length] ?? ACCENTS[0];
		}
		/** Badge text follows the raw task status:
		* claimed/pending/failed/cancelled keep their own labels and colors. */
		const TASK_STATUS_LABEL = {
			pending: "task.status.pending",
			claimed: "task.status.claimed",
			in_progress: "task.status.inProgress",
			completed: "task.status.completed",
			failed: "task.status.failed",
			cancelled: "task.status.cancelled"
		};
		function taskStatusLabel(status, t) {
			const key = TASK_STATUS_LABEL[status];
			return key === void 0 ? status : t(key);
		}
		function formatTaskIds(ids, t) {
			return ids.join(t("format.listSeparator"));
		}
		function taskTitle(task, model) {
			const extras = [
				task.kind,
				task.round === void 0 ? void 0 : `r${task.round}`,
				task.verdict,
				task.verdictStale === void 0 ? void 0 : `⚠ ${task.verdictStale}`,
				model === "" ? void 0 : model
			].filter((item) => item !== void 0);
			return extras.length === 0 ? `${task.id} · ${task.subject}` : `${task.id} · ${task.subject} · ${extras.join(" · ")}`;
		}
		/** Badge/bar coloring key: visual state, widened for terminal statuses. */
		function taskTone(state, status) {
			if (status === "failed") return "failed";
			if (status === "cancelled") return "cancelled";
			return state;
		}
		function Chevron({ open }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: ActivityPanel_module_css_default.chevron,
				"data-open": open,
				width: "9",
				height: "9",
				viewBox: "0 0 10 10",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsx)("path", { d: "M3.5 2l3 3-3 3" })
			});
		}
		function WorkGlyph({ active }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: ActivityPanel_module_css_default.workGlyph,
				"data-active": active,
				width: "11",
				height: "11",
				viewBox: "0 0 11 11",
				fill: "currentColor",
				"aria-hidden": true,
				children: [
					[0, 0],
					[4.2, 0],
					[8.4, 0],
					[0, 4.2],
					[4.2, 4.2],
					[8.4, 4.2]
				].map(([x, y], index) => (0, react_jsx_runtime.jsx)("rect", {
					x,
					y,
					width: "2.6",
					height: "2.6",
					rx: ".6",
					style: { animationDelay: `${index * .15}s` }
				}, `${x}:${y}`))
			});
		}
		/** Collapsed badge: an always-visible corner pill while any team exists. */
		function CollapsedBadge({ count, busy, onClick, t }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ActivityPanel_module_css_default.badge,
				"data-agent-teams-collapsed": true,
				"data-busy": busy,
				onClick,
				"aria-label": t("activity.badgeAria", { count }),
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: ActivityPanel_module_css_default.badgeDot,
					"data-busy": busy,
					"aria-hidden": true
				}), (0, react_jsx_runtime.jsx)("span", {
					className: ActivityPanel_module_css_default.badgeCount,
					children: count
				})]
			});
		}
		function memberStateLabel(member, tasks, historic, t) {
			const owned = tasks.filter((task) => task.assignee === member.name);
			if (member.activity === "working") return t("member.state.working");
			if (owned.some((task) => task.status === "failed")) return t("member.state.failed");
			if (owned.some((task) => task.state === "blocked")) return t("member.state.waiting");
			if (owned.length > 0 && owned.every((task) => task.status === "completed")) return t("member.state.delivered");
			if (member.status === "removed") return t(historic ? "member.state.left" : "member.state.removed");
			if (owned.length > 0) return t("member.state.pending");
			return t("member.state.unassigned");
		}
		function memberStatusText(member, tasks, t) {
			const owned = tasks.filter((task) => task.assignee === member.name);
			const current = owned.find((task) => task.id === member.currentTask);
			const blocked = owned.find((task) => task.state === "blocked");
			if (member.activity === "working" && current !== void 0) {
				const model = taskModelLabel(current, [member]);
				return model === "" ? t("member.status.executing", { taskId: current.id }) : t("member.status.executingModel", {
					taskId: current.id,
					model
				});
			}
			if (member.activity === "working") return t("member.status.working");
			if (blocked !== void 0) {
				const dependency = tasks.find((task) => blocked.dependencies.includes(task.id) && task.state !== "completed");
				if (dependency !== void 0) return t("member.status.waitingOn", {
					taskId: dependency.id,
					assignee: dependency.assignee || t("task.assignee.unclaimed")
				});
				return t("member.status.waitingPrerequisite");
			}
			if (member.total === 0) return t("member.status.waitingAssignment");
			if (member.done === member.total) return t("member.status.delivered");
			if (owned.some((task) => task.status === "failed")) return t("task.detail.failed");
			if (owned.length > 0 && owned.every((task) => task.status === "completed" || task.status === "cancelled")) return t("member.status.settled");
			return t(member.activity === "idle" ? "member.status.idle" : "member.status.unknown");
		}
		function compactTaskLabel(subject) {
			const withoutVerb = subject.replace(/^开发\s*/u, "").replace(/^\d+[-_.、\s]*/u, "");
			const head = withoutVerb.split(/[（(·：:]/u)[0]?.trim() ?? withoutVerb;
			return head.length > 18 ? `${head.slice(0, 17)}…` : head;
		}
		function taskSummary(team, t, discarded = false) {
			const completed = team.tasks.filter((task) => task.status === "completed");
			const cancelled = team.tasks.filter((task) => task.status === "cancelled");
			const running = team.tasks.filter((task) => task.state === "running");
			const claimed = team.tasks.filter((task) => task.state === "claimed");
			const blocked = team.tasks.filter((task) => task.state === "blocked");
			const ready = team.tasks.filter((task) => task.state === "open" && task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled");
			const failed = team.tasks.filter((task) => task.status === "failed");
			if (discarded) return t("task.summary.discarded", { count: team.tasks.length });
			if (team.tasks.length === 0) return t("task.summary.waitingBreakdown");
			if (team.phase === "staged") return t("task.summary.staged", { count: team.tasks.length });
			if (completed.length === team.tasks.length) return t("task.summary.allDelivered", { count: completed.length });
			if (completed.length + cancelled.length + failed.length === team.tasks.length) return t("task.summary.ended", {
				completed: completed.length,
				cancelled: cancelled.length,
				failed: failed.length
			});
			if (failed.length > 0 && running.length === 0 && claimed.length === 0 && ready.length === 0 && blocked.length === 0) return t("task.summary.failedSettled", { count: failed.length });
			if (blocked.length > 0 && running.length > 0) return t("task.summary.blockedAndRunning", {
				tasks: formatTaskIds(blocked.slice(0, 3).map((task) => task.id), t),
				more: blocked.length > 3 ? t("task.summary.more", { count: blocked.length - 3 }) : ""
			});
			if (running.length > 0) return t("task.summary.running", { tasks: formatTaskIds(running.map((task) => task.id), t) });
			if (claimed.length > 0) return t("task.summary.claimed", { tasks: formatTaskIds(claimed.map((task) => task.id), t) });
			if (ready.length > 0) return t("task.summary.ready", { tasks: formatTaskIds(ready.map((task) => task.id), t) });
			if (blocked.length > 0) return t("task.summary.blocked", { tasks: formatTaskIds(blocked.map((task) => task.id), t) });
			return t("task.summary.waitingSchedule");
		}
		function ProgressOverview({ team, t, discarded = false }) {
			const running = discarded ? 0 : team.tasks.filter((task) => task.state === "running").length;
			const claimed = discarded ? 0 : team.tasks.filter((task) => task.state === "claimed").length;
			const blocked = discarded ? 0 : team.tasks.filter((task) => task.state === "blocked").length;
			const completed = discarded ? 0 : team.tasks.filter((task) => task.status === "completed").length;
			const settled = !discarded && team.tasks.length > 0 && team.tasks.every((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled");
			const summaryTone = discarded ? "discarded" : blocked > 0 || team.tasks.some((task) => task.status === "failed" || task.status === "cancelled") ? "warning" : settled ? "completed" : "running";
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.progressOverview,
				"aria-label": t("progress.aria"),
				"data-progress-summary": true,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.progressTitle,
						children: t("progress.title")
					}),
					team.tasks.length > 0 ? (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.progressSegments,
						"aria-hidden": true,
						children: team.tasks.map((task) => (0, react_jsx_runtime.jsx)("span", { "data-state": discarded ? "cancelled" : taskTone(task.state, task.status) }, task.id))
					}) : (0, react_jsx_runtime.jsx)("span", { className: ActivityPanel_module_css_default.progressEmpty }),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.progressLegend,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								"data-state": "running",
								children: t("progress.running", { count: running })
							}),
							claimed > 0 && (0, react_jsx_runtime.jsx)("span", {
								"data-state": "claimed",
								children: t("progress.claimed", { count: claimed })
							}),
							(0, react_jsx_runtime.jsx)("span", {
								"data-state": "blocked",
								children: t("progress.blocked", { count: blocked })
							}),
							(0, react_jsx_runtime.jsx)("span", {
								"data-state": "completed",
								children: t("progress.delivered", { count: completed })
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.progressSummary,
						"data-state": summaryTone,
						children: [(0, react_jsx_runtime.jsx)("span", { className: ActivityPanel_module_css_default.progressSummaryDot }), (0, react_jsx_runtime.jsx)("span", { children: taskSummary(team, t, discarded) })]
					})
				]
			});
		}
		/** Workspace-only summary of durable completion and the current unread inbox.
		* The snapshot is not a chat transcript: it provides at most five unread
		* captain messages, with no timestamps, so do not imply a complete history.
		*/
		function WorkspaceSummary({ team, t, discarded }) {
			const completed = discarded ? 0 : team.tasks.filter((task) => task.status === "completed").length;
			const total = team.tasks.length;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.workspaceSummary,
				children: [(0, react_jsx_runtime.jsxs)("section", {
					className: ActivityPanel_module_css_default.completionCard,
					"aria-label": t("progress.aria"),
					children: [(0, react_jsx_runtime.jsx)("h3", { children: t("progress.title") }), (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.completionBody,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ActivityPanel_module_css_default.completionRing,
							role: "img",
							"aria-label": t("team.stats.completed", {
								completed,
								total
							}),
							"data-completed": completed,
							"data-total": total,
							children: [(0, react_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 120 120",
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsx)("circle", {
									className: ActivityPanel_module_css_default.ringTrack,
									cx: "60",
									cy: "60",
									r: "51"
								}), (0, react_jsx_runtime.jsx)("circle", {
									className: ActivityPanel_module_css_default.ringValue,
									cx: "60",
									cy: "60",
									r: "51",
									pathLength: "100",
									strokeDasharray: `${total === 0 ? 0 : completed / total * 100} 100`
								})]
							}), (0, react_jsx_runtime.jsxs)("span", {
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsxs)("strong", { children: [completed, (0, react_jsx_runtime.jsxs)("small", { children: [" / ", total] })] }), (0, react_jsx_runtime.jsx)("span", { children: t(discarded ? "task.status.notRun" : "workspace.completed") })]
							})]
						}), total === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: ActivityPanel_module_css_default.summaryEmpty,
							children: t("workspace.noTasks")
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: ActivityPanel_module_css_default.completionTasks,
							tabIndex: 0,
							"aria-label": t("workspace.taskSummary"),
							children: team.tasks.map((task) => (0, react_jsx_runtime.jsxs)("li", {
								"data-state": discarded ? "cancelled" : taskTone(task.state, task.status),
								"data-verdict-stale": task.verdictStale === void 0 ? void 0 : "true",
								title: taskTitle(task, taskModelLabel(task, team.members)),
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.completionDot,
										"aria-hidden": true,
										children: task.verdictStale !== void 0 ? "!" : !discarded && task.status === "completed" ? "✓" : "·"
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.completionTaskId,
										children: task.id
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.completionTaskSubject,
										title: task.subject,
										children: task.subject
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.completionTaskStatus,
										children: discarded ? t("task.status.notRun") : task.verdictStale !== void 0 ? t("workspace.verdictStale") : taskStatusLabel(task.status, t)
									})
								]
							}, task.id))
						})]
					})]
				}), (0, react_jsx_runtime.jsxs)("section", {
					className: ActivityPanel_module_css_default.inboxCard,
					"aria-label": t("workspace.inbox"),
					children: [(0, react_jsx_runtime.jsxs)("header", { children: [(0, react_jsx_runtime.jsx)("h3", { children: t("workspace.inbox") }), (0, react_jsx_runtime.jsx)("span", { children: t("workspace.inboxHint") })] }), team.captainInbox.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.summaryEmpty,
						children: t("workspace.inboxEmpty")
					}) : (0, react_jsx_runtime.jsx)("ul", {
						className: ActivityPanel_module_css_default.inboxMessages,
						tabIndex: 0,
						"aria-label": t("workspace.inbox"),
						children: team.captainInbox.map((message, index) => {
							const member = team.members.find((candidate) => candidate.name === message.from);
							const art = message.from === CAPTAIN_ASSIGNEE ? LEAD_ART : memberArtUrl(message.from, member?.role ?? "");
							return (0, react_jsx_runtime.jsxs)("li", { children: [art === null ? (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.inboxInitial,
								"aria-hidden": true,
								children: memberInitial(message.from)
							}) : (0, react_jsx_runtime.jsx)("img", {
								src: art,
								alt: "",
								"aria-hidden": true
							}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: message.from }), (0, react_jsx_runtime.jsx)("p", { children: message.content })] })] }, `${index}:${message.from}`);
						})
					})]
				})]
			});
		}
		function DependencyMap({ tasks, members, t, discarded = false, workspace = false, onSelectTask }) {
			const [open, setOpen] = (0, react.useState)(true);
			const [hoverTaskId, setHoverTaskId] = (0, react.useState)(null);
			const [keyboardTaskId, setKeyboardTaskId] = (0, react.useState)(null);
			const [pinnedTaskId, setPinnedTaskId] = (0, react.useState)(null);
			const hoverTimer = (0, react.useRef)(null);
			const focusedTaskId = dependencyFocusTaskId(pinnedTaskId, keyboardTaskId, hoverTaskId);
			const nodeWidth = workspace ? 164 : 92;
			const nodeHeight = workspace ? 76 : 30;
			const layout = (0, react.useMemo)(() => compactDagLayout(tasks, workspace ? {
				nodeWidth: 164,
				nodeHeight: 76,
				columnGap: 36,
				rowGap: 16
			} : void 0), [tasks, workspace]);
			const parallel = (0, react.useMemo)(() => usesParallelTaskGrid(tasks), [tasks]);
			const related = (0, react.useMemo)(() => focusedTaskId === null ? null : relatedTaskIds(focusedTaskId, tasks), [focusedTaskId, tasks]);
			const scheduleHover = (id) => {
				if (hoverTimer.current !== null) {
					clearTimeout(hoverTimer.current);
					hoverTimer.current = null;
				}
				if (id === null) {
					setHoverTaskId(null);
					return;
				}
				hoverTimer.current = setTimeout(() => {
					hoverTimer.current = null;
					setHoverTaskId(id);
				}, 180);
			};
			(0, react.useEffect)(() => () => {
				if (hoverTimer.current !== null) clearTimeout(hoverTimer.current);
			}, []);
			(0, react.useEffect)(() => {
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						setPinnedTaskId(null);
						onSelectTask?.(null);
					}
				};
				window.addEventListener("keydown", onKeyDown);
				return () => {
					window.removeEventListener("keydown", onKeyDown);
				};
			}, [onSelectTask]);
			if (tasks.length === 0) return null;
			const fallbackTask = tasks.find((task) => task.state === "blocked") ?? tasks.find((task) => task.state === "running") ?? tasks.find((task) => task.state === "claimed") ?? tasks[0];
			const detailTask = tasks.find((task) => task.id === focusedTaskId) ?? fallbackTask;
			const detailModel = taskModelLabel(detailTask, members);
			const waitingOn = detailTask.dependencies.filter((dependency) => tasks.find((task) => task.id === dependency)?.status !== "completed");
			const dependents = tasks.filter((task) => task.dependencies.includes(detailTask.id));
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.dependencySection,
				"aria-label": t("dependency.aria"),
				"data-dependency-map": true,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: ActivityPanel_module_css_default.sectionHead,
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ActivityPanel_module_css_default.sectionToggleTitle,
						onClick: () => {
							setOpen((current) => !current);
						},
						"aria-expanded": open,
						children: [
							(0, react_jsx_runtime.jsx)(Chevron, { open }),
							(0, react_jsx_runtime.jsx)(IconBranchOutline16, {}),
							" ",
							t(parallel ? "dependency.parallel" : "dependency.title")
						]
					}), (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.sectionHint,
						children: pinnedTaskId === null ? t(parallel ? "dependency.hint.parallel" : workspace ? "workspace.dependencies" : "dependency.hint.chain") : t("dependency.hint.pinned", { taskId: pinnedTaskId })
					})]
				}), open && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
					className: ActivityPanel_module_css_default.dagViewport,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.dagCanvas,
						"data-layout": parallel ? "parallel" : "dependency",
						style: parallel ? void 0 : {
							width: layout.width,
							height: layout.height
						},
						children: [!parallel && (0, react_jsx_runtime.jsx)("svg", {
							className: ActivityPanel_module_css_default.dagEdges,
							width: layout.width,
							height: layout.height,
							"aria-hidden": true,
							children: layout.edges.map((edge) => {
								const active = related !== null && related.has(edge.from) && related.has(edge.to);
								return (0, react_jsx_runtime.jsx)("path", {
									d: edge.path,
									"data-active": active,
									"data-dimmed": related !== null && !active
								}, `${edge.from}:${edge.to}`);
							})
						}), layout.nodes.map(({ task, x, y }) => {
							const model = taskModelLabel(task, members);
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.dagNode,
								style: parallel ? { height: nodeHeight } : {
									left: x,
									top: y,
									width: nodeWidth,
									height: nodeHeight
								},
								"data-task-id": task.id,
								"data-state": discarded ? "cancelled" : taskTone(task.state, task.status),
								"data-verdict-stale": task.verdictStale === void 0 ? void 0 : "true",
								"data-task-model": model || void 0,
								"data-focused": related?.has(task.id) ?? false,
								"data-dimmed": related !== null && !related.has(task.id),
								"aria-pressed": pinnedTaskId === task.id,
								title: taskTitle(task, model),
								onClick: () => {
									const next = pinnedTaskId === task.id ? null : task.id;
									setPinnedTaskId(next);
									onSelectTask?.(next);
								},
								onMouseEnter: () => {
									scheduleHover(task.id);
								},
								onMouseLeave: () => {
									scheduleHover(null);
								},
								onFocus: () => {
									setKeyboardTaskId(task.id);
								},
								onBlur: () => {
									setKeyboardTaskId(null);
								},
								children: [
									(0, react_jsx_runtime.jsxs)("span", {
										className: ActivityPanel_module_css_default.dagNodeHead,
										children: [
											(0, react_jsx_runtime.jsx)("span", { className: ActivityPanel_module_css_default.dagNodeDot }),
											task.id,
											workspace && (0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.dagOwner,
												children: task.assignee || t("task.assignee.unclaimed")
											})
										]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.dagNodeLabel,
										children: workspace ? task.subject : compactTaskLabel(task.subject)
									}),
									!discarded && task.state === "claimed" && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.dagClaimedState,
										children: t("task.status.claimed")
									}),
									task.state === "running" && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.dagRunningState,
										"aria-label": t("task.runningAria"),
										children: (0, react_jsx_runtime.jsx)(WorkGlyph, { active: true })
									})
								]
							}, task.id);
						})]
					})
				}), (0, react_jsx_runtime.jsxs)("section", {
					className: ActivityPanel_module_css_default.taskDetail,
					"data-task-detail": detailTask.id,
					children: [
						(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.taskDetailHead,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskDetailId,
									children: detailTask.id
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskDetailSubject,
									title: detailTask.subject,
									children: detailTask.subject.replace(/^开发\s*/u, "")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskDetailBadge,
									"data-state": discarded ? "cancelled" : taskTone(detailTask.state, detailTask.status),
									children: discarded ? t("task.status.notRun") : taskStatusLabel(detailTask.status, t)
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.taskDetailLine,
							children: [
								detailTask.assignee || t("task.assignee.unclaimed"),
								" · ",
								discarded ? t("task.detail.notRun") : detailTask.status === "completed" ? t("task.detail.completed") : detailTask.status === "cancelled" ? t("task.detail.cancelled") : detailTask.status === "failed" ? t("task.detail.failed") : detailTask.dependencies.length === 0 ? t("task.detail.noPrerequisite") : waitingOn.length === 0 ? t("task.detail.ready") : t("task.detail.waitingOn", { tasks: formatTaskIds(waitingOn, t) })
							]
						}),
						detailModel !== "" && (0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskDetailModel,
							"data-task-model": detailModel,
							children: t("task.model", { model: detailModel })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskDetailMeta,
							children: dependents.length === 0 ? t("task.detail.noDownstream") : t("task.detail.unlocks", { tasks: formatTaskIds(dependents.map((task) => task.id), t) })
						})
					]
				})] })]
			});
		}
		function TeamSection({ team, modelDirectory, onContinuePlanning, onDiscarded, onNavigate, t, historic = false, workspace = false }) {
			const [selectedTaskId, setSelectedTaskId] = (0, react.useState)(null);
			const selectedAssignee = team.tasks.find((task) => task.id === selectedTaskId)?.assignee;
			const [membersOpen, setMembersOpen] = (0, react.useState)(workspace);
			const [stopOpen, setStopOpen] = (0, react.useState)(false);
			const [stopping, setStopping] = (0, react.useState)(false);
			const [stopError, setStopError] = (0, react.useState)("");
			const discarded = historic && team.phase === "staged";
			const stopped = !historic && team.halted === true;
			const busyCount = team.members.filter((member) => member.activity === "working").length;
			const assignedCount = team.tasks.filter((task) => task.assignee !== "" && task.assignee !== CAPTAIN_ASSIGNEE).length;
			const captainOwned = team.tasks.filter((task) => task.assignee === CAPTAIN_ASSIGNEE && task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled");
			const captainBusy = captainOwned.length > 0;
			const captainTaskIds = formatTaskIds(captainOwned.map((task) => task.id), t);
			const completedCount = team.tasks.filter((task) => task.status === "completed").length;
			const allCompleted = team.tasks.length > 0 && completedCount === team.tasks.length;
			const allSettled = team.tasks.length > 0 && team.tasks.every((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled");
			const unfinishedCount = team.tasks.filter((task) => task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled").length;
			const canStop = !historic && team.phase === "running" && team.halted !== true && teamIsActive(team);
			const stopTeam = async () => {
				if (stopping) return;
				setStopping(true);
				setStopError("");
				try {
					const response = await fetch(ACTIVITY_HALT_URL, {
						method: "POST",
						cache: "no-store",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							sessionId: team.captainSessionId,
							teamId: team.teamId
						})
					});
					if (!response.ok) {
						let message = t("team.stopRequestFailed");
						try {
							const body = await response.json();
							if (typeof body.error === "string" && body.error.trim() !== "") message = body.error;
						} catch {}
						throw new Error(message);
					}
					setStopOpen(false);
				} catch (error) {
					setStopError(t("team.stopFailed", { message: error instanceof Error ? error.message : String(error) }));
				} finally {
					setStopping(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.team,
				"data-team-id": team.teamId,
				"data-workspace-team": workspace || void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: ActivityPanel_module_css_default.teamHead,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.teamName,
								title: team.name,
								children: team.name
							}),
							historic && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.historicPill,
								children: t(discarded ? "team.discarded" : "team.ended")
							}),
							stopped && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.historicPill,
								children: t("team.stopped")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.teamStats,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										"data-stat": "members",
										children: t("team.stats.members", { count: team.members.length })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										"data-stat": "tasks",
										children: t("team.stats.completed", {
											completed: completedCount,
											total: team.tasks.length
										})
									}),
									(0, react_jsx_runtime.jsx)("span", {
										"data-stat": "messages",
										children: t("team.stats.messages", { count: team.messageCount })
									})
								]
							}),
							canStop && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.teamStopButton,
								"aria-label": t("team.stop"),
								title: t("team.stop"),
								onClick: () => {
									setStopError("");
									setStopOpen(true);
								},
								children: (0, react_jsx_runtime.jsx)(IconStopFill16, {})
							})
						]
					}),
					team.phase === "staged" && !historic && modelDirectory !== void 0 && onContinuePlanning !== void 0 && onDiscarded !== void 0 && (0, react_jsx_runtime.jsx)(StagingPlanEditor, {
						team,
						modelDirectory,
						onContinuePlanning,
						onDiscarded,
						t
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ActivityPanel_module_css_default.delegationSection,
						"aria-label": t("delegation.aria"),
						"data-delegation-map": true,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.captainNode,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.captainAvatar,
										children: (0, react_jsx_runtime.jsx)("img", {
											className: ActivityPanel_module_css_default.leadAvatar,
											src: LEAD_ART,
											alt: "",
											"aria-hidden": true
										})
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: ActivityPanel_module_css_default.captainInfo,
										children: [(0, react_jsx_runtime.jsxs)("span", {
											className: ActivityPanel_module_css_default.captainLine,
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.captainName,
												children: t("captain.name")
											}), (0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.captainRole,
												children: t("captain.role")
											})]
										}), (0, react_jsx_runtime.jsx)("span", {
											className: ActivityPanel_module_css_default.captainSummary,
											children: discarded ? t("captain.summary.discarded", {
												tasks: team.tasks.length,
												members: team.members.length
											}) : captainBusy ? t("captain.summary.withTakeover", {
												tasks: assignedCount,
												captainTasks: captainTaskIds
											}) : team.phase === "staged" ? t(team.planReviewState === "awaiting_feedback" ? "captain.summary.awaitingFeedback" : "captain.summary.staged", {
												tasks: team.tasks.length,
												members: team.members.length
											}) : t("captain.summary", {
												tasks: assignedCount,
												members: team.members.length
											})
										})]
									}),
									(0, react_jsx_runtime.jsxs)("span", {
										className: ActivityPanel_module_css_default.captainState,
										"data-busy": captainBusy || busyCount > 0,
										children: [(0, react_jsx_runtime.jsx)(WorkGlyph, { active: captainBusy || busyCount > 0 }), discarded ? t("captain.state.discarded") : captainBusy ? t("captain.state.takeover", { tasks: captainTaskIds }) : team.phase === "staged" ? t(team.planReviewState === "awaiting_feedback" ? "captain.state.awaitingFeedback" : "captain.state.staged") : busyCount > 0 ? t("captain.state.working", { count: busyCount }) : t(allCompleted ? "captain.state.collected" : allSettled ? "captain.state.settled" : "captain.state.waiting")]
									})
								]
							}),
							(0, react_jsx_runtime.jsx)(ProgressOverview, {
								team,
								t,
								discarded
							}),
							(() => {
								const orderedMembers = orderDelegationMembers(team.members, team.tasks);
								const runningMembers = orderedMembers.filter((member) => member.activity === "working" || member.status === "working" || team.tasks.some((task) => task.assignee === member.name && (task.status === "pending" || task.status === "claimed" || task.status === "in_progress")));
								const visibleMembers = membersOpen ? orderedMembers : runningMembers;
								const hiddenFinishedCount = orderedMembers.length - visibleMembers.length;
								const expandLabel = membersOpen ? t("members.collapse") : hiddenFinishedCount > 0 ? t("members.expandFinished", { count: hiddenFinishedCount }) : t("members.expand");
								return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.membersToggle,
									onClick: () => {
										setMembersOpen((current) => !current);
									},
									"aria-expanded": membersOpen,
									"data-members-toggle": true,
									children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)(Chevron, { open: membersOpen }), t("members.toggle", { count: team.members.length })] }), (0, react_jsx_runtime.jsx)("span", { children: expandLabel })]
								}), (membersOpen || visibleMembers.length > 0) && (0, react_jsx_runtime.jsxs)("div", {
									className: ActivityPanel_module_css_default.delegationTree,
									children: [team.members.length === 0 && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.emptyHint,
										children: t("members.empty")
									}), visibleMembers.map((member) => {
										const owned = team.tasks.filter((task) => task.assignee === member.name);
										const memberModel = memberRouteLabel(member);
										return (0, react_jsx_runtime.jsxs)("div", {
											className: ActivityPanel_module_css_default.memberBlock,
											"data-activity": member.activity,
											"data-selected-member": workspace && selectedAssignee === member.name || void 0,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: ActivityPanel_module_css_default.memberBranch,
													"aria-hidden": true,
													children: (0, react_jsx_runtime.jsx)("span", {})
												}),
												(0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: ActivityPanel_module_css_default.memberRow,
													"data-activity": member.activity,
													onClick: () => {
														if (member.id !== "") onNavigate(team.captainSessionId, member.id);
													},
													children: [
														(0, react_jsx_runtime.jsxs)("span", {
															className: ActivityPanel_module_css_default.memberAvatar,
															"data-unread": member.unread > 0,
															children: [memberArtUrl(member.name, member.role) !== null ? (0, react_jsx_runtime.jsx)("img", {
																className: ActivityPanel_module_css_default.memberArt,
																src: memberArtUrl(member.name, member.role) ?? "",
																alt: "",
																"aria-hidden": true
															}) : (0, react_jsx_runtime.jsx)("span", {
																className: ActivityPanel_module_css_default.memberInitial,
																style: { background: accentOf(member.id) },
																children: memberInitial(member.name)
															}), (0, react_jsx_runtime.jsx)("img", {
																className: ActivityPanel_module_css_default.stateArt,
																"data-activity": member.activity,
																src: ACTION_ART[member.activity],
																alt: "",
																"aria-hidden": true
															})]
														}),
														(0, react_jsx_runtime.jsxs)("span", {
															className: ActivityPanel_module_css_default.memberInfo,
															children: [(0, react_jsx_runtime.jsxs)("span", {
																className: ActivityPanel_module_css_default.memberLine,
																children: [
																	(0, react_jsx_runtime.jsx)("span", {
																		className: ActivityPanel_module_css_default.memberName,
																		children: member.name
																	}),
																	member.role !== "" && (0, react_jsx_runtime.jsx)("span", {
																		className: ActivityPanel_module_css_default.memberRole,
																		children: member.role
																	}),
																	memberModel !== "" && (0, react_jsx_runtime.jsx)("span", {
																		className: ActivityPanel_module_css_default.memberModel,
																		role: "img",
																		"data-member-model": memberModel,
																		title: memberModel,
																		"aria-label": memberModel,
																		children: compactModelLabel(memberModel)
																	}),
																	(0, react_jsx_runtime.jsxs)("span", {
																		className: ActivityPanel_module_css_default.memberState,
																		"data-activity": member.activity,
																		children: [(0, react_jsx_runtime.jsx)(WorkGlyph, { active: member.activity === "working" }), discarded ? t("member.state.notCreated") : stopped ? t("member.state.stopped") : team.phase === "staged" ? t("member.state.staged") : memberStateLabel(member, team.tasks, historic, t)]
																	})
																]
															}), (0, react_jsx_runtime.jsx)("span", {
																className: ActivityPanel_module_css_default.memberStatusLine,
																children: discarded ? t("member.status.discarded") : stopped ? t("member.status.stopped") : team.phase === "staged" ? t("member.status.staged") : historic && owned.length > 0 && owned.every((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled") ? t("member.status.settled") : memberStatusText(member, team.tasks, t)
															})]
														}),
														(0, react_jsx_runtime.jsxs)("span", {
															className: ActivityPanel_module_css_default.memberCount,
															children: [
																member.done,
																"/",
																member.total
															]
														})
													]
												}),
												(0, react_jsx_runtime.jsxs)("div", {
													className: ActivityPanel_module_css_default.assignmentLine,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: ActivityPanel_module_css_default.assignmentLabel,
														children: t(discarded ? "assignment.discarded" : team.phase === "staged" ? "assignment.staged" : "assignment.label")
													}), (0, react_jsx_runtime.jsx)("span", {
														className: ActivityPanel_module_css_default.assignmentTasks,
														children: owned.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
															className: ActivityPanel_module_css_default.taskEmpty,
															children: t("assignment.empty")
														}) : owned.map((task) => {
															const model = taskModelLabel(task, team.members);
															const shortModel = compactModelLabel(model);
															return (0, react_jsx_runtime.jsx)("span", {
																className: ActivityPanel_module_css_default.assignmentChip,
																"data-state": discarded ? "cancelled" : taskTone(task.state, task.status),
																"data-verdict-stale": task.verdictStale === void 0 ? void 0 : "true",
																"data-task-model": model || void 0,
																title: taskTitle(task, model),
																children: task.state === "running" && shortModel !== "" ? `${task.id} · ${shortModel}` : task.id
															}, task.id);
														})
													})]
												})
											]
										}, member.id || member.name);
									})]
								})] });
							})()
						]
					}),
					(0, react_jsx_runtime.jsx)(DependencyMap, {
						tasks: team.tasks,
						members: team.members,
						t,
						discarded,
						workspace,
						onSelectTask: setSelectedTaskId
					}),
					workspace && (0, react_jsx_runtime.jsx)(WorkspaceSummary, {
						team,
						t,
						discarded
					})
				]
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: stopOpen,
				onClose: () => {
					if (!stopping) setStopOpen(false);
				},
				title: t("team.stopTitle", { team: team.name }),
				closeLabel: t("plan.cancel"),
				description: t("team.stopDescription", {
					tasks: unfinishedCount,
					members: busyCount
				}),
				footer: (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.stopModalActions,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: stopping,
						onClick: () => {
							setStopOpen(false);
						},
						children: t("team.stopCancel")
					}), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-danger": true,
						disabled: stopping,
						onClick: () => {
							stopTeam();
						},
						children: [(0, react_jsx_runtime.jsx)(IconStopFill16, {}), stopping ? t("team.stopping") : t("team.stopConfirm")]
					})]
				}),
				children: stopError !== "" && (0, react_jsx_runtime.jsxs)("p", {
					className: ActivityPanel_module_css_default.stopModalError,
					role: "alert",
					children: [(0, react_jsx_runtime.jsx)(IconWarningOutline16, {}), stopError]
				})
			})] });
		}
		/** Legacy conversation cards may outlive their host archive. Project their
		* durable roster through the same rebuilt panel instead of a second UI. */
		function historicCardTeam(data, owner) {
			return {
				workspace: "",
				teamId: data.teamId,
				name: data.teamName,
				captainSessionId: data.captainSessionId || owner,
				phase: "running",
				members: data.members.map((member) => ({
					...member,
					status: "removed",
					activity: "idle",
					progress: 0,
					done: 0,
					total: 0,
					currentTask: "",
					unread: 0
				})),
				tasks: [],
				messageCount: 0,
				captainInbox: []
			};
		}
		function ActivityPanel({ sessionsList, modelDirectories, openMember, t, conversationVisible = true }) {
			const navigateToSession = (parentId, childId) => {
				setOpen(false);
				setWasActive(false);
				openMember(parentId, childId);
			};
			const [open, setOpen] = (0, react.useState)(false);
			const [openOwner, setOpenOwner] = (0, react.useState)();
			const [autoOpened, setAutoOpened] = (0, react.useState)(false);
			const [wasActive, setWasActive] = (0, react.useState)(false);
			const [historic, setHistoric] = (0, react.useState)(/* @__PURE__ */ new Map());
			const [officeMode, setOfficeMode] = (0, react.useState)(() => {
				if (typeof window === "undefined") return false;
				try {
					return window.localStorage.getItem(OFFICE_VIEW_KEY) === "1";
				} catch {
					return false;
				}
			});
			const setOfficeView = (0, react.useCallback)((next) => {
				setOfficeMode(next);
				try {
					window.localStorage.setItem(OFFICE_VIEW_KEY, next ? "1" : "0");
				} catch {}
			}, []);
			const [layout, setLayout] = (0, react.useState)(initialPanelLayout);
			const [bounds, setBounds] = (0, react.useState)(initialPanelBounds);
			const [interaction, setInteraction] = (0, react.useState)(null);
			const panelRef = (0, react.useRef)(null);
			const boundsRef = (0, react.useRef)(bounds);
			const gestureRef = (0, react.useRef)(null);
			const frameRef = (0, react.useRef)(null);
			const pendingLayoutRef = (0, react.useRef)(null);
			const current = currentSessionId((0, react.useSyncExternalStore)(sessionsList.subscribe, sessionsList.getSnapshot));
			const autoOpenTrackerRef = (0, react.useRef)({
				sessionId: current,
				restoreComplete: false,
				liveTeamIds: /* @__PURE__ */ new Set()
			});
			const monitorTargets = (0, react.useSyncExternalStore)(subscribeActivityMonitorTargets, getActivityMonitorTargetsSnapshot);
			const returnToComposer = () => {
				setOpen(false);
				setOpenOwner(void 0);
				window.requestAnimationFrame(() => {
					document.querySelector("[data-composer-card] [contenteditable=\"true\"][role=\"textbox\"], [data-composer-card] textarea")?.focus();
				});
			};
			const { teams, archivedTeams } = (0, react.useSyncExternalStore)(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
			const currentTargets = (0, react.useMemo)(() => current === void 0 ? [] : monitorTargets.filter((target) => target.sessionId === current), [current, monitorTargets]);
			const currentRef = (0, react.useRef)(current);
			(0, react.useEffect)(() => {
				currentRef.current = current;
			}, [current]);
			const mountedAtRef = (0, react.useRef)(performance.now());
			const expanded = conversationVisible && activityPanelExpandedForSession(open, openOwner, current);
			const geometry = (0, react.useMemo)(() => resolvePanelGeometry(layout, bounds), [layout, bounds]);
			const compact = compactPanelForBounds(bounds);
			const commitLayout = (0, react.useCallback)((next) => {
				setLayout(next);
			}, []);
			(0, react.useEffect)(() => {
				window.localStorage.setItem(PANEL_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
			}, [layout]);
			(0, react.useLayoutEffect)(() => {
				const overlay = document.querySelector("[data-shell-overlay]");
				if (overlay === null) return;
				const conversation = document.querySelector("[data-phase='active']");
				let frame = null;
				const measure = () => {
					frame = null;
					const overlayRect = overlay.getBoundingClientRect();
					const conversationRect = conversation?.getBoundingClientRect();
					const next = {
						width: overlayRect.width,
						height: overlayRect.height,
						anchorRight: conversationRect === void 0 ? overlayRect.width : Math.min(Math.max(conversationRect.right - overlayRect.left, 0), overlayRect.width)
					};
					const previous = boundsRef.current;
					if (previous.width === next.width && previous.height === next.height && previous.anchorRight === next.anchorRight) return;
					boundsRef.current = next;
					setBounds(next);
				};
				const scheduleMeasure = () => {
					frame ??= requestAnimationFrame(measure);
				};
				measure();
				const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
				observer?.observe(overlay);
				if (conversation !== null) observer?.observe(conversation);
				window.addEventListener("resize", scheduleMeasure);
				return () => {
					if (frame !== null) cancelAnimationFrame(frame);
					observer?.disconnect();
					window.removeEventListener("resize", scheduleMeasure);
				};
			}, [current]);
			(0, react.useLayoutEffect)(() => {
				const tracker = autoOpenTrackerRef.current;
				if (tracker.sessionId !== current) {
					tracker.sessionId = current;
					tracker.restoreComplete = false;
					tracker.liveTeamIds = /* @__PURE__ */ new Set();
					setWasActive(false);
					setAutoOpened(false);
				}
				if (openOwner === void 0 || openOwner === current) return;
				setOpen(false);
				setOpenOwner(void 0);
			}, [current, openOwner]);
			(0, react.useLayoutEffect)(() => {
				const root = document.documentElement;
				if (expanded && geometry.mode === "docked" && !compact) {
					root.setAttribute(PANEL_OPEN_ATTRIBUTE, "");
					root.style.setProperty(PANEL_SHIFT_PROPERTY, `${geometry.width + PANEL_CONVERSATION_GAP + 18}px`);
				} else {
					root.removeAttribute(PANEL_OPEN_ATTRIBUTE);
					root.style.removeProperty(PANEL_SHIFT_PROPERTY);
				}
				return () => {
					root.removeAttribute(PANEL_OPEN_ATTRIBUTE);
					root.style.removeProperty(PANEL_SHIFT_PROPERTY);
				};
			}, [
				compact,
				expanded,
				geometry.mode,
				geometry.width
			]);
			(0, react.useEffect)(() => {
				if (current === void 0) return;
				const controller = startActivityPolling(currentTargets, { discoverySessionId: current });
				let active = true;
				const tracker = autoOpenTrackerRef.current;
				if (tracker.sessionId === current && !tracker.restoreComplete) controller.firstTick.then(() => {
					const latest = autoOpenTrackerRef.current;
					if (!active || latest.sessionId !== current || latest.restoreComplete) return;
					latest.liveTeamIds = new Set(getActivitySnapshotsSnapshot().teams.filter((team) => team.captainSessionId === current).map((team) => team.teamId));
					latest.restoreComplete = true;
				});
				return () => {
					active = false;
					controller.stop();
				};
			}, [current, currentTargets]);
			(0, react.useEffect)(() => {
				const onOpenPanel = (event) => {
					const activeSession = currentRef.current;
					if (activeSession === void 0) return;
					setOpenOwner(activeSession);
					setOpen(true);
					const detail = event.detail;
					if (detail?.teamId !== void 0) {
						const owner = detail.captainSessionId !== "" ? detail.captainSessionId : currentRef.current ?? "";
						const teamKey = `${owner}:${detail.teamId}`;
						setHistoric((previous) => {
							const next = new Map(previous);
							next.set(teamKey, {
								data: detail,
								owner
							});
							return next;
						});
					}
				};
				window.addEventListener(OPEN_PANEL_EVENT, onOpenPanel);
				return () => {
					window.removeEventListener(OPEN_PANEL_EVENT, onOpenPanel);
				};
			}, []);
			const visibleTeams = (0, react.useMemo)(() => current === void 0 ? [] : teams.filter((team) => team.captainSessionId === current), [teams, current]);
			const visibleHistoric = (0, react.useMemo)(() => current === void 0 ? [] : [...historic.values()].filter(({ data, owner }) => owner === current && !teams.some((live) => live.captainSessionId === current && live.teamId === data.teamId) && !archivedTeams.some((archived) => archived.captainSessionId === current && archived.teamId === data.teamId)), [
				historic,
				current,
				teams,
				archivedTeams
			]);
			const visibleArchived = (0, react.useMemo)(() => current === void 0 ? [] : archivedTeams.filter((team) => team.captainSessionId === current && !teams.some((live) => live.captainSessionId === current && live.teamId === team.teamId)), [
				archivedTeams,
				current,
				teams
			]);
			const visibleCount = visibleTeams.length + visibleArchived.length + visibleHistoric.length;
			const officeTeam = visibleTeams[0];
			const visibleLiveTeamIds = (0, react.useMemo)(() => visibleTeams.map((team) => team.teamId).sort(), [visibleTeams]);
			(0, react.useEffect)(() => {
				const tracker = autoOpenTrackerRef.current;
				const settled = performance.now() - mountedAtRef.current >= AUTO_OPEN_SETTLE_MS;
				const shouldAutoExpand = tracker.sessionId === current && activityPanelShouldAutoExpand({
					alreadyAutoOpened: autoOpened,
					pageSettled: settled,
					restoreComplete: tracker.restoreComplete,
					previousLiveTeamIds: tracker.liveTeamIds,
					currentLiveTeamIds: visibleLiveTeamIds
				});
				if (tracker.sessionId === current && tracker.restoreComplete) tracker.liveTeamIds = new Set(visibleLiveTeamIds);
				if (visibleCount > 0) {
					setWasActive(true);
					if (shouldAutoExpand) {
						setOpenOwner(current);
						setOpen(true);
						setAutoOpened(true);
					}
					return;
				}
				if (!wasActive) return;
				const timer = setTimeout(() => {
					setOpen(false);
					setOpenOwner(void 0);
					setWasActive(false);
					setAutoOpened(false);
				}, AUTOCLOSE_GRACE_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [
				visibleCount,
				visibleLiveTeamIds.join("\0"),
				autoOpened,
				wasActive,
				current
			]);
			const busy = (0, react.useMemo)(() => visibleTeams.some((team) => team.members.some((member) => member.activity === "working")), [visibleTeams]);
			const hasTeams = visibleCount > 0;
			const panelGeometryForGesture = (0, react.useCallback)(() => {
				const measuredHeight = panelRef.current?.getBoundingClientRect().height;
				if (measuredHeight === void 0 || measuredHeight <= 0) return geometry;
				return {
					...geometry,
					height: measuredHeight
				};
			}, [geometry]);
			const flushScheduledLayout = (0, react.useCallback)(() => {
				if (frameRef.current !== null) {
					cancelAnimationFrame(frameRef.current);
					frameRef.current = null;
				}
				const pending = pendingLayoutRef.current;
				pendingLayoutRef.current = null;
				if (pending !== null) commitLayout(pending);
			}, [commitLayout]);
			const scheduleLayout = (0, react.useCallback)((next) => {
				pendingLayoutRef.current = next;
				frameRef.current ??= requestAnimationFrame(() => {
					frameRef.current = null;
					const pending = pendingLayoutRef.current;
					pendingLayoutRef.current = null;
					if (pending !== null) commitLayout(pending);
				});
			}, [commitLayout]);
			(0, react.useEffect)(() => () => {
				if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
			}, []);
			const beginMove = (0, react.useCallback)((event) => {
				if (compact || event.button !== 0 || event.target.closest("button") !== null) return;
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				gestureRef.current = {
					kind: "move",
					pointerId: event.pointerId,
					originX: event.clientX,
					originY: event.clientY,
					start: panelGeometryForGesture(),
					activated: false
				};
			}, [compact, panelGeometryForGesture]);
			const beginResize = (0, react.useCallback)((edge, event) => {
				if (compact || event.button !== 0 || geometry.mode === "docked" && edge !== "left") return;
				event.preventDefault();
				event.stopPropagation();
				event.currentTarget.setPointerCapture(event.pointerId);
				gestureRef.current = {
					kind: "resize",
					edge,
					pointerId: event.pointerId,
					originX: event.clientX,
					originY: event.clientY,
					start: panelGeometryForGesture(),
					activated: true
				};
				setInteraction("resizing");
			}, [
				compact,
				geometry.mode,
				panelGeometryForGesture
			]);
			const updateGesture = (0, react.useCallback)((event) => {
				const gesture = gestureRef.current;
				if (gesture === null || gesture.pointerId !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
				const dx = event.clientX - gesture.originX;
				const dy = event.clientY - gesture.originY;
				const activeBounds = boundsRef.current;
				if (gesture.kind === "move") {
					if (!gesture.activated && Math.hypot(dx, dy) < MOVE_THRESHOLD) return;
					if (!gesture.activated) {
						gesture.activated = true;
						setInteraction("dragging");
					}
					scheduleLayout(movePanelLayout(floatPanelLayout(gesture.start, activeBounds), dx, dy, activeBounds));
					return;
				}
				scheduleLayout(resizePanelLayout(gesture.start, gesture.edge ?? "left", dx, dy, activeBounds));
			}, [scheduleLayout]);
			const endGesture = (0, react.useCallback)((event) => {
				const gesture = gestureRef.current;
				if (gesture === null || gesture.pointerId !== event.pointerId) return;
				updateGesture(event);
				flushScheduledLayout();
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				gestureRef.current = null;
				setInteraction(null);
			}, [flushScheduledLayout, updateGesture]);
			const cancelGesture = (0, react.useCallback)((event) => {
				const gesture = gestureRef.current;
				if (gesture === null || gesture.pointerId !== event.pointerId) return;
				flushScheduledLayout();
				gestureRef.current = null;
				setInteraction(null);
			}, [flushScheduledLayout]);
			const toggleDock = (0, react.useCallback)(() => {
				const liveGeometry = panelGeometryForGesture();
				commitLayout(liveGeometry.mode === "docked" ? floatPanelLayout(liveGeometry, boundsRef.current) : dockPanelLayout(liveGeometry, boundsRef.current));
			}, [commitLayout, panelGeometryForGesture]);
			const autoHeight = panelUsesAutoHeight(geometry, bounds);
			const panelStyle = {
				width: geometry.width,
				height: autoHeight ? "auto" : geometry.height,
				maxHeight: panelMaximumHeight(geometry, bounds),
				transform: `translate3d(${geometry.x}px, ${geometry.y}px, 0)`
			};
			if (!conversationVisible || !hasTeams && !expanded) return null;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [!expanded && (0, react_jsx_runtime.jsx)(CollapsedBadge, {
				count: visibleCount,
				busy,
				t,
				onClick: () => {
					if (current === void 0) return;
					setOpenOwner(current);
					setOpen(true);
				}
			}), expanded && (0, react_jsx_runtime.jsxs)("aside", {
				ref: panelRef,
				className: ActivityPanel_module_css_default.panel,
				style: panelStyle,
				"data-agent-teams-activity": true,
				"data-panel-mode": geometry.mode,
				"data-height-mode": autoHeight ? "auto" : "manual",
				"data-compact": compact || void 0,
				"data-dragging": interaction === "dragging" || void 0,
				"data-resizing": interaction === "resizing" || void 0,
				"aria-label": t("activity.panelAria"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: ActivityPanel_module_css_default.panelHead,
						onPointerDown: beginMove,
						onPointerMove: updateGesture,
						onPointerUp: endGesture,
						onPointerCancel: cancelGesture,
						"data-drag-handle": !compact || void 0,
						children: [(0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.panelTitle,
							children: [t("activity.title"), (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.panelDot,
								"data-busy": busy,
								"aria-hidden": true
							})]
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.panelControls,
							children: [
								hasTeams && (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.iconButton,
									"data-control": "office",
									"aria-pressed": officeMode,
									onClick: () => {
										setOfficeView(!officeMode);
									},
									"aria-label": t(officeMode ? "office.showBoard" : "office.showOffice"),
									title: t(officeMode ? "office.showBoard" : "office.showOffice"),
									children: (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: officeMode ? "☰" : "🏢"
									})
								}),
								!compact && (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.iconButton,
									"data-control": "dock",
									"data-mode": geometry.mode,
									onClick: toggleDock,
									"aria-label": t(geometry.mode === "docked" ? "activity.float" : "activity.dockRight"),
									title: t(geometry.mode === "docked" ? "activity.float" : "activity.dockRight"),
									children: (0, react_jsx_runtime.jsx)(IconPanelLeftOutline16, {})
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.iconButton,
									"data-control": "collapse",
									onClick: () => {
										setOpen(false);
										setOpenOwner(void 0);
									},
									"aria-label": t("activity.collapse"),
									title: t("activity.collapse"),
									children: (0, react_jsx_runtime.jsx)(IconChevronDownOutline14, {})
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.teams,
						"data-view": officeMode && officeTeam !== void 0 ? "office" : "board",
						children: officeMode && officeTeam !== void 0 ? (0, react_jsx_runtime.jsx)(PixelOffice, {
							team: officeTeam,
							t,
							onShowBoard: () => {
								setOfficeView(false);
							},
							onOpenMember: (memberId) => {
								navigateToSession(officeTeam.captainSessionId, memberId);
							}
						}) : visibleCount === 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.emptyHint,
							children: t("activity.empty")
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							visibleTeams.map((team) => (0, react_jsx_runtime.jsx)(TeamSection, {
								team,
								modelDirectory: team.phase === "staged" ? modelDirectories.directoryFor(team.captainSessionId) : void 0,
								onContinuePlanning: returnToComposer,
								onDiscarded: returnToComposer,
								onNavigate: navigateToSession,
								t
							}, team.teamId)),
							visibleArchived.map((team) => (0, react_jsx_runtime.jsxs)("div", {
								"data-team-id": team.teamId,
								"data-historic": true,
								className: ActivityPanel_module_css_default.archivedWrap,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.archiveLabel,
									children: t(team.phase === "staged" ? "archive.discardedLabel" : "archive.label")
								}), (0, react_jsx_runtime.jsx)(TeamSection, {
									team,
									onNavigate: navigateToSession,
									t,
									historic: true
								})]
							}, `${team.captainSessionId}:${team.teamId}`)),
							visibleHistoric.map(({ data: team, owner }) => {
								const teamKey = `${owner}:${team.teamId}`;
								return (0, react_jsx_runtime.jsx)(TeamSection, {
									team: historicCardTeam(team, owner),
									onNavigate: navigateToSession,
									t,
									historic: true
								}, teamKey);
							})
						] })
					}),
					!compact && (0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.resizeHandle,
						"data-resize-edge": "left",
						onPointerDown: (event) => {
							beginResize("left", event);
						},
						onPointerMove: updateGesture,
						onPointerUp: endGesture,
						onPointerCancel: cancelGesture,
						"aria-hidden": true
					}),
					!compact && geometry.mode === "floating" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.resizeHandle,
						"data-resize-edge": "bottom",
						onPointerDown: (event) => {
							beginResize("bottom", event);
						},
						onPointerMove: updateGesture,
						onPointerUp: endGesture,
						onPointerCancel: cancelGesture,
						"aria-hidden": true
					}), (0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.resizeHandle,
						"data-resize-edge": "corner",
						onPointerDown: (event) => {
							beginResize("corner", event);
						},
						onPointerMove: updateGesture,
						onPointerUp: endGesture,
						onPointerCancel: cancelGesture,
						"aria-hidden": true
					})] })
				]
			})] });
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\TeamConfigPanel.module.css.mjs
		const css$2 = ".FZXPhq_panel{flex-direction:column;gap:14px;display:flex}.FZXPhq_facts{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;display:grid}.FZXPhq_fact{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-direction:column;gap:3px;min-width:0;padding:10px 12px;display:flex}.FZXPhq_label{color:var(--dsw-alias-label-secondary);font-size:11px}.FZXPhq_value{overflow-wrap:anywhere;font-size:14px;font-weight:650}.FZXPhq_sub{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;font-size:10px}.FZXPhq_heading{color:var(--dsw-alias-label-secondary);margin:4px 0 0;font-size:12px;font-weight:650}.FZXPhq_tableWrap{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;overflow-x:auto}.FZXPhq_table{border-collapse:collapse;width:100%;font-size:12px}.FZXPhq_table th,.FZXPhq_table td{text-align:left;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l2);overflow-wrap:anywhere;padding:8px 10px}.FZXPhq_table thead th{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, var(--dsw-alias-bg-base));white-space:nowrap;font-weight:600}.FZXPhq_table tbody tr:last-child td{border-bottom:none}.FZXPhq_mono{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}.FZXPhq_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px;line-height:1.7}";
		const tagId$2 = "agent-teams-pixel/TeamConfigPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var TeamConfigPanel_module_css_default = {
			"fact": "FZXPhq_fact",
			"facts": "FZXPhq_facts",
			"heading": "FZXPhq_heading",
			"hint": "FZXPhq_hint",
			"label": "FZXPhq_label",
			"mono": "FZXPhq_mono",
			"panel": "FZXPhq_panel",
			"sub": "FZXPhq_sub",
			"table": "FZXPhq_table",
			"tableWrap": "FZXPhq_tableWrap",
			"value": "FZXPhq_value"
		};
		//#endregion
		//#region lib/client/TeamConfigPanel.js
		function memberRoute(member) {
			const parts = [member.provider, member.model].filter((part) => typeof part === "string" && part !== "");
			return parts.length > 0 ? parts.join(" / ") : "—";
		}
		const STATUS_KEYS = {
			pending: "task.status.pending",
			claimed: "task.status.claimed",
			running: "task.status.inProgress",
			in_progress: "task.status.inProgress",
			completed: "task.status.completed",
			failed: "task.status.failed",
			cancelled: "task.status.cancelled"
		};
		const KIND_KEYS = {
			work: "config.kind.work",
			requirements: "config.kind.requirements",
			implementation: "config.kind.implementation",
			verification: "config.kind.verification",
			review: "config.kind.review",
			repair: "config.kind.repair",
			integration: "config.kind.integration"
		};
		function statusLabel(status, t) {
			const key = STATUS_KEYS[status];
			return key === void 0 ? status : t(key);
		}
		function kindLabel(kind, t) {
			if (kind === void 0) return "";
			const key = KIND_KEYS[kind];
			return key === void 0 ? kind : t(key);
		}
		function TeamConfigPanel({ team, t }) {
			const completed = team.tasks.filter((task) => task.status === "completed").length;
			const facts = [
				{
					label: t("config.team"),
					value: team.name,
					sub: team.teamId
				},
				{
					label: t("config.phase"),
					value: team.halted === true ? t("config.halted") : t(team.phase === "staged" ? "config.phaseStaged" : "config.phaseRunning")
				},
				{
					label: t("config.members"),
					value: String(team.members.length)
				},
				{
					label: t("config.tasks"),
					value: `${completed}/${team.tasks.length}`
				}
			];
			return (0, react_jsx_runtime.jsxs)("section", {
				className: TeamConfigPanel_module_css_default.panel,
				"data-team-config": true,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamConfigPanel_module_css_default.facts,
						children: facts.map((fact) => (0, react_jsx_runtime.jsxs)("div", {
							className: TeamConfigPanel_module_css_default.fact,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamConfigPanel_module_css_default.label,
									children: fact.label
								}),
								(0, react_jsx_runtime.jsx)("strong", {
									className: TeamConfigPanel_module_css_default.value,
									children: fact.value
								}),
								fact.sub !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: TeamConfigPanel_module_css_default.sub,
									children: fact.sub
								})
							]
						}, fact.label))
					}),
					(0, react_jsx_runtime.jsx)("h3", {
						className: TeamConfigPanel_module_css_default.heading,
						children: t("config.members")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamConfigPanel_module_css_default.tableWrap,
						children: (0, react_jsx_runtime.jsxs)("table", {
							className: TeamConfigPanel_module_css_default.table,
							children: [(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("th", { children: t("config.name") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.role") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.model") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.effort") })
							] }) }), (0, react_jsx_runtime.jsx)("tbody", { children: team.members.map((member) => (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("td", { children: member.name }),
								(0, react_jsx_runtime.jsx)("td", { children: member.role }),
								(0, react_jsx_runtime.jsx)("td", {
									className: TeamConfigPanel_module_css_default.mono,
									children: memberRoute(member)
								}),
								(0, react_jsx_runtime.jsx)("td", { children: member.reasoningEffort ?? "—" })
							] }, member.id)) })]
						})
					}),
					(0, react_jsx_runtime.jsx)("h3", {
						className: TeamConfigPanel_module_css_default.heading,
						children: t("config.tasks")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: TeamConfigPanel_module_css_default.tableWrap,
						children: (0, react_jsx_runtime.jsxs)("table", {
							className: TeamConfigPanel_module_css_default.table,
							children: [(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("th", { children: t("config.task") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.assignee") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.status") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.deps") })
							] }) }), (0, react_jsx_runtime.jsx)("tbody", { children: team.tasks.map((task) => (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("td", { children: task.subject }),
								(0, react_jsx_runtime.jsx)("td", { children: task.assignee === "" ? t("config.unassigned") : task.assignee }),
								(0, react_jsx_runtime.jsx)("td", { children: task.kind === void 0 ? statusLabel(task.status, t) : `${kindLabel(task.kind, t)} · ${statusLabel(task.status, t)}` }),
								(0, react_jsx_runtime.jsx)("td", {
									className: TeamConfigPanel_module_css_default.mono,
									children: task.dependencies.length === 0 ? "—" : task.dependencies.join(", ")
								})
							] }, task.id)) })]
						})
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: TeamConfigPanel_module_css_default.hint,
						children: team.phase === "staged" ? t("config.stagedHint") : t("config.hint")
					})
				]
			});
		}
		//#endregion
		//#region lib/client/workspace-state.js
		function createWorkspaceState() {
			let snapshot = {
				statuses: /* @__PURE__ */ new Map(),
				history: /* @__PURE__ */ new Map(),
				selected: /* @__PURE__ */ new Map()
			};
			const listeners = /* @__PURE__ */ new Set();
			const publish = (next) => {
				snapshot = next;
				for (const listener of listeners) listener();
			};
			return {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				status(session, status) {
					if (snapshot.statuses.get(session) === status) return;
					publish({
						...snapshot,
						statuses: new Map(snapshot.statuses).set(session, status)
					});
				},
				select(session, team) {
					if (snapshot.selected.get(session) === team) return;
					publish({
						...snapshot,
						selected: new Map(snapshot.selected).set(session, team)
					});
				},
				remember(session, data) {
					const owner = data.captainSessionId || session;
					if (owner !== session) return;
					publish({
						...snapshot,
						history: new Map(snapshot.history).set(`${owner}:${data.teamId}`, {
							...data,
							captainSessionId: owner
						}),
						selected: new Map(snapshot.selected).set(owner, data.teamId)
					});
				}
			};
		}
		/** Records restored at mount never reopen a closed tab; new teams are announced once. */
		function createTeamDiscovery() {
			let restored = false;
			let known = /* @__PURE__ */ new Set();
			return (teams) => {
				const added = restored ? teams.find((team) => !known.has(team.teamId))?.teamId : void 0;
				known = new Set(teams.map((team) => team.teamId));
				restored = true;
				return added;
			};
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\WorkspaceActivity.module.css.mjs
		const css$1 = ".jROsYq_root{--dsw-alias-state-business-primary:light-dark(#2866d7,#82b4ff);height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 78%, var(--dsw-alias-bg-base));font-variant-numeric:tabular-nums;flex-direction:column;font-family:inherit;display:flex;overflow:hidden;container:jROsYq_team-workspace/inline-size}.jROsYq_content{box-sizing:border-box;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-secondary) 45%, transparent) transparent;flex:auto;width:100%;max-width:1400px;min-height:0;margin:0 auto;padding:10px 12px 12px;overflow:auto}.jROsYq_content::-webkit-scrollbar{width:9px;height:9px}.jROsYq_content::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 42%, transparent);border-radius:8px}.jROsYq_content::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 62%, transparent)}.jROsYq_content::-webkit-scrollbar-track{background:0 0}.jROsYq_splitter{cursor:row-resize;touch-action:none;flex:none;width:100%;max-width:1400px;height:9px;margin:0 auto;position:relative}.jROsYq_splitter:before{content:\"\";background:var(--dsw-alias-border-l2);height:1px;transition:background-color .12s,height .12s;position:absolute;top:4px;left:0;right:0}.jROsYq_splitter:hover:before,.jROsYq_splitter:active:before{background:var(--dsw-alias-state-business-primary);border-radius:2px;height:3px;top:3px}.jROsYq_officePane{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);flex:none;width:100%;max-width:1400px;height:clamp(200px,34vh,380px);margin:0 auto;padding:6px 12px 8px;overflow:hidden}.jROsYq_officeBar{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);flex:none;justify-content:flex-end;align-items:center;width:100%;max-width:1400px;margin:auto auto 0;padding:4px 12px;display:flex}.jROsYq_officeBarButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:center;gap:6px;padding:4px 10px;font-size:11px;font-weight:600;display:inline-flex}.jROsYq_officeBarButton:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-state-business-primary)}.jROsYq_heading{flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:8px;display:flex}.jROsYq_heading img{object-fit:contain;width:26px;height:26px}.jROsYq_heading h2{letter-spacing:-.4px;margin:0;font-size:15px;font-weight:650}.jROsYq_heading>span{color:var(--dsw-alias-label-secondary);font-size:11px}.jROsYq_viewTabs{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 65%, var(--dsw-alias-bg-base));border-radius:9px;gap:2px;width:fit-content;margin:0 0 0 auto;padding:2px;display:flex}.jROsYq_viewTabs button{color:var(--dsw-alias-label-secondary);background:0 0;border:none;border-radius:6px;padding:4px 11px;font-size:11px;font-weight:600}.jROsYq_viewTabs button:hover{color:var(--dsw-alias-label-primary)}.jROsYq_viewTabs button[aria-selected=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px #0000002e}.jROsYq_stagedNotice{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-direction:column;align-items:flex-start;gap:10px;padding:20px;display:flex}.jROsYq_stagedNotice h3{margin:0;font-size:15px;font-weight:650}.jROsYq_stagedNotice p{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.7}.jROsYq_stagedNotice button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:9px;padding:8px 14px;font-size:12px}.jROsYq_stagedNotice button:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_teamPicker{align-items:center;gap:6px;min-width:0;margin:0;display:inline-flex}.jROsYq_teamPickerCaption{color:var(--dsw-alias-label-secondary);white-space:nowrap;font-size:10px}.jROsYq_teamPickerSelect{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);max-width:230px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;padding:4px 8px;font-size:11px}.jROsYq_teamPickerSelect:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.jROsYq_root button{cursor:pointer;font-family:inherit}.jROsYq_empty button,.jROsYq_error button,.jROsYq_officeBarButton{color:inherit}.jROsYq_root button:active{transform:scale(.98)}.jROsYq_root button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}.jROsYq_empty{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:18px;padding:32px 24px}.jROsYq_emptyMark{width:44px;height:44px;color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent);border-radius:13px;place-items:center;font-size:26px;display:grid}.jROsYq_empty h3{margin:20px 0 10px;font-size:16px;font-weight:600}.jROsYq_empty p{max-width:45ch;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.8}.jROsYq_empty button,.jROsYq_error button{background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:9px 13px;font-size:12px}.jROsYq_empty button:hover,.jROsYq_error button:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_error{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, var(--dsw-alias-border-l2));background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-wrap:wrap;align-items:start;gap:12px;margin-bottom:18px;padding:14px;font-size:12px;line-height:1.65;display:flex}.jROsYq_error>span{flex:180px}.jROsYq_error button{flex:none}.jROsYq_skeleton{gap:14px;display:grid}.jROsYq_skeleton i{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:16px;height:130px;animation:1.8s ease-in-out infinite alternate jROsYq_breathe}.jROsYq_skeleton i:first-child{height:74px}.jROsYq_skeleton i:last-child{animation-delay:.3s}@keyframes jROsYq_breathe{to{opacity:.45}}@container jROsYq_team-workspace (width>=720px){.jROsYq_content{padding:24px 24px 32px}.jROsYq_heading{margin-bottom:24px}}@media (prefers-reduced-motion:reduce){.jROsYq_skeleton i{animation:none}.jROsYq_root button{transition:none}}";
		const tagId$1 = "agent-teams-pixel/WorkspaceActivity.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var WorkspaceActivity_module_css_default = {
			"breathe": "jROsYq_breathe",
			"content": "jROsYq_content",
			"empty": "jROsYq_empty",
			"emptyMark": "jROsYq_emptyMark",
			"error": "jROsYq_error",
			"heading": "jROsYq_heading",
			"officeBar": "jROsYq_officeBar",
			"officeBarButton": "jROsYq_officeBarButton",
			"officePane": "jROsYq_officePane",
			"root": "jROsYq_root",
			"skeleton": "jROsYq_skeleton",
			"splitter": "jROsYq_splitter",
			"stagedNotice": "jROsYq_stagedNotice",
			"team-workspace": "jROsYq_team-workspace",
			"teamPicker": "jROsYq_teamPicker",
			"teamPickerCaption": "jROsYq_teamPickerCaption",
			"teamPickerSelect": "jROsYq_teamPickerSelect",
			"viewTabs": "jROsYq_viewTabs"
		};
		//#endregion
		//#region lib/client/WorkspaceActivity.js
		/** Native workspace content; discovery remains mounted independently of tab lifetime. */
		const TEAM_TAB_KIND = "agent-teams";
		const TEAM_TAB_ID = "agent-teams-pixel/activity";
		/** Persisted workspace-tab preference: progress board vs setup page. */
		const WORKSPACE_VIEW_KEY = "agent-teams-pixel.workspaceView";
		/** Persisted pixel-office collapsed state (bottom bar when closed). */
		const OFFICE_OPEN_KEY = "agent-teams-pixel.officeOpen";
		/** Persisted pixel-office pane height (px); unset uses the CSS default. */
		const WORKSPACE_OFFICE_HEIGHT_KEY = "agent-teams-pixel.workspaceOfficeHeight";
		const OFFICE_MIN_HEIGHT = 140;
		/** Optional host integration is observable so installing/removing it also switches the fallback. */
		function createWorkspaceBridge() {
			let sidebar;
			const listeners = /* @__PURE__ */ new Set();
			return {
				getSnapshot: () => sidebar,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				set(value) {
					sidebar = value;
					for (const listener of listeners) listener();
				}
			};
		}
		function ActivitySurface({ bridge, state, ...props }) {
			const sidebar = (0, react.useSyncExternalStore)(bridge.subscribe, bridge.getSnapshot);
			return sidebar === void 0 ? (0, react_jsx_runtime.jsx)(ActivityPanel, { ...props }) : (0, react_jsx_runtime.jsx)(WorkspaceMonitor, {
				...props,
				sidebar,
				state
			});
		}
		function WorkspaceMonitor({ sessionsList, sidebar, state }) {
			const current = currentSessionId((0, react.useSyncExternalStore)(sessionsList.subscribe, sessionsList.getSnapshot));
			const targets = (0, react.useSyncExternalStore)(subscribeActivityMonitorTargets, getActivityMonitorTargetsSnapshot);
			const currentTargets = (0, react.useMemo)(() => targets.filter((target) => target.sessionId === current), [targets, current]);
			const discover = (0, react.useMemo)(() => createTeamDiscovery(), [current]);
			(0, react.useEffect)(() => {
				if (current === void 0) return;
				state.status(current, "loading");
				const controller = startActivityPolling(currentTargets, {
					discoverySessionId: current,
					onStatus(status) {
						state.status(current, status);
					},
					publishSnapshots(update) {
						updateActivitySnapshots(update);
						if (update.teams === void 0) return;
						const added = discover(update.teams.filter((team) => team.captainSessionId === current));
						if (added !== void 0 && sidebar.mounted.getSnapshot() === current && !sidebar.isExpanded()) {
							state.select(current, added);
							sidebar.openTab(TEAM_TAB_KIND);
						}
					}
				});
				return () => {
					controller.stop();
				};
			}, [
				current,
				currentTargets,
				discover,
				sidebar,
				state
			]);
			(0, react.useEffect)(() => {
				const open = (event) => {
					if (current === void 0 || sidebar.mounted.getSnapshot() !== current) return;
					const data = event.detail;
					if (data?.captainSessionId && data.captainSessionId !== current) return;
					if (data?.teamId) state.remember(current, data);
					sidebar.openTab(TEAM_TAB_KIND);
				};
				window.addEventListener(OPEN_PANEL_EVENT, open);
				return () => {
					window.removeEventListener(OPEN_PANEL_EVENT, open);
				};
			}, [
				current,
				sidebar,
				state
			]);
			return null;
		}
		function WorkspaceActivity({ sessionId, useTabInfo, t, state, modelDirectories, openMember }) {
			const { tab } = useTabInfo();
			const snapshots = (0, react.useSyncExternalStore)(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
			const local = (0, react.useSyncExternalStore)(state.subscribe, state.getSnapshot);
			const [retry, setRetry] = (0, react.useState)(0);
			const [view, setView] = (0, react.useState)(() => {
				if (typeof window === "undefined") return "board";
				try {
					return window.localStorage.getItem(WORKSPACE_VIEW_KEY) === "config" ? "config" : "board";
				} catch {
					return "board";
				}
			});
			const setWorkspaceView = (next) => {
				setView(next);
				try {
					window.localStorage.setItem(WORKSPACE_VIEW_KEY, next);
				} catch {}
			};
			const [officeOpen, setOfficeOpen] = (0, react.useState)(() => {
				if (typeof window === "undefined") return true;
				try {
					return window.localStorage.getItem(OFFICE_OPEN_KEY) !== "0";
				} catch {
					return true;
				}
			});
			const setOfficeOpenPersist = (next) => {
				setOfficeOpen(next);
				try {
					window.localStorage.setItem(OFFICE_OPEN_KEY, next ? "1" : "0");
				} catch {}
			};
			const containerRef = (0, react.useRef)(null);
			const officePaneRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const [officeHeight, setOfficeHeight] = (0, react.useState)(() => {
				if (typeof window === "undefined") return void 0;
				try {
					const raw = Number(window.localStorage.getItem(WORKSPACE_OFFICE_HEIGHT_KEY));
					return Number.isFinite(raw) && raw >= OFFICE_MIN_HEIGHT ? raw : void 0;
				} catch {
					return;
				}
			});
			const beginSplit = (event) => {
				const pane = officePaneRef.current;
				const container = containerRef.current;
				if (pane === null || container === null || event.button !== 0) return;
				event.preventDefault();
				dragRef.current = {
					startY: event.clientY,
					startHeight: pane.getBoundingClientRect().height
				};
				const move = (moveEvent) => {
					const drag = dragRef.current;
					if (drag === null) return;
					const containerHeight = container.getBoundingClientRect().height;
					const next = Math.min(Math.max(180, containerHeight - 180), Math.max(OFFICE_MIN_HEIGHT, drag.startHeight + (drag.startY - moveEvent.clientY)));
					setOfficeHeight(next);
				};
				const up = () => {
					window.removeEventListener("mousemove", move);
					window.removeEventListener("mouseup", up);
					dragRef.current = null;
					setOfficeHeight((value) => {
						if (value !== void 0) try {
							window.localStorage.setItem(WORKSPACE_OFFICE_HEIGHT_KEY, String(Math.round(value)));
						} catch {}
						return value;
					});
				};
				window.addEventListener("mousemove", move);
				window.addEventListener("mouseup", up);
			};
			const live = snapshots.teams.filter((team) => team.captainSessionId === sessionId);
			const archived = snapshots.archivedTeams.filter((team) => team.captainSessionId === sessionId && !live.some((item) => item.teamId === team.teamId));
			const historic = [...local.history.values()].filter((team) => team.captainSessionId === sessionId && !live.some((item) => item.teamId === team.teamId) && !archived.some((item) => item.teamId === team.teamId)).map((team) => historicCardTeam(team, sessionId));
			const records = [
				...live,
				...archived,
				...historic
			];
			const selected = records.find((team) => team.teamId === local.selected.get(sessionId)) ?? records[0];
			const history = selected !== void 0 && !live.includes(selected);
			const status = local.statuses.get(sessionId) ?? "loading";
			const lastTeamRef = (0, react.useRef)(void 0);
			const lastPhaseRef = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (selected === void 0 || !live.includes(selected)) return;
				if (lastTeamRef.current !== selected.teamId) {
					if (selected.phase === "staged") setWorkspaceView("config");
				} else if (lastPhaseRef.current === "staged" && selected.phase === "running") setWorkspaceView("board");
				lastTeamRef.current = selected.teamId;
				lastPhaseRef.current = selected.phase;
			}, [selected?.teamId, selected?.phase]);
			(0, react.useEffect)(() => {
				if (retry === 0 || !tab.visible) return;
				const controller = startActivityPolling([], {
					discoverySessionId: sessionId,
					onStatus: (value) => state.status(sessionId, value)
				});
				controller.firstTick.finally(() => {
					controller.stop();
				});
				return () => {
					controller.stop();
				};
			}, [
				retry,
				sessionId,
				state,
				tab.visible
			]);
			const backToChat = () => {
				tab.actions.close();
				requestAnimationFrame(() => document.querySelector("[data-composer-card] [contenteditable=\"true\"][role=\"textbox\"], [data-composer-card] textarea")?.focus());
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: containerRef,
				className: WorkspaceActivity_module_css_default.root,
				"data-agent-teams-workspace": true,
				"data-session-id": sessionId,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: WorkspaceActivity_module_css_default.content,
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: WorkspaceActivity_module_css_default.heading,
							children: [
								(0, react_jsx_runtime.jsx)("img", {
									src: LEAD_ART,
									alt: "",
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("h2", { children: t("app.title") }),
								(0, react_jsx_runtime.jsx)("span", { children: t("workspace.title") }),
								records.length > 0 && (0, react_jsx_runtime.jsxs)("label", {
									className: WorkspaceActivity_module_css_default.teamPicker,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: WorkspaceActivity_module_css_default.teamPickerCaption,
										children: t("workspace.switchTeam")
									}), (0, react_jsx_runtime.jsx)("select", {
										className: WorkspaceActivity_module_css_default.teamPickerSelect,
										value: selected?.teamId ?? "",
										"aria-label": t("workspace.switchTeam"),
										"data-control": "team-picker",
										onChange: (event) => {
											state.select(sessionId, event.target.value);
										},
										children: records.map((team) => (0, react_jsx_runtime.jsx)("option", {
											value: team.teamId,
											children: live.includes(team) ? team.name : `${team.name} · ${t("workspace.history")}`
										}, team.teamId))
									})]
								}),
								selected !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
									className: WorkspaceActivity_module_css_default.viewTabs,
									role: "tablist",
									"data-control": "workspace-views",
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										role: "tab",
										"aria-selected": view === "board",
										"data-view": "board",
										onClick: () => {
											setWorkspaceView("board");
										},
										children: t("workspace.tabBoard")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										role: "tab",
										"aria-selected": view === "config",
										"data-view": "config",
										onClick: () => {
											setWorkspaceView("config");
										},
										children: t("workspace.tabConfig")
									})]
								})
							]
						}),
						status === "error" && (0, react_jsx_runtime.jsxs)("div", {
							className: WorkspaceActivity_module_css_default.error,
							role: "alert",
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("workspace.error") }), (0, react_jsx_runtime.jsx)("button", {
								onClick: () => setRetry((value) => value + 1),
								children: t("workspace.retry")
							})]
						}),
						selected === void 0 ? status === "loading" ? (0, react_jsx_runtime.jsxs)("div", {
							className: WorkspaceActivity_module_css_default.skeleton,
							role: "status",
							"aria-label": t("workspace.loading"),
							children: [
								(0, react_jsx_runtime.jsx)("i", {}),
								(0, react_jsx_runtime.jsx)("i", {}),
								(0, react_jsx_runtime.jsx)("i", {})
							]
						}) : (0, react_jsx_runtime.jsxs)("section", {
							className: WorkspaceActivity_module_css_default.empty,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: WorkspaceActivity_module_css_default.emptyMark,
									"aria-hidden": true,
									children: "↳"
								}),
								(0, react_jsx_runtime.jsx)("h3", { children: t("workspace.emptyTitle") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("workspace.emptyBody") }),
								(0, react_jsx_runtime.jsx)("button", {
									onClick: backToChat,
									children: t("workspace.back")
								})
							]
						}) : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: view === "config" ? live.includes(selected) && selected.phase === "staged" ? (0, react_jsx_runtime.jsx)(StagingPlanEditor, {
							team: selected,
							modelDirectory: modelDirectories.directoryFor(sessionId),
							onContinuePlanning: backToChat,
							onDiscarded: backToChat,
							t
						}) : (0, react_jsx_runtime.jsx)(TeamConfigPanel, {
							team: selected,
							t
						}) : live.includes(selected) && selected.phase === "staged" ? (0, react_jsx_runtime.jsxs)("section", {
							className: WorkspaceActivity_module_css_default.stagedNotice,
							"data-staged-notice": true,
							children: [
								(0, react_jsx_runtime.jsx)("h3", { children: t("config.stagedTitle") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("config.stagedBody") }),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setWorkspaceView("config");
									},
									children: t("config.openConfig")
								})
							]
						}) : (0, react_jsx_runtime.jsx)(TeamSection, {
							team: selected,
							workspace: true,
							historic: history,
							modelDirectory: selected.phase === "staged" ? modelDirectories.directoryFor(sessionId) : void 0,
							onContinuePlanning: backToChat,
							onDiscarded: backToChat,
							onNavigate: openMember,
							t
						}, `${sessionId}:${selected.teamId}`) })
					]
				}), selected !== void 0 && live.includes(selected) && (officeOpen ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
					className: WorkspaceActivity_module_css_default.splitter,
					"data-control": "office-splitter",
					role: "separator",
					"aria-orientation": "horizontal",
					"aria-label": t("office.resize"),
					title: t("office.resize"),
					onMouseDown: beginSplit
				}), (0, react_jsx_runtime.jsx)("section", {
					ref: officePaneRef,
					className: WorkspaceActivity_module_css_default.officePane,
					"data-office-pane": true,
					"aria-label": t("office.title"),
					style: officeHeight === void 0 ? void 0 : {
						height: `${Math.round(officeHeight)}px`,
						flex: "0 0 auto"
					},
					children: (0, react_jsx_runtime.jsx)(PixelOffice, {
						team: selected,
						t,
						onCollapse: () => {
							setOfficeOpenPersist(false);
						},
						onOpenMember: (memberId) => {
							openMember(selected.captainSessionId, memberId);
						}
					})
				})] }) : (0, react_jsx_runtime.jsx)("div", {
					className: WorkspaceActivity_module_css_default.officeBar,
					children: (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: WorkspaceActivity_module_css_default.officeBarButton,
						"data-control": "office-expand",
						"aria-label": t("office.expand"),
						title: t("office.expand"),
						onClick: () => {
							setOfficeOpenPersist(true);
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: "⛩"
						}), t("office.expand")]
					})
				}))]
			});
		}
		//#endregion
		//#region lib/client/agent-teams-card-definition.js
		/**
		* AgentTeams conversation card: a lightweight in-conversation summary shown
		* when a team is created — the captain's name, the member roster with whale
		* avatars, and an entry point that re-activates the top-right activity
		* panel (useful after the floater was closed, or when re-opening an old
		* session for review).
		*
		* The fold anchors to the Harness's durable `tool/call` + `tool/result`
		* records for `agent_teams_create`. Those are first-party session events, so
		* the card survives restarts without writing an out-of-repo event type.
		* @module dsh-agent-teams/client/card
		*/
		/**
		* Fold a team name the way the host's `sanitizeKey` does, minus the host's
		* digest fallback. The host keeps Unicode letters and digits, so an ASCII-only
		* client derivation turned every CJK name into the shared `team` key and the
		* card could never match its live team (issue #203). Names with no letters or
		* digits at all, and names longer than the host's key limit, still need the
		* host's canonical id; the create result now carries it.
		* @param name - the create call's team name.
		* @returns the host-shaped key for the name.
		*/
		function teamKeyFromName(name) {
			const cleaned = name.normalize("NFC").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
			return cleaned === "" ? "team" : cleaned;
		}
		/** Parse the only create-call fields the historic card owns. */
		function parseAgentTeamsCreateArgs(value) {
			try {
				const parsed = JSON.parse(value);
				if (typeof parsed !== "object" || parsed === null || !("name" in parsed) || typeof parsed.name !== "string") return;
				const name = parsed.name.trim();
				if (name === "") return void 0;
				return {
					teamId: teamKeyFromName(name),
					name
				};
			} catch {
				return;
			}
		}
		/**
		* Read the canonical identity the host attaches to the `agent_teams_create`
		* result. Records written before the host published it carry no metadata, so
		* an absent or malformed payload falls back to the client derivation.
		* @param meta - the durable `tool/result` metadata payload, if any.
		* @returns the canonical identity, or `undefined` when the host published none.
		*/
		function parseAgentTeamsCreateResult(meta) {
			if (typeof meta !== "object" || meta === null) return void 0;
			const record = meta;
			const teamId = typeof record.team_id === "string" ? record.team_id.trim() : "";
			if (teamId === "") return void 0;
			const captainSessionId = typeof record.captain_session_id === "string" ? record.captain_session_id.trim() : "";
			const members = [];
			if (Array.isArray(record.members)) for (const entry of record.members) {
				if (typeof entry !== "object" || entry === null) continue;
				const member = entry;
				const name = typeof member.name === "string" ? member.name : "";
				if (name === "") continue;
				members.push({
					id: typeof member.id === "string" ? member.id : "",
					name,
					role: typeof member.role === "string" ? member.role : ""
				});
			}
			return {
				teamId,
				captainSessionId,
				members
			};
		}
		/**
		* Read the canonical team id out of a `tool/result` recorded before the host
		* published {@link parseAgentTeamsCreateResult}'s metadata. Both historic
		* renderings carry it and have been stable since they were introduced:
		* `Team "<name>" created (id <canonical>) under <state_dir>. You are the
		* captain.` and the staged `Team "<name>" plan created under <state_dir>. It is
		* staged: …`, whose `state_dir` ends in the canonical id. This is the only
		* legacy path for names the client cannot re-derive (host digest fallback,
		* over-long names). Matches are taken right-to-left because the team name sits
		* in front of the canonical segment and may itself contain a look-alike.
		* @param text - the concatenated text blocks of one successful create result.
		* @returns the canonical id, or `undefined` when the text carries none.
		*/
		function teamIdFromCreateResultText(text) {
			const created = [...text.matchAll(/" created \(id ([^()\s]+)\) under /gu)].at(-1)?.[1];
			if (created !== void 0 && created !== "") return created;
			const stagedPath = [...text.matchAll(/plan created under (.+?)\. It is staged: /gu)].at(-1)?.[1];
			if (stagedPath === void 0) return void 0;
			const segment = stagedPath.split(/[\\/]/u).filter((part) => part !== "").at(-1);
			return segment === void 0 || segment === "" ? void 0 : segment;
		}
		/** Durable first-party tool events folded into one keyed Chat node. */
		const agentTeamsCardDefinition = {
			kind: "agent-teams",
			target: "chat",
			match: (event) => {
				if (event.type === "tool/call" && event.data.name === "agent_teams_create") return parseAgentTeamsCreateArgs(event.data.arguments) === void 0 ? null : {
					id: String(event.data.callId),
					role: "start"
				};
				if (event.type === "tool/result" && event.data.message.source.kind === "tool") return {
					id: String(event.data.message.source.callId),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "tool/call") throw new Error("agent-teams card start requires agent_teams_create tool/call");
				const parsed = parseAgentTeamsCreateArgs(match.event.data.arguments);
				if (parsed === void 0) throw new Error("agent-teams card start requires valid create arguments");
				return {
					...parsed,
					accepted: false,
					captainSessionId: "",
					members: []
				};
			},
			update: (context, match) => {
				if (match.event.type !== "tool/result") return context.state;
				if (match.event.data.error !== void 0 || toolResultFailed(match.event.data.message)) return context.state;
				const canonical = parseAgentTeamsCreateResult(match.event.data.meta);
				const legacyId = canonical === void 0 ? teamIdFromCreateResultText(resultText(match.event.data.message)) : void 0;
				if (canonical === void 0 && legacyId === void 0) return {
					...context.state,
					accepted: true
				};
				return {
					...context.state,
					accepted: true,
					teamId: canonical?.teamId ?? legacyId ?? context.state.teamId,
					captainSessionId: canonical?.captainSessionId ?? "",
					members: canonical?.members ?? []
				};
			},
			buildViewNode: (context) => {
				if (context.start === void 0) return null;
				const state = context.state;
				if (!state.accepted) return null;
				return {
					key: context.key,
					kind: "agent-teams",
					id: context.id,
					target: "chat",
					anchorSeq: context.start.event.seq,
					location: context.start.location,
					visibility: "visible",
					data: {
						teamId: state.teamId,
						captainSessionId: state.captainSessionId,
						teamName: state.name,
						members: state.members
					}
				};
			}
		};
		/** Concatenate the text blocks of one durable tool-result message. */
		function resultText(message) {
			return message.content.filter((block) => typeof block === "object" && block !== null && "type" in block && block.type === "text" && "text" in block && typeof block.text === "string").map((block) => block.text).join("\n");
		}
		/** V4 tool-role results carry isError directly; older logs nest tool-result blocks. */
		function toolResultFailed(message) {
			return message.isError === true || message.content.some((block) => typeof block === "object" && block !== null && "type" in block && block.type === "tool-result" && "isError" in block && block.isError === true);
		}
		/** Keep summaries tied to the create turn, including multiple teams in one turn. */
		function teamCardsForTurn(nodes, turn) {
			return [...nodes].filter((node) => node.kind === "agent-teams" && (node.location.kind === "turn" || node.location.kind === "step") && node.location.turn.turn === turn);
		}
		//#endregion
		//#region lib/client/TeamChatEntry.js
		/** Session-owned entry points: a persistent title action and a durable turn card. */
		function TeamChatEntry({ sessionId, t }) {
			const { teams, archivedTeams } = (0, react.useSyncExternalStore)(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
			const team = [...teams, ...archivedTeams].find((team) => team.captainSessionId === sessionId);
			if (!team) return null;
			return (0, react_jsx_runtime.jsxs)("button", {
				className: AgentTeamsCard_module_css_default.chatEntry,
				"data-team-chat-entry": true,
				type: "button",
				title: t("workspace.focus"),
				onClick: () => openActivityPanel({
					teamId: team.teamId,
					captainSessionId: sessionId,
					teamName: team.name,
					members: team.members
				}),
				children: [(0, react_jsx_runtime.jsx)("img", {
					src: LEAD_ART,
					alt: "",
					"aria-hidden": true
				}), t("workspace.focus")]
			});
		}
		function TeamTurnCard({ sessionId, turn, useChat, t, openMember }) {
			const cards = teamCardsForTurn(useChat((snapshot) => snapshot.nodes).values(), turn.turn);
			if (turn.status !== "closed" || cards.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: AgentTeamsCard_module_css_default.turnCards,
				"data-team-turn-cards": true,
				children: cards.map((node) => (0, react_jsx_runtime.jsx)(AgentTeamsSummary, {
					data: node.data,
					sessionId,
					t,
					openMember
				}, node.key))
			});
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\QuickStartDialog.module.css.mjs
		const css = "﻿ .N5ZfSa_entry{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap;border-radius:8px;align-items:center;gap:4px;padding:0 9px;font-size:12px;font-weight:600;display:inline-flex}.N5ZfSa_entry:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_actions{justify-content:flex-end;gap:8px;display:flex}.N5ZfSa_form{flex-direction:column;gap:12px;display:flex}.N5ZfSa_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.6}.N5ZfSa_field{flex-direction:column;gap:6px;font-size:12px;display:flex}.N5ZfSa_field>span{color:var(--dsw-alias-label-secondary)}.N5ZfSa_field textarea,.N5ZfSa_field input,.N5ZfSa_field select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);font:inherit;box-sizing:border-box;border-radius:8px;padding:8px 9px}.N5ZfSa_field textarea{resize:vertical}.N5ZfSa_error{color:var(--dsw-alias-state-error-primary,#ef6b6b);margin:0;font-size:12px}.N5ZfSa_success{color:var(--dsw-alias-state-success-primary,#3fbf9a);margin:0;font-size:12px}.N5ZfSa_multi{position:relative}.N5ZfSa_multiTrigger{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;min-height:34px;color:var(--dsw-alias-label-primary);font:inherit;box-sizing:border-box;text-align:left;cursor:pointer;border-radius:8px;align-items:center;gap:6px;padding:5px 9px;font-size:12px;display:flex}.N5ZfSa_multiTrigger:hover{border-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_chips{flex-wrap:wrap;flex:1;gap:4px;min-width:0;display:flex}.N5ZfSa_chip{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#5b8def) 14%, transparent);color:var(--dsw-alias-state-business-primary,#5b8def);border-radius:999px;padding:1px 7px;font-size:11px}.N5ZfSa_placeholder{color:var(--dsw-alias-label-secondary);font-size:12px}.N5ZfSa_caret{color:var(--dsw-alias-label-secondary);margin-left:auto;font-size:10px}.N5ZfSa_multiPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:10px;max-height:200px;margin-top:4px;padding:6px;position:static;overflow:auto;box-shadow:0 8px 22px #00000059}.N5ZfSa_option{cursor:pointer;border-radius:6px;align-items:center;gap:8px;padding:4px 6px;font-size:12px;display:flex}.N5ZfSa_option:hover{background:var(--dsw-alias-bg-layer-1)}.N5ZfSa_option input{accent-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_customRow{border-top:1px solid var(--dsw-alias-border-l2);gap:6px;margin-top:4px;padding:6px 4px 2px;display:flex}.N5ZfSa_customRow input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;flex:1;padding:6px 8px;font-size:12px}.N5ZfSa_customRow button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:7px;padding:6px 10px;font-size:12px}.N5ZfSa_customRow button:disabled{opacity:.5;cursor:default}.N5ZfSa_templateDesc{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}.N5ZfSa_option{flex-wrap:wrap}.N5ZfSa_optionName{font-weight:600}.N5ZfSa_optionId{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px}.N5ZfSa_optionAbility{color:var(--dsw-alias-label-secondary);flex-basis:100%;padding-left:22px;font-size:10px}.N5ZfSa_replaceRow{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warning-primary) 40%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-warning-primary) 8%, transparent);border-radius:8px;flex-wrap:wrap;align-items:center;gap:8px;margin:0;padding:8px 10px;font-size:11px;display:flex}.N5ZfSa_replaceRow button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:7px;padding:5px 10px;font-size:11px}.N5ZfSa_templates{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;max-height:200px;padding:2px;display:grid;overflow:auto}.N5ZfSa_templateCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;border-radius:8px;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 9px;display:flex}.N5ZfSa_templateCard:hover{border-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_templateCard[aria-checked=true]{border-color:var(--dsw-alias-state-business-primary,#5b8def);background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#5b8def) 12%, var(--dsw-alias-bg-layer-1))}.N5ZfSa_templateName{font-size:12px;font-weight:650}.N5ZfSa_templateCard .N5ZfSa_templateDesc{color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.45}";
		const tagId = "agent-teams-pixel/QuickStartDialog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var QuickStartDialog_module_css_default = {
			"actions": "N5ZfSa_actions",
			"caret": "N5ZfSa_caret",
			"chip": "N5ZfSa_chip",
			"chips": "N5ZfSa_chips",
			"customRow": "N5ZfSa_customRow",
			"entry": "N5ZfSa_entry",
			"error": "N5ZfSa_error",
			"field": "N5ZfSa_field",
			"form": "N5ZfSa_form",
			"hint": "N5ZfSa_hint",
			"multi": "N5ZfSa_multi",
			"multiPanel": "N5ZfSa_multiPanel",
			"multiTrigger": "N5ZfSa_multiTrigger",
			"option": "N5ZfSa_option",
			"optionAbility": "N5ZfSa_optionAbility",
			"optionId": "N5ZfSa_optionId",
			"optionName": "N5ZfSa_optionName",
			"placeholder": "N5ZfSa_placeholder",
			"replaceRow": "N5ZfSa_replaceRow",
			"success": "N5ZfSa_success",
			"templateCard": "N5ZfSa_templateCard",
			"templateDesc": "N5ZfSa_templateDesc",
			"templateName": "N5ZfSa_templateName",
			"templates": "N5ZfSa_templates"
		};
		//#endregion
		//#region lib/client/QuickStartDialog.js
		/** Click-to-dispatch entry: a header button that stages a plan from a small form. */
		const TEMPLATES = [
			{
				id: "fix",
				labelKey: "quickstart.tplFix",
				descKey: "quickstart.desc.fix",
				roles: [
					"implementer",
					"verifier",
					"reviewer"
				]
			},
			{
				id: "feat",
				labelKey: "quickstart.tplFeat",
				descKey: "quickstart.desc.feat",
				roles: [
					"planner",
					"implementer",
					"verifier",
					"reviewer"
				]
			},
			{
				id: "research",
				labelKey: "quickstart.tplResearch",
				descKey: "quickstart.desc.research",
				roles: [
					"researcher",
					"analyst",
					"writer",
					"reviewer"
				]
			},
			{
				id: "audit",
				labelKey: "quickstart.tplAudit",
				descKey: "quickstart.desc.audit",
				roles: ["auditor", "reviewer"]
			},
			{
				id: "build",
				labelKey: "quickstart.tplBuild",
				descKey: "quickstart.desc.build",
				roles: [
					"implementer",
					"verifier",
					"operator"
				]
			},
			{
				id: "array",
				labelKey: "quickstart.tplArray",
				descKey: "quickstart.desc.array",
				roles: [
					"architect",
					"implementer",
					"verifier",
					"reviewer"
				]
			},
			{
				id: "docs",
				labelKey: "quickstart.tplDocs",
				descKey: "quickstart.desc.docs",
				roles: [
					"writer",
					"documenter",
					"reviewer"
				]
			},
			{
				id: "debate",
				labelKey: "quickstart.tplDebate",
				descKey: "quickstart.desc.debate",
				roles: [
					"researcher",
					"analyst",
					"reviewer"
				]
			}
		];
		const ROLE_META = [
			{
				id: "planner",
				nameKey: "role.planner.name",
				abilityKey: "role.planner.ability"
			},
			{
				id: "implementer",
				nameKey: "role.implementer.name",
				abilityKey: "role.implementer.ability"
			},
			{
				id: "verifier",
				nameKey: "role.verifier.name",
				abilityKey: "role.verifier.ability"
			},
			{
				id: "reviewer",
				nameKey: "role.reviewer.name",
				abilityKey: "role.reviewer.ability"
			},
			{
				id: "researcher",
				nameKey: "role.researcher.name",
				abilityKey: "role.researcher.ability"
			},
			{
				id: "analyst",
				nameKey: "role.analyst.name",
				abilityKey: "role.analyst.ability"
			},
			{
				id: "writer",
				nameKey: "role.writer.name",
				abilityKey: "role.writer.ability"
			},
			{
				id: "auditor",
				nameKey: "role.auditor.name",
				abilityKey: "role.auditor.ability"
			},
			{
				id: "architect",
				nameKey: "role.architect.name",
				abilityKey: "role.architect.ability"
			},
			{
				id: "tester",
				nameKey: "role.tester.name",
				abilityKey: "role.tester.ability"
			},
			{
				id: "documenter",
				nameKey: "role.documenter.name",
				abilityKey: "role.documenter.ability"
			},
			{
				id: "operator",
				nameKey: "role.operator.name",
				abilityKey: "role.operator.ability"
			}
		];
		function templateOf(id) {
			return TEMPLATES.find((entry) => entry.id === id) ?? TEMPLATES[0];
		}
		function TeamQuickStart({ sessionId, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [goal, setGoal] = (0, react.useState)("");
			const [template, setTemplate] = (0, react.useState)(TEMPLATES[0]?.id ?? "fix");
			const [roles, setRoles] = (0, react.useState)([...TEMPLATES[0]?.roles ?? []]);
			const [customRole, setCustomRole] = (0, react.useState)("");
			const [rolesOpen, setRolesOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [blocked, setBlocked] = (0, react.useState)(false);
			const [created, setCreated] = (0, react.useState)();
			const multiRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!rolesOpen) return;
				const onPointerDown = (event) => {
					if (multiRef.current === null) return;
					if (!multiRef.current.contains(event.target)) setRolesOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown);
				};
			}, [rolesOpen]);
			const reset = () => {
				setGoal("");
				setError("");
				setBlocked(false);
				setCreated(void 0);
				setBusy(false);
				setRolesOpen(false);
			};
			const chooseTemplate = (id) => {
				setTemplate(id);
				setRoles([...templateOf(id).roles]);
			};
			const toggleRole = (role) => {
				setRoles((current) => current.includes(role) ? current.filter((entry) => entry !== role) : [...current, role]);
			};
			const roleName = (id) => {
				const meta = ROLE_META.find((entry) => entry.id === id);
				return meta === void 0 ? id : t(meta.nameKey);
			};
			const addCustomRole = () => {
				const trimmed = customRole.trim();
				if (trimmed === "") return;
				setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed]);
				setCustomRole("");
			};
			const submit = async (replace) => {
				const trimmed = goal.trim();
				if (trimmed === "") {
					setError(t("quickstart.goalRequired"));
					return;
				}
				setBusy(true);
				setError("");
				try {
					const response = await fetch("/plugins/dsh-agent-teams/quick-start", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							sessionId,
							goal: trimmed,
							template,
							roles,
							replace
						})
					});
					const body = await response.json().catch(() => null);
					if (!response.ok || body?.ok !== true) {
						const raw = body?.error ?? `HTTP ${response.status}`;
						const existing = /already lead team/i.test(raw);
						setBlocked(existing);
						throw new Error(existing ? t("quickstart.teamExists") : raw);
					}
					setCreated(body.teamId ?? "");
					setGoal("");
					window.setTimeout(() => {
						setOpen(false);
						reset();
					}, 1400);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: QuickStartDialog_module_css_default.entry,
				"data-quick-start-entry": true,
				title: t("quickstart.entryTitle"),
				onClick: () => {
					setOpen(true);
					setError("");
					setBlocked(false);
					setCreated(void 0);
				},
				children: [(0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: "⛩"
				}), t("quickstart.entry")]
			}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: () => {
					if (!busy) {
						setOpen(false);
						reset();
					}
				},
				title: t("quickstart.title"),
				closeLabel: t("quickstart.cancel"),
				footer: (0, react_jsx_runtime.jsxs)("span", {
					className: QuickStartDialog_module_css_default.actions,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => {
							setOpen(false);
							reset();
						},
						children: t("quickstart.cancel")
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						"data-primary": true,
						onClick: () => {
							submit(false);
						},
						children: busy ? t("quickstart.busy") : t("quickstart.submit")
					})]
				}),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: QuickStartDialog_module_css_default.form,
					children: [
						(0, react_jsx_runtime.jsx)("p", {
							className: QuickStartDialog_module_css_default.hint,
							children: t("quickstart.desc")
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: QuickStartDialog_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.template") }), (0, react_jsx_runtime.jsx)("div", {
								className: QuickStartDialog_module_css_default.templates,
								role: "radiogroup",
								"aria-label": t("quickstart.template"),
								children: TEMPLATES.map((entry) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "radio",
									"aria-checked": template === entry.id,
									className: QuickStartDialog_module_css_default.templateCard,
									"data-template": entry.id,
									disabled: busy,
									onClick: () => {
										chooseTemplate(entry.id);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: QuickStartDialog_module_css_default.templateName,
										children: t(entry.labelKey)
									}), (0, react_jsx_runtime.jsx)("span", {
										className: QuickStartDialog_module_css_default.templateDesc,
										children: t(entry.descKey)
									})]
								}, entry.id))
							})]
						}),
						(0, react_jsx_runtime.jsxs)("label", {
							className: QuickStartDialog_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.goal") }), (0, react_jsx_runtime.jsx)("textarea", {
								value: goal,
								rows: 3,
								autoFocus: true,
								disabled: busy,
								placeholder: t("quickstart.goalPlaceholder"),
								onChange: (event) => {
									setGoal(event.target.value);
								}
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: QuickStartDialog_module_css_default.field,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.roles") }), (0, react_jsx_runtime.jsxs)("div", {
								className: QuickStartDialog_module_css_default.multi,
								ref: multiRef,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: QuickStartDialog_module_css_default.multiTrigger,
									"data-control": "quickstart-roles",
									"aria-expanded": rolesOpen,
									"aria-haspopup": "listbox",
									disabled: busy,
									onClick: () => {
										setRolesOpen((current) => !current);
									},
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: QuickStartDialog_module_css_default.chips,
										children: roles.length === 0 ? (0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.placeholder,
											children: t("quickstart.rolesEmpty")
										}) : roles.map((role) => (0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.chip,
											children: roleName(role)
										}, role))
									}), (0, react_jsx_runtime.jsx)("span", {
										className: QuickStartDialog_module_css_default.caret,
										"aria-hidden": true,
										children: "▾"
									})]
								}), rolesOpen && (0, react_jsx_runtime.jsxs)("div", {
									className: QuickStartDialog_module_css_default.multiPanel,
									role: "listbox",
									"aria-multiselectable": "true",
									"aria-label": t("quickstart.roles"),
									children: [ROLE_META.map((meta) => (0, react_jsx_runtime.jsxs)("label", {
										className: QuickStartDialog_module_css_default.option,
										children: [
											(0, react_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: roles.includes(meta.id),
												onChange: () => {
													toggleRole(meta.id);
												}
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: QuickStartDialog_module_css_default.optionName,
												children: t(meta.nameKey)
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: QuickStartDialog_module_css_default.optionId,
												children: meta.id
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: QuickStartDialog_module_css_default.optionAbility,
												children: t(meta.abilityKey)
											})
										]
									}, meta.id)), (0, react_jsx_runtime.jsxs)("div", {
										className: QuickStartDialog_module_css_default.customRow,
										children: [(0, react_jsx_runtime.jsx)("input", {
											value: customRole,
											placeholder: t("quickstart.customRole"),
											onChange: (event) => {
												setCustomRole(event.target.value);
											},
											onKeyDown: (event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													addCustomRole();
												}
											}
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: customRole.trim() === "",
											onClick: addCustomRole,
											children: t("quickstart.addRole")
										})]
									})]
								})]
							})]
						}),
						error !== "" && (0, react_jsx_runtime.jsx)("p", {
							className: QuickStartDialog_module_css_default.error,
							role: "alert",
							children: error
						}),
						blocked && (0, react_jsx_runtime.jsxs)("p", {
							className: QuickStartDialog_module_css_default.replaceRow,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.replaceHint") }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => {
									submit(true);
								},
								children: t("quickstart.replace")
							})]
						}),
						created !== void 0 && (0, react_jsx_runtime.jsx)("p", {
							className: QuickStartDialog_module_css_default.success,
							role: "status",
							children: t("quickstart.created", { team: created })
						})
					]
				})
			})] });
		}
		//#endregion
		//#region lib/client/locales.js
		/** `agentTeams` namespace dictionaries for every plugin-owned Web surface. */
		/** Dictionary namespace owned by the AgentTeams client plugin. */
		const AGENT_TEAMS_LOCALE_NAMESPACE = "agentTeams";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"workspace.dependencies": "从左到右：完成前置后解锁 · 点击查看详情",
			"workspace.title": "宗门协作",
			"workspace.guide": "查看成员分工、任务依赖与执行进度",
			"workspace.eyebrow": "AGENT TEAMS",
			"workspace.description": "队长统筹分工，成员按任务依赖并行协作。",
			"workspace.relationships": "队长协调成员分工；任务连线表示前置依赖。点击任务可定位负责成员。",
			"workspace.emptyTitle": "当前会话还没有团队",
			"workspace.emptyBody": "在聊天中使用 /agent-teams 描述目标，确认计划后即可在这里查看协作进度。",
			"workspace.loading": "正在读取团队状态",
			"workspace.error": "暂时无法连接团队服务，正在自动重试。已加载的状态可能不是最新。",
			"workspace.retry": "重新连接",
			"workspace.current": "当前团队",
			"workspace.history": "历史记录",
			"workspace.back": "返回对话",
			"workspace.tasks": "项任务",
			"workspace.members": "名成员",
			"workspace.completed": "已完成",
			"workspace.focus": "查看宗门",
			"workspace.noTasks": "等待队长拆解任务",
			"workspace.inbox": "队长收件箱",
			"workspace.inboxHint": "最近 5 条未读消息",
			"workspace.inboxEmpty": "暂无未读消息。成员回报会在这里显示，队长读取后移出。",
			"workspace.taskSummary": "任务完成情况",
			"workspace.verdictStale": "结论已过期",
			"card.memberCount": "{count} 名成员",
			"action.openActivityPanel": "打开活动面板",
			"activity.panelButton": "活动面板",
			"activity.badgeAria": "AgentTeams 活动与历史，{count} 条团队记录",
			"activity.panelAria": "AgentTeams 活动面板",
			"activity.title": "AgentTeams 活动",
			"activity.float": "切换为浮动面板",
			"activity.dockRight": "停靠到右侧",
			"activity.collapse": "收起活动面板",
			"activity.empty": "暂无团队活动",
			"team.stop": "停止团队",
			"team.stopped": "已停止",
			"team.stopTitle": "确认停止“{team}”？",
			"team.stopDescription": "将取消 {tasks} 项未完成任务，并停止 {members} 名正在工作的成员。已完成的结果会保留。",
			"team.stopCancel": "继续运行",
			"team.stopConfirm": "确认停止",
			"team.stopping": "正在停止…",
			"team.stopFailed": "停止失败：{message}",
			"team.stopRequestFailed": "服务器未能停止团队，请重试",
			"team.discarded": "已放弃",
			"format.listSeparator": "、",
			"task.status.pending": "待领取",
			"task.status.claimed": "已认领",
			"task.status.inProgress": "进行中",
			"task.status.completed": "已完成",
			"task.status.failed": "失败",
			"task.status.cancelled": "已取消",
			"task.status.notRun": "未执行",
			"member.state.working": "工作中",
			"member.state.failed": "有失败",
			"member.state.waiting": "等待",
			"member.state.delivered": "已交付",
			"member.state.left": "已离队",
			"member.state.removed": "已移除",
			"member.state.pending": "待执行",
			"member.state.unassigned": "待派工",
			"member.state.staged": "待创建",
			"member.state.notCreated": "未创建",
			"member.state.stopped": "已停止",
			"member.status.executing": "正在执行 {taskId}",
			"member.status.executingModel": "正在执行 {taskId} · {model}",
			"member.status.working": "正在处理已派任务",
			"member.status.waitingOn": "等待 {taskId} · {assignee}",
			"member.status.waitingPrerequisite": "等待前置任务",
			"member.status.waitingAssignment": "等待队长派工",
			"member.status.delivered": "任务已交付",
			"member.status.idle": "待继续执行",
			"member.status.unknown": "状态未知",
			"member.status.staged": "确认后创建并启动",
			"member.status.settled": "任务均已终结",
			"member.status.discarded": "计划已放弃，未创建",
			"member.status.stopped": "团队已停止，需显式恢复",
			"task.assignee.unclaimed": "待认领",
			"task.summary.waitingBreakdown": "等待队长拆解任务",
			"task.summary.staged": "{count} 项计划等待确认",
			"task.summary.discarded": "{count} 项计划已放弃，均未执行",
			"task.summary.allDelivered": "全部 {count} 项任务已交付",
			"task.summary.ended": "终态：{completed} 已交付 · {cancelled} 已取消 · {failed} 失败",
			"task.summary.blockedAndRunning": "{tasks}{more} 等待前置，其余已开工",
			"task.summary.more": " 等 {count} 项",
			"task.summary.running": "{tasks} 正在执行",
			"task.summary.claimed": "已认领：{tasks}",
			"task.summary.ready": "{tasks} 已就绪待开工",
			"task.summary.blocked": "{tasks} 等待前置",
			"task.summary.failedSettled": "{count} 项已失败，自动循环已停止",
			"task.summary.waitingSchedule": "等待下一轮调度",
			"progress.aria": "团队总进度",
			"progress.title": "总进度",
			"progress.running": "■ 进行中 {count}",
			"progress.claimed": "■ 已认领 {count}",
			"progress.blocked": "■ 等待依赖 {count}",
			"progress.delivered": "■ 已交付 {count}",
			"dependency.aria": "任务依赖链",
			"dependency.parallel": "并行任务",
			"dependency.title": "任务依赖",
			"dependency.hint.parallel": "无前后依赖 · 点击查看详情",
			"dependency.hint.chain": "悬停高亮依赖链 · 点击固定",
			"dependency.hint.pinned": "{taskId} 已固定 · Esc 取消",
			"task.runningAria": "运行中",
			"task.model": "{model}",
			"task.detail.cancelled": "任务已取消，不会继续执行",
			"task.detail.failed": "任务失败，等待明确重试",
			"task.detail.completed": "已完成并交付",
			"task.detail.noPrerequisite": "无前置，可立即开工",
			"task.detail.ready": "前置已就绪，可开工",
			"task.detail.waitingOn": "等待 {tasks}",
			"task.detail.notRun": "计划已放弃，任务未执行",
			"task.detail.noDownstream": "无下游任务",
			"task.detail.unlocks": "完成后解锁 {tasks}",
			"team.ended": "已结束",
			"plan.badge": "待确认",
			"plan.title": "执行前计划审查",
			"plan.description": "成员尚未创建、任务尚未调度。可直接调整计划，也可返回对话告诉队长哪里需要修改。",
			"plan.member.role": "角色",
			"plan.member.provider": "Provider",
			"plan.member.model": "模型",
			"plan.member.reasoning": "推理等级",
			"plan.member.reasoningHint": "留空使用默认值；可用 low、medium、high、xhigh 等",
			"plan.model.choose": "选择模型",
			"plan.model.currentUnavailable": "{provider}/{model}（当前目录不可用）",
			"plan.model.route": "路由：{provider}/{model}",
			"plan.model.defaultReasoning": "默认推理等级",
			"plan.model.providerDefault": "Provider 默认值",
			"plan.model.modelDefault": "模型默认值（{effort}）",
			"plan.model.triggerAria": "选择成员模型，当前 {model}，推理等级 {effort}",
			"plan.model.back": "返回",
			"plan.model.loading": "正在加载模型…",
			"plan.model.empty": "暂无可用模型",
			"plan.model.partialFailure": "{count} 个 Provider 的模型目录加载失败",
			"plan.model.retry": "重试",
			"plan.member.prompt": "角色提示词",
			"plan.member.roleFallback": "未设置角色",
			"plan.task.subject": "任务名称",
			"plan.task.description": "任务说明",
			"plan.task.assignee": "负责人",
			"plan.task.dependencies": "依赖任务 ID（逗号分隔）",
			"plan.task.dependenciesHint": "例如 task-1, task-2；不得形成循环依赖",
			"plan.task.unassigned": "共享任务池",
			"plan.unsaved": "未保存",
			"plan.save": "保存",
			"plan.saving": "保存中…",
			"plan.remove": "删除",
			"plan.removed": "任务已删除",
			"plan.removeConfirm": "确认删除",
			"plan.removeWarning": "删除 {task} 后将重新计算依赖关系。",
			"plan.cancel": "取消",
			"plan.addTask": "添加任务",
			"plan.adding": "添加中…",
			"plan.taskAdded": "任务已添加",
			"plan.newTask": "新任务名称",
			"plan.newTaskLabel": "新增计划任务",
			"plan.readySummary": "{members} 名成员 · {tasks} 项任务 · {links} 条依赖",
			"plan.flow.aria": "团队启动流程",
			"plan.flow.review": "审查计划",
			"plan.flow.spawn": "创建成员",
			"plan.flow.run": "开始执行",
			"plan.members.title": "成员与模型路由",
			"plan.members.count": "{count} 名成员",
			"plan.members.empty": "尚未规划成员",
			"plan.tasks.title": "任务与依赖",
			"plan.tasks.count": "{count} 项任务 · {links} 条依赖",
			"plan.tasks.empty": "尚未规划任务",
			"plan.dependencies.none": "无依赖",
			"plan.dependencies.count": "{count} 条依赖",
			"plan.approve": "确认并启动团队",
			"plan.approving": "正在创建成员…",
			"plan.approveTitle": "计划检查完毕？",
			"plan.approveHint": "确认后将创建 {members} 名成员并调度 {tasks} 项任务。",
			"plan.approveConfirmTitle": "确认启动此团队",
			"plan.approveWarning": "启动后不能再在此处编辑成员和依赖。",
			"plan.approveConfirm": "确认启动",
			"plan.continue": "返回对话修改",
			"plan.returnToChat": "回到对话",
			"plan.feedbackTitle": "正在等你说明修改方向",
			"plan.feedbackHint": "队长会在对话中追问；收到你的回复后，只修改这份草案并再次等待确认。",
			"plan.discard": "放弃本次计划",
			"plan.discardConfirmTitle": "放弃本次计划？",
			"plan.discardWarning": "该计划会结束并归档；尚未创建任何成员，也不会执行任务。",
			"plan.discardConfirm": "确认放弃",
			"plan.discarding": "正在放弃…",
			"plan.pendingEdits": "请先保存当前修改，再启动团队。",
			"plan.saved": "计划已保存",
			"plan.failed": "操作失败：{message}",
			"team.stats.members": "{count} 名成员",
			"team.stats.completed": "{completed}/{total} 完成",
			"team.stats.messages": "{count} 条消息",
			"delegation.aria": "队长派工关系",
			"captain.name": "队长",
			"captain.role": "拆解 · 派发 · 汇总",
			"captain.summary": "已派发 {tasks} 项任务给 {members} 名成员",
			"captain.summary.staged": "已规划 {tasks} 项任务与 {members} 名成员，等待确认",
			"captain.summary.awaitingFeedback": "草案已保留，等待你在对话中说明修改方向",
			"captain.summary.discarded": "计划已放弃：{members} 名成员未创建，{tasks} 项任务未执行",
			"captain.summary.withTakeover": "已派发 {tasks} 项给成员 · 队长接管 {captainTasks}",
			"captain.state.working": "{count} 人执行中",
			"captain.state.takeover": "正在执行 {tasks}",
			"captain.state.collected": "已收齐",
			"captain.state.waiting": "等待回报",
			"captain.state.staged": "待确认",
			"captain.state.awaitingFeedback": "待反馈",
			"captain.state.discarded": "已放弃",
			"captain.state.settled": "已终结",
			"members.toggle": "{count} 名成员",
			"members.collapse": "收起",
			"members.expand": "展开",
			"members.expandFinished": "展开已结束（{count}）",
			"members.empty": "暂无成员，等待队长组建团队",
			"assignment.label": "队长派发",
			"assignment.staged": "计划任务",
			"assignment.discarded": "未执行的计划",
			"assignment.empty": "暂无任务",
			"archive.label": "已结束 · 历史归档",
			"archive.discardedLabel": "计划已放弃 · 历史归档",
			"office.title": "山门洞府",
			"office.members": "{count} 名修士",
			"office.progress": "任务 {done}/{total}",
			"office.awaiting": "等待批准",
			"office.stalled": "已停止",
			"office.empty": "暂无成员",
			"office.captain": "队长",
			"office.working": "工作中",
			"office.idle": "空闲",
			"office.unknown": "未知",
			"office.showBoard": "看板",
			"office.showOffice": "像素办公室",
			"office.collapse": "收起像素办公室",
			"office.expand": "展开像素办公室",
			"office.resize": "拖动调整像素办公室高度",
			"office.hint": "点击工位打开修士会话，悬停查看状态",
			"app.title": "凡人百世书",
			"quickstart.entry": "开宗",
			"quickstart.entryTitle": "不输入命令，点这里开宗立派",
			"quickstart.title": "开宗立派",
			"quickstart.desc": "选道统模板与修士，先生成开宗草案；你点「批准」后才会真正开山。",
			"quickstart.goal": "目标（写清验收标准更好）",
			"quickstart.goalPlaceholder": "例如：修复登录接口偶发 500，测试在 tests/auth",
			"quickstart.template": "任务模板",
			"quickstart.roles": "角色（多选，可自定义）",
			"quickstart.tplFix": "斗法除魔",
			"quickstart.tplFeat": "开山立业",
			"quickstart.tplResearch": "寻仙问道",
			"quickstart.tplAudit": "巡查天机",
			"role.planner.name": "军师",
			"role.planner.ability": "拆解与排程",
			"role.implementer.name": "剑修",
			"role.implementer.ability": "攻坚与实现",
			"role.verifier.name": "丹修",
			"role.verifier.ability": "校验与复现",
			"role.reviewer.name": "执法长老",
			"role.reviewer.ability": "审查与裁断",
			"role.researcher.name": "游历者",
			"role.researcher.ability": "取证与探查",
			"role.analyst.name": "推演师",
			"role.analyst.ability": "推演与汇总",
			"role.writer.name": "书记",
			"role.writer.ability": "撰写与整理",
			"role.auditor.name": "巡查使",
			"role.auditor.ability": "只读审计",
			"role.architect.name": "阵法师",
			"role.architect.ability": "架构与边界",
			"role.tester.name": "试炼官",
			"role.tester.ability": "测试与回归",
			"role.documenter.name": "传道者",
			"role.documenter.ability": "文档与示例",
			"role.operator.name": "炼器师",
			"role.operator.ability": "构建与发布",
			"quickstart.tplBuild": "炼器成器",
			"quickstart.tplArray": "布阵改构",
			"quickstart.tplDocs": "传道著书",
			"quickstart.tplDebate": "论道裁断",
			"quickstart.desc.fix": "定位并修复缺陷，附验证与审查。",
			"quickstart.desc.feat": "从需求到实现、验证与审查的全链路。",
			"quickstart.desc.research": "多路取证后综述并核对证据。",
			"quickstart.desc.audit": "只读审计，逐条给出证据。",
			"quickstart.desc.build": "收敛改动、发布前验证、打包发布。",
			"quickstart.desc.array": "先设计边界与迁移，再小步重构。",
			"quickstart.desc.docs": "列纲、成文、审阅交付文档。",
			"quickstart.desc.debate": "正反立论、合论与裁断。",
			"quickstart.replaceHint": "当前宗门尚未结束，可结束它并立即开新宗：",
			"quickstart.replace": "结束旧宗门并开新宗",
			"quickstart.rolesEmpty": "选择角色",
			"quickstart.customRole": "自定义角色",
			"quickstart.addRole": "添加",
			"quickstart.teamExists": "当前会话已有团队：请先在右栏「团队协作」里继续或结束它，再开新团。",
			"quickstart.cancel": "取消",
			"quickstart.submit": "生成草案",
			"quickstart.busy": "生成中…",
			"quickstart.goalRequired": "请先填写目标",
			"quickstart.created": "草案已生成：{team}，请在右侧「团队协作」中批准",
			"workspace.tabBoard": "宗门进度",
			"workspace.tabConfig": "道统配置",
			"workspace.switchTeam": "切换宗门",
			"config.team": "宗门",
			"config.phase": "阶段",
			"config.halted": "已停止",
			"config.phaseStaged": "计划待批准",
			"config.phaseRunning": "进行中",
			"config.kind.work": "工作",
			"config.kind.requirements": "需求",
			"config.kind.implementation": "实现",
			"config.kind.verification": "验证",
			"config.kind.review": "审查",
			"config.kind.repair": "修复",
			"config.kind.integration": "集成",
			"config.members": "修士",
			"config.tasks": "任务",
			"config.name": "名称",
			"config.role": "角色",
			"config.model": "模型",
			"config.effort": "思考档",
			"config.task": "任务",
			"config.assignee": "负责人",
			"config.status": "状态",
			"config.deps": "依赖",
			"config.unassigned": "未分配",
			"config.stagedHint": "计划尚未批准：先在「操作配置」里改成员与任务，再回到这里批准。",
			"config.hint": "运行中成员与任务为只读；调整请通过聊天让队长处理。",
			"config.stagedTitle": "计划待批准",
			"config.stagedBody": "批准后才会创建成员、派发任务。",
			"config.openConfig": "去操作配置"
		};
		/** English dictionary, checked complete against the Chinese source key set. */
		const en = {
			"workspace.dependencies": "Left to right: prerequisites unlock tasks · Select for details",
			"workspace.title": "Sect hall",
			"workspace.guide": "Members, task dependencies, and execution progress",
			"workspace.eyebrow": "AGENT TEAMS",
			"workspace.description": "The captain coordinates. Members work in parallel as dependencies clear.",
			"workspace.relationships": "The captain coordinates members. Connections show task prerequisites. Select a task to locate its owner.",
			"workspace.emptyTitle": "No team in this conversation yet",
			"workspace.emptyBody": "Use /agent-teams in chat to describe your goal. Review the plan, then follow the team here.",
			"workspace.loading": "Loading team activity",
			"workspace.error": "The team service is unavailable. Retrying automatically; loaded activity may be out of date.",
			"workspace.retry": "Reconnect",
			"workspace.current": "Current team",
			"workspace.history": "History",
			"workspace.back": "Back to conversation",
			"workspace.tasks": "tasks",
			"workspace.members": "members",
			"workspace.completed": "completed",
			"workspace.focus": "Open sect",
			"workspace.noTasks": "Waiting for the captain to define tasks",
			"workspace.inbox": "Captain inbox",
			"workspace.inboxHint": "Up to 5 recent unread messages",
			"workspace.inboxEmpty": "No unread messages. Member reports appear here until the captain reads them.",
			"workspace.taskSummary": "Task completion summary",
			"workspace.verdictStale": "Verdict outdated",
			"card.memberCount": "{count} members",
			"action.openActivityPanel": "Open activity panel",
			"activity.panelButton": "Activity panel",
			"activity.badgeAria": "AgentTeams activity and history, {count} team records",
			"activity.panelAria": "AgentTeams activity panel",
			"activity.title": "AgentTeams activity",
			"activity.float": "Switch to floating panel",
			"activity.dockRight": "Dock to the right",
			"activity.collapse": "Collapse activity panel",
			"activity.empty": "No team activity",
			"team.stop": "Stop team",
			"team.stopped": "Stopped",
			"team.stopTitle": "Stop “{team}”?",
			"team.stopDescription": "This cancels {tasks} unfinished tasks and stops {members} working members. Completed results are kept.",
			"team.stopCancel": "Keep running",
			"team.stopConfirm": "Stop team",
			"team.stopping": "Stopping…",
			"team.stopFailed": "Could not stop team: {message}",
			"team.stopRequestFailed": "The server could not stop this team. Try again.",
			"team.discarded": "Discarded",
			"format.listSeparator": ", ",
			"task.status.pending": "Unclaimed",
			"task.status.claimed": "Claimed",
			"task.status.inProgress": "In progress",
			"task.status.completed": "Completed",
			"task.status.failed": "Failed",
			"task.status.cancelled": "Cancelled",
			"task.status.notRun": "Not run",
			"member.state.working": "Working",
			"member.state.failed": "Has failures",
			"member.state.waiting": "Waiting",
			"member.state.delivered": "Delivered",
			"member.state.left": "Left team",
			"member.state.removed": "Removed",
			"member.state.pending": "Pending",
			"member.state.unassigned": "Awaiting assignment",
			"member.state.staged": "Not spawned",
			"member.state.notCreated": "Not created",
			"member.state.stopped": "Stopped",
			"member.status.executing": "Working on {taskId}",
			"member.status.executingModel": "Working on {taskId} · {model}",
			"member.status.working": "Working on assigned tasks",
			"member.status.waitingOn": "Waiting for {taskId} · {assignee}",
			"member.status.waitingPrerequisite": "Waiting for prerequisites",
			"member.status.waitingAssignment": "Waiting for the captain to assign work",
			"member.status.delivered": "Tasks delivered",
			"member.status.idle": "Ready to continue",
			"member.status.unknown": "Status unknown",
			"member.status.staged": "Will be spawned after approval",
			"member.status.settled": "All assigned work is settled",
			"member.status.discarded": "Plan discarded; member was not created",
			"member.status.stopped": "Team stopped; explicit resume required",
			"task.assignee.unclaimed": "Unclaimed",
			"task.summary.waitingBreakdown": "Waiting for the captain to break down the work",
			"task.summary.staged": "{count} planned tasks awaiting approval",
			"task.summary.discarded": "{count} planned tasks discarded; none ran",
			"task.summary.allDelivered": "All {count} tasks delivered",
			"task.summary.ended": "Final: {completed} delivered · {cancelled} cancelled · {failed} failed",
			"task.summary.blockedAndRunning": "{tasks}{more} waiting on prerequisites; other work has started",
			"task.summary.more": " and {count} more",
			"task.summary.running": "{tasks} in progress",
			"task.summary.claimed": "Claimed: {tasks}",
			"task.summary.ready": "{tasks} ready to start",
			"task.summary.blocked": "{tasks} waiting on prerequisites",
			"task.summary.failedSettled": "{count} failed; the automatic loop has stopped",
			"task.summary.waitingSchedule": "Waiting for the next scheduling round",
			"progress.aria": "Overall team progress",
			"progress.title": "Overall progress",
			"progress.running": "■ In progress {count}",
			"progress.claimed": "■ Claimed {count}",
			"progress.blocked": "■ Waiting {count}",
			"progress.delivered": "■ Delivered {count}",
			"dependency.aria": "Task dependency chain",
			"dependency.parallel": "Parallel tasks",
			"dependency.title": "Task dependencies",
			"dependency.hint.parallel": "No dependencies · Click for details",
			"dependency.hint.chain": "Hover to highlight dependencies · Click to pin",
			"dependency.hint.pinned": "{taskId} pinned · Esc to clear",
			"task.runningAria": "Running",
			"task.model": "{model}",
			"task.detail.cancelled": "Cancelled; execution will not continue",
			"task.detail.failed": "Failed; awaiting an explicit retry",
			"task.detail.completed": "Completed and delivered",
			"task.detail.noPrerequisite": "No prerequisites; ready to start",
			"task.detail.ready": "Prerequisites ready; can start",
			"task.detail.waitingOn": "Waiting for {tasks}",
			"task.detail.notRun": "Plan discarded; task was not run",
			"task.detail.noDownstream": "No downstream tasks",
			"task.detail.unlocks": "Unlocks {tasks} when complete",
			"team.ended": "Ended",
			"plan.badge": "Awaiting approval",
			"plan.title": "Pre-run plan review",
			"plan.description": "Members have not been spawned and tasks have not been scheduled. Edit the draft here, or return to chat and tell the Captain what should change.",
			"plan.member.role": "Role",
			"plan.member.provider": "Provider",
			"plan.member.model": "Model",
			"plan.member.reasoning": "Reasoning effort",
			"plan.member.reasoningHint": "Leave blank for default; accepts low, medium, high, xhigh, and more",
			"plan.model.choose": "Choose a model",
			"plan.model.currentUnavailable": "{provider}/{model} (not in the current catalog)",
			"plan.model.route": "Route: {provider}/{model}",
			"plan.model.defaultReasoning": "Default reasoning effort",
			"plan.model.providerDefault": "Provider default",
			"plan.model.modelDefault": "Model default ({effort})",
			"plan.model.triggerAria": "Choose member model, currently {model}, reasoning effort {effort}",
			"plan.model.back": "Back",
			"plan.model.loading": "Loading models…",
			"plan.model.empty": "No models available",
			"plan.model.partialFailure": "{count} provider catalogs could not be loaded",
			"plan.model.retry": "Retry",
			"plan.member.prompt": "Role prompt",
			"plan.member.roleFallback": "Role not set",
			"plan.task.subject": "Task subject",
			"plan.task.description": "Task description",
			"plan.task.assignee": "Assignee",
			"plan.task.dependencies": "Dependency task IDs (comma-separated)",
			"plan.task.dependenciesHint": "For example task-1, task-2; cycles are rejected",
			"plan.task.unassigned": "Shared task pool",
			"plan.unsaved": "Unsaved",
			"plan.save": "Save",
			"plan.saving": "Saving…",
			"plan.remove": "Remove",
			"plan.removed": "Task removed",
			"plan.removeConfirm": "Confirm remove",
			"plan.removeWarning": "Removing {task} will recalculate downstream dependencies.",
			"plan.cancel": "Cancel",
			"plan.addTask": "Add task",
			"plan.adding": "Adding…",
			"plan.taskAdded": "Task added",
			"plan.newTask": "New task subject",
			"plan.newTaskLabel": "Add a planned task",
			"plan.readySummary": "{members} members · {tasks} tasks · {links} dependencies",
			"plan.flow.aria": "Team launch flow",
			"plan.flow.review": "Review plan",
			"plan.flow.spawn": "Create members",
			"plan.flow.run": "Start work",
			"plan.members.title": "Members & model routes",
			"plan.members.count": "{count} members",
			"plan.members.empty": "No members planned yet",
			"plan.tasks.title": "Tasks & dependencies",
			"plan.tasks.count": "{count} tasks · {links} dependencies",
			"plan.tasks.empty": "No tasks planned yet",
			"plan.dependencies.none": "No dependencies",
			"plan.dependencies.count": "{count} dependencies",
			"plan.approve": "Approve & Run",
			"plan.approving": "Creating members…",
			"plan.approveTitle": "Plan ready?",
			"plan.approveHint": "Approval creates {members} members and schedules {tasks} tasks.",
			"plan.approveConfirmTitle": "Confirm team launch",
			"plan.approveWarning": "Member routes and dependencies cannot be edited here after launch.",
			"plan.approveConfirm": "Confirm launch",
			"plan.continue": "Return to chat & revise",
			"plan.returnToChat": "Return to chat",
			"plan.feedbackTitle": "Waiting for your revision direction",
			"plan.feedbackHint": "The Captain will ask in chat. After your reply, it will revise this draft and wait for approval again.",
			"plan.discard": "Discard this plan",
			"plan.discardConfirmTitle": "Discard this plan?",
			"plan.discardWarning": "The plan will end and be archived. No members have been spawned and no tasks will run.",
			"plan.discardConfirm": "Discard plan",
			"plan.discarding": "Discarding…",
			"plan.pendingEdits": "Save the current edits before launching the team.",
			"plan.saved": "Plan saved",
			"plan.failed": "Operation failed: {message}",
			"team.stats.members": "{count} members",
			"team.stats.completed": "{completed}/{total} completed",
			"team.stats.messages": "{count} messages",
			"delegation.aria": "Captain delegation map",
			"captain.name": "Captain",
			"captain.role": "Break down · Delegate · Synthesize",
			"captain.summary": "Assigned {tasks} tasks to {members} members",
			"captain.summary.staged": "Planned {tasks} tasks and {members} members; awaiting approval",
			"captain.summary.awaitingFeedback": "Draft preserved; waiting for your revision direction in chat",
			"captain.summary.discarded": "Plan discarded: {members} members were not created and {tasks} tasks did not run",
			"captain.summary.withTakeover": "Assigned {tasks} to members · Captain owns {captainTasks}",
			"captain.state.working": "{count} active",
			"captain.state.takeover": "Working on {tasks}",
			"captain.state.collected": "All reports received",
			"captain.state.waiting": "Waiting for reports",
			"captain.state.staged": "Awaiting approval",
			"captain.state.awaitingFeedback": "Awaiting feedback",
			"captain.state.discarded": "Discarded",
			"captain.state.settled": "Settled",
			"members.toggle": "Members {count}",
			"members.collapse": "Collapse",
			"members.expand": "Expand",
			"members.expandFinished": "Show finished ({count})",
			"members.empty": "No members yet; waiting for the captain to assemble the team",
			"assignment.label": "Captain assigned",
			"assignment.staged": "Planned task",
			"assignment.discarded": "Plan not run",
			"assignment.empty": "No tasks",
			"archive.label": "Ended · Archived history",
			"archive.discardedLabel": "Plan discarded · Archived history",
			"office.title": "Mountain gate",
			"office.members": "{count} cultivators",
			"office.progress": "Tasks {done}/{total}",
			"office.awaiting": "Awaiting approval",
			"office.stalled": "Stopped",
			"office.empty": "No members yet",
			"office.captain": "Captain",
			"office.working": "Working",
			"office.idle": "Idle",
			"office.unknown": "Unknown",
			"office.showBoard": "Board",
			"office.showOffice": "Pixel office",
			"office.collapse": "Hide pixel office",
			"office.expand": "Show pixel office",
			"office.resize": "Drag to resize the pixel office",
			"office.hint": "Click a desk to open the cultivator; hover for status",
			"app.title": "Hundred Lives of Mortals",
			"quickstart.entry": "Found sect",
			"quickstart.entryTitle": "Found a sect without typing a command",
			"quickstart.title": "Found a sect",
			"quickstart.desc": "Pick a doctrine and cultivators, then stage a sect plan. Nothing starts until you approve it.",
			"quickstart.goal": "Goal (include acceptance criteria if you can)",
			"quickstart.goalPlaceholder": "e.g. Fix the intermittent 500 on the login API; tests live in tests/auth",
			"quickstart.template": "Template",
			"quickstart.roles": "Roles (multi-select, custom allowed)",
			"quickstart.tplFix": "Trial: purge",
			"quickstart.tplFeat": "Trial: build",
			"quickstart.tplResearch": "Trial: research",
			"quickstart.tplAudit": "Trial: audit",
			"role.planner.name": "Strategist",
			"role.planner.ability": "plan & sequence",
			"role.implementer.name": "Sword cultivator",
			"role.implementer.ability": "build & fix",
			"role.verifier.name": "Pill cultivator",
			"role.verifier.ability": "verify & reproduce",
			"role.reviewer.name": "Elder",
			"role.reviewer.ability": "review & judge",
			"role.researcher.name": "Wanderer",
			"role.researcher.ability": "gather & explore",
			"role.analyst.name": "Diviner",
			"role.analyst.ability": "analyze & synthesize",
			"role.writer.name": "Scribe",
			"role.writer.ability": "write & organize",
			"role.auditor.name": "Inspector",
			"role.auditor.ability": "audit, read-only",
			"role.architect.name": "Array master",
			"role.architect.ability": "design & boundaries",
			"role.tester.name": "Trial officer",
			"role.tester.ability": "test & regress",
			"role.documenter.name": "Preacher",
			"role.documenter.ability": "document & examples",
			"role.operator.name": "Artificer",
			"role.operator.ability": "build & release",
			"quickstart.tplBuild": "Trial: forge",
			"quickstart.tplArray": "Trial: array",
			"quickstart.tplDocs": "Trial: scripture",
			"quickstart.tplDebate": "Trial: debate",
			"quickstart.desc.fix": "Locate and fix a defect, then verify and review.",
			"quickstart.desc.feat": "Requirements to implementation, verification and review.",
			"quickstart.desc.research": "Parallel evidence gathering, synthesis and evidence check.",
			"quickstart.desc.audit": "Read-only audit with per-item evidence.",
			"quickstart.desc.build": "Converge changes, verify, then package and release.",
			"quickstart.desc.array": "Design boundaries and migration, then refactor in small steps.",
			"quickstart.desc.docs": "Outline, draft and review a document.",
			"quickstart.desc.debate": "Argue both sides, synthesize and judge.",
			"quickstart.replaceHint": "The current sect is still active. End it and found a new one:",
			"quickstart.replace": "End old sect and found new",
			"quickstart.rolesEmpty": "Select roles",
			"quickstart.customRole": "Custom role",
			"quickstart.addRole": "Add",
			"quickstart.teamExists": "This session already leads a team. Continue or end it in the Teams pane before creating another.",
			"quickstart.cancel": "Cancel",
			"quickstart.submit": "Stage plan",
			"quickstart.busy": "Staging…",
			"quickstart.goalRequired": "Enter a goal first",
			"quickstart.created": "Plan staged: {team}. Approve it in the team pane on the right.",
			"workspace.tabBoard": "Sect progress",
			"workspace.tabConfig": "Doctrine",
			"workspace.switchTeam": "Switch sect",
			"config.team": "Sect",
			"config.phase": "Phase",
			"config.halted": "Stopped",
			"config.phaseStaged": "Awaiting approval",
			"config.phaseRunning": "Running",
			"config.kind.work": "Work",
			"config.kind.requirements": "Requirements",
			"config.kind.implementation": "Implementation",
			"config.kind.verification": "Verification",
			"config.kind.review": "Review",
			"config.kind.repair": "Repair",
			"config.kind.integration": "Integration",
			"config.members": "Cultivators",
			"config.tasks": "Tasks",
			"config.name": "Name",
			"config.role": "Role",
			"config.model": "Model",
			"config.effort": "Effort",
			"config.task": "Task",
			"config.assignee": "Assignee",
			"config.status": "Status",
			"config.deps": "Deps",
			"config.unassigned": "Unassigned",
			"config.stagedHint": "The plan is not approved yet: edit members and tasks under Setup, then approve it there.",
			"config.hint": "Members and tasks are read-only while running; ask the captain in chat to change them.",
			"config.stagedTitle": "Plan awaiting approval",
			"config.stagedBody": "Members are spawned and tasks dispatched only after approval.",
			"config.openConfig": "Open setup"
		};
		//#endregion
		//#region lib/client/index.js
		/** Required services: conversation nodes, slots, sessions navigation, and locale. */
		const inject = [
			"uiConversation",
			"slots",
			"sessions",
			"locale",
			"modelDirectories",
			"layout"
		];
		const useLegacyPanelInfo = (select) => select({ activePanelId: null });
		/** The replayed user message is the canonical transcript entry. */
		function HiddenAgentTeamsCommand() {
			return null;
		}
		/**
		* Register the activity monitor in the shell's additive overlay and the
		* in-conversation team card. The card's activity button re-opens a folded
		* monitor via a window event — the recovery path for an old session.
		*/
		function apply(ctx) {
			const bridge = createWorkspaceBridge();
			const state = createWorkspaceState();
			ctx.effect(() => ctx.locale.register(AGENT_TEAMS_LOCALE_NAMESPACE, {
				zh,
				en
			}), "agent-teams: dictionaries");
			const openMember = (parentId, childId) => {
				openAgentTeamMember(ctx.sessions, parentId, childId, ctx.layout, ctx.get("uiWorkspace")).catch((error) => {
					console.warn(`agent-teams: failed to open member transcript ${childId}: ${String(error)}`);
				});
			};
			const Panel = ({ t, usePanelInfo }) => {
				const conversationVisible = (usePanelInfo ?? useLegacyPanelInfo)((panel) => panel.activePanelId === null);
				return (0, react_jsx_runtime.jsx)(ActivitySurface, {
					bridge,
					state,
					conversationVisible,
					sessionsList: ctx.sessions.list,
					modelDirectories: ctx.modelDirectories,
					openMember,
					t
				});
			};
			ctx.inject(["sidebarRight", "sidebarRightTabs"], (native) => {
				const t = native.locale.bind(AGENT_TEAMS_LOCALE_NAMESPACE);
				native.effect(() => native.sidebarRightTabs.register({
					id: TEAM_TAB_ID,
					kind: TEAM_TAB_KIND,
					title: () => t("workspace.title")
				}));
				native.slots.inject("conversation.session.header.actions", () => native.slots.register({
					name: "conversation.session.header.actions",
					id: "agent-teams-create",
					order: 49,
					locale: AGENT_TEAMS_LOCALE_NAMESPACE
				}, TeamQuickStart));
				native.slots.inject("conversation.session.header.actions", () => native.slots.register({
					name: "conversation.session.header.actions",
					id: "agent-teams-entry",
					order: 50,
					locale: AGENT_TEAMS_LOCALE_NAMESPACE
				}, TeamChatEntry));
				native.slots.inject("conversation.chat.turnTail", () => native.slots.register({
					name: "conversation.chat.turnTail",
					id: "agent-teams-summary",
					order: 50,
					locale: AGENT_TEAMS_LOCALE_NAMESPACE,
					inject: () => ({ openMember })
				}, TeamTurnCard));
				native.slots.inject("sidebar.right.pane.tab", () => {
					const dispose = native.slots.register({
						name: "sidebar.right.pane.tab",
						key: TEAM_TAB_ID,
						locale: AGENT_TEAMS_LOCALE_NAMESPACE,
						inject: () => ({
							state,
							modelDirectories: native.modelDirectories,
							openMember
						})
					}, WorkspaceActivity);
					bridge.set(native.sidebarRight);
					return () => {
						bridge.set(void 0);
						dispose();
					};
				});
			});
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "agent-teams-activity",
				order: 80,
				label: "AgentTeams activity",
				locale: AGENT_TEAMS_LOCALE_NAMESPACE
			}, Panel));
			ctx.slots.inject("conversation.chat.commandview", () => ctx.slots.register({
				name: "conversation.chat.commandview",
				key: "agent-teams"
			}, HiddenAgentTeamsCommand));
			ctx.uiConversation.events.register(agentTeamsCardDefinition);
			ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
				name: "conversation.chat.node",
				key: "agent-teams",
				locale: AGENT_TEAMS_LOCALE_NAMESPACE,
				inject: () => ({
					openMember,
					workspaceBridge: bridge
				})
			}, AgentTeamsCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map