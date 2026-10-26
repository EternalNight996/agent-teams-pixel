window.__ModuleLoader__.load({
	id: "agent-teams-pixel",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
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
		//#region lib/client/cultivation.js
		/**
		* 修炼体系：修为全局持久化，任务完成快、挂机慢；等级上限 9999。
		*
		* 这里负责“修为 -> 等级/境界/装备/技能解锁”，修为累积由 cultivation-store 负责。
		*/
		const CULTIVATION_REALMS = [
			"realm.mortal",
			"realm.qi",
			"realm.foundation",
			"realm.golden",
			"realm.nascent",
			"realm.spirit",
			"realm.void",
			"realm.integration",
			"realm.mahayana",
			"realm.tribulation",
			"realm.trueImmortal",
			"realm.goldenImmortal",
			"realm.taiyi",
			"realm.daluo",
			"realm.dao"
		];
		/** 装备物品栏：等级里程碑解锁。 */
		const CULTIVATION_ITEMS = [
			{
				id: "weapon-tao",
				kind: "weapon",
				level: 1,
				key: "item.weapon.tao",
				icon: "🗡"
			},
			{
				id: "weapon-spirit",
				kind: "weapon",
				level: 3,
				key: "item.weapon.spirit",
				icon: "⚔"
			},
			{
				id: "weapon-treasure",
				kind: "weapon",
				level: 10,
				key: "item.weapon.treasure",
				icon: "🔮"
			},
			{
				id: "weapon-immortal",
				kind: "weapon",
				level: 50,
				key: "item.weapon.immortal",
				icon: "🪄"
			},
			{
				id: "weapon-divine",
				kind: "weapon",
				level: 500,
				key: "item.weapon.divine",
				icon: "⚡"
			},
			{
				id: "weapon-core",
				kind: "weapon",
				level: 150,
				key: "item.weapon.core",
				icon: "🔱"
			},
			{
				id: "weapon-spirit-treasure",
				kind: "weapon",
				level: 700,
				key: "item.weapon.spiritTreasure",
				icon: "🔮"
			},
			{
				id: "weapon-immortal-high",
				kind: "weapon",
				level: 2800,
				key: "item.weapon.immortalHigh",
				icon: "🪄"
			},
			{
				id: "weapon-true-immortal",
				kind: "weapon",
				level: 5200,
				key: "item.weapon.trueImmortal",
				icon: "🌟"
			},
			{
				id: "weapon-dao",
				kind: "weapon",
				level: 9e3,
				key: "item.weapon.dao",
				icon: "🪐"
			},
			{
				id: "mount-auto",
				kind: "mount",
				level: 1,
				key: "office.mountAuto",
				icon: "✦",
				form: "auto"
			},
			{
				id: "mount-walk",
				kind: "mount",
				level: 1,
				key: "office.mountWalk",
				icon: "🚶",
				form: "off"
			},
			{
				id: "mount-sword",
				kind: "mount",
				level: 5,
				key: "item.mount.sword",
				icon: "🗡",
				form: "sword"
			},
			{
				id: "mount-beast",
				kind: "mount",
				level: 8,
				key: "item.mount.beast",
				icon: "🐉",
				form: "beast"
			},
			{
				id: "mount-crane",
				kind: "mount",
				level: 20,
				key: "item.mount.crane",
				icon: "🕊",
				form: "beast"
			},
			{
				id: "mount-qilin",
				kind: "mount",
				level: 50,
				key: "item.mount.qilin",
				icon: "🦄",
				form: "beast"
			},
			{
				id: "mount-dragon",
				kind: "mount",
				level: 100,
				key: "item.mount.dragon",
				icon: "🐲",
				form: "beast"
			},
			{
				id: "mount-jiao",
				kind: "mount",
				level: 350,
				key: "item.mount.jiao",
				icon: "🐍",
				form: "beast"
			},
			{
				id: "mount-immortal-crane",
				kind: "mount",
				level: 1200,
				key: "item.mount.immortalCrane",
				icon: "🕊",
				form: "beast"
			},
			{
				id: "mount-kirin",
				kind: "mount",
				level: 2800,
				key: "item.mount.kirin",
				icon: "🦄",
				form: "beast"
			},
			{
				id: "mount-true-dragon",
				kind: "mount",
				level: 5200,
				key: "item.mount.trueDragon",
				icon: "🐉",
				form: "beast"
			},
			{
				id: "mount-phoenix",
				kind: "mount",
				level: 8e3,
				key: "item.mount.phoenix",
				icon: "🔥",
				form: "beast"
			},
			{
				id: "mount-dao-beast",
				kind: "mount",
				level: 9800,
				key: "item.mount.daoBeast",
				icon: "🦣",
				form: "beast"
			},
			{
				id: "skill-aura",
				kind: "skill",
				level: 2,
				key: "skill.aura",
				icon: "✨"
			},
			{
				id: "skill-shield",
				kind: "skill",
				level: 7,
				key: "skill.shield",
				icon: "🛡"
			},
			{
				id: "skill-swordarray",
				kind: "skill",
				level: 15,
				key: "skill.swordArray",
				icon: "🌀"
			},
			{
				id: "skill-gale",
				kind: "skill",
				level: 30,
				key: "skill.gale",
				icon: "🌪"
			},
			{
				id: "skill-law",
				kind: "skill",
				level: 100,
				key: "skill.law",
				icon: "🪷"
			},
			{
				id: "skill-swordqi",
				kind: "skill",
				level: 50,
				key: "skill.swordQi",
				icon: "🗡"
			},
			{
				id: "skill-pillfire",
				kind: "skill",
				level: 150,
				key: "skill.pillFire",
				icon: "🔥"
			},
			{
				id: "skill-infantfire",
				kind: "skill",
				level: 350,
				key: "skill.infantFire",
				icon: "👶"
			},
			{
				id: "skill-divinepower",
				kind: "skill",
				level: 700,
				key: "skill.divinePower",
				icon: "✨"
			},
			{
				id: "skill-domain",
				kind: "skill",
				level: 1200,
				key: "skill.domain",
				icon: "🌌"
			},
			{
				id: "skill-dharma",
				kind: "skill",
				level: 2800,
				key: "skill.dharma",
				icon: "🪷"
			},
			{
				id: "skill-immortalart",
				kind: "skill",
				level: 5200,
				key: "skill.immortalArt",
				icon: "🌟"
			},
			{
				id: "skill-daoart",
				kind: "skill",
				level: 9e3,
				key: "skill.daoArt",
				icon: "🪐"
			}
		];
		/** 等级上限：9999。 */
		const LEVEL_CAP = 9999;
		/** 境界带宽：炼气/筑基/…一路扩到 9999。 */
		const REALM_BANDS = [
			4,
			49,
			149,
			349,
			699,
			1199,
			1899,
			2799,
			3899,
			5199,
			6699,
			7999,
			8999,
			9799,
			9999
		];
		/** 升到下一级还需要的修为（随等级线性增长）。 */
		function xpNeed(level) {
			return 60 + (level - 1) * 45;
		}
		/** 指定等级所需的累计修为（用于调试/直接提级）。 */
		function xpForLevel(level) {
			const target = Math.min(LEVEL_CAP, Math.max(1, Math.floor(level)));
			let xp = 0;
			for (let current = 1; current < target; current += 1) xp += xpNeed(current);
			return xp;
		}
		function cultivationFromXp(xp) {
			const safe = Math.max(0, xp);
			let level = 1;
			let floor = 0;
			let need = xpNeed(1);
			while (level < 9999 && safe >= floor + need) {
				floor += need;
				level += 1;
				need = xpNeed(level);
			}
			let realmIndex = REALM_BANDS.findIndex((band) => level <= band);
			if (realmIndex < 0) realmIndex = REALM_BANDS.length - 1;
			const ratio = level >= 9999 ? 1 : Math.min(1, Math.max(0, (safe - floor) / need));
			const skills = CULTIVATION_ITEMS.filter((item) => item.kind === "skill" && level >= item.level).map((item) => item.key);
			return {
				level,
				xp: safe,
				floor,
				next: floor + need,
				ratio,
				rankKey: CULTIVATION_REALMS[realmIndex],
				skills
			};
		}
		function memberKey(name) {
			return `member:${name.trim()}`;
		}
		function captainKey(teamName) {
			return `captain:${teamName.trim()}`;
		}
		//#endregion
		//#region lib/client/cultivation-store.js
		/**
		* 全局修为仓库：按“修士名字 / 宗门掌门”持久化累计修为。
		*
		* - 任务完成：给对应修士加较多修为（历史已完成任务在首次见到时结算一次）；
		* - 掌门：按宗门已完成任务获得带队修为；
		* - 挂机：只给“当前打开对话”的那个角色少量修为；
		* - 数据落在 localStorage，跨宗门、跨会话共享。
		*/
		const STORAGE_KEY = "agent-teams-pixel.cultivation.v1";
		function emptyState() {
			return {
				xp: {},
				seen: {},
				tick: Date.now()
			};
		}
		function load() {
			if (typeof localStorage === "undefined") return emptyState();
			try {
				const raw = localStorage.getItem(STORAGE_KEY);
				if (raw === null) return emptyState();
				const parsed = JSON.parse(raw);
				if (typeof parsed !== "object" || parsed === null) return emptyState();
				return {
					xp: typeof parsed.xp === "object" && parsed.xp !== null ? parsed.xp : {},
					seen: typeof parsed.seen === "object" && parsed.seen !== null ? parsed.seen : {},
					tick: typeof parsed.tick === "number" ? parsed.tick : Date.now()
				};
			} catch {
				return emptyState();
			}
		}
		let state = load();
		let version = 0;
		const listeners = /* @__PURE__ */ new Set();
		function persist() {
			if (typeof localStorage === "undefined") return;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
			} catch {}
		}
		function notify() {
			version += 1;
			for (const listener of listeners) listener();
		}
		function addXp(key, amount) {
			if (!(amount > 0)) return false;
			state.xp[key] = (state.xp[key] ?? 0) + amount;
			return true;
		}
		function subscribeCultivation(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		function cultivationVersion() {
			return version;
		}
		/** 全局修为查询；组件通过 useCultivationVersion 订阅后调用。 */
		function xpOf(key) {
			return state.xp[key] ?? 0;
		}
		/** 直接设置某个角色修为（调试/提级用）；会立即持久化并通知界面。 */
		function setCultivationXp(key, xp) {
			state.xp[key] = Math.max(0, xp);
			persist();
			notify();
		}
		function useCultivationVersion() {
			return (0, react.useSyncExternalStore)(subscribeCultivation, cultivationVersion, cultivationVersion);
		}
		/**
		* 消费一次队伍快照：结算新完成的任务、掌门带队修为，以及当前对话角色的挂机修为。
		* @param teams - 所有实时队伍（同一份 activity 快照）。
		* @param currentSessionId - 当前前台会话，用于确定挂机角色。
		*/
		function ingestCultivation(teams, currentSessionId) {
			const now = Date.now();
			let changed = false;
			for (const team of teams) {
				for (const member of team.members) {
					const key = memberKey(member.name);
					const seenKey = `${team.teamId}:member:${member.name}`;
					const previous = state.seen[seenKey];
					if (previous === void 0) {
						state.seen[seenKey] = member.done;
						if (member.done > 0) changed = addXp(key, member.done * 60) || changed;
					} else if (member.done > previous) {
						changed = addXp(key, (member.done - previous) * 60) || changed;
						state.seen[seenKey] = member.done;
					} else if (member.done < previous) state.seen[seenKey] = member.done;
				}
				const teamDone = team.tasks.filter((task) => task.status === "completed").length;
				const captainSeenKey = `${team.teamId}:captain`;
				const captainPrevious = state.seen[captainSeenKey];
				if (captainPrevious === void 0) {
					state.seen[captainSeenKey] = teamDone;
					if (teamDone > 0) changed = addXp(captainKey(team.name), teamDone * 40) || changed;
				} else if (teamDone > captainPrevious) {
					changed = addXp(captainKey(team.name), (teamDone - captainPrevious) * 40) || changed;
					state.seen[captainSeenKey] = teamDone;
				} else if (teamDone < captainPrevious) state.seen[captainSeenKey] = teamDone;
			}
			if (currentSessionId !== void 0 && currentSessionId !== "") {
				const team = teams.find((item) => item.captainSessionId === currentSessionId) ?? teams.find((item) => item.members.some((member) => member.id === currentSessionId));
				if (team !== void 0) {
					const isCaptain = team.captainSessionId === currentSessionId;
					const member = team.members.find((item) => item.id === currentSessionId);
					const key = isCaptain ? captainKey(team.name) : member === void 0 ? void 0 : memberKey(member.name);
					if (key !== void 0) {
						const elapsedMinutes = Math.min(2, Math.max(0, (now - state.tick) / 6e4));
						if (elapsedMinutes > 0) changed = addXp(key, elapsedMinutes * .25) || changed;
					}
				}
			}
			state.tick = now;
			if (changed) {
				persist();
				notify();
			}
		}
		//#endregion
		//#region lib/client/role-labels.js
		/** Built-in roles, in picker order. */
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
			},
			{
				id: "talisman",
				nameKey: "role.talisman.name",
				abilityKey: "role.talisman.ability"
			},
			{
				id: "healer",
				nameKey: "role.healer.name",
				abilityKey: "role.healer.ability"
			},
			{
				id: "beastmaster",
				nameKey: "role.beastmaster.name",
				abilityKey: "role.beastmaster.ability"
			},
			{
				id: "puppeteer",
				nameKey: "role.puppeteer.name",
				abilityKey: "role.puppeteer.ability"
			},
			{
				id: "musician",
				nameKey: "role.musician.name",
				abilityKey: "role.musician.ability"
			},
			{
				id: "poisoner",
				nameKey: "role.poisoner.name",
				abilityKey: "role.poisoner.ability"
			},
			{
				id: "monk",
				nameKey: "role.monk.name",
				abilityKey: "role.monk.ability"
			},
			{
				id: "demon",
				nameKey: "role.demon.name",
				abilityKey: "role.demon.ability"
			}
		];
		const ROLE_INDEX = new Map(ROLE_META.map((role) => [role.id, role]));
		/**
		* Localized label for one role id.
		* @param id - the wire role id (for example `implementer`).
		* @param memberName - the member's display name, used to avoid repeating the
		*   role word for members that were named after their role.
		* @param t - the AgentTeams translator.
		* @returns the localized role name, the role's duty when the name already is
		*   that name, or the untouched id for a custom role.
		*/
		function roleLabel(id, memberName, t) {
			const meta = ROLE_INDEX.get(id);
			if (meta === void 0) return id;
			const name = t(meta.nameKey);
			return memberName.trim() === name ? t(meta.abilityKey) : name;
		}
		//#endregion
		//#region lib/client/role-visuals.js
		/**
		* Generated by scripts/gen-cultivation-art.mjs from the avatar palettes.
		* The canvas scene dresses each desk with the 道途 robe and 本命法器 so the
		* office and the roster portraits show the same character.
		*/
		const ROLE_VISUALS = {
			captain: {
				weapon: "crown",
				robe: "#d4af37",
				robeDark: "#9a7a1e",
				robeLight: "#f2d97a",
				trim: "#8a1c1c",
				accent: "#ffe9a8",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			planner: {
				weapon: "fan",
				robe: "#3f4f7a",
				robeDark: "#2b3757",
				robeLight: "#5c6fa0",
				trim: "#d8e6ff",
				accent: "#d8e6ff",
				hair: "#2a2230",
				skin: "#f2cfae",
				hairStyle: "topknot"
			},
			implementer: {
				weapon: "sword",
				robe: "#3f6a8a",
				robeDark: "#2a4a63",
				robeLight: "#5f8fb2",
				trim: "#cfe8ff",
				accent: "#cfe8ff",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			verifier: {
				weapon: "pill",
				robe: "#7a5c9e",
				robeDark: "#55416f",
				robeLight: "#9b7fc0",
				trim: "#e6d9ff",
				accent: "#e6d9ff",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			reviewer: {
				weapon: "scroll",
				robe: "#4a4a58",
				robeDark: "#32323d",
				robeLight: "#666675",
				trim: "#d4af37",
				accent: "#ffe9a8",
				hair: "#1c1a22",
				skin: "#f2cfae",
				beard: true
			},
			researcher: {
				weapon: "gourd",
				robe: "#4f7d5a",
				robeDark: "#365740",
				robeLight: "#6c9f78",
				trim: "#d9f2df",
				accent: "#d9f2df",
				hair: "#2a2230",
				skin: "#f2cfae",
				hairStyle: "long"
			},
			analyst: {
				weapon: "compass",
				robe: "#3f5a8a",
				robeDark: "#2a3f63",
				robeLight: "#5c7cb2",
				trim: "#bfe3ff",
				accent: "#bfe3ff",
				hair: "#241f2c",
				skin: "#f2cfae",
				hairStyle: "topknot"
			},
			writer: {
				weapon: "brush",
				robe: "#5a6a3f",
				robeDark: "#3e4a2a",
				robeLight: "#788c56",
				trim: "#f0f2d9",
				accent: "#f0f2d9",
				hair: "#2a2230",
				skin: "#f2cfae",
				hairStyle: "long"
			},
			auditor: {
				weapon: "lantern",
				robe: "#5a5a6a",
				robeDark: "#3d3d49",
				robeLight: "#787888",
				trim: "#ffe9b8",
				accent: "#ffe9b8",
				hair: "#1c1a22",
				skin: "#f2cfae",
				beard: true
			},
			architect: {
				weapon: "array",
				robe: "#2f6a6a",
				robeDark: "#1f4848",
				robeLight: "#4b8f8f",
				trim: "#bff3ef",
				accent: "#bff3ef",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			tester: {
				weapon: "fist",
				robe: "#8a3f3f",
				robeDark: "#612a2a",
				robeLight: "#ad5c5c",
				trim: "#ffd9c2",
				accent: "#ffd9c2",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			documenter: {
				weapon: "book",
				robe: "#8a6a3a",
				robeDark: "#614a26",
				robeLight: "#ad8a56",
				trim: "#ffe9c2",
				accent: "#ffe9c2",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			operator: {
				weapon: "hammer",
				robe: "#6a5a3f",
				robeDark: "#4a3f2b",
				robeLight: "#8a7856",
				trim: "#ffe9b8",
				accent: "#ffe9b8",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			talisman: {
				weapon: "talisman",
				robe: "#a85a3a",
				robeDark: "#7a3f28",
				robeLight: "#c97a56",
				trim: "#f2d97a",
				accent: "#ffd27a",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			healer: {
				weapon: "needle",
				robe: "#cfd8d4",
				robeDark: "#9fada8",
				robeLight: "#eef4f0",
				trim: "#7fb89a",
				accent: "#d9f2e6",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			beastmaster: {
				weapon: "whistle",
				robe: "#7a6a3f",
				robeDark: "#544a2b",
				robeLight: "#9a8a56",
				trim: "#d9c27a",
				accent: "#ffe9b8",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			puppeteer: {
				weapon: "puppet",
				robe: "#5f4a6a",
				robeDark: "#3f3149",
				robeLight: "#806a8c",
				trim: "#c7a8d8",
				accent: "#e0d0ff",
				hair: "#1c1a22",
				skin: "#f2cfae"
			},
			musician: {
				weapon: "flute",
				robe: "#8a9ec2",
				robeDark: "#5f7291",
				robeLight: "#a8bcdc",
				trim: "#e8f0ff",
				accent: "#cfe4ff",
				hair: "#2a2230",
				skin: "#f2cfae",
				hairStyle: "long"
			},
			poisoner: {
				weapon: "vial",
				robe: "#4a6a4a",
				robeDark: "#33503a",
				robeLight: "#648a64",
				trim: "#b8e08a",
				accent: "#d4ff9a",
				hair: "#241f2c",
				skin: "#f2cfae"
			},
			monk: {
				weapon: "beads",
				robe: "#a06a3a",
				robeDark: "#754a24",
				robeLight: "#c08a56",
				trim: "#f2c14e",
				accent: "#ffe9a8",
				hair: "#2a2230",
				skin: "#f2cfae"
			},
			demon: {
				weapon: "blade",
				robe: "#5a2a3a",
				robeDark: "#3c1a28",
				robeLight: "#7a3f52",
				trim: "#d43a4a",
				accent: "#ff9aa8",
				hair: "#1c1a22",
				skin: "#f2cfae"
			}
		};
		/** Visuals for a role id (custom roles resolve to undefined). */
		function roleVisual(role) {
			return ROLE_VISUALS[role.trim().toLowerCase()];
		}
		//#endregion
		//#region lib/client/pixel-office/office-actions.js
		/**
		* Interactive facilities painted on the sect-hall wall.
		*
		* The wall is the workspace's menu: every facility is a fixed scene-space
		* rectangle that maps to one panel. The renderer draws the pixels, React owns
		* the copy and the panel, and this module keeps both sides on the same rects so
		* the hit area can never drift away from the art.
		*/
		/** Fixed wall layout: bookshelf, gate, merit stele and message rack. */
		const FACILITIES = {
			config: {
				x: 10,
				y: 10,
				w: 84,
				h: 60
			},
			teams: {
				x: 102,
				y: 6,
				w: 128,
				h: 66
			},
			board: {
				x: 238,
				y: 10,
				w: 72,
				h: 60
			},
			gear: {
				x: 318,
				y: 10,
				w: 72,
				h: 60
			},
			inbox: {
				x: 398,
				y: 10,
				w: 72,
				h: 60
			}
		};
		/** Order used by the rail and by tests (left to right on the wall). */
		const FACILITY_ORDER = [
			"config",
			"teams",
			"board",
			"gear",
			"inbox"
		];
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
		/** 中庭两个可点物件：传送阵（归栏）与阵盘（配置）。 */
		const DOCK_AT = {
			x: 132,
			y: 148
		};
		const DIAL_AT = {
			x: WORLD_W - DOCK_AT.x,
			y: 142
		};
		const COLORS = {
			wall: "#2f3b33",
			wallShade: "#27322b",
			floor: "#e2d6b8",
			floorLine: "#d3c5a2",
			desk: "#7c5b3a",
			deskTop: "#a67c4f",
			monitor: "#8a6a3a",
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
		/** Hex color + alpha as a CSS rgba() string (canvas gradients). */
		function rgba(hex, alpha) {
			return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
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
				setHover() {},
				jump() {},
				cycleMount() {},
				setMount() {},
				setEquip() {},
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
			let hovered;
			const zoom = options.zoom ?? 1;
			const jumps = /* @__PURE__ */ new Map();
			const mountOverride = /* @__PURE__ */ new Map();
			const weaponEquip = /* @__PURE__ */ new Map();
			const skillEquip = /* @__PURE__ */ new Map();
			let cultivationFx = [];
			const lastXp = /* @__PURE__ */ new Map();
			const lastLevel = /* @__PURE__ */ new Map();
			function fit() {
				const ratio = Math.min(width / WORLD_W, height / worldH);
				scale = Math.max(.2, ratio) * zoom;
				offsetX = (width - WORLD_W * scale) / 2;
				offsetY = (height - worldH * scale) / 2;
			}
			/** 悬停/打开态：描金边，让墙面设施看起来可点。 */
			function paintFacilityHover(rect, hovered, active) {
				if (!hovered && !active) return;
				g.strokeStyle = active ? "rgba(212, 175, 55, 0.95)" : "rgba(255, 233, 168, 0.8)";
				g.lineWidth = active ? 1.4 : 1;
				roundRect(g, rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4, 5);
				g.stroke();
				if (hovered && !active) {
					g.fillStyle = "#d4af37";
					g.fillRect(rect.x - 3, rect.y - 3, 2, 2);
					g.fillRect(rect.x + rect.w + 1, rect.y - 3, 2, 2);
				}
			}
			/** 设施下的木牌标签：名字就是可点提示。 */
			function paintFacilityLabel(rect, label, hovered, active) {
				const text = `${truncate(label, 11)} ›`;
				g.font = hovered || active ? "bold 9px \"Segoe UI\", sans-serif" : "9px \"Segoe UI\", sans-serif";
				const width = Math.ceil(g.measureText(text).width) + 10;
				const x = Math.round(rect.x + rect.w / 2 - width / 2);
				const y = 79;
				g.fillStyle = active ? "rgba(212, 175, 55, 0.95)" : hovered ? "rgba(42, 52, 44, 0.96)" : "rgba(14, 18, 20, 0.7)";
				roundRect(g, x, y, width, 13, 3);
				g.fill();
				g.fillStyle = active ? "#241a08" : hovered ? "#ffe9a8" : "#e2ce92";
				g.fillText(text, x + 5, 89);
			}
			/** 归栏入口：火把（2026-10-26 由「金色传送阵」改为火把，更贴场景）。 */
			function paintDockArray(cx, cy, time, hovered, label) {
				const flick = .82 + .18 * Math.sin(time / 90) + .06 * Math.sin(time / 37);
				const bob = Math.sin(time / 900) * .8;
				g.save();
				g.translate(cx, cy + bob);
				const halo = g.createRadialGradient(0, 2, 2, 0, 2, 46);
				halo.addColorStop(0, `rgba(255, 176, 82, ${(.3 * flick).toFixed(3)})`);
				halo.addColorStop(.5, "rgba(255, 140, 60, 0.10)");
				halo.addColorStop(1, "rgba(255, 120, 40, 0)");
				g.fillStyle = halo;
				g.beginPath();
				g.ellipse(0, 4, 44, 20, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#5a3a22";
				g.fillRect(-2, -16, 4, 34);
				g.fillStyle = "#3f2817";
				g.fillRect(-2, -16, 1, 34);
				g.fillStyle = "#8d979b";
				g.fillRect(-4, -12, 8, 3);
				g.fillStyle = "#6a4a2a";
				g.beginPath();
				g.moveTo(-8, -18);
				g.lineTo(8, -18);
				g.lineTo(5, -25);
				g.lineTo(-5, -25);
				g.closePath();
				g.fill();
				const flame = (h, w, color) => {
					g.fillStyle = color;
					g.beginPath();
					g.moveTo(0, -25 - h);
					g.quadraticCurveTo(w, -25 - h * .42, w * .42, -25);
					g.quadraticCurveTo(0, -21, -w * .42, -25);
					g.quadraticCurveTo(-w, -25 - h * .42, 0, -25 - h);
					g.closePath();
					g.fill();
				};
				flame(17 * flick, 6.2, "rgba(214, 74, 30, 0.92)");
				flame(12 * flick, 4.6, "rgba(255, 150, 46, 0.96)");
				flame(7 * flick, 3, "rgba(255, 233, 168, 0.98)");
				g.fillStyle = `rgba(255, 196, 96, ${(.55 * flick).toFixed(3)})`;
				for (let i = 0; i < 3; i += 1) {
					const t = (time / 700 + i * .42) % 1;
					g.fillRect(-3 + i * 3, -34 - t * 22, 1.5, 1.5);
				}
				g.restore();
				paintFloorObjectLabel(cx, cy + 26, label, hovered);
			}
			/** 配置入口：大水晶（2026-10-26 由「阵盘」改为水晶，更醒目）。 */
			function paintHallDial(cx, cy, time, hovered, active, label) {
				const bob = Math.sin(time / 1400) * 2.2;
				const pulse = .5 + .5 * Math.sin(time / 1100);
				g.save();
				g.translate(cx, cy + bob);
				g.fillStyle = "rgba(24, 40, 52, 0.35)";
				g.beginPath();
				g.ellipse(0, 20, 17, 6, 0, 0, Math.PI * 2);
				g.fill();
				const glow = g.createRadialGradient(0, 2, 3, 0, 2, 40);
				glow.addColorStop(0, `rgba(120, 210, 255, ${(.26 + pulse * .16).toFixed(3)})`);
				glow.addColorStop(.6, "rgba(96, 180, 255, 0.10)");
				glow.addColorStop(1, "rgba(96, 180, 255, 0)");
				g.fillStyle = glow;
				g.beginPath();
				g.ellipse(0, 6, 38, 22, 0, 0, Math.PI * 2);
				g.fill();
				const top = -34;
				const waist = -8;
				const bottom = 18;
				const bodyGrad = g.createLinearGradient(-12, top, 12, bottom);
				bodyGrad.addColorStop(0, active ? "#eaf7ff" : "#bfe8ff");
				bodyGrad.addColorStop(.45, active ? "#9fd6ff" : "#6fb6e0");
				bodyGrad.addColorStop(1, active ? "#7fbde8" : "#3f7f9c");
				g.fillStyle = bodyGrad;
				g.beginPath();
				g.moveTo(0, top);
				g.lineTo(11, waist - 6);
				g.lineTo(8, bottom - 2);
				g.lineTo(-8, bottom - 2);
				g.lineTo(-11, waist - 6);
				g.closePath();
				g.fill();
				g.strokeStyle = active ? "rgba(255, 255, 255, 0.85)" : "rgba(226, 246, 255, 0.62)";
				g.lineWidth = 1;
				g.beginPath();
				g.moveTo(0, top);
				g.lineTo(0, bottom - 2);
				g.moveTo(-11, waist - 6);
				g.lineTo(11, waist - 6);
				g.stroke();
				g.fillStyle = "rgba(255, 255, 255, 0.55)";
				g.beginPath();
				g.moveTo(-3, -27);
				g.lineTo(1, -25);
				g.lineTo(-1, waist - 3);
				g.lineTo(-5, waist - 6);
				g.closePath();
				g.fill();
				g.fillStyle = active ? "rgba(230, 248, 255, 0.9)" : "rgba(180, 228, 255, 0.75)";
				for (let i = 0; i < 3; i += 1) {
					const angle = time / 1500 + i / 3 * Math.PI * 2;
					const px = Math.cos(angle) * 21;
					const py = -12 + Math.sin(angle) * 8;
					g.fillRect(px - 1.5, py - 1.5, 3, 3);
				}
				g.restore();
				paintFloorObjectLabel(cx, cy + 24, label, hovered || active);
			}
			/** 中庭物件的小标签，和墙面设施标签同一风格。 */
			function paintFloorObjectLabel(cx, y, label, highlighted) {
				if (label === "") return;
				const text = `${truncate(label, 11)} ›`;
				g.font = highlighted ? "bold 9px \"Segoe UI\", sans-serif" : "9px \"Segoe UI\", sans-serif";
				const width = Math.ceil(g.measureText(text).width) + 10;
				const x = Math.round(cx - width / 2);
				g.fillStyle = highlighted ? "rgba(42, 52, 44, 0.96)" : "rgba(12, 16, 20, 0.62)";
				roundRect(g, x, Math.round(y), width, 13, 3);
				g.fill();
				g.fillStyle = highlighted ? "#ffe9a8" : "#e2ce92";
				g.fillText(text, x + 5, Math.round(y) + 10);
			}
			/** 藏经阁：道统、成员与计划。 */
			function paintLibrary(rect, hovered, active) {
				g.fillStyle = "#3a2718";
				roundRect(g, rect.x, rect.y, rect.w, rect.h, 3);
				g.fill();
				g.fillStyle = "#1b120b";
				g.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
				const books = [
					"#a34b3f",
					"#3f6aa3",
					"#a3873f",
					"#3f8a6a",
					"#7a3f8a"
				];
				for (let row = 0; row < 3; row += 1) {
					const shelfY = rect.y + 7 + row * 16;
					g.fillStyle = "#2c1d12";
					g.fillRect(rect.x + 5, shelfY + 12, rect.w - 10, 2);
					for (let i = 0; i < 10; i += 1) {
						g.fillStyle = books[(i + row * 2) % books.length];
						g.fillRect(rect.x + 7 + i * 8, shelfY + 1, 5, 11);
					}
				}
				g.fillStyle = "#d8c48a";
				g.fillRect(rect.x + rect.w - 20, rect.y - 3, 14, 3);
				g.fillStyle = "#8a1c1c";
				g.fillRect(rect.x + rect.w - 21, rect.y - 3, 2, 3);
				paintFacilityHover(rect, hovered, active);
			}
			/** 开宗入口：木构山门（保留原造型），门洞中央加入旋转传输。 */
			function paintGate(rect, name, hovered, active, time) {
				g.fillStyle = "#1f2a25";
				g.beginPath();
				g.moveTo(rect.x - 8, rect.y + 11);
				g.lineTo(rect.x + rect.w / 2, rect.y - 3);
				g.lineTo(rect.x + rect.w + 8, rect.y + 11);
				g.closePath();
				g.fill();
				g.fillStyle = "#3b2a1e";
				g.fillRect(rect.x - 3, rect.y + 11, rect.w + 6, 4);
				g.fillStyle = "#0d1512";
				g.fillRect(rect.x + 10, rect.y + 16, rect.w - 20, rect.h - 16);
				const glow = g.createLinearGradient(0, rect.y + rect.h - 8, 0, rect.y + 20);
				glow.addColorStop(0, "rgba(103, 217, 165, 0.26)");
				glow.addColorStop(1, "rgba(103, 217, 165, 0)");
				g.fillStyle = glow;
				g.fillRect(rect.x + 10, rect.y + 16, rect.w - 20, rect.h - 20);
				const cx = rect.x + rect.w / 2;
				const cy = rect.y + rect.h * .62;
				const pulse = .5 + .5 * Math.sin(time / 900);
				const doorX = rect.x + 10;
				const doorY = rect.y + 16;
				const doorW = rect.w - 20;
				const doorH = rect.h - 16;
				g.save();
				g.beginPath();
				g.rect(doorX, doorY, doorW, doorH);
				g.clip();
				const base = g.createRadialGradient(cx, cy, 1, cx, cy, Math.max(26, doorW * .34));
				base.addColorStop(0, `rgba(170, 255, 228, ${(.16 + pulse * .08).toFixed(3)})`);
				base.addColorStop(.45, "rgba(48, 128, 110, 0.16)");
				base.addColorStop(1, "rgba(4, 12, 10, 0.9)");
				g.fillStyle = base;
				g.fillRect(doorX, doorY, doorW, doorH);
				const membrane = g.createRadialGradient(cx, cy + 4, 2, cx, cy, Math.max(18, doorW * .2));
				membrane.addColorStop(0, `rgba(214, 255, 244, ${(.55 + pulse * .2).toFixed(3)})`);
				membrane.addColorStop(.35, "rgba(120, 236, 200, 0.35)");
				membrane.addColorStop(.75, "rgba(30, 90, 78, 0.22)");
				membrane.addColorStop(1, "rgba(8, 20, 18, 0)");
				g.fillStyle = membrane;
				g.beginPath();
				g.ellipse(cx, cy, Math.max(10, doorW * .13), Math.max(16, doorH * .42), 0, 0, Math.PI * 2);
				g.fill();
				for (let layer = 0; layer < 5; layer += 1) {
					const spin = (layer % 2 === 0 ? 1 : -1) * time / (900 + layer * 260) + layer * .7;
					const rx = doorW * (.1 + layer * .035);
					const ry = doorH * (.16 + layer * .055);
					g.strokeStyle = `rgba(150, 245, 214, ${(.24 - layer * .035 + pulse * .05).toFixed(3)})`;
					g.lineWidth = layer === 0 ? 1.6 : 1;
					g.beginPath();
					g.ellipse(cx, cy, rx, ry, spin, spin, spin + Math.PI * 1.25);
					g.stroke();
				}
				for (let i = 0; i < 18; i += 1) {
					const seed = hash("gate" + i) % 1e3 / 1e3;
					const life = (time / (1400 + seed * 900) + seed) % 1;
					const angle = life * Math.PI * 2.4 + seed * Math.PI * 2;
					const radius = (1 - life) * (doorW * .3) + 2;
					const px = cx + Math.cos(angle) * radius;
					const py = cy + Math.sin(angle) * radius * .85;
					const size = life > .82 ? 1 : life > .5 ? 2 : 3;
					g.fillStyle = `rgba(214, 255, 244, ${(.15 + (1 - life) * .65).toFixed(3)})`;
					g.fillRect(px - size / 2, py - size / 2, size, size);
				}
				const core = g.createRadialGradient(cx, cy, .5, cx, cy, 14);
				core.addColorStop(0, "rgba(255, 255, 255, 0.95)");
				core.addColorStop(.4, `rgba(200, 255, 236, ${(.5 + pulse * .25).toFixed(3)})`);
				core.addColorStop(1, "rgba(160, 255, 220, 0)");
				g.fillStyle = core;
				g.beginPath();
				g.ellipse(cx, cy, 10, 16, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "rgba(255, 255, 255, 0.9)";
				g.fillRect(cx - 1, cy - 1, 2, 2);
				const inner = g.createLinearGradient(doorX, 0, doorX + doorW, 0);
				inner.addColorStop(0, "rgba(0, 0, 0, 0.55)");
				inner.addColorStop(.12, "rgba(0, 0, 0, 0)");
				inner.addColorStop(.88, "rgba(0, 0, 0, 0)");
				inner.addColorStop(1, "rgba(0, 0, 0, 0.55)");
				g.fillStyle = inner;
				g.fillRect(doorX, doorY, doorW, doorH);
				g.restore();
				g.fillStyle = "#6b3a2a";
				g.fillRect(rect.x + 2, rect.y + 15, 9, rect.h - 15);
				g.fillRect(rect.x + rect.w - 11, rect.y + 15, 9, rect.h - 15);
				g.fillStyle = "#8a4b34";
				g.fillRect(rect.x + 2, rect.y + 15, 2, rect.h - 15);
				g.fillRect(rect.x + rect.w - 11, rect.y + 15, 2, rect.h - 15);
				const pw = Math.min(96, rect.w - 24);
				const px = rect.x + Math.round((rect.w - pw) / 2);
				const py = rect.y + 19;
				g.fillStyle = "#6b4a2a";
				roundRect(g, px - 3, py - 3, pw + 6, 22, 3);
				g.fill();
				g.fillStyle = "#d4af37";
				roundRect(g, px, py, pw, 16, 2);
				g.fill();
				const label = truncate(name, 7);
				g.fillStyle = "#3a2410";
				g.font = "bold 9px \"Segoe UI\", sans-serif";
				g.fillText(label, px + (pw - g.measureText(label).width) / 2, py + 11);
				paintFacilityHover(rect, hovered, active);
			}
			function paintStele(rect, wall, hovered, active) {
				g.fillStyle = "#263630";
				roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
				g.fill();
				g.fillStyle = "#5a6b60";
				roundRect(g, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 5);
				g.fill();
				g.fillStyle = "#1e2a24";
				roundRect(g, rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14, 3);
				g.fill();
				g.fillStyle = "#d4af37";
				g.font = "bold 8px \"Segoe UI\", sans-serif";
				const title = truncate(wall?.title ?? "", 6);
				if (title !== "") g.fillText(title, rect.x + (rect.w - g.measureText(title).width) / 2, rect.y + 18);
				const ratio = wall === void 0 || wall.total === 0 ? 0 : Math.min(1, wall.doneCount / wall.total);
				g.fillStyle = "rgba(255, 255, 255, 0.18)";
				g.fillRect(rect.x + 12, rect.y + 22, rect.w - 24, 5);
				g.fillStyle = "#67d9a5";
				g.fillRect(rect.x + 12, rect.y + 22, Math.round((rect.w - 24) * ratio), 5);
				g.fillStyle = "#e8eef8";
				g.font = "bold 13px \"Segoe UI\", sans-serif";
				const count = `${wall?.doneCount ?? 0}/${wall?.total ?? 0}`;
				g.fillText(count, rect.x + (rect.w - g.measureText(count).width) / 2, rect.y + 45);
				const dots = [
					[wall?.runningCount ?? 0, "#5b8def"],
					[wall?.waitingCount ?? 0, "#e0a94a"],
					[wall?.failedCount ?? 0, "#ef6b6b"]
				];
				let dx = rect.x + 12;
				g.font = "7px \"Segoe UI\", sans-serif";
				for (const [value, tone] of dots) {
					g.fillStyle = tone;
					g.fillRect(dx, rect.y + 51, 4, 4);
					g.fillStyle = "#c9d5e3";
					g.fillText(String(value), dx + 6, rect.y + 55);
					dx += 20;
				}
				paintFacilityHover(rect, hovered, active);
			}
			/** 天机阁：法器/坐骑/技能的陈列柜，点开装备页。 */
			function paintGear(rect, hovered, active) {
				g.fillStyle = "#263630";
				roundRect(g, rect.x, rect.y, rect.w, rect.h, 4);
				g.fill();
				g.fillStyle = "#4f5f55";
				roundRect(g, rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8, 5);
				g.fill();
				g.fillStyle = "#1e2a24";
				roundRect(g, rect.x + 7, rect.y + 7, rect.w - 14, rect.h - 14, 3);
				g.fill();
				g.fillStyle = "#7a6a4a";
				g.fillRect(rect.x + 10, rect.y + 22, rect.w - 20, 2);
				g.fillRect(rect.x + 10, rect.y + 38, rect.w - 20, 2);
				g.fillStyle = "#8fe3ff";
				g.fillRect(rect.x + 14, rect.y + 14, 5, 7);
				g.fillRect(rect.x + 24, rect.y + 15, 4, 6);
				g.fillStyle = "#f2c14e";
				g.fillRect(rect.x + rect.w - 22, rect.y + 15, 5, 6);
				const cx = rect.x + rect.w / 2;
				const cy = rect.y + 31;
				const glow = g.createRadialGradient(cx, cy, 1, cx, cy, 13);
				glow.addColorStop(0, "rgba(143, 227, 255, 0.9)");
				glow.addColorStop(.6, "rgba(143, 227, 255, 0.25)");
				glow.addColorStop(1, "rgba(143, 227, 255, 0)");
				g.fillStyle = glow;
				g.beginPath();
				g.arc(cx, cy, 13, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#e8fbff";
				g.beginPath();
				g.arc(cx, cy, 4, 0, Math.PI * 2);
				g.fill();
				paintFacilityHover(rect, hovered, active);
			}
			/** 传音阁：掌门收件箱，红点表示未读。 */
			function paintPost(rect, badge, hovered, active) {
				g.fillStyle = "#3a2718";
				roundRect(g, rect.x, rect.y, rect.w, rect.h, 3);
				g.fill();
				g.fillStyle = "#1b120b";
				g.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
				for (let i = 0; i < 3; i += 1) {
					const bx = rect.x + 9 + i * 22;
					g.fillStyle = "#4a3524";
					roundRect(g, bx, rect.y + 14, 18, 24, 2);
					g.fill();
					g.fillStyle = "#e8e2ce";
					g.fillRect(bx + 3, rect.y + 19, 12, 9);
					g.fillStyle = "#b9ae90";
					g.beginPath();
					g.moveTo(bx + 3, rect.y + 19);
					g.lineTo(bx + 9, rect.y + 24);
					g.lineTo(bx + 15, rect.y + 19);
					g.closePath();
					g.fill();
					g.fillStyle = "#8a1c1c";
					g.fillRect(bx + 7, rect.y + 25, 4, 4);
				}
				g.fillStyle = "#6b4a2a";
				g.fillRect(rect.x + 4, rect.y + 9, rect.w - 8, 3);
				g.fillStyle = "#d4af37";
				g.beginPath();
				g.arc(rect.x + rect.w / 2, rect.y + 7, 3.5, 0, Math.PI * 2);
				g.fill();
				if (badge > 0) {
					g.fillStyle = "#ef6b6b";
					g.beginPath();
					g.arc(rect.x + rect.w - 7, rect.y + 8, 6.5, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#fff";
					g.font = "bold 7px \"Segoe UI\", monospace";
					g.fillText(String(Math.min(9, badge)), rect.x + rect.w - 10, rect.y + 11);
				}
				paintFacilityHover(rect, hovered, active);
			}
			/** 中庭飘浮的灵气尘：纯氛围，让大块地面不显得空。 */
			function paintQiMotes(time) {
				const floorH = worldH - 96;
				if (floorH < 260) return;
				for (let i = 0; i < 12; i += 1) {
					const phase = (time / 9e3 + i / 12) % 1;
					const x = 24 + i * 137 % (WORLD_W - 48) + Math.sin(time / 3200 + i * 1.7) * 14;
					const y = 136 + (1 - phase) * (floorH - 60);
					const alpha = .16 * Math.sin(phase * Math.PI);
					if (alpha <= .01) continue;
					g.fillStyle = `rgba(236, 220, 160, ${alpha.toFixed(3)})`;
					g.fillRect(Math.round(x), Math.round(y), 1.5, 1.5);
				}
			}
			/** 地面聚灵阵：给高房间的空地面一点内容，纯装饰、不可点。 */
			function paintFloorFormation(time) {
				const floorH = worldH - 96;
				if (floorH < 220) return;
				const cx = WORLD_W / 2;
				const cy = 96 + floorH * .56;
				const radius = Math.min(WORLD_W * .44, floorH * .46);
				const pulse = .55 + Math.abs(Math.sin(time / 2600)) * .45;
				g.lineWidth = 1;
				g.strokeStyle = `rgba(122, 102, 58, ${(.24 * pulse).toFixed(3)})`;
				for (const ratio of [
					1,
					.66,
					.34
				]) {
					g.beginPath();
					g.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
					g.stroke();
				}
				for (let i = 0; i < 8; i += 1) {
					const angle = i / 8 * Math.PI * 2;
					g.beginPath();
					g.moveTo(cx + Math.cos(angle) * radius * .36, cy + Math.sin(angle) * radius * .36);
					g.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
					g.stroke();
				}
				g.strokeStyle = `rgba(103, 217, 165, ${(.1 * pulse).toFixed(3)})`;
				for (let i = 0; i < 16; i += 1) {
					const angle = i / 16 * Math.PI * 2;
					g.beginPath();
					g.moveTo(cx + Math.cos(angle) * radius * .86, cy + Math.sin(angle) * radius * .86);
					g.lineTo(cx + Math.cos(angle) * radius * .94, cy + Math.sin(angle) * radius * .94);
					g.stroke();
				}
				g.fillStyle = `rgba(103, 217, 165, ${(.2 * pulse).toFixed(3)})`;
				g.fillRect(cx - 3, cy - 3, 6, 6);
				g.fillStyle = "rgba(150, 126, 70, 0.3)";
				for (let i = 0; i < 4; i += 1) {
					const angle = Math.PI / 4 + i / 4 * Math.PI * 2;
					g.fillRect(cx + Math.cos(angle) * radius * .66 - 2, cy + Math.sin(angle) * radius * .66 - 2, 4, 4);
				}
			}
			/** 庭院摆了石灯与香炉，让高面板下方的空地像宗门中庭而不是留白。 */
			function paintYardProps(time, lastDeskY) {
				const floorH = worldH - 96;
				if (floorH < 520) return;
				const base = worldH - 24;
				paintStoneLantern(26, base, time);
				paintStoneLantern(WORLD_W - 26, base, time);
				if (floorH >= 760 && lastDeskY + 60 < worldH - 227) paintCenser(WORLD_W / 2 - 150, worldH - 150, time);
				else paintCenser(WORLD_W / 2, base, time);
			}
			/** 中庭莲池：给高面板的底部一块真实景物，纯装饰。 */
			function paintPond(time, lastDeskY) {
				if (worldH - 96 < 760 || lastDeskY + 60 >= worldH - 227) return;
				const cx = WORLD_W / 2;
				const cy = worldH - 145;
				const rx = 122;
				const ry = 72;
				g.fillStyle = "#8a8574";
				g.beginPath();
				g.ellipse(cx, cy, 132, 82, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#5f5b4e";
				g.beginPath();
				g.ellipse(cx, cy, 126, 76, 0, 0, Math.PI * 2);
				g.fill();
				const water = g.createLinearGradient(0, cy - ry, 0, cy + ry);
				water.addColorStop(0, "#3f727a");
				water.addColorStop(.55, "#2f5d68");
				water.addColorStop(1, "#22444f");
				g.fillStyle = water;
				g.beginPath();
				g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
				g.fill();
				for (let i = 0; i < 3; i += 1) {
					const phase = (time / 4200 + i / 3) % 1;
					g.strokeStyle = `rgba(180, 226, 224, ${(.16 * (1 - phase)).toFixed(3)})`;
					g.lineWidth = 1;
					g.beginPath();
					g.ellipse(cx, cy + 8, 24 + phase * 80, 12 + phase * 36, 0, 0, Math.PI * 2);
					g.stroke();
				}
				for (const [dx, dy, size] of [
					[
						-70,
						-18,
						16
					],
					[
						-28,
						20,
						13
					],
					[
						34,
						-24,
						15
					],
					[
						72,
						12,
						12
					],
					[
						8,
						34,
						11
					]
				]) {
					g.fillStyle = "#3f7d4e";
					g.beginPath();
					g.ellipse(cx + dx, cy + dy, size, size * .62, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#599f61";
					g.beginPath();
					g.ellipse(cx + dx - 2, cy + dy - 2, size * .7, size * .42, 0, 0, Math.PI * 2);
					g.fill();
				}
				const flowerBob = Math.round(Math.sin(time / 1500) * 1);
				g.fillStyle = "#e8a0b4";
				for (const [dx, dy] of [[-28, 12], [40, -28]]) {
					g.fillRect(cx + dx - 2, cy + dy - 6 + flowerBob, 4, 4);
					g.fillStyle = "#f4c6d4";
					g.fillRect(cx + dx - 1, cy + dy - 7 + flowerBob, 2, 2);
					g.fillStyle = "#e8a0b4";
				}
				for (let i = 0; i < 2; i += 1) {
					const angle = time / (3200 + i * 900) + i * Math.PI;
					const kx = cx + Math.cos(angle) * (58 + i * 16);
					const ky = cy + Math.sin(angle * 1.3) * 26;
					g.fillStyle = i === 0 ? "#e08a4a" : "#e6d2a8";
					g.fillRect(Math.round(kx), Math.round(ky), 5, 2);
					g.fillStyle = "rgba(255, 255, 255, 0.55)";
					g.fillRect(Math.round(kx) + 3, Math.round(ky), 2, 1);
					g.fillStyle = "rgba(224, 138, 74, 0.5)";
					g.fillRect(Math.round(kx) - 2, Math.round(ky) - 1, 2, 4);
				}
				g.fillStyle = "#6b6656";
				for (const [dx, dy, w, h] of [
					[
						-126,
						22,
						10,
						5
					],
					[
						rx - 2,
						-20,
						9,
						5
					],
					[
						-40,
						74,
						12,
						4
					],
					[
						66,
						ry,
						8,
						4
					]
				]) g.fillRect(cx + dx, cy + dy, w, h);
				g.strokeStyle = "#4f7d4e";
				g.lineWidth = 1;
				for (let i = 0; i < 4; i += 1) {
					const bx = 156 + i * 9;
					g.beginPath();
					g.moveTo(bx, cy + ry - 2);
					g.lineTo(bx + Math.sin(time / 2200 + i) * 2, cy + ry - 16 - i % 2 * 4);
					g.stroke();
				}
			}
			function paintStoneLantern(cx, baseY, time) {
				g.fillStyle = "#3b3a32";
				g.fillRect(cx - 8, baseY - 2, 16, 3);
				g.fillStyle = "#5c5a4d";
				g.fillRect(cx - 3, baseY - 22, 6, 20);
				g.fillStyle = "#7a7666";
				g.fillRect(cx - 8, baseY - 26, 16, 4);
				g.fillStyle = "#3b3a32";
				g.fillRect(cx - 5, baseY - 36, 10, 10);
				const pulse = .6 + Math.abs(Math.sin(time / 700 + cx)) * .4;
				g.fillStyle = `rgba(240, 190, 90, ${(.55 * pulse).toFixed(3)})`;
				g.fillRect(cx - 2, baseY - 33, 4, 4);
				g.fillStyle = "#8a8574";
				g.fillRect(cx - 7, baseY - 39, 14, 3);
			}
			function paintCenser(cx, baseY, time) {
				g.fillStyle = "#5b4630";
				g.fillRect(cx - 12, baseY - 18, 24, 12);
				g.fillStyle = "#7a5b3a";
				g.fillRect(cx - 14, baseY - 22, 28, 5);
				g.fillStyle = "#a67c4f";
				g.fillRect(cx - 14, baseY - 22, 28, 2);
				g.fillStyle = "#3a2a1a";
				g.fillRect(cx - 10, baseY - 6, 4, 6);
				g.fillRect(cx + 6, baseY - 6, 4, 6);
				g.fillRect(cx - 2, baseY - 7, 4, 7);
				for (let i = 0; i < 3; i += 1) {
					const phase = (time / 1800 + i / 3) % 1;
					g.fillStyle = `rgba(150, 200, 170, ${(.22 * (1 - phase)).toFixed(3)})`;
					const sx = cx - 8 + i * 8 + Math.round(Math.sin(time / 600 + i) * 2);
					g.fillRect(sx, Math.round(baseY - 26 - phase * 30), 2, 2);
				}
				const pulse = .55 + Math.abs(Math.sin(time / 900)) * .45;
				g.fillStyle = `rgba(224, 169, 74, ${(.55 * pulse).toFixed(3)})`;
				g.fillRect(cx - 3, baseY - 19, 6, 2);
			}
			/** 木板墙：梁、灯、四件可点设施，以及下方的工位地面。 */
			function paintRoom(time, wall, hovered, lastDeskY) {
				g.fillStyle = COLORS.wall;
				g.fillRect(0, 0, WORLD_W, 96);
				g.fillStyle = "rgba(255, 255, 255, 0.03)";
				for (let x = 0; x < WORLD_W; x += 64) g.fillRect(x, 0, 1, 82);
				g.fillStyle = COLORS.wallShade;
				g.fillRect(0, 82, WORLD_W, 14);
				g.fillStyle = "#1d2723";
				g.fillRect(0, 0, WORLD_W, 4);
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
				paintFloorFormation(time);
				paintQiMotes(time);
				for (const lx of [124]) {
					const swing = Math.sin(time / 720 + lx) * 2;
					g.fillStyle = "#3a2a1a";
					g.fillRect(lx - 1, 5, 2, 9);
					g.fillStyle = "#8a1c1c";
					g.beginPath();
					g.ellipse(lx + swing, 25, 7, 10, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#d4af37";
					g.fillRect(lx + swing - 7, 23, 14, 2);
					g.fillRect(lx + swing - 1, 35, 2, 4);
				}
				paintYardProps(time, lastDeskY);
				const facilityIndex = /* @__PURE__ */ new Map();
				for (const facility of model?.facilities ?? []) facilityIndex.set(facility.action, facility);
				const hoverAction = hovered?.kind === "action" ? hovered.action : void 0;
				const active = model?.activeAction;
				paintLibrary(FACILITIES.config, hoverAction === "config", active === "config");
				paintGate(FACILITIES.teams, model?.teamName ?? "", hoverAction === "teams", active === "teams", time);
				paintStele(FACILITIES.board, wall, hoverAction === "board", active === "board");
				paintGear(FACILITIES.gear, hoverAction === "gear", active === "gear");
				paintPost(FACILITIES.inbox, facilityIndex.get("inbox")?.badge ?? 0, hoverAction === "inbox", active === "inbox");
				for (const action of FACILITY_ORDER) {
					const facility = facilityIndex.get(action);
					if (facility === void 0) continue;
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
				if (realm >= 2) {
					const radius = 18 + realm * 5;
					const halo = g.createRadialGradient(cx, base - 16, 2, cx, base - 16, radius);
					halo.addColorStop(0, rgba(accent, .2 + realm * .05));
					halo.addColorStop(.6, rgba(accent, .08 + realm * .02));
					halo.addColorStop(1, rgba(accent, 0));
					g.fillStyle = halo;
					g.beginPath();
					g.arc(cx, base - 16, radius, 0, Math.PI * 2);
					g.fill();
					g.save();
					g.shadowColor = rgba(accent, .9);
					g.shadowBlur = 4 + realm * 2;
					g.fillStyle = rgba(accent, .55);
					g.fillRect(cx - 1, base - 24, 2, 2);
					g.restore();
				}
				if (realm >= 3) {
					g.fillStyle = rgba(accent, .9);
					for (let i = 0; i < 3; i += 1) {
						const angle = time / 900 + i * 2.1;
						g.fillRect(cx + Math.cos(angle) * 16 - 1, base - 16 + Math.sin(angle) * 9 - 1, 2, 2);
					}
				}
				switch (visual.weapon) {
					case "sword": {
						g.fillStyle = "#6b4a2a";
						g.fillRect(cx - 22, base - 16, 3, 16);
						g.fillRect(cx + 19, base - 16, 3, 16);
						g.fillStyle = "#8a6a3a";
						g.fillRect(cx - 22, base - 18, 44, 2);
						const length = 17 + realm * 2;
						const pulse = working ? .82 + Math.sin(time / 90) * .18 : .66;
						g.save();
						g.shadowColor = "rgba(126, 232, 255, " + pulse.toFixed(2) + ")";
						g.shadowBlur = 6 + realm * 4;
						g.strokeStyle = "rgba(150, 240, 255, " + pulse.toFixed(2) + ")";
						g.lineWidth = 5;
						g.lineCap = "round";
						g.beginPath();
						g.moveTo(cx - length, base - 15);
						g.lineTo(cx + length, base - 15);
						g.stroke();
						g.strokeStyle = "#ffffff";
						g.lineWidth = 2;
						g.beginPath();
						g.moveTo(cx - length + 2, base - 15);
						g.lineTo(cx + length - 2, base - 15);
						g.stroke();
						g.restore();
						g.fillStyle = "#333a46";
						g.fillRect(cx - length - 10, base - 18, 10, 6);
						g.fillStyle = "#d4af37";
						g.fillRect(cx - length - 2, base - 19, 2, 8);
						if (working) {
							g.fillStyle = "rgba(180, 245, 255, 0.95)";
							g.fillRect(cx + length + 2, base - 18 - Math.round(Math.sin(time / 140) * 2), 2, 2);
							g.fillRect(cx - length - 4, base - 12 - Math.round(Math.cos(time / 170) * 2), 2, 2);
						}
						break;
					}
					case "fan":
						g.fillStyle = "#8a5a3a";
						g.fillRect(cx - 2, base - 8, 3, 12);
						g.fillStyle = accent;
						g.fillRect(cx - 12, base - 23, 20, 3);
						g.fillRect(cx - 14, base - 20, 24, 3);
						g.fillRect(cx - 12, base - 17, 20, 3);
						g.fillStyle = trim;
						g.fillRect(cx - 14, base - 20, 24, 1);
						break;
					case "pill":
						g.fillStyle = accent;
						g.fillRect(cx - 8, base - 18, 16, 12);
						g.fillStyle = trim;
						g.fillRect(cx - 3, base - 22, 6, 4);
						g.fillStyle = "#ffffff";
						g.fillRect(cx - 5, base - 16, 3, 6);
						if (working) {
							g.fillStyle = "rgba(230, 217, 255, 0.85)";
							g.fillRect(cx + 10, base - 26 - Math.round(Math.sin(time / 300) * 2), 2, 2);
						}
						break;
					case "scroll":
						g.fillStyle = accent;
						g.fillRect(cx - 14, base - 18, 28, 10);
						g.fillStyle = "#8a6a3a";
						g.fillRect(cx - 16, base - 20, 3, 14);
						g.fillRect(cx + 13, base - 20, 3, 14);
						g.fillStyle = "#8a1c1c";
						g.fillRect(cx - 2, base - 18, 4, 2);
						break;
					case "gourd":
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
					case "compass":
						g.fillStyle = "#2f4a4a";
						g.beginPath();
						g.arc(cx, base - 12, 10, 0, Math.PI * 2);
						g.fill();
						g.fillStyle = trim;
						g.beginPath();
						g.arc(cx, base - 12, 6, 0, Math.PI * 2);
						g.fill();
						g.fillStyle = "#d4af37";
						g.fillRect(cx - 1, base - 18, 2, 8);
						break;
					case "brush":
						g.fillStyle = "#4a3a2a";
						g.fillRect(cx - 8, base - 10, 16, 10);
						g.fillStyle = "#8a5a3a";
						g.fillRect(cx - 1, base - 26, 2, 18);
						g.fillStyle = accent;
						g.fillRect(cx - 2, base - 30, 4, 5);
						break;
					case "lantern":
						g.fillStyle = trim;
						g.fillRect(cx - 1, base - 30, 2, 6);
						g.fillStyle = accent;
						g.fillRect(cx - 7, base - 24, 14, 12);
						g.fillStyle = "rgba(255, 242, 196, 0.95)";
						g.fillRect(cx - 5, base - 22, 10, 8);
						if (working) {
							g.fillStyle = "rgba(255, 220, 140, 0.22)";
							g.beginPath();
							g.arc(cx, base - 18, 12, 0, Math.PI * 2);
							g.fill();
						}
						break;
					case "array":
						g.fillStyle = "#1f3a3a";
						g.fillRect(cx - 12, base - 20, 24, 14);
						g.fillStyle = accent;
						for (const dot of [
							[-8, -16],
							[0, -16],
							[8, -16],
							[-4, -11],
							[4, -11]
						]) g.fillRect(cx + dot[0] - 1, base + dot[1] - 1, 2, 2);
						break;
					case "fist":
						g.fillStyle = accent;
						g.fillRect(cx - 10, base - 12, 9, 8);
						g.fillRect(cx + 2, base - 12, 9, 8);
						g.fillStyle = trim;
						g.fillRect(cx - 10, base - 12, 9, 2);
						g.fillRect(cx + 2, base - 12, 9, 2);
						break;
					case "book":
						g.fillStyle = accent;
						g.fillRect(cx - 12, base - 10, 24, 5);
						g.fillStyle = trim;
						g.fillRect(cx - 10, base - 16, 22, 5);
						g.fillStyle = "#8a6a3a";
						g.fillRect(cx - 12, base - 10, 2, 5);
						break;
					case "hammer":
						g.fillStyle = "#8a5a3a";
						g.fillRect(cx - 1, base - 18, 3, 18);
						g.fillStyle = accent;
						g.fillRect(cx - 9, base - 24, 18, 8);
						g.fillStyle = trim;
						g.fillRect(cx - 9, base - 24, 18, 2);
						break;
					case "crown":
						g.fillStyle = "#6b4a2a";
						g.fillRect(cx - 16, base - 30, 2, 30);
						g.fillStyle = "#d4af37";
						g.fillRect(cx - 17, base - 31, 4, 3);
						g.fillStyle = accent;
						g.fillRect(cx - 14, base - 29, 16, 9);
						g.fillStyle = "#8a1c1c";
						g.fillRect(cx - 14, base - 25, 16, 2);
						g.fillStyle = "#1b1510";
						g.fillRect(cx - 8, base - 27, 4, 4);
						break;
					case "talisman":
						g.fillStyle = "#f2e6c4";
						g.fillRect(cx - 6, base - 30, 12, 18);
						g.fillStyle = "#fff6dd";
						g.fillRect(cx - 5, base - 29, 10, 16);
						g.fillStyle = trim;
						g.fillRect(cx - 5, base - 26, 10, 1);
						g.fillRect(cx - 5, base - 23, 6, 1);
						g.fillStyle = "#c23a3a";
						g.fillRect(cx - 3, base - 20, 6, 5);
						g.fillStyle = "#f2d97a";
						g.fillRect(cx - 1, base - 18, 2, 1);
						break;
					case "needle":
						g.fillStyle = "#dfe9f2";
						g.fillRect(cx - 7, base - 30, 1, 16);
						g.fillRect(cx - 1, base - 28, 1, 14);
						g.fillRect(cx + 5, base - 30, 1, 16);
						g.fillStyle = "#ffffff";
						g.fillRect(cx - 7, base - 30, 1, 2);
						g.fillRect(cx + 5, base - 30, 1, 2);
						g.fillStyle = trim;
						g.fillRect(cx - 6, base - 14, 12, 4);
						g.fillStyle = accent;
						g.fillRect(cx - 2, base - 13, 4, 2);
						break;
					case "whistle":
						g.fillStyle = accent;
						g.fillRect(cx - 9, base - 20, 12, 7);
						g.fillStyle = "#ffffff";
						g.fillRect(cx - 9, base - 20, 12, 1);
						g.fillStyle = trim;
						g.fillRect(cx - 12, base - 22, 3, 11);
						g.fillRect(cx + 5, base - 18, 2, 5);
						g.fillStyle = visual.robeDark;
						g.fillRect(cx - 5, base - 18, 2, 2);
						g.fillRect(cx - 1, base - 18, 2, 2);
						break;
					case "puppet":
						g.fillStyle = "#d8d2c8";
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
					case "flute":
						g.fillStyle = "#8a6a3a";
						g.fillRect(cx - 14, base - 22, 28, 4);
						g.fillStyle = "#b07a52";
						g.fillRect(cx - 14, base - 22, 28, 1);
						g.fillStyle = trim;
						g.fillRect(cx - 16, base - 23, 2, 6);
						g.fillRect(cx + 14, base - 23, 2, 6);
						g.fillStyle = visual.robeDark;
						g.fillRect(cx - 8, base - 21, 2, 2);
						g.fillRect(cx - 1, base - 21, 2, 2);
						g.fillRect(cx + 6, base - 21, 2, 2);
						break;
					case "vial":
						g.fillStyle = accent;
						g.fillRect(cx - 7, base - 20, 14, 10);
						g.fillStyle = "#ffffff";
						g.fillRect(cx - 7, base - 20, 14, 1);
						g.fillStyle = trim;
						g.fillRect(cx - 3, base - 25, 6, 5);
						g.fillStyle = visual.robeDark;
						g.fillRect(cx - 4, base - 17, 2, 2);
						if (working) {
							g.fillStyle = "rgba(212, 255, 154, 0.85)";
							g.fillRect(cx + 9, base - 26 - Math.round(Math.sin(time / 280) * 2), 2, 2);
						}
						break;
					case "beads":
						g.fillStyle = accent;
						for (let i = 0; i < 8; i += 1) {
							const angle = i / 8 * Math.PI * 2;
							g.fillRect(cx + Math.round(Math.cos(angle) * 9) - 1, base - 18 + Math.round(Math.sin(angle) * 7) - 1, 3, 3);
						}
						g.fillStyle = trim;
						g.fillRect(cx - 1, base - 10, 2, 6);
						break;
					case "blade":
						if (realm >= 2) {
							g.save();
							g.strokeStyle = "rgba(95, 208, 168, 0.55)";
							g.lineWidth = 1.5;
							g.beginPath();
							g.ellipse(cx + 2, deskY - 10, 16 + realm * 2, 5, 0, 0, Math.PI * 2);
							g.stroke();
							g.strokeStyle = "rgba(95, 208, 168, 0.25)";
							g.beginPath();
							g.ellipse(cx + 2, deskY - 10, 11 + realm * 2, 3.5, 0, 0, Math.PI * 2);
							g.stroke();
							g.restore();
						}
						g.save();
						g.shadowColor = "rgba(255, 79, 176, 0.9)";
						g.shadowBlur = 7 + realm * 3;
						g.fillStyle = "#4a1f9a";
						g.fillRect(cx + 2, base - 54, 9, 11);
						g.fillRect(cx + 1, base - 43, 9, 9);
						g.fillRect(cx, base - 34, 8, 8);
						g.fillRect(cx - 1, base - 26, 6, 6);
						g.fillStyle = "#ff4fb0";
						g.fillRect(cx + 10, base - 54, 2, 11);
						g.fillRect(cx + 9, base - 43, 2, 9);
						g.fillRect(cx + 7, base - 34, 2, 8);
						g.fillRect(cx + 4, base - 26, 2, 6);
						g.restore();
						g.fillStyle = "#ffd27a";
						g.fillRect(cx + 5, base - 49, 2, 2);
						g.fillRect(cx + 6, base - 39, 2, 2);
						g.fillRect(cx + 4, base - 30, 2, 2);
						g.fillStyle = "#f2c14e";
						g.fillRect(cx - 9, base - 20, 15, 3);
						g.fillStyle = "#ffe9a8";
						g.fillRect(cx - 9, base - 20, 15, 1);
						g.fillStyle = "#2a1a2a";
						g.fillRect(cx - 4, base - 17, 4, 10);
						g.fillStyle = "#7a3f52";
						g.fillRect(cx - 3, base - 17, 1, 10);
						g.fillStyle = "#c23a3a";
						g.fillRect(cx - 5, base - 7, 6, 4);
						g.fillStyle = "#ff9aa8";
						g.fillRect(cx - 4, base - 6, 2, 2);
						if (working) {
							g.fillStyle = "rgba(255, 79, 176, 0.95)";
							g.fillRect(cx + 12, base - 58 - Math.round(Math.sin(time / 160) * 3), 2, 2);
							g.fillRect(cx + 2, base - 62 - Math.round(Math.cos(time / 200) * 2), 2, 2);
						}
						break;
					default: break;
				}
			}
			/** Character + desk + 本命法器 + monitor. Overlays are painted by paintOverlay. */
			/** 修士本体：灵气、影子、道袍、发式与状态小像。baseY 是脚下地面点。 */
			function paintCharacter(cx, baseY, member, time, walking = false) {
				const seed = hash(member.id || member.name);
				const visual = roleVisual(member.isLeader === true ? "captain" : member.role);
				const skin = visual?.skin ?? pick(SKIN, seed);
				const robe = visual?.robe ?? (member.isLeader ? COLORS.captain : pick(SHIRT, seed >> 3));
				const trim = visual?.trim ?? "#e8eef8";
				const hair = visual?.hair ?? "#2a2f3a";
				const working = member.activity === "working";
				const bob = walking ? Math.round(Math.sin(time / 90 + seed % 7) * 1) : working ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
				const headY = baseY - 92 + bob;
				const bodyY = headY + 16;
				const tone = stateTone(member.activity);
				const auraPulse = .5 + Math.abs(Math.sin(time / (working ? 420 : 900))) * .5;
				const auraY = bodyY + 8;
				const auraR = (member.isLeader ? 40 : 34) + auraPulse * 4;
				const aura = g.createRadialGradient(cx, auraY, 4, cx, auraY, auraR);
				aura.addColorStop(0, rgba(tone, .26 + (working ? .1 : .02)));
				aura.addColorStop(.55, rgba(tone, .12));
				aura.addColorStop(1, rgba(tone, 0));
				g.fillStyle = aura;
				g.beginPath();
				g.arc(cx, auraY, auraR, 0, Math.PI * 2);
				g.fill();
				if (working) for (let i = 0; i < 3; i += 1) {
					const phase = (time / 1200 + i / 3) % 1;
					g.fillStyle = rgba(tone, .75 * (1 - phase));
					g.fillRect(cx - 16 + i * 12, Math.round(auraY + 14 - phase * 46), 2, 2);
				}
				g.fillStyle = "rgba(56, 44, 30, 0.16)";
				g.beginPath();
				g.ellipse(cx, baseY - 6, 24, 8, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#1b1510";
				g.fillRect(cx - 10, bodyY - 1, 20, 20);
				g.fillRect(cx - 7, headY - 1, 14, 15);
				g.fillStyle = robe;
				g.fillRect(cx - 9, bodyY, 18, 18);
				g.fillStyle = visual?.robeLight ?? "rgba(255, 255, 255, 0.16)";
				g.fillRect(cx - 9, bodyY, 3, 18);
				g.fillStyle = visual?.robeDark ?? "rgba(0, 0, 0, 0.22)";
				g.fillRect(cx + 5, bodyY, 4, 18);
				g.fillStyle = trim;
				g.fillRect(cx - 9, bodyY + 12, 18, 2);
				g.fillRect(cx - 1, bodyY, 2, 12);
				g.fillStyle = skin;
				g.fillRect(cx - 6, headY, 12, 13);
				g.fillStyle = hair;
				g.fillRect(cx - 6, headY - 2, 12, 4);
				if (visual?.hairStyle === "long") {
					g.fillRect(cx - 8, headY, 2, 12);
					g.fillRect(cx + 6, headY, 2, 12);
				}
				if (visual?.hairStyle === "topknot") {
					g.fillRect(cx - 2, headY - 6, 4, 4);
					g.fillStyle = trim;
					g.fillRect(cx - 1, headY - 7, 2, 1);
				}
				if (visual?.beard === true) {
					g.fillStyle = "#d8d2c8";
					g.fillRect(cx - 3, headY + 9, 6, 3);
				}
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
				if (member.activity === "idle" && !walking) {
					g.fillStyle = "rgba(232, 238, 248, 0.75)";
					g.font = "8px monospace";
					g.fillText("z", cx + 12, headY - 2 - Math.round(Math.sin(time / 500) * 3));
				}
			}
			/** 工位家具：矮案、蒲团、香炉与本命法器；主人离开时仍留在原位。 */
			function paintFurniture(cx, deskY, member, time) {
				const visual = roleVisual(member.isLeader === true ? "captain" : member.role);
				const working = member.activity === "working";
				const realm = realmIndex(member.progress);
				const deskX = cx - DESK_W / 2;
				g.fillStyle = COLORS.desk;
				roundRect(g, deskX, deskY - 18, DESK_W, 18, 3);
				g.fill();
				g.fillStyle = COLORS.deskTop;
				g.fillRect(deskX, deskY - 21, DESK_W, 4);
				g.fillStyle = "#8a6a4a";
				g.beginPath();
				g.ellipse(cx, deskY - 6, 26, 9, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#b08a5a";
				g.beginPath();
				g.ellipse(cx, deskY - 8, 22, 7, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#8a6a3a";
				g.beginPath();
				g.ellipse(cx + 30, deskY - 38, 7, 4, 0, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = working ? "#e0a94a" : "#7a6a4a";
				g.fillRect(cx + 27, deskY - 43, 6, 3);
				if (working) {
					g.fillStyle = "rgba(222, 226, 238, 0.35)";
					g.beginPath();
					g.arc(cx + 30, deskY - 52, 4, 0, Math.PI * 2);
					g.fill();
					g.beginPath();
					g.arc(cx + 34, deskY - 60, 3, 0, Math.PI * 2);
					g.fill();
				}
				if (visual !== void 0) paintWeapon(visual, cx, deskY, realm, working, time);
			}
			/** 悬停工位：四角描金 + 轻微呼吸，和工作台一体。 */
			function paintDeskHover(cx, deskY, time) {
				const x = cx - 54;
				const y = deskY - 104;
				const w = 108;
				const h = 128;
				const len = 10;
				const pulse = .55 + Math.abs(Math.sin(time / 500)) * .35;
				g.strokeStyle = `rgba(255, 233, 168, ${pulse.toFixed(3)})`;
				g.lineWidth = 1.2;
				for (const [dx, dy, sx, sy] of [
					[
						x,
						y,
						1,
						1
					],
					[
						x + w,
						y,
						-1,
						1
					],
					[
						x,
						y + h,
						1,
						-1
					],
					[
						x + w,
						y + h,
						-1,
						-1
					]
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
				const rgb = member.isLeader === true ? "242, 193, 78" : "111, 214, 200";
				const pulse = .5 + .5 * Math.sin(time / 900);
				g.save();
				const glow = g.createRadialGradient(cx, baseY - 46, 2, cx, baseY - 46, 52);
				glow.addColorStop(0, `rgba(${rgb}, ${(.26 + pulse * .08).toFixed(3)})`);
				glow.addColorStop(.55, `rgba(${rgb}, ${(.1 + pulse * .05).toFixed(3)})`);
				glow.addColorStop(1, "rgba(0, 0, 0, 0)");
				g.fillStyle = glow;
				g.beginPath();
				g.ellipse(cx, baseY - 46, 44, 58, 0, 0, Math.PI * 2);
				g.fill();
				g.strokeStyle = `rgba(${rgb}, ${(.18 + pulse * .1).toFixed(3)})`;
				g.lineWidth = 1.2;
				g.beginPath();
				g.ellipse(cx, baseY - 2, 30, 9, 0, 0, Math.PI * 2);
				g.stroke();
				g.restore();
			}
			/** 双击弹跳高度（抛物线，520ms）。 */
			function jumpHeight(id, time) {
				const start = jumps.get(id);
				if (start === void 0) return 0;
				if (start < 0) {
					jumps.set(id, time);
					return 0;
				}
				const progress = (time - start) / 520;
				if (progress >= 1) {
					jumps.delete(id);
					return 0;
				}
				return Math.sin(progress * Math.PI) * 20;
			}
			/** 高境界的修士闲逛时御剑或乘神兽。 */
			function mountKindOf(member) {
				if (member.activity === "working") return void 0;
				const level = member.level ?? 0;
				if (level >= 8) return "beast";
				if (level >= 5) return "sword";
			}
			/** 双击切换后的坐骑：auto 按等级、off 步行、指定则强制。 */
			function chosenMount(member) {
				if (member.activity === "working") return void 0;
				const mode = mountOverride.get(member.id || member.name);
				if (mode === "off") return void 0;
				if (mode === "sword" || mode === "beast") return mode;
				return mountKindOf(member);
			}
			function liftOf(kind) {
				return kind === "sword" ? 14 : kind === "beast" ? 9 : 0;
			}
			function paintMount(cx, y, kind, time) {
				const bob = Math.sin(time / 380) * 1.2;
				g.save();
				g.translate(cx, y + bob);
				if (kind === "sword") {
					const glow = g.createRadialGradient(0, -4, 2, 0, -4, 40);
					glow.addColorStop(0, "rgba(120, 220, 255, 0.34)");
					glow.addColorStop(1, "rgba(120, 220, 255, 0)");
					g.fillStyle = glow;
					g.beginPath();
					g.ellipse(0, -4, 38, 14, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#e8fbff";
					g.fillRect(-24, -6, 46, 3);
					g.fillStyle = "#8fe3ff";
					g.fillRect(14, -7, 12, 5);
					g.fillStyle = "#f2c14e";
					g.fillRect(-10, -8, 6, 2);
					g.fillStyle = "rgba(180, 240, 255, 0.75)";
					g.fillRect(-28, -5, 3, 1);
					g.fillRect(-34, -4, 3, 1);
				} else {
					g.fillStyle = "rgba(120, 220, 200, 0.16)";
					g.beginPath();
					g.ellipse(0, 0, 26, 9, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#3d5c52";
					g.beginPath();
					g.ellipse(0, -8, 18, 7, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#4d7266";
					g.beginPath();
					g.ellipse(14, -13, 7, 6, 0, 0, Math.PI * 2);
					g.fill();
					g.fillStyle = "#f2c14e";
					g.fillRect(11, -20, 2, 5);
					g.fillRect(17, -20, 2, 5);
					g.fillStyle = "#2e4740";
					g.fillRect(-13, -4, 3, 6);
					g.fillRect(7, -4, 3, 6);
					g.fillRect(-22, -11, 8, 3);
					g.fillStyle = "#ffe9a8";
					g.fillRect(16, -14, 2, 2);
				}
				g.restore();
			}
			/** 当前对话者头顶的悬浮标签，比只有光圈更容易一眼看到。 */
			function paintViewingBadge(cx, baseY, member, time) {
				const text = model?.labels?.viewing ?? "对话中";
				const color = member.isLeader === true ? "#f2c14e" : "#6fd6c8";
				const bob = Math.sin(time / 520) * 2;
				g.save();
				g.font = "bold 8px \"Segoe UI\", sans-serif";
				const w = g.measureText(text).width + 12;
				const x = cx + 22;
				const y = baseY - 104 + bob;
				g.fillStyle = "rgba(12, 18, 22, 0.88)";
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
				if (level !== void 0) {
					const previous = lastLevel.get(id);
					if (previous !== void 0 && level > previous) {
						cultivationFx.push({
							x: spot.cx,
							y: spot.baseY - 152,
							groundY: spot.baseY,
							text: `Lv.${level}`,
							start: time,
							kind: "level"
						});
						leveled = true;
					}
					lastLevel.set(id, level);
				}
				const xp = spot.member.xp;
				if (xp !== void 0) {
					const previous = lastXp.get(id);
					if (previous !== void 0 && xp - previous >= 1 && !leveled) cultivationFx.push({
						x: spot.cx,
						y: spot.baseY - 118,
						groundY: spot.baseY,
						text: `+${Math.round(xp - previous)}`,
						start: time,
						kind: "xp"
					});
					lastXp.set(id, xp);
				}
				if (cultivationFx.length > 40) cultivationFx = cultivationFx.slice(-40);
			}
			function drawCultivationFx(time) {
				const keep = [];
				for (const fx of cultivationFx) {
					const progress = (time - fx.start) / 1400;
					if (progress >= 1) continue;
					keep.push(fx);
					const alpha = 1 - progress;
					const y = fx.y - progress * 30;
					g.save();
					g.globalAlpha = alpha;
					if (fx.kind === "level") {
						const ring = 16 + progress * 46;
						const ringY = fx.groundY - 2;
						g.strokeStyle = "#f2c14e";
						g.lineWidth = 2;
						g.beginPath();
						g.ellipse(fx.x, ringY, ring, ring * .32, 0, 0, Math.PI * 2);
						g.stroke();
						for (let i = 0; i < 8; i += 1) {
							const angle = i / 8 * Math.PI * 2 + progress * 2;
							g.fillStyle = "#ffe9a8";
							g.fillRect(fx.x + Math.cos(angle) * ring - 1.5, ringY + Math.sin(angle) * ring * .32 - 1.5, 3, 3);
						}
						g.font = "bold 10px \"Segoe UI\", sans-serif";
						const text = `${model?.labels?.levelUp ?? "Level up"} ${fx.text}`;
						const w = g.measureText(text).width;
						g.fillStyle = "rgba(12, 18, 22, 0.88)";
						roundRect(g, fx.x - w / 2 - 6, y - 10, w + 12, 16, 4);
						g.fill();
						g.strokeStyle = "#f2c14e";
						g.lineWidth = 1;
						roundRect(g, fx.x - w / 2 - 6, y - 10, w + 12, 16, 4);
						g.stroke();
						g.fillStyle = "#f2c14e";
						g.fillText(text, fx.x - w / 2, y + 3);
					} else {
						g.font = "bold 10px \"Segoe UI\", sans-serif";
						const w = g.measureText(fx.text).width;
						g.fillStyle = "rgba(12, 18, 22, 0.78)";
						roundRect(g, fx.x - w / 2 - 5, y - 9, w + 10, 14, 4);
						g.fill();
						g.fillStyle = "#9be36f";
						g.fillText(fx.text, fx.x - w / 2, y + 2);
					}
					g.restore();
				}
				cultivationFx = keep;
			}
			/** 境界灵光：Lv.2 起周身灵光，Lv.10 起脚下金环。 */
			function paintCultivationAura(cx, baseY, member, time) {
				const level = member.level ?? 0;
				if (level < 2) return;
				g.save();
				const count = level >= 10 ? 6 : 3;
				for (let i = 0; i < count; i += 1) {
					const angle = time / 1200 + i / count * Math.PI * 2;
					const x = cx + Math.cos(angle) * 22;
					const y = baseY - 55 + Math.sin(angle * 1.4) * 16;
					g.globalAlpha = .32 + .24 * Math.sin(time / 500 + i);
					g.fillStyle = level >= 10 ? "#f2c14e" : "#9be36f";
					g.fillRect(x - 1, y - 1, 2, 2);
				}
				if (level >= 10) {
					g.globalAlpha = .22 + .1 * Math.sin(time / 700);
					g.strokeStyle = "#f2c14e";
					g.lineWidth = 1;
					g.beginPath();
					g.ellipse(cx, baseY - 2, 28, 8, 0, 0, Math.PI * 2);
					g.stroke();
				}
				g.restore();
			}
			/** 已装备外观：法器悬浮在身侧，技能多一层灵环。 */
			function paintEquipFx(cx, baseY, member, time) {
				const key = member.id || member.name;
				const weaponTier = weaponEquip.get(key);
				const skillTier = skillEquip.get(key);
				if (weaponTier !== void 0) {
					const color = weaponTier >= 1e3 ? "#c39bff" : weaponTier >= 100 ? "#8fe3ff" : "#f2c14e";
					const bob = Math.sin(time / 620) * 2;
					g.save();
					g.translate(cx + 21, baseY - 58 + bob);
					g.globalAlpha = .28;
					g.fillStyle = color;
					g.beginPath();
					g.ellipse(0, 0, 12, 14, 0, 0, Math.PI * 2);
					g.fill();
					g.globalAlpha = .95;
					g.fillStyle = color;
					g.fillRect(-1, -11, 2, 20);
					g.fillRect(-3, -13, 6, 3);
					g.fillRect(-2, 9, 4, 2);
					g.font = "bold 8px \"Segoe UI\", sans-serif";
					g.fillText("✦", 7, -8);
					g.restore();
				}
				if (skillTier !== void 0) {
					const color = skillTier >= 1e3 ? "#c39bff" : skillTier >= 100 ? "#8fe3ff" : "#9be36f";
					g.save();
					g.globalAlpha = .5 + .15 * Math.sin(time / 480);
					g.strokeStyle = color;
					g.lineWidth = 1.4;
					g.beginPath();
					g.ellipse(cx, baseY - 2, 30, 10, 0, 0, Math.PI * 2);
					g.stroke();
					for (let i = 0; i < 3; i += 1) {
						const angle = time / 900 + i / 3 * Math.PI * 2;
						g.fillStyle = color;
						g.fillRect(cx + Math.cos(angle) * 33 - 1.5, baseY - 2 + Math.sin(angle) * 10 - 1.5, 3, 3);
					}
					g.restore();
				}
			}
			/** Name plate, state dot, progress bar, task bubble and unread badge. */
			function paintOverlay(cx, deskY, member, time) {
				const seed = hash(member.id || member.name);
				const bob = member.activity === "working" ? Math.round(Math.sin(time / 130 + seed % 7) * 1.5) : Math.round(Math.sin(time / 700 + seed % 5) * 1);
				const headY = deskY - 92 + bob;
				const labels = model?.labels;
				const stateText = member.viewing === true ? labels?.viewing ?? "对话中" : member.activity === "working" ? labels?.working : member.activity === "idle" ? labels?.idle : labels?.unknownState;
				const label = stateText === void 0 || stateText === "" ? truncate(member.name, 10) : `${truncate(member.name, 8)} · ${stateText}`;
				g.font = "9px \"Segoe UI\", monospace";
				const textW = g.measureText(label).width;
				g.fillStyle = COLORS.labelBg;
				roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3);
				g.fill();
				g.fillStyle = member.isLeader ? COLORS.captain : COLORS.label;
				g.fillText(label, cx - textW / 2, deskY + 13);
				if (member.viewing === true) {
					const accent = member.isLeader === true ? "#f2c14e" : "#6fd6c8";
					g.save();
					g.strokeStyle = accent;
					g.lineWidth = 1;
					g.globalAlpha = .9;
					roundRect(g, cx - textW / 2 - 6, deskY + 3, textW + 12, 14, 3);
					g.stroke();
					g.globalAlpha = .28 + .14 * Math.sin(time / 700);
					roundRect(g, cx - textW / 2 - 9, deskY + 1, textW + 18, 18, 4);
					g.stroke();
					g.restore();
				}
				g.fillStyle = member.viewing === true ? member.isLeader === true ? "#f2c14e" : "#6fd6c8" : stateTone(member.activity);
				g.beginPath();
				g.arc(cx - textW / 2 - 10, deskY + 10, 2.6, 0, Math.PI * 2);
				g.fill();
				const levelText = member.level === void 0 || member.level <= 0 ? void 0 : `Lv.${member.level}${member.realm === void 0 || member.realm === "" ? "" : ` ${member.realm}`}`;
				if (levelText !== void 0) {
					g.font = "bold 7px \"Segoe UI\", monospace";
					const lw = Math.max(50, g.measureText(levelText).width + 12);
					const lx = Math.max(2, Math.min(WORLD_W - lw - 2, cx - lw / 2));
					const ly = headY - 25;
					g.fillStyle = "#d9f2cf";
					roundRect(g, lx, ly, lw, 18, 4);
					g.fill();
					g.strokeStyle = "#7fb27a";
					g.lineWidth = 1;
					roundRect(g, lx, ly, lw, 18, 4);
					g.stroke();
					g.fillStyle = "#22452a";
					g.fillText(levelText, lx + 6, ly + 9);
					const trackX = lx + 4;
					const trackY = ly + 13;
					const trackW = lw - 8;
					g.fillStyle = "rgba(34, 69, 42, 0.18)";
					g.fillRect(trackX, trackY, trackW, 2.5);
					const ratio = Math.min(1, Math.max(0, member.xpRatio ?? 0));
					g.fillStyle = "#4f9a57";
					g.fillRect(trackX, trackY, Math.max(1, Math.round(trackW * ratio)), 2.5);
				}
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
					const by = Math.max(4, headY - 26 - (member.level === void 0 ? 0 : 23));
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
				const chatter = model?.chatter;
				if (member.activity === "idle" && chatter !== void 0 && chatter.length > 0 && (member.currentTask === void 0 || member.currentTask === "")) {
					const cycle = 11e3 + seed % 6 * 1300;
					const t0 = time + seed % 5e3;
					if (t0 % cycle < 2600) {
						const line = chatter[Math.floor(t0 / cycle + seed) % chatter.length];
						g.font = "8px \"Segoe UI\", monospace";
						const text = truncate(line, 18);
						const bw = g.measureText(text).width + 12;
						const bx = Math.max(2, Math.min(WORLD_W - bw - 2, cx - bw / 2));
						const by = Math.max(4, headY - 26 - (member.level === void 0 ? 0 : 23));
						g.fillStyle = "rgba(28, 36, 48, 0.94)";
						roundRect(g, bx, by, bw, 15, 4);
						g.fill();
						g.strokeStyle = "rgba(127, 212, 255, 0.35)";
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
			/** 缓入缓出，让走动不像平移。 */
			function smooth01(t) {
				return t * t * (3 - 2 * t);
			}
			/** 中庭里的落脚点：按修士 seed 与时间槽确定，画面可复现。 */
			function wanderPoint(seed, slot, top, bottom) {
				const width = WORLD_W - 120;
				const height = Math.max(1, bottom - top);
				return {
					x: 60 + (seed * 37 + slot * 131) % width,
					y: top + (seed * 53 + slot * 97) % height
				};
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
					if (candidateScale > bestScale + 1e-6 || Math.abs(candidateScale - bestScale) <= 1e-6 && candidate > columns) {
						bestScale = candidateScale;
						columns = candidate;
						worldHeight = candidateHeight;
					}
				}
				scale = Math.max(.2, bestScale) * zoom;
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
				const firstDeskY = 232;
				const available = Math.max(0, worldH - 24 - firstDeskY);
				const spacing = rowCount > 1 ? Math.min(280, available / (rowCount - 1)) : 0;
				const blockTop = firstDeskY + (rowCount === 1 ? Math.min(150, available * .18) : 0);
				const layout = members.map((member, index) => {
					const row = Math.floor(index / columns);
					const inRow = Math.min(columns, members.length - row * columns);
					const column = index % columns + (columns - inRow) / 2;
					return {
						member,
						cx: cellW * (column + .5),
						deskY: blockTop + spacing * row
					};
				});
				const lastDeskY = layout.length === 0 ? 0 : layout[layout.length - 1].deskY;
				const spots = layout.map((item) => ({
					...item,
					deskCx: item.cx,
					baseY: item.deskY,
					walking: false
				}));
				const courtyardTop = lastDeskY + 132;
				const pondGap = worldH - 96 >= 760 ? 250 : 70;
				const courtyardBottom = worldH - pondGap;
				if (courtyardBottom - courtyardTop >= 60) for (const spot of spots) {
					if (spot.member.activity !== "idle") continue;
					const seed = hash(spot.member.id || spot.member.name);
					const cycle = 15e3 + seed % 5 * 1400;
					const t0 = time + seed % 9e3;
					const slot = Math.floor(t0 / cycle);
					const phase = t0 % cycle / cycle;
					const eased = phase < .62 ? smooth01(phase / .62) : 1;
					const from = wanderPoint(seed, slot, courtyardTop, courtyardBottom);
					const to = wanderPoint(seed, slot + 1, courtyardTop, courtyardBottom);
					spot.cx = from.x + (to.x - from.x) * eased;
					spot.baseY = from.y + (to.y - from.y) * eased;
					spot.walking = phase < .62;
				}
				else for (const spot of spots) {
					if (spot.member.activity !== "idle") continue;
					const seed = hash(spot.member.id || spot.member.name);
					const sway = Math.sin(time / (2400 + seed % 1200) + seed % 7);
					spot.cx = Math.max(36, Math.min(WORLD_W - 36, spot.deskCx + sway * 24));
					spot.walking = Math.abs(sway) > .25;
				}
				for (const spot of spots) trackCultivationFx(spot, time);
				paintRoom(time, model?.wall, hovered, lastDeskY);
				paintPond(time, lastDeskY);
				hitAreas = [];
				const labelled = new Set((model?.facilities ?? []).map((facility) => facility.action));
				for (const action of FACILITY_ORDER) {
					if (!labelled.has(action)) continue;
					const rect = FACILITIES[action];
					hitAreas.push({
						x: rect.x,
						y: rect.y,
						w: rect.w,
						h: 92 - rect.y,
						hit: {
							kind: "action",
							action
						}
					});
				}
				for (const spot of spots) {
					hitAreas.push({
						x: spot.deskCx - 62,
						y: spot.deskY - 78,
						w: 124,
						h: 98,
						hit: {
							kind: "member",
							id: spot.member.id
						}
					});
					if (spot.cx !== spot.deskCx || spot.baseY !== spot.deskY) hitAreas.push({
						x: spot.cx - 34,
						y: spot.baseY - 96,
						w: 68,
						h: 104,
						hit: {
							kind: "member",
							id: spot.member.id
						}
					});
				}
				for (const spot of spots) {
					if ((spot.member.level ?? 0) <= 0 || spot.member.id === "") continue;
					hitAreas.push({
						x: Math.max(2, Math.min(WORLD_W - 62, spot.cx - 31)),
						y: spot.baseY - 122,
						w: 62,
						h: 18,
						hit: {
							kind: "level",
							id: spot.member.id
						}
					});
				}
				if (model?.sceneObjects?.dock === true) hitAreas.push({
					x: DOCK_AT.x - 40,
					y: DOCK_AT.y - 30,
					w: 80,
					h: 60,
					hit: { kind: "dock" }
				});
				if (model?.sceneObjects?.settings === true) hitAreas.push({
					x: DIAL_AT.x - 28,
					y: DIAL_AT.y - 32,
					w: 56,
					h: 66,
					hit: { kind: "settings" }
				});
				if (layout.length === 0) {
					g.fillStyle = COLORS.label;
					g.font = "12px \"Segoe UI\", sans-serif";
					const text = model?.labels?.empty ?? "No members yet";
					g.fillText(text, 24, 150);
				} else {
					for (const spot of spots) paintFurniture(spot.deskCx, spot.deskY, spot.member, time);
					for (const spot of spots) if (spot.member.viewing === true) paintViewingAura(spot.cx, spot.baseY, spot.member, time);
					for (const spot of spots) {
						const mount = chosenMount(spot.member);
						if (mount !== void 0) paintMount(spot.cx, spot.baseY, mount, time);
					}
					for (const spot of spots) {
						const lift = liftOf(chosenMount(spot.member));
						const hop = jumpHeight(spot.member.id || spot.member.name, time);
						paintCharacter(spot.cx, spot.baseY - lift - hop, spot.member, time, spot.walking);
						paintCultivationAura(spot.cx, spot.baseY - lift, spot.member, time);
					}
					for (const spot of spots) {
						const lift = liftOf(chosenMount(spot.member));
						paintOverlay(spot.cx, spot.baseY - lift, spot.member, time);
						paintEquipFx(spot.cx, spot.baseY - lift, spot.member, time);
					}
					for (const spot of spots) if (spot.member.viewing === true) paintViewingBadge(spot.cx, spot.baseY, spot.member, time);
					drawCultivationFx(time);
					const hoveredMemberId = hovered?.kind === "member" ? hovered.id : void 0;
					if (hoveredMemberId !== void 0) {
						const target = spots.find((spot) => spot.member.id === hoveredMemberId);
						if (target !== void 0) paintDeskHover(target.cx, target.baseY, time);
					}
				}
				if (model?.sceneObjects?.dock === true) paintDockArray(DOCK_AT.x, DOCK_AT.y, time, hovered?.kind === "dock", model?.sceneLabels?.dock ?? "");
				if (model?.sceneObjects?.settings === true) paintHallDial(DIAL_AT.x, DIAL_AT.y, time, hovered?.kind === "settings", model.sceneObjects.settingsActive === true, model?.sceneLabels?.settings ?? "");
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
						if (wx >= area.x && wx <= area.x + area.w && wy >= area.y && wy <= area.y + area.h) return area.hit;
					}
				},
				setHover(hit) {
					hovered = hit;
				},
				jump(id) {
					jumps.set(id, -1);
				},
				cycleMount(id) {
					const member = model?.members.find((item) => (item.id || item.name) === id);
					if (member === void 0 || member.activity === "working") return;
					const level = member.level ?? 0;
					if (level < 5) return;
					const key = member.id || member.name;
					const current = mountOverride.get(key) ?? "auto";
					const next = current === "auto" ? "sword" : current === "sword" ? level >= 8 ? "beast" : "off" : current === "beast" ? "off" : "auto";
					mountOverride.set(key, next);
				},
				setMount(id, form) {
					mountOverride.set(id, form);
				},
				setEquip(id, kind, tier) {
					if (kind === "weapon") weaponEquip.set(id, tier);
					else skillEquip.set(id, tier);
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
		const css$6 = ".qgBgta_office{box-sizing:border-box;flex-direction:column;flex:auto;height:100%;min-height:0;max-height:min(640px,100%);padding:0;display:flex}.qgBgta_canvasHost{background:#1c2320;border-radius:10px;flex:auto;min-height:160px;position:relative;overflow:hidden}.qgBgta_canvas{display:block;position:absolute;inset:0}.qgBgta_srOnly{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.qgBgta_tooltip{z-index:2;border:1px solid var(--dsw-alias-border-strong,#a0b0c880);color:#e8eef8;pointer-events:none;background:#12161ef2;border-radius:8px;flex-direction:column;gap:1px;min-width:90px;max-width:210px;padding:5px 8px;font-size:10px;line-height:1.45;display:flex;position:absolute;transform:translate(-50%,-118%);box-shadow:0 4px 14px #00000059}.qgBgta_tooltip[data-placement=below]{transform:translate(-50%,16%)}.qgBgta_tooltip strong{font-size:11px}.qgBgta_tooltip span{opacity:.8;overflow-wrap:anywhere}.qgBgta_tooltip span[data-activity=working]{color:#67d9a5}.qgBgta_tooltip span[data-activity=idle]{color:#9fb0c8}.qgBgta_rail{z-index:3;clip-path:inset(50%);pointer-events:none;white-space:nowrap;border:0;gap:3px;width:1px;height:1px;padding:0;display:flex;position:absolute;top:6px;right:6px;overflow:hidden}.qgBgta_rail:focus-within{clip-path:none;pointer-events:auto;background:#12161aeb;border:1px solid #a0b0c859;border-radius:8px;width:auto;height:auto;padding:3px;overflow:visible;box-shadow:0 4px 14px #00000059}.qgBgta_railButton{color:#d8c48a;background:0 0;border:1px solid #0000;border-radius:5px;place-items:center;width:20px;height:20px;padding:0;font-size:11px;line-height:1;display:inline-grid}.qgBgta_railButton:hover{color:#ffe9a8;background:#d4af371f;border-color:#d4af378c}.qgBgta_railButton[aria-pressed=true]{color:#241a08;background:#d4af37;border-color:#ffe9a8}.qgBgta_railButton:focus-visible{outline-offset:1px;outline:2px solid #d4af37}";
		const tagId$6 = "agent-teams-pixel/PixelOffice.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var PixelOffice_module_css_default = {
			"canvas": "qgBgta_canvas",
			"canvasHost": "qgBgta_canvasHost",
			"office": "qgBgta_office",
			"rail": "qgBgta_rail",
			"railButton": "qgBgta_railButton",
			"srOnly": "qgBgta_srOnly",
			"tooltip": "qgBgta_tooltip"
		};
		//#endregion
		//#region lib/client/pixel-office/PixelOffice.js
		/** Pixel-office view of one AgentTeams snapshot, driven by the shared activity model. */
		const FACILITY_LABEL = {
			teams: "office.facility.teams",
			board: "office.facility.board",
			config: "office.facility.config",
			gear: "office.facility.gear",
			inbox: "office.facility.inbox"
		};
		const FACILITY_HINT = {
			teams: "office.action.teamsHint",
			board: "office.action.boardHint",
			config: "office.action.configHint",
			gear: "office.action.gearHint",
			inbox: "office.action.inboxHint"
		};
		/** Single-character rail glyphs keep the floating toolbar tiny. */
		const FACILITY_GLYPH = {
			teams: "山",
			board: "碑",
			config: "经",
			gear: "阁",
			inbox: "信"
		};
		const ALL_ACTIONS = FACILITY_ORDER;
		/** 闲置修士的随机闲聊：短句、与任务无关，按角色口吻写。 */
		const CHATTER_KEYS = [
			"office.chatter.1",
			"office.chatter.2",
			"office.chatter.3",
			"office.chatter.4",
			"office.chatter.5",
			"office.chatter.6",
			"office.chatter.7",
			"office.chatter.8"
		];
		function sceneLabel(activity, t) {
			if (activity === "working") return t("office.working");
			if (activity === "unknown") return t("office.unknown");
			return t("office.idle");
		}
		function PixelOffice({ team, t, onOpenMember, onOpenCaptain, onOpenCharacter, viewingSessionId, onUnavailable, onAction, activeAction, enabledActions, onDock, onSettings, settingsOpen, teamless }) {
			const canvasRef = (0, react.useRef)(null);
			const hostRef = (0, react.useRef)(null);
			const sceneRef = (0, react.useRef)(null);
			const clickTimer = (0, react.useRef)(void 0);
			const cultivationVersion = useCultivationVersion();
			const [hover, setHover] = (0, react.useState)();
			const actions = enabledActions ?? ALL_ACTIONS;
			const labelFor = (action) => action === "teams" && teamless === true ? t("quickstart.entry") : t(FACILITY_LABEL[action]);
			const hintFor = (action) => action === "teams" && teamless === true ? t("quickstart.entryTitle") : t(FACILITY_HINT[action]);
			const live = (0, react.useMemo)(() => team.members.filter((member) => member.status !== "removed"), [team.members]);
			const done = team.tasks.filter((task) => task.status === "completed").length;
			const running = team.tasks.filter((task) => task.state === "running").length;
			const waiting = team.tasks.filter((task) => task.state === "blocked").length;
			const failed = team.tasks.filter((task) => task.status === "failed").length;
			const model = (0, react.useMemo)(() => {
				const allCompleted = team.tasks.length > 0 && team.tasks.every((task) => task.status === "completed");
				const captainCultivation = cultivationFromXp(xpOf(captainKey(team.name)));
				const captainActive = team.phase === "running" && team.halted !== true && !allCompleted && team.tasks.some((task) => task.status === "pending" || task.status === "claimed" || task.status === "in_progress");
				const members = [{
					id: team.captainSessionId,
					name: t("office.captain"),
					role: "captain",
					activity: captainActive ? "working" : "idle",
					unread: team.captainInbox.length,
					isLeader: true,
					viewing: viewingSessionId !== void 0 && viewingSessionId === team.captainSessionId,
					level: captainCultivation.level,
					realm: t(captainCultivation.rankKey),
					xp: captainCultivation.xp,
					xpRatio: captainCultivation.ratio
				}, ...live.map((member) => {
					const cultivation = cultivationFromXp(xpOf(memberKey(member.name)));
					return {
						id: member.id,
						name: member.name,
						role: member.role,
						activity: member.activity,
						currentTask: member.currentTask,
						progress: member.progress,
						done: member.done,
						total: member.total,
						model: member.model,
						unread: member.unread,
						viewing: viewingSessionId !== void 0 && viewingSessionId === member.id,
						level: cultivation.level,
						realm: t(cultivation.rankKey),
						xp: cultivation.xp,
						xpRatio: cultivation.ratio
					};
				})];
				const facilities = onAction === void 0 ? [] : actions.map((action) => ({
					action,
					label: labelFor(action),
					badge: action === "inbox" ? team.captainInbox.length : void 0
				}));
				return {
					teamName: team.name,
					phase: team.phase,
					halted: team.halted,
					members,
					activeAction: activeAction ?? void 0,
					facilities,
					sceneObjects: {
						dock: onDock !== void 0,
						settings: onSettings !== void 0,
						settingsActive: settingsOpen === true
					},
					sceneLabels: {
						dock: t("office.dockSidebar"),
						settings: t("office.floorSettings")
					},
					chatter: CHATTER_KEYS.map((key) => t(key)),
					labels: {
						captain: t("office.captain"),
						stalled: t("office.stalled"),
						awaiting: t("office.awaiting"),
						empty: t("office.empty"),
						working: t("office.working"),
						idle: t("office.idle"),
						unknownState: t("office.unknown"),
						viewing: t("office.viewingState"),
						levelUp: t("office.levelUp")
					},
					wall: {
						title: t("progress.title"),
						doneCount: done,
						total: team.tasks.length,
						runningCount: running,
						waitingCount: waiting,
						failedCount: failed
					}
				};
			}, [
				actions,
				activeAction,
				cultivationVersion,
				done,
				failed,
				live,
				onAction,
				onDock,
				onSettings,
				running,
				settingsOpen,
				t,
				team,
				teamless,
				waiting
			]);
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
					if (clickTimer.current !== void 0) window.clearTimeout(clickTimer.current);
				};
			}, []);
			(0, react.useEffect)(() => {
				sceneRef.current?.render(model);
			}, [model]);
			(0, react.useEffect)(() => {
				const onMount = (event) => {
					const detail = event.detail;
					if (detail?.id !== void 0 && detail.form !== void 0) sceneRef.current?.setMount(detail.id, detail.form);
				};
				window.addEventListener("agent-teams:mount", onMount);
				return () => {
					window.removeEventListener("agent-teams:mount", onMount);
				};
			}, []);
			(0, react.useEffect)(() => {
				const onEquip = (event) => {
					const detail = event.detail;
					if (detail?.id !== void 0 && detail.kind !== void 0 && detail.tier !== void 0) sceneRef.current?.setEquip(detail.id, detail.kind, detail.tier);
				};
				window.addEventListener("agent-teams:equip", onEquip);
				return () => {
					window.removeEventListener("agent-teams:equip", onEquip);
				};
			}, []);
			const sceneMembers = (0, react.useMemo)(() => new Map(model.members.map((member) => [member.id, member])), [model]);
			const hitAt = (event) => {
				const canvas = canvasRef.current;
				if (canvas === null) return void 0;
				const rect = canvas.getBoundingClientRect();
				return sceneRef.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
			};
			const onPointerMove = (event) => {
				const rawHit = hitAt(event);
				const hit = rawHit?.kind === "level" ? {
					kind: "member",
					id: rawHit.id
				} : rawHit;
				sceneRef.current?.setHover(hit);
				const canvas = canvasRef.current;
				if (hit === void 0) {
					if (hover !== void 0) setHover(void 0);
					if (canvas !== null) canvas.style.cursor = "default";
					return;
				}
				if (canvas !== null) canvas.style.cursor = "pointer";
				const rect = event.currentTarget.getBoundingClientRect();
				const x = Math.max(110, Math.min(event.clientX - rect.left, Math.max(110, rect.width - 110)));
				const y = event.clientY - rect.top;
				if (hit.kind === "action") {
					setHover({
						kind: "action",
						action: hit.action,
						label: labelFor(hit.action),
						hint: hintFor(hit.action),
						x,
						y
					});
					return;
				}
				if (hit.kind === "dock") {
					setHover({
						kind: "dock",
						label: t("office.dockSidebar"),
						hint: t("office.scene.dockHint"),
						x,
						y
					});
					return;
				}
				if (hit.kind === "settings") {
					setHover({
						kind: "settings",
						label: t("office.floorSettings"),
						hint: t("office.scene.settingsHint"),
						x,
						y
					});
					return;
				}
				const member = sceneMembers.get(hit.id);
				if (member === void 0) return;
				setHover({
					kind: "member",
					name: member.name,
					role: member.role,
					activity: member.activity,
					realm: member.isLeader === true ? `Lv.${cultivationFromXp(xpOf(captainKey(team.name))).level} ${t(cultivationFromXp(xpOf(captainKey(team.name))).rankKey)}` : `Lv.${cultivationFromXp(xpOf(memberKey(member.name))).level} ${t(cultivationFromXp(xpOf(memberKey(member.name))).rankKey)}`,
					task: member.currentTask ?? "",
					x,
					y
				});
			};
			const onPointerLeave = () => {
				setHover(void 0);
				sceneRef.current?.setHover(void 0);
				if (canvasRef.current !== null) canvasRef.current.style.cursor = "default";
			};
			const onClick = (event) => {
				const hit = hitAt(event);
				if (hit === void 0) return;
				if (hit.kind === "level") {
					onOpenCharacter?.(hit.id);
					return;
				}
				if (hit.kind === "action") {
					onAction?.(hit.action);
					return;
				}
				if (hit.kind === "dock") {
					onDock?.();
					return;
				}
				if (hit.kind === "settings") {
					onSettings?.();
					return;
				}
				const member = sceneMembers.get(hit.id);
				if (member === void 0) return;
				if (event.detail >= 2) {
					if (clickTimer.current !== void 0) {
						window.clearTimeout(clickTimer.current);
						clickTimer.current = void 0;
					}
					if ((member.level ?? 0) >= 5 && member.activity !== "working") sceneRef.current?.cycleMount(member.id || member.name);
					else sceneRef.current?.jump(member.id || member.name);
					return;
				}
				if (clickTimer.current !== void 0) window.clearTimeout(clickTimer.current);
				clickTimer.current = window.setTimeout(() => {
					clickTimer.current = void 0;
					if (member.isLeader) {
						onOpenCaptain?.();
						return;
					}
					if (member.id === "") {
						onUnavailable?.(member.name);
						return;
					}
					onOpenMember?.(member.id);
				}, 240);
			};
			const statusLine = team.halted === true ? t("office.stalled") : team.phase === "staged" ? t("office.awaiting") : t("office.progress", {
				done,
				total: team.tasks.length
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PixelOffice_module_css_default.office,
				"data-pixel-office": true,
				"data-phase": team.phase,
				"data-halted": team.halted === true || void 0,
				"aria-label": t("office.sceneAria", { name: team.name }),
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: PixelOffice_module_css_default.srOnly,
					children: [
						statusLine,
						" · ",
						t("office.members", { count: live.length })
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					ref: hostRef,
					className: PixelOffice_module_css_default.canvasHost,
					children: [
						(0, react_jsx_runtime.jsx)("canvas", {
							ref: canvasRef,
							className: PixelOffice_module_css_default.canvas,
							role: "img",
							"aria-label": t("office.sceneAria", { name: team.name }),
							title: t("office.hint"),
							onPointerMove,
							onPointerLeave,
							onClick
						}),
						hover !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: PixelOffice_module_css_default.tooltip,
							"data-placement": hover.kind === "member" ? "above" : "below",
							style: {
								left: hover.x,
								top: hover.y
							},
							role: "tooltip",
							children: hover.kind === "member" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								(0, react_jsx_runtime.jsx)("strong", { children: hover.name }),
								(0, react_jsx_runtime.jsx)("span", { children: hover.role === "captain" ? hover.realm : `${roleLabel(hover.role, hover.name, t)} · ${hover.realm}` }),
								(0, react_jsx_runtime.jsxs)("span", {
									"data-activity": hover.activity,
									children: [sceneLabel(hover.activity, t), hover.task === "" ? "" : ` · ${hover.task}`]
								})
							] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("strong", { children: hover.label }), (0, react_jsx_runtime.jsx)("span", { children: hover.hint })] })
						}),
						onAction !== void 0 && actions.length > 0 && (0, react_jsx_runtime.jsx)("div", {
							className: PixelOffice_module_css_default.rail,
							role: "toolbar",
							"aria-label": t("office.rail"),
							"data-office-rail": true,
							children: actions.map((action) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: PixelOffice_module_css_default.railButton,
								"data-control": `office-${action}`,
								"aria-pressed": activeAction === action,
								"aria-label": labelFor(action),
								title: `${labelFor(action)} · ${hintFor(action)}`,
								onClick: () => {
									onAction(action);
								},
								children: (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: FACILITY_GLYPH[action]
								})
							}, action))
						})
					]
				})]
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
		* Return from a member transcript to the team's main conversation.
		* Falls back to the workspace navigator when the legacy `open` action is absent.
		*/
		function openAgentTeamCaptain(sessions, sessionId, layout, workspace) {
			if (sessions.open !== void 0) {
				sessions.open(sessionId);
				layout?.selectPanel?.(null);
				return;
			}
			if (workspace !== void 0) {
				workspace.openSession(sessionId);
				layout?.selectPanel?.(null);
				return;
			}
			throw new Error("Harness does not expose session navigation");
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
			const vertical = dimensions?.direction === "vertical";
			const stages = taskStages(tasks);
			const widest = Math.max(1, ...stages.map((stage) => stage.tasks.length));
			const track = widest * nodeWidth + (widest - 1) * columnGap;
			const positions = /* @__PURE__ */ new Map();
			const nodes = [];
			for (const [index, stage] of stages.entries()) {
				if (!vertical) {
					for (const [row, task] of stage.tasks.entries()) {
						const x = index * (nodeWidth + columnGap);
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
					continue;
				}
				const stageWidth = stage.tasks.length * nodeWidth + Math.max(0, stage.tasks.length - 1) * columnGap;
				for (const [row, task] of stage.tasks.entries()) {
					const x = (track - stageWidth) / 2 + row * (nodeWidth + columnGap);
					const y = index * (nodeHeight + rowGap);
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
			}
			const edges = [];
			for (const task of tasks) {
				const target = positions.get(task.id);
				if (target === void 0) continue;
				for (const dependency of task.dependencies) {
					const source = positions.get(dependency);
					if (source === void 0) continue;
					if (vertical) {
						const x1 = source.x + nodeWidth / 2;
						const y1 = source.y + nodeHeight;
						const x2 = target.x + nodeWidth / 2;
						const y2 = target.y;
						edges.push({
							from: dependency,
							to: task.id,
							path: `M${x1} ${y1}C${x1} ${y1 + 18},${x2} ${y2 - 18},${x2} ${y2}`
						});
						continue;
					}
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
				width: stages.length === 0 ? 0 : vertical ? track : stages.length * nodeWidth + (stages.length - 1) * columnGap,
				height: stages.length === 0 ? 0 : vertical ? stages.length * nodeHeight + (stages.length - 1) * rowGap : rows * nodeHeight + (rows - 1) * rowGap,
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
		/** Host route that resumes a halted team (same path as the captain tool). */
		const ACTIVITY_RESUME_URL = "/plugins/dsh-agent-teams/resume";
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
		//#region lib/client/art-data.js
		/**
		* Generated by scripts/gen-art-data.mjs from assets/agent-teams/*.png.
		* Base64 PNG payloads keyed by file name; artwork.ts wraps them as data URLs
		* so portraits render without a host asset round-trip.
		*/
		const ART_BASE64 = {
			"avatar-analyst.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACXklEQVR42u3dMU7DMAAF0NyBgQWJpRN0QOqMunGIigGJa3CCngQJCSEuwBGYmZlghIExrCSLa9kOif2+9McmafwGy03crqssx0cn/d+uTtdJHR+vEwAEAAFAJhnA2KYOeCyI2BphAAQAAUDKTNrmXiAAAAAAAAAAoAyAl/e+aAEAAAAAAAAAgGUAMAkEAAAAAAAAAAtBAAAAAAAAAADAcgF8vT7Oqm8P+0EBAAAAAAAAAAAAAAAAAAAAAACAcgBiF2JiB9hCEAAAAAAAAACYBJaYBE5dAAAAAAAAAKgVwPnqYtCf789BYwc4dLxYAKVfXAl1diAAAAAAAAAAIBOA8YCUnvSlAjjb3hYtAAAAAAAAAMwVQAhE6Ian9ulmN2ju44+/TwjAdrdPKgAAAAAAAADUAmBuP/7ENjeA/uN+UAAAAAAAAAAAoA0A488DAAAAAAAAwFIBlH4IMvdCTmoBAAAAAAAAoFUA4wu4vnuOauwNyt3YH2NCA9LcAyEAAAAAAAA0A2B8wtAFtwag+hdDAAAAAAAAAACAg1rdBhEAAAAAAAAAMBGAVCC5X8xIBdAtPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADDxQ5Gxnfp6AQAAAAAAAAAAAAAAAAAAAADAQpCFIAAAAAAAAABYOoDQxoq1A4jdWBIAAAAAAAAAAAAAAAAAAAAAAGoC8d+bJjW3aRMAAAAAAAAAzBREqJebq6TO7Xxd6wEAAAAAAEAOBLJebZIaGoCpzycACAACgAAgAAgAAoDkWzhKHYDF/UEDAAAAAAAAAByWX9njq16X1Fn0AAAAAElFTkSuQmCC",
			"avatar-architect.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACWElEQVR42u3dsU3DQBQGYO9AQYOUJh2RQEpNiyKxARV1RqHJIEiIDRiBmhVokEhBCS12wfnpfM7Z/n7pLzmbvK84HcZpmpnl/Ozi52/Xq01Wu+s1AoAAIADIKAOMNnfgURDRmjAAAoAAIGU2bbUXCAAAAAAAAAAoA+DucAgVAAAAAAAAAACwCQQAAAAAAAAAAAAAAAAAAAAAAADqAvD19lxV358eWwUAAAAAAAAAAAAAAAAAAAAAAADKAYgexEQH7CAIAAAAAAAAAGwCS2wCxy4AAAAAAAAAzBXA5fq61e/jR6vRAafWiwJ4PX6etNWBAAAAAAAAAICBAHQHUnrTlwtgtdsVLQAAAAAAAADUCiAFIvWB5/bl4b7Vodfv/j4pAFEg0fUAAAAAAAAAYCoAavvjT7RRAKkB5v48AAAAAAAAAAAAAAAAAAAAAADUNPChO/RBTm4dBAEAAAAAALBUAN0biH7Bw9V+/29LP1SZun7uwGb/QAgAAAAAAACLAdC9YOqGlwZg9v8YAgAAAAAAAAAA9OrsXhABAAAAAAAAACMByAWSu/7QAJqpBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEZ+KDLase8XAAAAAAAAAAAAAAAAAAAAAAAcBDkIAgAAAAAAAICpA0i9WHHuAKIvlgQAAAAAAAAAAAAAAAAAAAAAgDmBOPVLkxb30iYAAAAAAAAAqBREqjfb26zWdr1m6QEAAAAAAEB6Atmst1lNDWDs6wkAAoAAIAAIAAKAACDDHRzlDmByX9AAAAAAAAAAAP3yC9P05ABrbM6tAAAAAElFTkSuQmCC",
			"avatar-auditor.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACfUlEQVR42u3dMUoDQRgG0L2DhSCpxE4LwTqt4BVSWXsCjyBeRRALC1vBIp1gpUfQMhaW2rpTOBlnJtndeR98lbA77P+KYRI3XTex7O7Mvn93tref1fB6nQAgAAgAspEBpjZ34KkgUmvCAAgAAoDU2bQNvUAAAAAAAAAAQB0Al5dXSQUAAAAAAAAAAGwCAQAAAAAAAAAAAIYCYPIfLgEAAAAAAADAmgBWz7eD6tvNda+5AMK/f78//NnRgwAAAAAAAACARgHEmgpgdJtGAAAAAAAAAPgngNSDmNQBlz4Iig20dgcHAgAAAAAAAAAa3QQ2N3AAAAAAAAAAqATg8OC416/Pj15TBxy7XnEAq6e8AgAAAAAAAECjAMKB1N70AQAAAAAAAAAAdUDEHvjQm/yFj9iAwwAAAAAAAADARAGkbtJeX5ZVm7qe4gBa2wQCAAAAAAAAQCUAd+eLXgEAAAAAAAAAgO0MPLe1N4Gl1wsAAAAAAAAArQAIF5T6Aw+LxcWfDR/A8vE+q+H1Yvefz8+S2vw/gwIAAAAAADBZAOECYg9k6gCae0EEAAAAAAAAAGwJQOmW3gSGLX3Q1PwmEAAAAAAAgGYA5ALJvX5pAN3YAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJWb++HPptcLAAAAAAAAAAAAAAAAAAAAAAAOghwEAQAAAAAAAMDYAcRerDh1AKkvlgQAAAAAAAAAAAAAAAAAAAAAgCmB2PZLk5p7aRMAAAAAAAAADBRErPOT06wO7X5d6wEAAAAAAEDWBHJ0cJLV2AA2fT8BQAAQAAQAAUAAEACk3MFR7gBG9wMNAAAAAAAAALBefgDXRJVaah6pnAAAAABJRU5ErkJggg==",
			"avatar-beastmaster.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACYElEQVR42u3dIU4DQRgG0L0DAkOCqWsFSTXBIdAEgUJzhB6hR+AKJASJ5gJojgCyCCRYdgKdDsMss7PvSz5FstPlf2Iyhd2uayz7ewcfXzs7XGQ1vF4nAAgAAoAMMsDU5g48FURqTRgAAUAAkDKbttoLBAAAAAAAAACUAXCzvkgqAAAAAAAAAABgEwgAAAAAAAAAAAAAAAAAAAAAAADUBWDzdFdVn2/XvQIAAAAAAAAAAAAAAAAAAAAAAADlAKQexKQO2EEQAAAAAAAAANgE2gQCAAAAAAAAQL0A5rOjXt/fXntNHXDsegAAAAAAAAAAQB0AwoGU3vQBAAAAAAAAAABlQMR+4bm9v7rsNfuaj6utBQAAAAAAAAAAdgNQ25c/0U1iIoDSBQAAAAAAAAAA6gAwdEYHAgAAAAAAgMkAKL0Jyj3YSV4vBuDlYdBWfxAFAAAAAADAZACEHyD1BQ+r65OtjQ0gt7nrxwZ2fjbvNfXnAAAAAAAAAFALgHDB8AbCTh1Ac5tAAAAAAAAAAADgXwBUt+sHAAAAAAAAgEIAcgdU+vqx+2/uj0IBAAAAAAAAAIBfAWjunz0BAAAAAAAAoFEAsfsDAAAAAAAAAACGae6XKUN/XgAAAAAAAAAAAAAAAAAAAAAAcBDkIAgAAAAAAAAAxg4g9qDF1gHE7h8AAAAAAAAAAAAAAAAAAAAAAFpK6sOVW+/kXiQJAAAAAACAdwn/ACLW4+VpVmtbr5t6AAAAAAAAkB2BLGbLrMYGMPR6AoAAIAAIAAKAACAAyN8dHOUOYPQPawYAAAAAAACA7/MJZTiXYs8KmpgAAAAASUVORK5CYII=",
			"avatar-captain.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACOklEQVR42u3dMU7DMBgG0NyBgSXqgDoBQ6UOTKwcgolz9Ag9AieohATchIWlRyhjGRjLSiKoaxxXbvw+6VuTpv8bLLeKm+bEc37W7n52t1llbf9+jQAgAAgAkmWgsQ0NcNm2exsLILYmDIAAIADI7wO/vJiNukAAAAAAAAAAQB4A2/UiqgAAAAAAAAAAgEUgAAAAAAAAAAAAAAAAAAAAAAAAUBaA7dtzUV0/LTsFAAAAAAAAAAAAAAAAAAAAAAAA8gGI/sNI5IBtBAEAAAAAAACARaBFIAAAAAAAAACUC+BqOuv06/Oj09gBh64HAAAAAAAAAACUAaA/kNyLPgAAAAAAAAAAIA+I0Bee2teH+06Hvr6BAwAAAAAAAMD/AJT2409sAQAAAAAAAAAAAAAAAAAABAD5e+BDd+iNnKELAAAAAAAAANUu8iIPeHh/udnb0MGQqQ3d/3ExiWp1IAAAAAAAAKgGQP8BQ19IbQBGDwIAAAAAAAAAAAAAAAAAAAAAADICSAWSen0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYHLU7jarpB778wIAAAAAAAAAAAAAAAAAAAAAgI0gG0EAAAAAAAAAcOoAgi9XHDmA6l4sCQAAAAAAAAAAAAAAAAAAAEDV5wv0HzD3Cx1Kb/VvCgUAAAAAAMD5AQf2dn6X1NLu19QeAAAAAAAA5EAg19N5UkMDOPb9BAABQAAQAAQAAUAAkOE2jlIH4HBoAAAAAAAARgrgG08Ac4m5U6lIAAAAAElFTkSuQmCC",
			"avatar-demon.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACqUlEQVR42u3dsWoUQRgH8HuHFMoRECRIOAWFdItilyJFBMurrH0CySPkEfIEAUFSpo0voIhNHiEpk8JyBSt3OG4cZ2ezs/v74F8dt7u3368Yvj1mF4uJ1aOd3fbv7C6fZiU83kIBoABQAKhBGpia3IangkiNDgOgAFAAqDKLtrEHCAAAAAAAAAAoA+Dk7fukPDSA2S8qAQAAAAAAAGCmi8CPL78npX130Un1IAAAAAAAAAAAAAAAAAAAAAAAYEvuvn0ZVa4/n3aSC6D9cdIJAAAAAAAAAAAwTQBh1s8uk1I9CAAAAAAAAAD4TwCpg5jUBg/9hxAAAAAAAAAAAMAi8E+Dg8EQAAAAAAAAAACwOc/3XnXy6/62k9QGx46XCyB2P46enG0NAAAAAAAAAACweVFWetEHAAAAAAAAAACUARG74bm5+LDupO/jpzYkBiAcDAEAAAAAAADAVAGM7eFPanIbEn6/efypEwAAAAAAAAAAAAAAAAAAAAAAqPlhUN/pe5Az9GbPAAAAAAAAADAVAOEFpr7gYb1qtuZnc1Q0sfO/Xu4nJRUMAAAAAAAAANQCILyg2A2pHUB7cz6qPDgIAAAAAAAAAJgJgLur41EFAAAAAAAAAOYCIBdI7vFTB0Gr5aqT8PeGn1f3cmkAAAAAAAAAAKAIgOr+8QMAAAAAAAAAAAAAAAAAAAAAAAXTnp1npfT1AQAAAAAAAAAAAAAAAAAAAACAQZBBEAAAAAAAAABMDUBsY8WpA/jaNL2muh1BAAAAAAAAAACAjQkHUQAAAAAAAABQK4AYiNIbOowts1sEAgAAAAAAAMA/gojlzcFhVsZ+vuo2gAAAAAAAAACAgYC82DvISuwGDn0+BYACQAGgAFAAKAAUAKq/wVFuAwxqAAAAAAAAmCiA3wAooKQrI06nAAAAAElFTkSuQmCC",
			"avatar-documenter.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACWElEQVR42u3dMU7DMBgG0NyBgYUJVQzAUKkbEisDB2BggpWj9CoIxBm4ADMbK4wgwVhWEipc4zh1nPdJ35qk/G+wnOI2TWXZ3dlb/ezh/jyp3es1AoAAIADIIAOMberAY0HE1oQBEAAEAMmzaCu9QAAAAAAAAABAHgB3y4uoAgAAAAAAAAAAFoEAAAAAAAAAAAAAAAAAAAAAAABAWQDen+6L6vPtslUAAAAAAAAAAAAAAAAAAAAAAAAgH4DYjZjYAdsIAgAAAAAAAACLQItAAAAAAAAAACgXwNFs3urXx1ursQMOXS8VwNAFAAAAAAAAgFoBdAeSe9EXC2D1+rjVFgcCAAAAAACAyQIIgQj9wVP7cHXZat/X736eX0P5fMlbAAAAAAAAABgpgNJe/sQWAAAAAAAAAAAAYB2A6/ODrAUAAAAAAACAsbwM6rt9b+Sk1iIQAAAAAACAqQLoPkDsDzwsb07+bO4vVITuH7som9wiEAAAAAAAgMkA6N4w9MBTA1D9IhAAAAAAAAAAAFgPoPZ/DAEAAAAAAACAgQCkAkm9furGTXUHRAAAAAAAAAAAAP8C0Iw9AAAAAAAAAAAAAAAAAAAAAAAwYFNfngz9vAAAAAAAAAAAAAAAAAAAAAAAYCPIRhAAAAAAAAAAjB1A6GDF2gHEHiwJAAAAAAAAAAAAAAAAAAAAAAA1gdj2gQl+zBkAAAAAAAAAygAR6uniLKml3a+ZegAAAAAAAJANgRzPFkkNDWDo+wkAAoAAIAAIAAKAACD9bRylDmB0hzMDAAAAAAAAwGb5BvWR4KznswYCAAAAAElFTkSuQmCC",
			"avatar-healer.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACdElEQVR42u3dvUrDUBgG4NyDg4uTdFKHQmdXL8LJO3H3ElxcBVEcvYsuDnZyE3QQqYKjgi4mFJOPk5Mm6fPCu5WTku8ZDvlpi2Jk2d7a+frbvd1pUqvrFQKAACAASCcDjDZ14FEQ0ZowAAKAACB5Nm19LxAAAAAAAAAAkAfA68dbqAAAAAAAAAAAgE0gAAAAAAAAAAAAwLoAtA2k9+AAAAAAAAAAoCGA5fymV11cnZWa+kBJNdEBtr0eAAAAAAAAAADQDYDH52Wp0U1j6noAAAAAAAAAMBQA0Qsx0QF3/WJJ3cCinwcAAAAAAAAAm8BxbAIBAAAAAAAAAIDV3Z9MS/18fyk1OuC69QAAAAAAAAAAgH4AqA4k96YPAAAAAAAAAADIA6LuhKf29uS41LbXjz7QAQAAAAAAAAAA/LZvN3+iBQAAAAAAAAAAAAAAAAAAAAAAAJq/3Jjati/k5C4AAAAAAAAAjBVA9QtE/+Bh/nD/b0/vzrO27vgX15ehAgAAAAAAAMBYAVQPWHdCNg1AtQAAAAAAAAAAAAAAAAAAAAAAAEBzAKlAUtdPBZD7ZtPar/wBAAAAAAAAAAA/zb1prdYmEAAAAAAAAACGCWCxfCoVAAAAAAAAAMYCoO1WT1i0ub+fTSAAAAAAAAAAbCYAN4MAAAAAAAAAwAMhqwAUQw8AAAAAAAAANPzhx7EDSP1hSQAAAAAAAAAAAAAAAAAAAAAAGDKIrh+I6FtHP3AAAAAAAAAAaAiiroezo6T27XjFpgcAAAAAAABpCORgMktq9I8ccx9PABAABAABQAAQAAQAae/CUeoABvcyJgAAAAAAAAA0yzcRMXZfy9YD3QAAAABJRU5ErkJggg==",
			"avatar-implementer.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACf0lEQVR42u3dPUoDQQAG0NzBwkawSaUphHSC2FlYWqZRsPMIHiGN5xBBgmewT6sXCGIlClrGwsZdMOMw+zO7+z74qsDOsvOKYZbMjkY9y/bWzvp3x7uTpJavNxIABAABQBqZwNimTngsiNhW/TwAAAAAAAAAwKKtGw1NYPn3clZvxXYeBAAAAAAAAABUBOD85iGqAAAAAAAAAACARWAXANw+rgoFAAAAAAAAAAAAAAAAAAAAAIA+A3hf3mfV57t5oQAAAAAAAAAAAAAAAAAAAAAAAEB9AGI3YmIn2EYQAAAAAAAAAFgEWgQCAAAAAAAAQL4A9scHhX59vBYaO8Gh6wEAAAAAAAAAAHkAKE9I3Ys+AAAAAAAAAACgHhChB57axcWs0KqvHztBAAAAAAAAAADAT3N7+RNbAAAAAAAAAAAAgCoA9O6gSAAAAAAAAAYLIPUjTKFWvZHTdGMBdO4jUwAAAAAAAAwGQPmGYj/wcHw139jly7rWhsbfO73c2PXnU6ttHQQAAAAAAACDAVAeMPSA+g6g7vsLFQAAAAAAAAAAaAdAqPPZYaGL67NCy79nvxEEAAAAAAAAAA0BSAWSev22AWT/tg8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgMEDqLqpL3+avl8AAAAAAAAAAAAAAAAAAAAAALARNJyNoM6f+AEAAAAAAAAAfwAIHazYdwCxB0u2/udOAAAAAAAAAACgFQC9OwwaAAAAAACAwQAIgWj70KTBHdoEAAAAAAAAAJmCCPVoepLU3MYbDT0AAAAAAADIP4FMxtOkhiag6fEEAAFAABAABAABQACQ6jaOUieg6fEEAAFAAGgo336jqEqZkYM3AAAAAElFTkSuQmCC",
			"avatar-monk.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAChElEQVR42u3dMUoDQRgG0L2DhY2VpFKLQDrB1sLC0sLK2t5L5BSWgiAeQU9g7RG01MIygli4K2Qyzs46O/s++DrZCTsv8DMm2aapLNtbO6uf3dudJ7V7vUYAEAAEABlkA2ObuuGxIGJrhwEQAAQAyTO0lV4gAAAAAAAAACAPgIflWVQBAAAAAAAAAABDIAAAAAAAAAAAAAAAAAAAAAAAAFAWgLenu6L6fLtsFQAAAAAAAAAAAAAAAAAAAAAAAMgHIPYgJnaDHQQBAAAAAAAAgCGwhCGwOkAAAAAAAAAA0BOA/dm81Y/311ZjNzh0vdwAun+/erlpdfQgAAAAAAAAAKAnAN0NyT30pQJIBTH6oREAAAAAAIDJAgi94NANT+39xXmrfV8/tOF9D3WjHxoBAAAAAAAA4Lul/fMntqEbnntDRj8EAgAAAAAAAEAlAPoe8qo/GQQAAAAAAKBaAKkPYQo190FObGMPZn69IR5P1zZ2fQAAAAAAAAD4rw2PfcDD9eXh2oZuUGpD61+dzKKaG0BxQyAAAAAAAACTAdBdMHRDpgYgFcTo3vEAAAAAAAAAAMBXq/9QKAAAAAAAAAAMBCAVSOr1hx4Ci/8ACAAAAAAAAAAA8CcA1X3ZEwAAAAAAAAAAGGQIBAAAAAAAAICxAOi73aEptkO/3uofCAEAAAAAAAAAAAAAAAAAAAAAAA6CAAAAAAAAAKB6AKEfVqwdQOqPSwMAAAAAAAAAAAAAAAAAAAAAwKhBZP5Bh9Jb/YYDAAAAAAAAwIYgQj1aHCe1tPWaqQcAAAAAAADZEMjBbJHU2C9f5l5PABAABAABQAAQAAQA6e/gqO8HMOReTwAQAASAgfIJFyB7pmkUm7oAAAAASUVORK5CYII=",
			"avatar-musician.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACdklEQVR42u3dLU4DQQAG0L0DAoMiVYBoUkeC5QBIDGgkkiPUcQE0CQnpAVBcoJoEiSAoAgJZLDsJTIfZ2U6770s+1+zPzBOT6Wa3aTYs21s7i5/d2x1nNTxeIwAIAAKA9DKBqc2d8FQQqTXDAAgAAoCUWbTVXiAAAAAAAAAAoAyA24fnpAIAAAAAAAAAABaBAAAAAAAAAAAAAAAAAAAAAAAAQF0T/jG/r6pPd9NWgQAAAAAAAAAAAAAAAAAAAAAAgHIASgOyMQQAAAAAAAAAFoEWgQAAAAAAAABQL4D90bjVr8+3VlMnOHY8AAAAAAAAAACgDgDhhJRe9AEAAAAAAAAAAGUAxAY8t7Pz01a7Pn5tAFYODgAAAAAAAACWBFDbnz9hX98XraY+UJL78unUhtcLAAAAAAAAAAB0A2B2dVJ1AQAAAAAAAGBdAOQuenI3clIXVdOLw6SeXV63Wvr3AAAAAAAAALAuAMIPPExvHv9seINdN3a+cMBtBAEAAAAAADBUAOEFpA5Q7QDCpt5f+PvSD2z0/kAIAAAAAAAAAPwCIHXAageQOuF9A1j5qh8AAAAAAAAACgHIBZJ7fAAAAAAAAAAA4H8Awo2f1I2gVQOI3R8AAAAAAAAAAAAAAAAAAAAAAABQrvOXRVb7vl4AAAAAAAAAAAAAAAAAAAAAALARZCMIAAAAAAAAANYdQOzFi5sOIHb/AAAAAAAAAAAAAAAAAAAAAACwSYm9uHBoHfzHowEAAAAAABgMgBiIWI8mx1mt7XzN0AMAAAAAAIAsCeRgNMlqbAL6Pp8AIAAIAAKAACAACADS3cZR7gT0fT4BQAAQAHrKN29LHY0NpljiAAAAAElFTkSuQmCC",
			"avatar-operator.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACaklEQVR42u3dsU3DQBQGYO9AQYNEk44USOmQUDoKBqBIRc0EzJBVkBAlW9DCCFCCBGVoKLCRYl7O55zt75f+1pfkfcXJuThVNbIcHhxtfnd2PE9q83qVACAACADSywCjTR14FES0JgyAACAASJ5NW+kFAgAAAAAAAADyAFjfXoUKAAAAAAAAAADYBAIAAAAAAAAAAAAAAAAAAAAAAABlAXh/ui+qL3frWnMfKBndgRQAAAAAAAAAmAiAzefzXlscCAAAAAAAAADYEUD0Rkx0wF3fCNq8PtYaPcASbXM9AAAAAAAAALAJ3NMmEAAAAAAAAAAAyALgZHZa69fHW63RAbddDwAAAAAAAAAAKANAcyC5N32pAPouAAAAAAAAAAzljGDbB57ah+tVrV1fv+tDnevV2dYO/kGVAAAAAAAAAPDT0r78iTZ1AKkABv9jUQAAAAAAAAAAAAAAAAAAAABGBSD3AxFKu5ETHRAAAAAAAAAAjAXAnzcUPOR4s1pube4DFW3rXy5PQm0bGAAAAAAAAAAMFUDzBbV9IFMD0AYCAAAAAAAAAAAAAAAAAAAAAAAA2L2pAwYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0gB03dQvf/p+vdFDooM7BQwAAAAAAAAAAOwEYHABAAAAAAAAADeCAAAAAAAAAGDSANoerDh2ALkfLAkAAAAAAAAAAAAAAAAAAAAAACWD2PefKfszZwAAAAAAAAAoA0RbzxcXSS1tvWrqAQAAAAAAQP4JZD5bJDX6w4vc6wkAAoAAIAAIAAKAACDd3ThKHUDf6wkAAoAA0FO+Affs3H9QV3p/AAAAAElFTkSuQmCC",
			"avatar-planner.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACdUlEQVR42u3doU7DQBwH4L4DAoMiKIZYMkFCQnBYJMmC4A3wPMKeAk9CeBMsvAACCQI5LL2Q3Y7rddf2+yU/2279f+Jy7bqmGVn29w7Wv3t8OM9qeLxGABAABADpZYCpzR14KojUmjAAAoAAIGUWbbUXCAAAAAAAAAAoA+D1fV20AAAAAAAAAADAMABYBAIAAAAAAACAjSAAAAAAAAAAAGC4AD5fnqrq2+Oq1VwAuQ+cDA4YAAAAAAAAAEwUQNiub15VDwIAAAAAAAAA/gkgdSMmdcB9/7AkHGCYXADVgQAAAAAAAACAiSwCSz+0mloAAAAAAAAAGAuA2dG81e+vj1ZTBxw73q4B3Nw9tAoAAAAAAAAAUwUQDqT0os8iEAAAAAAAAADKgIhd8Nw+3y5b7fr4tQ0cAAAAAAAAAIYCoLabP6ktPcDBbwQBAAAAAAAAAAAWgQAAAAAAAEz6ZlDXzd3I6frzAAAAAAAAAMBUAYQXJNzIiPXi6n5jS1+w2Plnp9cbCwAAAAAAAABTARAOPHaBxg6gbyA7f0EEAAAAAAAAAACwVWMDWy3PWh3cS6AAAAAAAAAAoBCAXCC5x981gOqf8AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYPIAum7uzZ++Py8AAAAAAAAAAAAAAAAAAAAAANgIshEEAAAAAAAAAEMHEHux4tgBxL4/AAAAAAAAAAAAwF8DrX7gAAAAAAAAALAliNr/UKF0Bz9QAAAAAAAAAOgIRKzni8us1na+ZuoBAAAAAABAtgRycrTIaupGS+nzCQACgAAgAAgAAoAAIN1tHOUOoO/zCQACgADQU34A1vUgomUCJocAAAAASUVORK5CYII=",
			"avatar-poisoner.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACY0lEQVR42u3dIU7EQBQG4N4BgSHBrGMFyToSLAKFRiFWcZQ9AlcgIUhugcHg0EgQyMUgaMXOvkzbnXa+P/ndpl36PjEZYNo0M8vx0cn2fxeny6x2r9cIAAKAACCjDDDa3IFHQURrwgAIAAKADLNoK71AAAAAAAAAAMAwANabdagAAAAAAAAAAIBFIAAAAAAAAAAAAAAAAAAAAAAAAFAWgK/Xp6L6/rhpFQAAAAAAAAAAAAAAAAAAAAAAABgOQHQjJjpgG0EAAAAAAAAAYBFoEQgAAAAAAAAA5QI4W5y3+vP92Wp0wKnrAQAAAAAAAAAAZQDoDmToRR8AAAAAAAAAADAMiNQDz+3z3W2rfV8/d+DVHUQJAAAAAAAAAH8t7Zc/0UYH1P38y8cm1MmDAAAAAAAAAAAAAAAAAAAAAGDWAHJfwpRq3xs5YzcXQPEgAAAAAAAAqAZA9wtFX/BwfX+9s9EHFm3q/qubi1DHzsFBAAAAAAAAUA2A7g1TD6Q2AG/bh52Nfj5VAAAAAAAAAABgGgD6LgAAAAAAAADMFUAukNzrHxpA9+cBAAAAAAAAAADqAGARCAAAAAAAAAAAAAAAAAAAAMCUAPTd3Ac29vcd+h9NDv5XwAAAAAAAAAAAwF4AmqkHAAAAAAAAAGwEAQAAAAAAAEDVAFIHK84dQN8HSwIAAAAAAAAAAAAAAAAAAAAAwJRADH2gQ+mt7mXSAAAAAAAAVAsgBSLVy9VVVku7X1N7AAAAAAAAkD2BLBerrKYGMPb9BAABQAAQAAQAAUAAkP42jnIHMLkDGQAAAAAAAABgv/wCxkkHoS+iHpcAAAAASUVORK5CYII=",
			"avatar-puppeteer.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACb0lEQVR42u3dIU4DQRQG4N4BQUKqCA4EpJrgSOAIGNA9BZpwEBISwi3AQVDFoZEgkMWyK5i+zM52O/u95Ffd7LT7PjGdbmcnk8pqe2u6/Jvpzm5W2uebKAAUAAoA1UsDo8lteBRENLnXo+vjAQAAAAAAAKCWSdvQk2pQ+/XF23MjKWCp4wEAAAAAAACgVgDX89tQAAAAAAAAAAAAk0AAAAAAAAAAAAAAAAAAAAAAAABgWAC+Xh4Glff7m0YAAAAAAAAAAAAAAAAAAAAAAACAcgCiCzHRBlsIAgAAAAAAAACTwHVMAj9el1kBAAAAAAAAgLEA2N87bOTn+7ORaINT5+sbwMnRWSOp1wEAAAAAAABgLADaDSk96TMJBAAAAAAAAIAyIFIXPDePVxeNdH3+3I0eAQAAAAAAAGCsAIb240800UlfdJOraDbuWwEAAAAAAAAAAAAAAAAAAAAAVQHIfQhTKl0v5JQOAAAAAAAAANQKIPcDX57P/83T3aJoUuO3b8pMBQAAAAAAAABqBdAeMHVBxgYg+vkBAAAAAAAAAAAAAAAAAAAAAACA1ZPb4NIAon/0iP6RBAAAAAAAAAAAAAAAAAAAAAAAABgOgFSDc2+yXfsdQAAAAAAAAADQU3I3Wer7/W7cpk4AAAAAAAAAAAAAAAAAAAAAAGAhCAAAAAAAAAAACG78WDuA3I0lAQAAAAAAAAAAAAAAAAAAAABgk0GU3tBh6Km+4QAAAAAAAACwIohUjmenWRnaeJOxFwAAAAAAAGpFIAd7s6xEH+RYejwFgAJAAaAAUAAoABQAqruFo9wG9D2eAkABoADoqX4Bmg7VK5/BIh0AAAAASUVORK5CYII=",
			"avatar-researcher.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACeUlEQVR42u3dLU7EQBgG4N4BgUGRVYDYZBMcCQqLJFnFATgAhgtwCQ5AQrgJGoVHLgIJljaE6dfpLLPt8yavI/2ZecRk2HSaZmLZ3zv4+tmjw2VWu9drBAABQACQrUxgtLkTHgURrRkGQAAQAKTMoq32AgEAAAAAAAAAZQDcPNyGCgAAAAAAAAAAWAQCAAAAAAAAAAAAAAAAAAAAAAAAdU345uWpqr4+3rcKBAAAAAAAAAAAAAAAAAAAAAAAlANQGpCNIQAAAAAAAACwCLQIBAAAAAAAAIB6ARwvlq1+fry3Gp3g1PUAAAAAAAAAAIA6AHQnpPSiDwAAAAAAAAAAKAMgNeC5fb5etzr29QEAAAAAAAAAgGEAavvnz9g/KAEAAAAAAAAAAAD4DcDkDqQAAAAAAAAAgJ4Acg9pyt3IKX2IVfL5N2+hVg8CAAAAAAAAAHoOUPeAh8u79Z+NDli0qfufXp23GgUw9vNWBwIAAAAAAIDZAOg+QHSApg6g+/cAAAAAAAAAMBcA0QGrHUB0wgEAAAAAAAAAgHEA5ALJvT4AAAAAAAAAADAMQHfjJ7oR9N8AUu/X7bazdRAAAAAAAAAAAMCg9935RSEAAAAAAAAA9AQwdnMHrPTz5QKIvi8AAAAAAAAAADANABaBAAAAAAAA2AiyEQQAAAAAAAAANQNIfVhx6gBS75/7UarqPiQJAAAAAAAAAAAMAtDsegAAAAAAAJgtgBSI0h90qL2zPzQKAAAAAACA2QBIgUj1bHWR1dru18w9AAAAAAAASE8gJ4tVVqMHNZa+nwAgAAgAAoAAIAAIADLexlHuBOzcjzABAAAAAAAAoF++Ad0XVxvmlB99AAAAAElFTkSuQmCC",
			"avatar-reviewer.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACcElEQVR42u3drU7DUBgG4N4DgoRMkTkQZBMkJLOIXQFBoSbw3MSuhIQEENwAbo6EIOASQIJADksrOD2ctjtrnzd5bf++R3xpsq4oepbdndH6d0d7+0mtHq8QAAQAAUA6GWBsUwceCyK2JgyAACAASDtLW+4FAgAAAAAAAADaAbBYXEUVAAAAAAAAAACwBAIAAAAAAAAAAAAAAAAAAAAAAAB5Afh8us2qbzfLUgEAAAAAAAAAAAAAAAAAAAAAAID2AMS+iIkdsBdBAAAAAAAAAGAJtAQCAAAAAAAAQL4ADsZHpX5/fZQaO+DQ8VIBdF0AAAAAAAAA6CuA6kDaXvpiASwvTzba7EAAAAAAAAAwWAAhEKEHnnur9/Nyd1zq+v261VbPBwAAAAAAAADbAiB2SXt9XrXa2OsBAAAAAAAAAADyBHB/cV4qAAAAAAAAAACwmYGntu0lMPX6QgAmk1lSAQAAAAAAACBXANULiP2Dh/n87M9Wb3j1+JDU6vFC5w8NaPBLIAAAAAAAAIMBUD1h6AENHUDvlkAAAAAAAAAA2BCApmsJBAAAAAAAAIA8AaQCST1+10sgAAAAAAAAAADQDwCWQAAAAAAAAAAAAAAAAAAAAACGBKDppj7Apq9ncB+KBAAAAAAAAAAAarV3fxgBAAAAAAAAAF4E/QtAse0BAAAAAAAAgJoffuw7gNgPSwIAAAAAAAAAAAAAAAAAAAAAQJ9AtP1Bh9zb+4EDAAAAAAAAQE0Qoc6mp0nN7XzF0AMAAAAAAIDUBHI4niY1NICuzycACAACgAAgAAgAAoA09+IodQBb92NMAAAAAAAAAKiXH4ekDM0Hdeb8AAAAAElFTkSuQmCC",
			"avatar-talisman.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACeElEQVR42u3dsUoDMQAG4L6Dg4uTdBB1KHQriJuP4NDJ57hH8EkEQXwGcXES3BxcHRwr6FhX78DmYi4lzX0//GtyNN8Qcte7yaSy7O8drH/3+HCW1O54EwFAABAAZCsLGNvUBY8FEVsrDIAAIABInk1b6QUCAAAAAAAAAPIAeGouowoAAAAAAAAAANgEAgAAAAAAAAAAAAAAAAAAAAAAAGUBWD3fFdXX2+tWAQAAAAAAAAAAAHI8VFrdQ6kAAAAAAAAA8E8AsQcxsQuc+yBo9dpstcWBAAAAAAAAAICRbgJX74+trr/eBm13fAAAAAAAAACoFcDJdNbq9+dHq7ELHBoPAAAAAAAAAAAoA0B3QXJv+oYGMPjhDwAAAAAAAAAUCiAEIvSDp/b+atnq0OOHHtAY/SYQAAAAAAAAAP4AUNrNn9jGAojd5AEAAAAAAAAAAHUAsAkEAAAAAABgrM8DDN3cBzmpBQAAAAAAAICxAOheQOwHHm6Wi43N/efK0PzN+VFUQwAeFouoAgAAAAAAAEApALoThn4QADYD6F4PAAAAAAAAAABgEwgAAAAAAAAAYwaQCiR1/KEB7PzNIAAAAAAAAAAAoBeA3AUAAAAAAAAAAMoA0G11H40CAAAAAAAAgJ4Ahu76pUnqtq+3uo9LAwAAAAAAAAAAAAAAAAAAAACAgyAAAAAAAAAAGB2A0IsVawcQ+2JJAAAAAAAAAAAAAAAAAAAAAACoCkTmFzqU3uoXHAAAAAAAAAB6ggj1bH6R1NLmm4w9AAAAAAAASE8gp9N5UkMLsO35BAABQAAQAAQAAUAAkOEOjlIXYOdeygQAAAAAAAAA/fIDdHNMxdocQokAAAAASUVORK5CYII=",
			"avatar-tester.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACUElEQVR42u3dMU7DMBgG0NyBgQWJpVPpgNQZdeMQqANcp1dBIM7ABZh7BUYYGNuBhQSpruM4cZL3Sd+aRPnfYBmTVtXEcnlxdfjbxfUqqc3rVQKAACAASC8DjG3qwGNBxNaEARAABADJs2grvUAAAAAAAAAAQB4AL9ttVAEAAAAAAAAAAItAAAAAAAAAAAAAAAAAAAAAAAAAoCwAXx+vRXX/vKsVAAAAAAAAAAAAAAAAAAAAAAAAyAcgdiMmdsA2ggAAAAAAAADAItAiEAAAAAAAAADKBXCzuK315/uz1tgBh64HAAAAAAAAAACUAaA5kNyLPgAAAAAAAAAAIA+I0AtP7dvjQ61dX9/AAQAAAAAAAKAdgNL++BNbAAAAAAAAAAAAgCEKAAAAAAAAAGMZeNfteiMntX2neBAAAAAAAADMBkDzgWJ/4GG32ZzsYf+etaH7Py2XJ5t6oCX2wAsAAAAAAAAADAWg+QChFzQ1AKmHTgEAAAAAAAAAAAAAAAAAAAAAAID2TR1wbgCTO5QKAAAAAAAAADMFMDQIAAAAAAAAAACgDADNdr1RVfwJIAAAAAAAAADoqakvtPTnAwAAAAAAAAAAxgmg2cl9EAIAAAAAAAAAbAS1AlCNPQAAAAAAAABw5ocf534gBAAAAAAAAAAAAAAAAAAAAAAAppR/H0/O/EGH0ju7H5UCAAAAAABgtgBCIEK9W98ntbT7VXMPAAAAAAAAciaQ1WKd1NAA+r6fACAACAACgAAgAAgA0t3GUeoAJvfPmgAAAAAAAADwmyOKtUgQ1cfZOwAAAABJRU5ErkJggg==",
			"avatar-verifier.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACaklEQVR42u3dIU7EQBgG0L0DAoMiqwCxyWoEhhtgCIIb4DF4rkDCBUgIR+AGaC6AQC4CWSytYDo7M8u0877kUyRt6f9IJrNsu1jMLPt7B93vHh2ukjo83kIAEAAEANnJAGObOvBYELE1YQAEAAFAyizaai8QAAAAAAAAAFAGwMPda1QBAAAAAAAAAACLQAAAAAAAAAAAAAAAAAAAAAAAAKAuAJu356r6/nTfKwAAAAAAAAAAAAAAAAAAAAAAAFAOQOxGTOyAbQQBAAAAAAAAgEWgRSAAAAAAAAAA1AvgeLnq9fvrs9fYAYeOBwAAAAAAAAAA1AFgOJDSiz4AAAAAAAAAAKAMiNANT+3L9WWvuY9v4AAAAAAAAACwHYDaPvyJLQAAAAAAAAAAAMAYAKkvpJg8OAAAAAAAAJoBkPsXzr2RVPr6hv1477K2ehAAAAAAAAA0A2B4QbEveLi9evyzuW/gsKHzX5zdRDU3iMn9xQMAAAAAADBbAMMLCt2Q1gCEQKQC+HcQAAAAAAAAAADAqOa+3hAwAAAAAAAAAJgLgFQgqccHAAAAAAAAAAAA2Kbdput3mMHPAQAAAAAAAACAmQIIFAAAAAAAAADmAiB3c2+klC4AAAAAAAAAANAmgOY/DAIAAAAAAMD/AzS6EVT6ARSz/2IIAAAAAAAA1QIIPVhx7gCae7g0AAAAAAAAAAAAAAAAAAAAAE2/Y6j0w5Gn1uZeKgUAAAAAAECzAEIgQj1dnye1tvMtWg8AAAAAAAAyEsjJcp3U0AB2fT4BQAAQAAQAAUAAEAAk38ZR6gAm90UMAAAAAAAAABiXH33uEave71KKAAAAAElFTkSuQmCC",
			"avatar-writer.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACcElEQVR42u3dr07DQAAH4L4DAoMiUwOxZI4EcAgkAjGF5gkIj7DwJiRkb4LeK0yRIZAgoc1Ge7u7rX++X/JzS9vdfeJy69qi6FmOj06+/3Z8Oolq9XiFACAACACylwkMbeyEh4IIrRkGQAAQACTPoq3tBQIAAAAAAAAA8gB4erkPKgAAAAAAAAAAYBHYBQC922gCAAAAAAAAAAAajc98dlHq4vmu1M6BAAAAAAAAYDAAYid8/f7Wqi5f56WmBgEAAAAAAAAAAAAAAAAAAAAAAAD8NjegQ28MAQAAAAAAAAAAFoEAAAAAAAAAAMD2no0mpX59rkoNneC64wEAAAAAAAAAAO0AUJ2Q3Is+AAAAAAAAAAAgD4C6AY/t4mFWaurjAwAAAAAAAAAAuwFo248/qW8oAQAAAAAAAAAAAAAAAAAAAAAAANK9pCl2Iyf3S6wAAAAAAAAAAIBmL4CYPV7/24/1Mmvrzn91Oy4VAAAAAAAAAIYKoHpBoQPUdwDVz1fHK/Z6Dw4CAAAAAAAAALYACB2wtgMInXAAAAAAAAAAACANgFggsccHAAAAAAAAAAB2A1Dd+AndCDo0gLrvFwugGgAAAAAAAAAAYBgALAIBAAAAAADoK4DUjR3AfV9v7B9ROndTKAAAAAAAAAAAsBFA0fUAAAAAAAAAgI0gAAAAAAAAABg0gLoHK/YdQN33BwAAAAAAAAAAAAAAAAAAAACAPiX1TY9db+8nHAAAAAAAAAAagqjr5fQmqm07XzH0AAAAAAAAIA2BnI+mUQ19QUPu8wkAAoAAIAAIAAKAACDpNo5iJ6DzD2gAAAAAAAAAgM35Aa+CXD4hfNLYAAAAAElFTkSuQmCC",
			"state-idle.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAACN0lEQVR42u3dPUoDQRgG4L2DhY1YiFUszAEEW9ELiI2CnZU3sDaNBxFEvEC8gbWdNxD0ANpYuCFkHCfLzs/zwtuZhOz3FB87K+m6wrO5sfX1u5Od6aBd/LxOABAABAAZZeBjAwACAAAAAAAAAOpY8iyJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkBeIj5eHUWvgAAAAAAAAAJAHgNf72cqGBhr7egAAAAAAAAAAIA8Ae7vTlQ0BiH09AAAAAAAAAADgRhAAAAAAgAAg+QJ4vDjrFQAAAAAAAAAAKBNA6PBm6AIAAAAAAAAAAP8bYOzf534jCAgAAAAAAAAAWD7Am7fnXkMX8PzuqdfDq1nWnRxf9to8CAAAAAAAAOwEf1wCWwdQPRgAAAAAAACaBRB7AVIBzD/fkzo0gNglGQAAAAAAAAAAqAOAJRAAAAAAAIBaAaReAIdBAAAAAAAAAFDmwBeXKodBAAAAAAAAAGAJXMcSGPrHjdSBxr7/ugEUDwgAAAAAAIBmAQx9GFQbgNQlGgAAAAAAAABKHXjtD4R4QggAAAAAAADPCC4fcKilHQaFvo8bPQAAAAAAALQKIPeBDl0AAAAAAAAAAAAAAAAAAAAAAGjpsAeAyn9wAgAAAAAAgGYALH6Bk+tbTWhxIAAAAAAAAADgp/tHp5pQAAAAAAAAAAAAAAAAAAAAAAAoCcD29EATCgAAAAAAAAC1PB+gca3+iSAFQAHQagGIiIiIiIiISDb5BvPJs7ehbTScAAAAAElFTkSuQmCC",
			"state-unknown.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABwUlEQVR42u3dsYkCURCA4e3B4JIFE/MLDAQTe7CBy23C3EKOywyugcMabMIqvMTEQRBZn2/W9/0wkbC47Bc9xrXrJEmSJEmSJEmSJEmSJEmSbvQx6c+m3AAAAAAAAABA1ge+Pf6ZgpMOBAAAAAAAAABcZrXZVJ3pfF50at8fAAAAAAAAAGQFUHviA5vMZoMmXs/BEAAAAAAAAK0CiF/g6/c71ZQGkO1+Xw4CAAAAAAAAAC7zuV6nmvjAzqefQROvl+1+AQAAAAAAAKAWgOwHQcf94mpi8fM42Q+CAAAAAAAAAKAUgLEtfd4D8OjE6zW3NAoAAAAAAAAASZY+H10KfTaA7PcPAAAAAAAAAK86F7AU6iQQAAAAAACANgFYCrUVDAAAAAAAgN8FZFwKPSyXg8ZSKAAAAAAAAACM8wURu74fNF4QAQAAAAAAAADjWBotDcDLogEAAAAAAAAg59JoaQBeFg0AAAAAAAAAOQ+G3n0ptMseAAAAAAAAzQKovURa+k+j3m7JEwAAAAAAAAAaXSK15AkAAAAAAAAAbS6RWvIEAAAAAAAAAEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSlLR/0uS0G42FsFEAAAAASUVORK5CYII=",
			"state-working.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABzElEQVR42u3dsY3CMBSAYXagoGEPJEahYRR6JgkVI0DBABQMQBWJCiQGgDopACtOcOzvl9yeuLyveAp3yWQiSZIkSZIkSZI04mbT+SvkuGIACAABoDwG3K5+fD5AAAAAAAAAAMA4Bt6ubwCAAAAAAAAAAEAeS+DuVDdO6M8DAgAAAAAAAAD+M/DQJTEUgCUQAAAAAAAAANIY+OZ6bJy+l0ATAEAACABZAgWAABAAGg+QvgEAAwAAAAAAAABlAAi9MWUiAAgAASBLoAAQAAJA+QAQAAJAAAgAASAABIDiDRAAAAAAAAAAAChj4IfnvXG6fjkDAAAAAAAAAABYAgEAAAAAAAAAgHyA9P3SKC+aBAAAAAAAAIA0Bv66VUmdrjeqgAIAAAAAAACA3y7YZb9I6oQ+UGJ9rj4eIAAAAAAAAMgFQOylJ/RGzXa1DDqxbwQBAAAAAAAAQCkA/v0LxwYw9usBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwLoP0AjK4PxAAAAAAAAAAAANIE8O3zZf8XQAAAAAAAABQLYOil5xuA9j92DA0g+wAAAAAAAFAiS4+HPgEAAAAAAACAJEmSJEmSJEkqsDf7T2pymSGI4QAAAABJRU5ErkJggg=="
		};
		//#endregion
		//#region lib/client/artwork.js
		/**
		* Cultivation artwork lookup for the activity panel and the conversation card.
		*
		* The images are embedded as base64 data URLs (art-data.ts, generated by
		* scripts/gen-art-data.mjs) instead of fetched from the host asset route: a
		* running host keeps that route's allowlist in memory, so a rebuilt client used
		* to 404 on every portrait until the whole app restarted. Embedded art ships
		* with the client that renders it.
		*
		* Every built-in 道途 resolves by role id, so a quick-start roster never falls
		* back to a bare initial. Custom roles fall back to a keyword heuristic and,
		* failing that, to the caller's initial-letter badge.
		* @module dsh-agent-teams/client/artwork
		*/
		/** Inline data URL for one packaged artwork file ('' when the build missed it). */
		function art(file) {
			const base64 = ART_BASE64[file];
			return base64 === void 0 ? "" : `data:image/png;base64,${base64}`;
		}
		/** One portrait per built-in role id (the wire id, never the display name). */
		const ROLE_ART = {
			planner: "avatar-planner.png",
			implementer: "avatar-implementer.png",
			verifier: "avatar-verifier.png",
			reviewer: "avatar-reviewer.png",
			researcher: "avatar-researcher.png",
			analyst: "avatar-analyst.png",
			writer: "avatar-writer.png",
			auditor: "avatar-auditor.png",
			architect: "avatar-architect.png",
			tester: "avatar-tester.png",
			documenter: "avatar-documenter.png",
			operator: "avatar-operator.png",
			talisman: "avatar-talisman.png",
			healer: "avatar-healer.png",
			beastmaster: "avatar-beastmaster.png",
			puppeteer: "avatar-puppeteer.png",
			musician: "avatar-musician.png",
			poisoner: "avatar-poisoner.png",
			monk: "avatar-monk.png",
			demon: "avatar-demon.png"
		};
		/** Keyword fallback for custom roles, mapped onto the closest 道途 portrait. */
		const KEYWORD_ART = [
			[/数据|分析|推演|指标|analys|metric|data/, "avatar-analyst.png"],
			[/研究|调研|取证|探索|resear|investig|explor/, "avatar-researcher.png"],
			[/\bqa\b|质量|验证|校验|verif|quality/, "avatar-verifier.png"],
			[/测试|回归|test|regress/, "avatar-tester.png"],
			[/实现|开发|工程|代码|编程|engineer|implement|backend|\bapi\b|runtime/, "avatar-implementer.png"],
			[/架构|设计|边界|architect|design/, "avatar-architect.png"],
			[/审查|裁断|评审|review|judge/, "avatar-reviewer.png"],
			[/审计|巡查|安全|风险|audit|secur/, "avatar-auditor.png"],
			[/文档|撰写|写作|书记|docs|writer|spec/, "avatar-writer.png"],
			[/传道|示例|document|tutorial/, "avatar-documenter.png"],
			[/发布|构建|部署|运维|打包|release|build|deploy|\bops\b/, "avatar-operator.png"],
			[/规划|拆解|排程|plan|strateg/, "avatar-planner.png"]
		];
		/** Captain portrait (the sect leader). */
		const LEAD_ART = art("avatar-captain.png");
		/** Status action artwork per member activity. */
		const ACTION_ART = {
			working: art("state-working.png"),
			idle: art("state-idle.png"),
			unknown: art("state-unknown.png")
		};
		/**
		* Member artwork URL, or null when no role matches (initial-letter fallback).
		* @param name - the member's display name.
		* @param role - the member's role text.
		* @returns the artwork data URL, or null when unmatched.
		*/
		function memberArtUrl(name, role) {
			const id = role.trim().toLowerCase();
			const exact = ROLE_ART[id];
			if (exact !== void 0) return art(exact);
			const identity = `${name} ${role}`.toLowerCase();
			for (const [pattern, file] of KEYWORD_ART) if (pattern.test(identity)) return art(file);
			return null;
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\AgentTeamsCard.module.css.mjs
		const css$5 = ".RraEla_root{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:10px;flex-direction:column;gap:8px;width:100%;min-width:0;padding:10px 12px;display:flex}.RraEla_head{align-items:center;gap:8px;min-width:0;display:flex}.RraEla_leadAvatar{object-fit:contain;filter:drop-shadow(0 1px 1px #122d4833);background:0 0;border:0;border-radius:0;flex:none;width:30px;height:30px}.RraEla_teamName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;flex:0 auto;font-size:13px;font-weight:600;line-height:20px;overflow:hidden}.RraEla_memberCount{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;margin-left:auto;font-size:11px;line-height:16px}.RraEla_panelButton{border:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;flex:none;padding:2px 8px;font-size:10.5px;font-weight:600;line-height:16px;transition:border-color .12s,color .12s}.RraEla_panelButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}.RraEla_panelButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.RraEla_members{flex-wrap:wrap;gap:6px;min-width:0;display:flex}.RraEla_member{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);max-width:160px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;align-items:center;gap:5px;padding:3px 8px 3px 3px;font-size:11px;font-weight:500;line-height:16px;transition:border-color .12s,background-color .12s;display:inline-flex}.RraEla_member:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-button-ghost-active-fill)}.RraEla_member:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}.RraEla_memberArt{object-fit:contain;filter:drop-shadow(0 1px 1px #122d482e);background:0 0;border:0;border-radius:0;width:24px;height:24px}.RraEla_memberInitial{background:var(--dsw-alias-state-business-primary);width:20px;height:20px;color:var(--dsw-alias-label-primary-inverted);border-radius:50%;justify-content:center;align-items:center;font-size:10px;font-weight:600;line-height:20px;display:inline-flex}.RraEla_memberName{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.RraEla_chatEntry{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border-radius:7px;align-items:center;gap:5px;padding:3px 8px;font-size:12px;display:inline-flex}.RraEla_chatEntry img{object-fit:contain;width:22px;height:22px}.RraEla_chatEntry:hover{background:var(--dsw-alias-bg-module-platform)}.RraEla_chatEntry:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RraEla_turnCards{gap:8px;margin-block:10px;display:grid}.RraEla_comms{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:5px;min-width:0;padding-top:8px;display:flex}.RraEla_commsTitle{color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:600;line-height:14px}.RraEla_commsTasks{flex-wrap:wrap;gap:4px;display:flex}.RraEla_commsTask{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);color:var(--dsw-alias-state-business-primary);border-radius:5px;align-items:center;gap:4px;padding:2px 6px;font-size:10px;line-height:14px;display:inline-flex}.RraEla_commsTask[data-state=completed]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent);color:var(--dsw-alias-state-success-primary)}.RraEla_commsTask[data-state=failed]{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);color:var(--dsw-alias-state-error-primary)}.RraEla_commsList{flex-direction:column;gap:5px;max-height:132px;margin:0;padding:0;list-style:none;display:flex;overflow:auto}.RraEla_commsRow{align-items:flex-start;gap:6px;min-width:0;display:flex}.RraEla_commsAvatar{object-fit:contain;background:0 0;border-radius:4px;flex:none;width:20px;height:20px}.RraEla_commsText{flex-direction:column;gap:1px;min-width:0;display:flex}.RraEla_commsMeta{color:var(--dsw-alias-label-tertiary);font-size:9.5px;line-height:12px}.RraEla_commsBody{color:var(--dsw-alias-label-secondary);word-break:break-word;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:10.5px;line-height:1.45;display:-webkit-box;overflow:hidden}@media (width<=600px){.RraEla_head{flex-wrap:wrap}}";
		const tagId$5 = "agent-teams-pixel/AgentTeamsCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var AgentTeamsCard_module_css_default = {
			"chatEntry": "RraEla_chatEntry",
			"comms": "RraEla_comms",
			"commsAvatar": "RraEla_commsAvatar",
			"commsBody": "RraEla_commsBody",
			"commsList": "RraEla_commsList",
			"commsMeta": "RraEla_commsMeta",
			"commsRow": "RraEla_commsRow",
			"commsTask": "RraEla_commsTask",
			"commsTasks": "RraEla_commsTasks",
			"commsText": "RraEla_commsText",
			"commsTitle": "RraEla_commsTitle",
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
		* one team — the captain's portrait and name, the member roster as
		* clickable 道途 portraits (opening the member's subagent transcript), and
		* an "activity panel" button that re-activates the top-right floater.
		*
		* The floater and this card share the `agent-teams:open-panel` window event
		* so the card can summon the panel even after it was closed (or when an old
		* session is re-opened for review).
		* @module dsh-agent-teams/client/card
		*/
		/** Window event name the floater listens for to open itself. */
		const OPEN_PANEL_EVENT = "agent-teams:open-panel";
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
			const messages = (snapshot?.messages ?? []).slice(-8);
			const taskEvents = [...snapshot?.tasks ?? []].filter((task) => task.updatedAt !== void 0).sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0)).slice(0, 3);
			return (0, react_jsx_runtime.jsxs)("section", {
				className: AgentTeamsCard_module_css_default.root,
				"data-agent-teams-card": true,
				"data-team-id": resolved.teamId,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
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
							})
						]
					}),
					(messages.length > 0 || taskEvents.length > 0) && (0, react_jsx_runtime.jsxs)("div", {
						className: AgentTeamsCard_module_css_default.comms,
						"data-team-comms": true,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: AgentTeamsCard_module_css_default.commsTitle,
								children: t("card.comms")
							}),
							taskEvents.length > 0 && (0, react_jsx_runtime.jsx)("div", {
								className: AgentTeamsCard_module_css_default.commsTasks,
								"data-team-comms-tasks": true,
								children: taskEvents.map((task) => {
									const state = task.status === "completed" ? "completed" : task.status === "failed" || task.status === "cancelled" ? "failed" : "start";
									const key = state === "completed" ? "card.task.completed" : state === "failed" ? "card.task.failed" : "card.task.start";
									const glyph = state === "completed" ? "✓" : state === "failed" ? "✕" : "▶";
									return (0, react_jsx_runtime.jsxs)("span", {
										className: AgentTeamsCard_module_css_default.commsTask,
										"data-state": state,
										children: [(0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": true,
											children: glyph
										}), t(key, {
											taskId: task.id,
											assignee: task.assignee || t("task.assignee.unclaimed")
										})]
									}, task.id);
								})
							}),
							(0, react_jsx_runtime.jsx)("ul", {
								className: AgentTeamsCard_module_css_default.commsList,
								children: messages.map((message) => {
									const fromCaptain = message.from === "captain" || message.from === "";
									const role = fromCaptain ? "" : snapshot?.members.find((member) => member.name === message.from)?.role ?? "";
									const art = fromCaptain ? LEAD_ART : memberArtUrl(message.from, role);
									return (0, react_jsx_runtime.jsxs)("li", {
										className: AgentTeamsCard_module_css_default.commsRow,
										"data-from": fromCaptain ? "captain" : "member",
										children: [(0, react_jsx_runtime.jsx)("img", {
											className: AgentTeamsCard_module_css_default.commsAvatar,
											src: art ?? "",
											alt: "",
											"aria-hidden": true
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: AgentTeamsCard_module_css_default.commsText,
											children: [(0, react_jsx_runtime.jsxs)("span", {
												className: AgentTeamsCard_module_css_default.commsMeta,
												children: [
													message.from,
													" → ",
													message.to ?? "captain"
												]
											}), (0, react_jsx_runtime.jsx)("span", {
												className: AgentTeamsCard_module_css_default.commsBody,
												title: message.content,
												children: message.content
											})]
										})]
									}, message.id ?? `${message.ts ?? 0}:${message.from}`);
								})
							})
						]
					}),
					resolved.members.length > 0 && (0, react_jsx_runtime.jsx)("div", {
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
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\ActivityPanel.module.css.mjs
		const css$4 = "html{--agent-teams-panel-shift:420px}html[data-agent-teams-panel-open] [data-phase=active]{box-sizing:border-box;padding-right:var(--agent-teams-panel-shift)}.dM3Hkq_badge{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 92%, transparent);backdrop-filter:blur(16px);height:34px;box-shadow:0 8px 28px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 29%, transparent);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;align-items:center;gap:7px;padding:0 12px;font-size:12px;font-weight:600;line-height:20px;transition:border-color .15s,transform .12s;display:inline-flex;position:absolute;top:64px;right:18px}.dM3Hkq_badge:hover{border-color:var(--dsw-alias-border-l3);transform:translateY(-1px)}.dM3Hkq_badge:active{transform:translateY(0)scale(.98)}.dM3Hkq_badge:focus-visible,.dM3Hkq_iconButton:focus-visible,.dM3Hkq_memberRow:focus-visible,.dM3Hkq_membersToggle:focus-visible,.dM3Hkq_sectionToggleTitle:focus-visible,.dM3Hkq_dagNode:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.dM3Hkq_badgeDot,.dM3Hkq_panelDot{background:var(--dsw-alias-label-tertiary);border-radius:50%;width:7px;height:7px}.dM3Hkq_badgeDot[data-busy=true],.dM3Hkq_panelDot[data-busy=true]{background:var(--dsw-alias-state-business-primary);animation:1.25s ease-in-out infinite dM3Hkq_agentTeamsPulse}.dM3Hkq_badgeCount,.dM3Hkq_memberCount,.dM3Hkq_teamStats,.dM3Hkq_stageLabel,.dM3Hkq_taskId{font-variant-numeric:tabular-nums}.dM3Hkq_panel{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-border-l3) 58%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 95%, transparent);backdrop-filter:blur(20px)saturate(1.08);box-shadow:0 12px 32px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 25%, transparent), 0 32px 72px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 33%, transparent);will-change:transform;border-radius:16px;flex-direction:column;animation:.16s ease-out dM3Hkq_agentTeamsPanelIn;display:flex;position:absolute;top:0;left:0;overflow:hidden}.dM3Hkq_panel[data-dragging],.dM3Hkq_panel[data-resizing]{user-select:none;box-shadow:0 16px 38px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 29%, transparent), 0 36px 78px color-mix(in srgb, var(--dsw-alias-bg-mask-3) 38%, transparent)}@keyframes dM3Hkq_agentTeamsPanelIn{0%{opacity:0}to{opacity:1}}@keyframes dM3Hkq_agentTeamsPulse{0%,to{opacity:.42}50%{opacity:1}}.dM3Hkq_panelHead{border-bottom:1px solid var(--dsw-alias-border-l2);cursor:grab;touch-action:none;flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:0 14px 0 16px;display:flex}.dM3Hkq_panelHead:active,.dM3Hkq_panel[data-dragging] .dM3Hkq_panelHead{cursor:grabbing}.dM3Hkq_panel[data-compact] .dM3Hkq_panelHead{cursor:default;touch-action:auto}.dM3Hkq_panelTitle{color:var(--dsw-alias-label-primary);align-items:center;gap:8px;font-size:14px;font-weight:600;line-height:20px;display:inline-flex}.dM3Hkq_panelControls{flex:none;align-items:center;gap:2px;display:inline-flex}.dM3Hkq_iconButton{width:28px;height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:7px;justify-content:center;align-items:center;padding:0;transition:background-color .12s,color .12s,transform .12s;display:inline-flex}.dM3Hkq_iconButton:hover{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_iconButton:active{transform:scale(.94)}.dM3Hkq_iconButton[data-control=dock][data-mode=docked] svg{transform:scaleX(-1)}.dM3Hkq_resizeHandle{z-index:5;touch-action:none;pointer-events:auto;position:absolute}.dM3Hkq_resizeHandle[data-resize-edge=left]{cursor:ew-resize;width:14px;top:44px;bottom:14px;left:0}.dM3Hkq_resizeHandle[data-resize-edge=left]:after{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 42%, transparent);content:\"\";opacity:.45;border-radius:999px;width:3px;height:48px;transition:background-color .12s,opacity .12s;position:absolute;top:50%;left:4px;transform:translateY(-50%)}.dM3Hkq_resizeHandle[data-resize-edge=bottom]{cursor:ns-resize;height:14px;bottom:0;left:20px;right:20px}.dM3Hkq_resizeHandle[data-resize-edge=bottom]:after{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 42%, transparent);content:\"\";opacity:.45;border-radius:999px;width:48px;height:3px;transition:background-color .12s,opacity .12s;position:absolute;bottom:4px;left:50%;transform:translate(-50%)}.dM3Hkq_resizeHandle[data-resize-edge=corner]{cursor:nwse-resize;width:28px;height:28px;bottom:0;right:0}.dM3Hkq_resizeHandle[data-resize-edge=corner]:after{border-right:2px solid var(--dsw-alias-label-tertiary);border-bottom:2px solid var(--dsw-alias-label-tertiary);content:\"\";opacity:.58;width:10px;height:10px;transition:border-color .12s,opacity .12s;position:absolute;bottom:6px;right:6px}.dM3Hkq_resizeHandle:hover:after,.dM3Hkq_panel[data-resizing] .dM3Hkq_resizeHandle:after{background-color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary);opacity:.95}.dM3Hkq_teams{overscroll-behavior:contain;scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent) transparent;scrollbar-width:thin;flex-direction:column;min-height:0;display:flex;overflow-y:auto}.dM3Hkq_teams::-webkit-scrollbar{width:6px}.dM3Hkq_teams::-webkit-scrollbar-track{background:0 0}.dM3Hkq_teams::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 28%, transparent);background-clip:padding-box;border:2px solid #0000;border-radius:999px}.dM3Hkq_teams:hover::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-tertiary) 44%, transparent);background-clip:padding-box}.dM3Hkq_team{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:12px;padding:12px 14px 16px;display:flex;container:dM3Hkq_agent-team/inline-size}.dM3Hkq_team:last-child{border-bottom:0}.dM3Hkq_teamHead{align-items:center;gap:10px;min-width:0;display:flex}.dM3Hkq_teamName{min-width:0;color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:13px;font-weight:600;line-height:18px;overflow:hidden}.dM3Hkq_teamStats{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;gap:8px;font-size:10.5px;line-height:16px;display:inline-flex}.dM3Hkq_statePill{border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;border-radius:999px;flex:none;align-items:center;padding:1px 8px;font-size:10px;font-weight:650;line-height:15px;display:inline-flex}.dM3Hkq_statePill[data-state=running]{color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)}.dM3Hkq_statePill[data-state=completed]{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)}.dM3Hkq_taskBoard{flex-direction:column;gap:6px;margin:8px 0 2px;display:flex}.dM3Hkq_taskBoardHead{color:var(--dsw-alias-label-secondary);justify-content:space-between;align-items:center;gap:8px;font-size:10.5px;line-height:16px;display:flex}.dM3Hkq_taskBoardHead>span:first-child{align-items:center;gap:5px;display:inline-flex}.dM3Hkq_taskBoardHead svg{width:13px;height:13px}.dM3Hkq_taskBoardHint{color:var(--dsw-alias-label-tertiary);font-size:9.5px}.dM3Hkq_taskBoardList{flex-direction:column;gap:3px;margin:0;padding:0;list-style:none;display:flex}.dM3Hkq_taskRow{--task-tone:var(--dsw-alias-label-tertiary);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer;border-radius:8px;grid-template-columns:8px 34px minmax(0,1fr) auto auto auto;align-items:center;gap:8px;padding:6px 9px;font-size:11px;line-height:16px;display:grid}.dM3Hkq_taskRow:hover{border-color:var(--dsw-alias-state-business-primary)}.dM3Hkq_taskRow[data-state=running],.dM3Hkq_taskRow[data-state=claimed]{--task-tone:var(--dsw-alias-state-business-primary)}.dM3Hkq_taskRow[data-state=completed]{--task-tone:var(--dsw-alias-state-success-primary)}.dM3Hkq_taskRow[data-state=failed]{--task-tone:var(--dsw-alias-state-error-primary)}.dM3Hkq_taskRow[data-state=blocked]{--task-tone:var(--dsw-alias-state-warning-primary)}.dM3Hkq_taskRow[data-state=cancelled]{--task-tone:var(--dsw-alias-label-tertiary)}.dM3Hkq_taskRow[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_taskRowDot{background:var(--task-tone);border-radius:50%;width:7px;height:7px}.dM3Hkq_taskRowId{color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;font-weight:600}.dM3Hkq_taskRowSubject{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_taskRowOwner{text-overflow:ellipsis;white-space:nowrap;max-width:90px;overflow:hidden}.dM3Hkq_taskRowDeps{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:9.5px}.dM3Hkq_taskRowStatus{color:var(--task-tone);white-space:nowrap;font-size:10px}.dM3Hkq_taskRowDetail{border-left:2px solid var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, transparent);color:var(--dsw-alias-label-secondary);border-radius:0 8px 8px 0;margin:2px 0 4px 14px;padding:7px 10px;font-size:10.5px;line-height:1.6}.dM3Hkq_taskRowDetail p{white-space:pre-wrap;margin:0 0 4px}.dM3Hkq_teamResumeButton{border:1px solid color-mix(in srgb, #4ec98a 55%, var(--dsw-alias-border-l2));background:color-mix(in srgb, #4ec98a 12%, var(--dsw-alias-bg-layer-1));color:#4ec98a;height:24px;font:inherit;cursor:pointer;white-space:nowrap;border-radius:7px;flex:none;align-items:center;gap:4px;padding:0 10px;font-size:11px;font-weight:650;line-height:16px;display:inline-flex}.dM3Hkq_teamResumeButton:hover:not(:disabled){background:color-mix(in srgb, #4ec98a 22%, var(--dsw-alias-bg-layer-1));border-color:#4ec98a}.dM3Hkq_teamResumeButton:disabled{opacity:.6;cursor:default}.dM3Hkq_teamResumeError{color:var(--dsw-alias-state-error-primary);margin:2px 14px 6px;font-size:11px}.dM3Hkq_teamStopButton{border:1px solid var(--dsw-alias-border-l2);width:26px;height:26px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border-radius:7px;flex:none;place-items:center;padding:0;transition:border-color .15s,background .15s,color .15s;display:grid}.dM3Hkq_teamStopButton:hover{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 42%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent);color:var(--dsw-alias-state-error-primary)}.dM3Hkq_teamStopButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.dM3Hkq_stopModalActions{justify-content:flex-end;gap:8px;display:flex}.dM3Hkq_stopModalActions button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;border-radius:8px;justify-content:center;align-items:center;gap:6px;padding:6px 13px;font-size:12px;font-weight:600;display:inline-flex}.dM3Hkq_stopModalActions button[data-danger]{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_stopModalActions button:disabled{cursor:wait;opacity:.58}.dM3Hkq_stopModalError{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);color:var(--dsw-alias-state-error-primary);border-radius:8px;align-items:flex-start;gap:7px;margin:0;padding:9px 10px;font-size:12px;line-height:18px;display:flex}.dM3Hkq_stopModalError svg{flex:none;margin-top:1px}.dM3Hkq_sectionHead{justify-content:space-between;align-items:center;gap:8px;min-width:0;display:flex}.dM3Hkq_sectionTitle{color:var(--dsw-alias-label-secondary);align-items:center;gap:6px;font-size:11px;font-weight:600;line-height:16px;display:inline-flex}.dM3Hkq_sectionHint{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_sectionHeadRight{align-items:center;gap:8px;min-width:0;display:inline-flex}.dM3Hkq_dependencyViews{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 65%, transparent);border-radius:7px;flex:none;gap:2px;padding:2px;display:inline-flex}.dM3Hkq_dependencyViews button{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:5px;padding:1px 7px;font-size:9.5px;line-height:14px}.dM3Hkq_dependencyViews button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary)}.dM3Hkq_delegationSection{min-width:0}.dM3Hkq_captainNode[data-clickable=true]{cursor:pointer}.dM3Hkq_captainNode[data-clickable=true]:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 13%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_captainNode{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 32%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 7%, var(--dsw-alias-bg-layer-1));border-radius:10px;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:9px;min-height:56px;padding:6px 10px;display:grid}.dM3Hkq_captainAvatar,.dM3Hkq_memberAvatar{flex:none;justify-content:center;align-items:center;display:inline-flex;position:relative}.dM3Hkq_captainAvatar{width:46px;height:46px}.dM3Hkq_leadAvatar,.dM3Hkq_memberArt{object-fit:contain;filter:drop-shadow(0 1px 1px #122d4833);background:0 0;border:0;border-radius:0}.dM3Hkq_leadAvatar{width:44px;height:44px}.dM3Hkq_memberArt{width:40px;height:40px}.dM3Hkq_captainInfo,.dM3Hkq_memberInfo{flex-direction:column;min-width:0;display:flex}.dM3Hkq_captainInfo{gap:2px}.dM3Hkq_captainLine,.dM3Hkq_memberLine{align-items:center;gap:6px;min-width:0;display:flex}.dM3Hkq_captainName,.dM3Hkq_memberName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:600;line-height:18px;overflow:hidden}.dM3Hkq_captainRole,.dM3Hkq_memberLevel{color:#d4af37;white-space:nowrap;background:#d4af371f;border-radius:4px;flex:none;padding:0 5px;font-size:9.5px;font-weight:600;line-height:15px}.dM3Hkq_memberRole{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_captainSummary,.dM3Hkq_memberBlock[data-viewing=true]{background:#6fd6c80d;border-radius:8px;box-shadow:0 0 0 1px #6fd6c88c,0 0 14px #6fd6c829}.dM3Hkq_memberState[data-viewing=true]{color:#6fd6c8}.dM3Hkq_captainNode[data-viewing=true]{border-color:color-mix(in srgb, #f2c14e 62%, var(--dsw-alias-border-l2));box-shadow:0 0 0 1px #f2c14e80,0 0 16px #f2c14e24}.dM3Hkq_viewingBadge{color:#f2c14e;background:#f2c14e29;border-radius:999px;align-items:center;padding:0 6px;font-size:9.5px;font-weight:600;line-height:16px;display:inline-flex}.dM3Hkq_memberStatusLine{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;font-size:10.5px;line-height:15px;overflow:hidden}.dM3Hkq_memberProgress{align-items:center;margin-top:4px;display:flex}.dM3Hkq_memberProgressTrack{background:var(--dsw-alias-border-l3);border-radius:2px;flex:1;height:4px;overflow:hidden}.dM3Hkq_memberProgressFill{border-radius:inherit;background:var(--dsw-alias-state-business-primary);height:100%;transition:width .16s;display:block}.dM3Hkq_memberProgressFill[data-state=completed]{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_memberProgressFill[data-state=failed]{background:var(--dsw-alias-state-error-primary)}.dM3Hkq_memberRel{min-width:0;color:var(--dsw-alias-state-business-primary);text-overflow:ellipsis;white-space:nowrap;align-items:center;gap:4px;margin-top:2px;font-size:10px;line-height:14px;display:inline-flex;overflow:hidden}.dM3Hkq_taskDetailModel{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:14px;overflow:hidden}.dM3Hkq_memberModel{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-width:0;max-width:132px;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;border-radius:999px;flex:0 auto;align-items:center;padding:0 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;font-weight:600;line-height:15px;display:inline-flex;overflow:hidden}.dM3Hkq_captainState,.dM3Hkq_memberState{color:var(--dsw-alias-label-tertiary);white-space:nowrap;flex:none;align-items:center;gap:5px;font-size:10px;font-weight:500;line-height:15px;display:inline-flex}.dM3Hkq_captainState[data-busy=true],.dM3Hkq_memberState[data-activity=working]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_workGlyph rect{opacity:.5}.dM3Hkq_workGlyph[data-active=true] rect{animation:1.1s ease-in-out infinite dM3Hkq_agentTeamsDot}@keyframes dM3Hkq_agentTeamsDot{0%,to{opacity:.25}50%{opacity:1}}.dM3Hkq_progressOverview{flex-direction:column;gap:7px;display:flex}.dM3Hkq_progressTitle{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px}.dM3Hkq_progressSegments{gap:3px;display:flex}.dM3Hkq_progressSegments>span,.dM3Hkq_progressEmpty{background:var(--dsw-alias-border-l3);border-radius:2px;flex:1;height:5px}.dM3Hkq_progressEmpty{width:100%;display:block}.dM3Hkq_progressSegments>span[data-state=running]{background:var(--dsw-alias-state-business-primary)}.dM3Hkq_progressSegments>span[data-state=blocked]{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressSegments>span[data-state=completed]{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSegments>span[data-state=failed]{background:var(--dsw-alias-state-error-primary)}.dM3Hkq_progressSegments>span[data-state=cancelled]{opacity:.55}.dM3Hkq_progressLegend{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;gap:10px;font-size:9.5px;line-height:14px;display:flex}.dM3Hkq_progressLegend>span[data-state=running]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_progressLegend>span[data-state=blocked]{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressLegend>span[data-state=completed]{color:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSummary{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 7%, var(--dsw-alias-bg-layer-1));min-width:0;color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:center;gap:6px;padding:5px 8px;font-size:10px;font-weight:600;line-height:15px;display:flex}.dM3Hkq_progressSummary[data-state=warning]{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_progressSummary[data-state=completed]{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_progressSummary[data-state=discarded]{background:var(--dsw-alias-button-ghost-active-fill)}.dM3Hkq_progressSummary>span:last-child{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-business-primary);border-radius:50%;flex:none;width:5px;height:5px}.dM3Hkq_progressSummary[data-state=warning] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressSummary[data-state=completed] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_progressSummary[data-state=discarded] .dM3Hkq_progressSummaryDot{background:var(--dsw-alias-label-tertiary)}.dM3Hkq_membersToggle{background:var(--dsw-alias-bg-module-platform);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border:0;border-radius:8px;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;font-size:10.5px;font-weight:600;line-height:15px;display:flex}.dM3Hkq_membersToggle:hover{background:var(--dsw-alias-button-ghost-active-fill)}.dM3Hkq_membersToggle>span{align-items:center;gap:5px;display:inline-flex}.dM3Hkq_membersToggle>span:last-child{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_chevron{flex:none;transition:transform .14s}.dM3Hkq_chevron[data-open=true]{transform:rotate(90deg)}.dM3Hkq_delegationTree{flex-direction:column;gap:2px;margin-left:18px;padding:9px 0 0 20px;display:flex;position:relative}.dM3Hkq_delegationTree:before{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, var(--dsw-alias-border-l2));content:\"\";width:1px;position:absolute;top:0;bottom:22px;left:0}.dM3Hkq_memberBlock{flex-direction:column;min-width:0;padding:3px 0 7px;display:flex;position:relative}.dM3Hkq_memberBranch{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 48%, var(--dsw-alias-border-l2));width:20px;height:1px;display:block;position:absolute;top:27px;right:100%}.dM3Hkq_memberBranch:before{background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:50%;width:5px;height:5px;position:absolute;top:-2px;right:-1px}.dM3Hkq_memberRow{box-sizing:border-box;width:100%;min-width:0;min-height:48px;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:8px;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:8px;padding:4px 6px;transition:background-color .12s,transform .12s;display:grid}.dM3Hkq_memberRow:hover,.dM3Hkq_memberRow[data-activity=working]{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_memberRow:active{transform:scale(.995)}.dM3Hkq_memberAvatar{width:42px;height:42px}.dM3Hkq_memberAvatar[data-unread=true]:after{box-sizing:border-box;border:1px solid var(--dsw-alias-bg-layer-1);background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:50%;width:6px;height:6px;animation:1.8s ease-in-out infinite dM3Hkq_agentTeamsUnreadPulse;position:absolute;top:0;right:-1px}@keyframes dM3Hkq_agentTeamsUnreadPulse{0%,to{opacity:.78;transform:scale(.92)}50%{opacity:1;transform:scale(1.16)}}.dM3Hkq_memberInitial{background:var(--dsw-alias-state-business-primary);width:34px;height:34px;color:var(--dsw-alias-label-primary-inverted);border-radius:50%;justify-content:center;align-items:center;font-size:14px;font-weight:600;line-height:20px;display:inline-flex}.dM3Hkq_stateArt{box-sizing:border-box;object-fit:contain;width:22px;height:22px;filter:drop-shadow(0 0 1px var(--dsw-alias-bg-layer-1)) drop-shadow(0 1px 1px #122d483d);background:0 0;border:0;border-radius:0;position:absolute;bottom:-3px;right:-5px}.dM3Hkq_stateArt[data-activity=working]{animation:2.4s ease-in-out infinite dM3Hkq_agentTeamsFloat}.dM3Hkq_stateArt[data-activity=idle]{animation:4.2s ease-in-out infinite dM3Hkq_agentTeamsBreathe}.dM3Hkq_stateArt[data-activity=unknown]{animation:2.8s ease-in-out infinite dM3Hkq_agentTeamsThink}@keyframes dM3Hkq_agentTeamsFloat{0%,to{transform:translateY(0)rotate(-4deg)}50%{transform:translateY(-2px)rotate(4deg)}}@keyframes dM3Hkq_agentTeamsBreathe{0%,to{opacity:.82;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}@keyframes dM3Hkq_agentTeamsThink{0%,to{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}.dM3Hkq_memberState{margin-left:auto}.dM3Hkq_memberCount{color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:16px}.dM3Hkq_assignmentLine{align-items:center;gap:7px;min-width:0;padding:0 6px 0 60px;display:flex}.dM3Hkq_assignmentLabel{color:var(--dsw-alias-label-tertiary);flex:none;font-size:9.5px;line-height:14px}.dM3Hkq_assignmentTasks{flex-wrap:wrap;flex:1;gap:4px;min-width:0;display:flex}.dM3Hkq_assignmentChip{background:var(--dsw-alias-button-ghost-active-fill);max-width:100%;min-height:16px;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;border-radius:4px;align-items:center;padding:0 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;font-weight:600;line-height:14px;display:inline-flex;overflow:hidden}.dM3Hkq_assignmentChip[data-state=running]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=completed]{background:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=blocked]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=failed]{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_assignmentChip[data-state=cancelled]{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}.dM3Hkq_unreadPill{color:var(--dsw-alias-state-business-primary);white-space:nowrap;flex:none;font-size:9.5px;font-weight:600;line-height:14px}.dM3Hkq_taskEmpty{color:var(--dsw-alias-label-tertiary);font-size:9.5px;line-height:14px}.dM3Hkq_dependencySection{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:7px;min-width:0;padding-top:10px;display:flex}.dM3Hkq_sectionToggleTitle{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:0;font-size:11px;font-weight:600;line-height:16px;display:inline-flex}.dM3Hkq_dagViewport{scrollbar-width:thin;min-width:0;padding:2px 0 4px;overflow-x:auto}.dM3Hkq_dagCanvas{min-width:100%;position:relative}.dM3Hkq_dagCanvas[data-layout=parallel]{flex-wrap:wrap;gap:8px;display:flex}.dM3Hkq_dagCanvas[data-layout=parallel] .dM3Hkq_dagNode{flex:92px;min-width:92px;position:relative}.dM3Hkq_dagEdges{pointer-events:none;position:absolute;inset:0;overflow:visible}.dM3Hkq_dagEdges path{fill:none;stroke:var(--dsw-alias-border-l3);stroke-width:1px;transition:opacity .14s,stroke .14s,stroke-width .14s}.dM3Hkq_dagEdges path[data-active=true]{stroke:var(--dsw-alias-state-business-primary);stroke-width:1.6px}.dM3Hkq_dagEdges path[data-dimmed=true]{opacity:.24}.dM3Hkq_dagNode{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;border-radius:6px;flex-direction:column;justify-content:center;gap:1px;padding:0 6px;transition:border-color .14s,background-color .14s,opacity .14s;display:flex;position:absolute}.dM3Hkq_dagNode:hover,.dM3Hkq_dagNode[data-focused=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-layer-1))}.dM3Hkq_dagNode[data-dimmed=true]{opacity:.3}.dM3Hkq_dagNode[data-state=running][data-dimmed=true]{opacity:.58}.dM3Hkq_dagNode[data-state=completed]{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 48%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-state=blocked]{border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 52%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-state=failed]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 56%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-verdict-stale=true]{border-style:dashed;border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 62%, var(--dsw-alias-border-l2))}.dM3Hkq_dagNode[data-verdict-stale=true] .dM3Hkq_dagNodeHead{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNodeHead{color:var(--dsw-alias-label-primary);align-items:center;gap:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;font-weight:700;display:flex}.dM3Hkq_dagNodeDot{background:var(--dsw-alias-border-l3);border-radius:1.5px;flex:none;width:5px;height:5px}.dM3Hkq_dagNode[data-state=running] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-business-primary)}.dM3Hkq_dagNode[data-state=running] .dM3Hkq_dagNodeHead{padding-right:12px}.dM3Hkq_dagRunningState{width:9px;height:9px;color:var(--dsw-alias-state-business-primary);pointer-events:none;justify-content:center;align-items:center;display:inline-flex;position:absolute;top:4px;right:5px}.dM3Hkq_dagRunningState .dM3Hkq_workGlyph{width:9px;height:9px}.dM3Hkq_dagNode[data-state=blocked] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=completed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-success-primary)}.dM3Hkq_dagNode[data-state=failed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-error-primary)}.dM3Hkq_dagPortrait{object-fit:contain;pointer-events:none;width:28px;height:28px;position:absolute;bottom:6px;right:8px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNode[data-portrait=true]{padding-right:44px}.dM3Hkq_dagNodeLabel{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:11px;overflow:hidden}.dM3Hkq_taskDetail{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:9px;flex-direction:column;gap:3px;min-width:0;padding:7px 9px;display:flex}.dM3Hkq_taskDetailHead{align-items:center;gap:6px;min-width:0;display:flex}.dM3Hkq_taskDetailId{color:var(--dsw-alias-state-business-primary);flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700}.dM3Hkq_taskDetailSubject{min-width:0;color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:600;line-height:16px;overflow:hidden}.dM3Hkq_taskDetailBadge{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-secondary);border-radius:4px;flex:none;padding:0 5px;font-size:8.5px;font-weight:600;line-height:14px}.dM3Hkq_taskDetailBadge[data-state=running]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=blocked]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=completed]{background:var(--dsw-alias-state-success-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailBadge[data-state=failed]{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_taskDetailLine,.dM3Hkq_taskDetailMeta{color:var(--dsw-alias-label-secondary);font-size:9.5px;line-height:14px}.dM3Hkq_taskDetailMeta{color:var(--dsw-alias-label-tertiary)}.dM3Hkq_emptyHint{color:var(--dsw-alias-label-tertiary);padding:10px 12px;font-size:11px;line-height:16px}.dM3Hkq_planEditor{border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 30%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 94%, var(--dsw-alias-state-business-primary));box-shadow:inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);border-radius:10px;flex-direction:column;gap:12px;margin:0 10px 12px;padding:12px;display:flex}.dM3Hkq_planHeader>span{justify-content:space-between;align-items:center;gap:8px;display:flex}.dM3Hkq_planHeader>span>span{flex-direction:column;gap:2px;min-width:0;display:flex}.dM3Hkq_planHeader strong{color:var(--dsw-alias-label-primary);font-size:12px}.dM3Hkq_planHeader small{color:var(--dsw-alias-label-secondary);font-size:9px;font-weight:500;line-height:13px}.dM3Hkq_planHeader em{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted);border-radius:999px;flex:none;padding:1px 7px;font-size:9px;font-style:normal;line-height:16px}.dM3Hkq_planHeader p{color:var(--dsw-alias-label-secondary);margin:5px 0 0;font-size:10px;line-height:15px}.dM3Hkq_planFlow{grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none;display:grid}.dM3Hkq_planFlow li{min-width:0;color:var(--dsw-alias-label-tertiary);align-items:center;gap:5px;font-size:9px;font-weight:600;line-height:14px;display:flex;position:relative}.dM3Hkq_planFlow li:not(:last-child):after{background:var(--dsw-alias-border-l2);content:\"\";flex:1;min-width:8px;height:1px;margin-right:5px}.dM3Hkq_planFlow li>span{border:1px solid var(--dsw-alias-border-l2);border-radius:50%;flex:none;place-items:center;width:18px;height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9px;display:grid}.dM3Hkq_planFlow li[data-active]{color:var(--dsw-alias-state-business-primary)}.dM3Hkq_planFlow li[data-active]>span{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}.dM3Hkq_planSection{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:8px;overflow:hidden}.dM3Hkq_planSectionToggle,.dM3Hkq_planCardHeader{box-sizing:border-box;width:100%;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;background:0 0;border:0}.dM3Hkq_planSectionToggle{justify-content:space-between;align-items:center;gap:8px;min-height:42px;padding:7px 9px;display:flex}.dM3Hkq_planSectionToggle:hover,.dM3Hkq_planCardHeader:hover{background:color-mix(in srgb, var(--dsw-alias-button-ghost-active-fill) 46%, transparent)}.dM3Hkq_planSectionToggle>span{align-items:baseline;gap:7px;min-width:0;display:flex}.dM3Hkq_planSectionToggle strong{font-size:10.5px}.dM3Hkq_planSectionToggle small{color:var(--dsw-alias-label-tertiary);font-size:9px}.dM3Hkq_planList{border-top:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:0;display:flex}.dM3Hkq_planEmpty{color:var(--dsw-alias-label-tertiary);text-align:center;margin:0;padding:12px;font-size:10px}.dM3Hkq_planCard{background:0 0;border:0;border-radius:0;min-width:0;margin:0;padding:0;display:block;position:relative}.dM3Hkq_planCard+.dM3Hkq_planCard{border-top:1px solid var(--dsw-alias-border-l2)}.dM3Hkq_planCard[data-open=true]{background:color-mix(in srgb, var(--dsw-alias-bg-base) 62%, transparent)}.dM3Hkq_planCardHeader{grid-template-columns:minmax(80px,.9fr) minmax(72px,1.15fr) auto 12px;align-items:center;gap:7px;min-height:40px;padding:6px 9px;display:grid}.dM3Hkq_planCardIdentity{flex-direction:column;gap:1px;min-width:0;display:flex}.dM3Hkq_planCardIdentity strong,.dM3Hkq_planTaskSummary{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:650;line-height:14px;overflow:hidden}.dM3Hkq_planCardIdentity>span,.dM3Hkq_planCardMeta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:12px;overflow:hidden}.dM3Hkq_planTaskId{background:var(--dsw-alias-button-ghost-active-fill);width:max-content;color:var(--dsw-alias-label-secondary);border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:8.5px;font-weight:700;line-height:14px}.dM3Hkq_planDirty{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 13%, transparent);color:var(--dsw-alias-state-warn-primary);border-radius:999px;justify-self:end;padding:1px 5px;font-size:8px;font-style:normal;font-weight:650;line-height:14px}.dM3Hkq_planChevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .18s cubic-bezier(.2,.7,.2,1)}.dM3Hkq_planChevron[data-open=true]{transform:rotate(90deg)}.dM3Hkq_planCardBody{flex-direction:column;gap:8px;padding:0 9px 9px;display:flex}.dM3Hkq_planCardBody fieldset{border:0;flex-direction:column;gap:7px;min-width:0;margin:0;padding:0;display:flex}.dM3Hkq_planCardBody label,.dM3Hkq_planNewTask label{min-width:0;color:var(--dsw-alias-label-tertiary);flex-direction:column;flex:1;gap:4px;font-size:9px;display:flex}.dM3Hkq_planCardBody label small{color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:11px}.dM3Hkq_planCard input,.dM3Hkq_planCard textarea,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:6px;outline:none;font-size:10.5px;line-height:16px;transition:border-color .16s,box-shadow .16s}.dM3Hkq_planCard input,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{min-height:32px;padding:6px 8px}.dM3Hkq_planCard textarea{resize:vertical;min-height:58px;padding:7px 8px}.dM3Hkq_planCard input:focus-visible,.dM3Hkq_planCard textarea:focus-visible,.dM3Hkq_planCard select:focus-visible,.dM3Hkq_planNewTask input:focus-visible{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent)}.dM3Hkq_planGrid{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;display:grid}.dM3Hkq_planModelPicker{grid-template-columns:minmax(0,1fr);gap:5px;display:grid}.dM3Hkq_planModelMenu{width:100%;display:flex}.dM3Hkq_planModelTrigger{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;text-align:left;border-radius:7px;justify-content:space-between;align-items:center;gap:8px;padding:7px 9px;transition:border-color .16s,background-color .16s,transform .12s;display:flex}.dM3Hkq_planModelTrigger:hover:not(:disabled){border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.dM3Hkq_planModelTrigger:active:not(:disabled){transform:translateY(1px)}.dM3Hkq_planModelTrigger:focus-visible{border-color:var(--dsw-alias-state-business-primary);outline:2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent);outline-offset:1px}.dM3Hkq_planModelTrigger:disabled{cursor:wait;opacity:.64}.dM3Hkq_planModelTriggerCopy{align-items:baseline;gap:6px;min-width:0;display:flex}.dM3Hkq_planModelTriggerCopy strong,.dM3Hkq_planModelTriggerCopy span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_planModelTriggerCopy strong{color:var(--dsw-alias-label-primary);font-size:10px;font-weight:650;line-height:15px}.dM3Hkq_planModelTriggerCopy span{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:14px}.dM3Hkq_planModelMenuRow{grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;width:100%;min-width:0;display:grid}.dM3Hkq_planModelMenuRow>span:first-child{color:var(--dsw-alias-label-primary)}.dM3Hkq_planModelMenuRow strong{color:var(--dsw-alias-label-tertiary);text-align:right;text-overflow:ellipsis;white-space:nowrap;font-weight:450;overflow:hidden}.dM3Hkq_planModelMenuBack{align-items:center;gap:7px;display:inline-flex}.dM3Hkq_planModelMenuBack svg{transform:rotate(180deg)}.dM3Hkq_planModelEffortRow{flex-direction:column;align-items:flex-start;min-width:0;display:flex}.dM3Hkq_planModelEffortRow small{width:100%;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;line-height:14px;overflow:hidden}.dM3Hkq_planModelHint{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8.5px;line-height:12px;overflow:hidden}.dM3Hkq_planModelNotice{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 9%, transparent);color:var(--dsw-alias-label-secondary);border-radius:6px;grid-column:1/-1;justify-content:space-between;align-items:center;gap:8px;padding:6px 7px;font-size:8.5px;line-height:12px;display:flex}.dM3Hkq_planModelNotice button{color:var(--dsw-alias-state-business-primary);cursor:pointer;font:inherit;background:0 0;border:0;flex:none;padding:2px 6px;font-weight:650}.dM3Hkq_planActions,.dM3Hkq_planApproveRow,.dM3Hkq_planNewTask,.dM3Hkq_planConfirm,.dM3Hkq_planApproveActions,.dM3Hkq_planSecondaryActions{align-items:center;gap:7px;display:flex}.dM3Hkq_planReviewActions{grid-template-columns:minmax(0,1fr);gap:6px;width:100%;display:grid}.dM3Hkq_planSecondaryActions{grid-template-columns:minmax(0,1fr) auto;display:grid}.dM3Hkq_planActions{justify-content:flex-end}.dM3Hkq_planActions button,.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow button,.dM3Hkq_planConfirm button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);min-height:30px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:6px;flex:none;padding:5px 10px;font-size:9.5px;font-weight:600;transition:background .16s,border-color .16s,transform .16s}.dM3Hkq_planActions button:hover:not(:disabled),.dM3Hkq_planNewTask button:hover:not(:disabled),.dM3Hkq_planApproveRow button:hover:not(:disabled),.dM3Hkq_planConfirm button:hover:not(:disabled){border-color:var(--dsw-alias-label-tertiary)}.dM3Hkq_planActions button:active:not(:disabled),.dM3Hkq_planNewTask button:active:not(:disabled),.dM3Hkq_planApproveRow button:active:not(:disabled),.dM3Hkq_planConfirm button:active:not(:disabled){transform:scale(.98)}.dM3Hkq_planActions button[data-danger],.dM3Hkq_planConfirm button[data-danger]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planFeedback{min-width:0;color:var(--dsw-alias-label-secondary);flex:1;align-items:center;gap:5px;font-size:9px;line-height:13px;animation:.18s ease-out dM3Hkq_plan-feedback-in;display:inline-flex}.dM3Hkq_planFeedback[data-tone=success]{color:var(--dsw-alias-state-success-primary)}.dM3Hkq_planFeedback[data-tone=error]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planFeedback>span{border:1px solid;border-radius:50%;flex:none;place-items:center;width:15px;height:15px;display:grid}.dM3Hkq_planFeedback svg{width:11px;height:11px}@keyframes dM3Hkq_plan-feedback-in{0%{opacity:0;transform:translateY(-2px)}to{opacity:1;transform:translateY(0)}}.dM3Hkq_planConfirm{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent);border-radius:7px;flex-wrap:wrap;justify-content:flex-end;padding:7px}.dM3Hkq_planConfirm>span{min-width:140px;color:var(--dsw-alias-label-secondary);flex:1;font-size:9px;line-height:13px}.dM3Hkq_planNewTask{align-items:flex-end}.dM3Hkq_planNewTask label{gap:4px}.dM3Hkq_planNewTask label>span{line-height:13px}.dM3Hkq_planApproveRow{z-index:1;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 94%, transparent);min-height:50px;box-shadow:0 -5px 16px color-mix(in srgb, var(--dsw-alias-bg-base) 35%, transparent);backdrop-filter:blur(8px);border-radius:8px;flex-direction:column;justify-content:flex-end;align-items:stretch;margin:0 -4px -4px;padding:8px;position:sticky;bottom:0}.dM3Hkq_planApproveRow[data-armed=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--dsw-alias-border-l2))}.dM3Hkq_planApproveRow[data-discard=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2))}.dM3Hkq_planApproveCopy{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.dM3Hkq_planApproveCopy strong{color:var(--dsw-alias-label-primary);font-size:9.5px;line-height:13px}.dM3Hkq_planApproveCopy small{color:var(--dsw-alias-label-tertiary);font-size:8.5px;line-height:12px}.dM3Hkq_planApproveRow button{background:var(--dsw-alias-state-business-primary);min-height:32px;color:var(--dsw-alias-label-primary-inverted);padding-inline:13px}.dM3Hkq_planReviewActions>button[data-plan-approve]{width:100%}.dM3Hkq_planApproveActions>button:first-child{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_planSecondaryActions>button,.dM3Hkq_planApproveActions>button[data-danger]{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-primary)}.dM3Hkq_planSecondaryActions>button[data-danger],.dM3Hkq_planApproveActions>button[data-danger]{color:var(--dsw-alias-state-error-primary)}.dM3Hkq_planSectionToggle:focus-visible,.dM3Hkq_planCardHeader:focus-visible,.dM3Hkq_planActions button:focus-visible,.dM3Hkq_planNewTask button:focus-visible,.dM3Hkq_planApproveRow button:focus-visible,.dM3Hkq_planConfirm button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.dM3Hkq_planActions button:disabled,.dM3Hkq_planNewTask button:disabled,.dM3Hkq_planApproveRow button:disabled{cursor:default;opacity:.55}.dM3Hkq_historicPill{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-tertiary);border-radius:4px;flex:none;margin-left:auto;padding:1px 7px;font-size:9.5px;font-weight:600;line-height:15px}.dM3Hkq_members{flex-direction:column;gap:3px;display:flex}.dM3Hkq_archiveLabel{color:var(--dsw-alias-label-tertiary);padding:5px 14px 0;font-size:9.5px;font-weight:600;line-height:14px;display:block}.dM3Hkq_taskChain{align-items:center;gap:8px;min-width:0;margin:10px 0 4px;display:flex}.dM3Hkq_taskChainTitle{color:var(--dsw-alias-label-secondary);flex:none;align-items:center;gap:5px;font-size:10.5px;line-height:16px;display:inline-flex}.dM3Hkq_taskChainTitle svg{width:13px;height:13px}.dM3Hkq_taskChainTrack{scrollbar-width:thin;scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-secondary) 40%, transparent) transparent;align-items:center;gap:6px;min-width:0;padding:2px 1px;display:flex;overflow-x:auto}.dM3Hkq_taskChip{--chip-tone:var(--dsw-alias-label-tertiary);border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 80%, transparent);max-width:230px;color:var(--dsw-alias-label-secondary);font:inherit;white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:5px;padding:3px 8px;font-size:10.5px;line-height:15px;display:inline-flex}.dM3Hkq_taskChip:hover{border-color:var(--dsw-alias-state-business-primary)}.dM3Hkq_taskChip[data-state=running],.dM3Hkq_taskChip[data-state=claimed]{--chip-tone:var(--dsw-alias-state-business-primary)}.dM3Hkq_taskChip[data-state=completed]{--chip-tone:var(--dsw-alias-state-success-primary)}.dM3Hkq_taskChip[data-state=failed]{--chip-tone:var(--dsw-alias-state-error-primary)}.dM3Hkq_taskChip[data-state=blocked]{--chip-tone:var(--dsw-alias-state-warning-primary)}.dM3Hkq_taskChip[data-state=cancelled]{--chip-tone:var(--dsw-alias-label-tertiary)}.dM3Hkq_taskChip[data-selected]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary)}.dM3Hkq_taskChipDot{background:var(--chip-tone);border-radius:50%;flex:none;width:6px;height:6px}.dM3Hkq_taskChipId{color:var(--dsw-alias-label-primary);font-weight:600}.dM3Hkq_taskChipOwner{text-overflow:ellipsis;overflow:hidden}.dM3Hkq_taskChipDep{color:var(--dsw-alias-label-tertiary);font-size:9.5px}.dM3Hkq_taskChipGlyph{color:var(--chip-tone);font-size:9px}.dM3Hkq_memberBlock[data-realm=high] .dM3Hkq_memberArt{filter:drop-shadow(0 1px 1px #122d4833)drop-shadow(0 0 5px #ffd97ab3)}.dM3Hkq_memberBlock[data-realm=high] .dM3Hkq_memberRow{border-color:color-mix(in srgb, #ffd97a 26%, var(--dsw-alias-border-l2))}@media (prefers-reduced-motion:reduce){.dM3Hkq_panel,.dM3Hkq_badge,.dM3Hkq_badgeDot,.dM3Hkq_panelDot,.dM3Hkq_workGlyph rect,.dM3Hkq_stateArt,.dM3Hkq_memberAvatar[data-unread=true]:after,.dM3Hkq_planChevron,.dM3Hkq_planFeedback,.dM3Hkq_planActions button,.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow button,.dM3Hkq_planConfirm button,.dM3Hkq_planCard input,.dM3Hkq_planCard textarea,.dM3Hkq_planCard select,.dM3Hkq_planNewTask input{transition:none;animation:none}}@media (width<=960px){html[data-agent-teams-panel-open] [data-phase=active]{padding-right:0}}@media (width<=640px){.dM3Hkq_badge{top:56px;right:10px}.dM3Hkq_teamStats span[data-stat=messages]{display:none}.dM3Hkq_captainNode{grid-template-columns:48px minmax(0,1fr)}.dM3Hkq_captainState{display:none}.dM3Hkq_delegationTree{margin-left:12px;padding-left:15px}.dM3Hkq_memberBranch{width:15px}.dM3Hkq_assignmentLine{padding-left:53px}.dM3Hkq_planFlow li{gap:4px;font-size:8px}.dM3Hkq_planFlow li:not(:last-child):after{margin-right:3px}.dM3Hkq_planCardHeader{grid-template-columns:auto minmax(0,1fr) auto}.dM3Hkq_planCardHeader .dM3Hkq_planCardMeta{display:none}.dM3Hkq_planGrid,.dM3Hkq_planModelPicker{grid-template-columns:minmax(0,1fr)}.dM3Hkq_planNewTask,.dM3Hkq_planApproveRow{flex-direction:column;align-items:stretch}.dM3Hkq_planNewTask button,.dM3Hkq_planApproveRow>button,.dM3Hkq_planApproveActions,.dM3Hkq_planReviewActions{width:100%}.dM3Hkq_planApproveActions button,.dM3Hkq_planReviewActions button,.dM3Hkq_planSecondaryActions button{flex:1}}@container dM3Hkq_agent-team (width<=360px){.dM3Hkq_planEditor{margin-inline:0;padding-inline:10px}.dM3Hkq_planHeader>span{align-items:flex-start}.dM3Hkq_planFlow li{gap:3px;font-size:7.5px}.dM3Hkq_planFlow li:not(:last-child):after{min-width:4px;margin-right:2px}.dM3Hkq_planSecondaryActions,.dM3Hkq_planApproveActions{grid-template-columns:minmax(0,1fr);width:100%;display:grid}.dM3Hkq_planSecondaryActions button,.dM3Hkq_planApproveActions button{width:100%}}.dM3Hkq_dagOwner{text-overflow:ellipsis;max-width:64px;margin-left:auto;font-size:9px;font-weight:400;overflow:hidden}.dM3Hkq_team[data-workspace-team]{--workspace-surface:var(--dsw-alias-bg-layer-1);--workspace-line:color-mix(in srgb, var(--dsw-alias-border-l2) 75%, transparent);--workspace-shadow:0 3px 14px color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);background:0 0;border:0;gap:14px;padding:0;container:none}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamHead{flex-wrap:wrap;gap:8px;padding:0 2px 2px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamName{flex-basis:160px;font-size:14px;line-height:1.5}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStats{flex-wrap:wrap;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStopButton{border-radius:9px;width:32px;height:32px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_delegationSection,.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection,.dM3Hkq_completionCard,.dM3Hkq_inboxCard{border:1px solid var(--workspace-line);background:var(--workspace-surface);min-width:0;box-shadow:var(--workspace-shadow);box-sizing:border-box;border-radius:18px;margin:0;padding:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainNode{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 4%, var(--dsw-alias-bg-module-platform));border-color:var(--workspace-line);border-radius:12px;grid-template-columns:44px minmax(0,1fr);gap:8px;padding:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainState{grid-column:2;justify-self:start;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainName{font-size:14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainRole{font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_captainSummary{white-space:normal;font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressOverview{gap:9px;margin:16px 0}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSegments{gap:4px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSegments>span{border-radius:4px;height:6px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressLegend{gap:8px 12px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSummary{font-size:11px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_progressSummary>span:last-child{white-space:normal}.dM3Hkq_team[data-workspace-team] .dM3Hkq_membersToggle{background:var(--dsw-alias-bg-module-platform);border-radius:9px;padding:10px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberBlock{padding-top:14px;padding-bottom:8px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRow{border-radius:9px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberLine{flex-wrap:wrap;gap:4px 6px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberName{font-size:13px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRole,.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberState,.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberCount{font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberRole{background:var(--dsw-alias-bg-module-platform);border-radius:5px;padding:1px 5px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberStatusLine{white-space:normal;font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentLine{flex-wrap:wrap;row-gap:5px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentLabel{font-size:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_assignmentChip{border-radius:5px;font-size:10px;line-height:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_memberBlock[data-selected-member] .dM3Hkq_memberRow{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionHead{flex-wrap:wrap;gap:8px;margin-bottom:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionToggleTitle{font-size:12px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_sectionHint{white-space:normal;font-size:11px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagViewport{padding:4px 2px 14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNode{background:var(--workspace-surface);border-radius:11px;padding:10px 11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNodeHead{margin-bottom:6px;font-size:11px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagNodeLabel{white-space:normal;-webkit-line-clamp:2;letter-spacing:0;-webkit-box-orient:vertical;font-size:12px;line-height:1.4;display:-webkit-box;overflow:hidden}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagOwner{white-space:nowrap;max-width:105px;font-size:10px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetail{border-radius:11px;margin-top:14px;padding:14px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailSubject{white-space:normal;font-size:13px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailLine,.dM3Hkq_team[data-workspace-team] .dM3Hkq_taskDetailMeta{font-size:12px;line-height:1.6}.dM3Hkq_team[data-workspace-team] .dM3Hkq_planEditor{background:var(--workspace-surface);border-color:var(--workspace-line);border-radius:18px;margin:0;padding:18px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_planApproveRow{position:static}.dM3Hkq_workspaceSummary{grid-template-columns:minmax(0,1fr);gap:14px;min-width:0;display:grid}.dM3Hkq_completionCard h3,.dM3Hkq_inboxCard h3{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;font-weight:600;line-height:1.6}.dM3Hkq_completionBody{flex-wrap:wrap;align-items:center;gap:20px;margin-top:16px;display:flex}.dM3Hkq_completionRing{flex:none;width:132px;height:132px;position:relative}.dM3Hkq_completionRing svg{width:100%;height:100%;transform:rotate(-90deg)}.dM3Hkq_completionRing circle{fill:none;stroke-width:7px}.dM3Hkq_ringTrack{stroke:var(--dsw-alias-border-l2)}.dM3Hkq_ringValue{stroke:var(--dsw-alias-state-business-primary)}.dM3Hkq_completionRing>span{color:var(--dsw-alias-label-secondary);flex-direction:column;justify-content:center;align-items:center;gap:5px;font-size:11px;display:flex;position:absolute;inset:0}.dM3Hkq_completionRing strong{color:var(--dsw-alias-label-primary);letter-spacing:-.7px;font-variant-numeric:tabular-nums;font-size:26px;font-weight:600;line-height:1.2}.dM3Hkq_completionRing small{font-size:18px;font-weight:450}.dM3Hkq_completionTasks{flex:200px;min-width:0;max-height:216px;margin:0;padding:2px;list-style:none;overflow:auto}.dM3Hkq_completionTasks li{border-bottom:1px solid var(--workspace-line);grid-template-columns:18px auto minmax(0,1fr) auto;align-items:center;gap:8px;padding:7px 0;font-size:11px;display:grid}.dM3Hkq_completionTasks li:last-child{border:0}.dM3Hkq_completionDot{background:var(--dsw-alias-bg-module-platform);width:16px;height:16px;color:var(--dsw-alias-label-secondary);border-radius:50%;place-items:center;display:grid}.dM3Hkq_completionTasks li[data-state=completed] .dM3Hkq_completionDot{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_completionTasks li[data-state=failed] .dM3Hkq_completionDot{background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-inverted)}.dM3Hkq_completionTaskId{text-overflow:ellipsis;white-space:nowrap;max-width:6em;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden}.dM3Hkq_completionTaskSubject{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.dM3Hkq_completionTaskStatus{color:var(--dsw-alias-label-secondary);font-size:10px}.dM3Hkq_completionTasks li[data-verdict-stale] .dM3Hkq_completionDot{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary)}.dM3Hkq_completionTasks li[data-verdict-stale] .dM3Hkq_completionTaskStatus{font-weight:600}.dM3Hkq_completionTasks:focus-visible,.dM3Hkq_inboxMessages:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px;border-radius:4px}.dM3Hkq_inboxCard>header{flex-wrap:wrap;align-items:baseline;gap:6px 12px;display:flex}.dM3Hkq_inboxCard>header>span{color:var(--dsw-alias-label-secondary);font-size:10px}.dM3Hkq_inboxMessages{max-height:260px;margin:14px 0 0;padding:0;list-style:none;overflow:auto}.dM3Hkq_inboxMessages li{align-items:start;gap:9px;margin:0 0 12px;display:flex}.dM3Hkq_inboxMessages img,.dM3Hkq_inboxInitial{object-fit:contain;flex:none;width:30px;height:30px}.dM3Hkq_inboxInitial{background:var(--dsw-alias-bg-module-platform);border-radius:9px;place-items:center;font-size:12px;display:grid}.dM3Hkq_inboxMessages li>div{flex:1;min-width:0}.dM3Hkq_inboxMessages strong{overflow-wrap:anywhere;font-size:11px;font-weight:550}.dM3Hkq_inboxMessages p{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, var(--dsw-alias-bg-module-platform));white-space:pre-wrap;overflow-wrap:anywhere;border-radius:0 10px 10px;margin:5px 0 0;padding:9px 11px;font-size:12px;line-height:1.6}.dM3Hkq_summaryEmpty{color:var(--dsw-alias-label-secondary);margin:14px 0 0;font-size:12px;line-height:1.8}@container (width>=800px){.dM3Hkq_team[data-workspace-team]{grid-template-columns:minmax(280px,.8fr) minmax(0,1.4fr);align-items:start;gap:16px;display:grid}.dM3Hkq_team[data-workspace-team]>.dM3Hkq_teamHead,.dM3Hkq_team[data-workspace-team]>[data-staging-editor],.dM3Hkq_workspaceSummary{grid-column:1/-1}.dM3Hkq_workspaceSummary{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection{align-self:stretch}.dM3Hkq_team[data-workspace-team] .dM3Hkq_dagCanvas[data-layout=parallel]{grid-template-columns:repeat(2,minmax(0,1fr))}}@container (width<=400px){.dM3Hkq_team[data-workspace-team] .dM3Hkq_delegationSection,.dM3Hkq_team[data-workspace-team] .dM3Hkq_dependencySection,.dM3Hkq_completionCard,.dM3Hkq_inboxCard{border-radius:14px;padding:12px}.dM3Hkq_team[data-workspace-team] .dM3Hkq_teamStats{gap:6px;font-size:10px}.dM3Hkq_completionBody{justify-content:center}}.dM3Hkq_progressSegments>span[data-state=claimed],.dM3Hkq_dagNode[data-state=claimed] .dM3Hkq_dagNodeDot{background:var(--dsw-alias-state-warn-primary)}.dM3Hkq_progressLegend>span[data-state=claimed]{color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=claimed]{border-color:var(--dsw-alias-state-warn-primary)}.dM3Hkq_dagNode[data-state=claimed] .dM3Hkq_dagNodeHead{padding-right:38px}.dM3Hkq_dagClaimedState{color:var(--dsw-alias-state-warn-primary);font-size:8px;line-height:10px;position:absolute;top:4px;right:5px}.dM3Hkq_assignmentChip[data-state=claimed],.dM3Hkq_taskDetailBadge[data-state=claimed]{background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-inverted)}";
		const tagId$4 = "agent-teams-pixel/ActivityPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
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
			"dagPortrait": "dM3Hkq_dagPortrait",
			"dagRunningState": "dM3Hkq_dagRunningState",
			"dagViewport": "dM3Hkq_dagViewport",
			"delegationSection": "dM3Hkq_delegationSection",
			"delegationTree": "dM3Hkq_delegationTree",
			"dependencySection": "dM3Hkq_dependencySection",
			"dependencyViews": "dM3Hkq_dependencyViews",
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
			"memberLevel": "dM3Hkq_memberLevel",
			"memberLine": "dM3Hkq_memberLine",
			"memberModel": "dM3Hkq_memberModel",
			"memberName": "dM3Hkq_memberName",
			"memberProgress": "dM3Hkq_memberProgress",
			"memberProgressFill": "dM3Hkq_memberProgressFill",
			"memberProgressTrack": "dM3Hkq_memberProgressTrack",
			"memberRel": "dM3Hkq_memberRel",
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
			"sectionHeadRight": "dM3Hkq_sectionHeadRight",
			"sectionHint": "dM3Hkq_sectionHint",
			"sectionTitle": "dM3Hkq_sectionTitle",
			"sectionToggleTitle": "dM3Hkq_sectionToggleTitle",
			"stageLabel": "dM3Hkq_stageLabel",
			"stateArt": "dM3Hkq_stateArt",
			"statePill": "dM3Hkq_statePill",
			"stopModalActions": "dM3Hkq_stopModalActions",
			"stopModalError": "dM3Hkq_stopModalError",
			"summaryEmpty": "dM3Hkq_summaryEmpty",
			"taskBoard": "dM3Hkq_taskBoard",
			"taskBoardHead": "dM3Hkq_taskBoardHead",
			"taskBoardHint": "dM3Hkq_taskBoardHint",
			"taskBoardList": "dM3Hkq_taskBoardList",
			"taskChain": "dM3Hkq_taskChain",
			"taskChainTitle": "dM3Hkq_taskChainTitle",
			"taskChainTrack": "dM3Hkq_taskChainTrack",
			"taskChip": "dM3Hkq_taskChip",
			"taskChipDep": "dM3Hkq_taskChipDep",
			"taskChipDot": "dM3Hkq_taskChipDot",
			"taskChipGlyph": "dM3Hkq_taskChipGlyph",
			"taskChipId": "dM3Hkq_taskChipId",
			"taskChipOwner": "dM3Hkq_taskChipOwner",
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
			"taskRow": "dM3Hkq_taskRow",
			"taskRowDeps": "dM3Hkq_taskRowDeps",
			"taskRowDetail": "dM3Hkq_taskRowDetail",
			"taskRowDot": "dM3Hkq_taskRowDot",
			"taskRowId": "dM3Hkq_taskRowId",
			"taskRowOwner": "dM3Hkq_taskRowOwner",
			"taskRowStatus": "dM3Hkq_taskRowStatus",
			"taskRowSubject": "dM3Hkq_taskRowSubject",
			"team": "dM3Hkq_team",
			"teamHead": "dM3Hkq_teamHead",
			"teamName": "dM3Hkq_teamName",
			"teamResumeButton": "dM3Hkq_teamResumeButton",
			"teamResumeError": "dM3Hkq_teamResumeError",
			"teamStats": "dM3Hkq_teamStats",
			"teamStopButton": "dM3Hkq_teamStopButton",
			"teams": "dM3Hkq_teams",
			"unreadPill": "dM3Hkq_unreadPill",
			"viewingBadge": "dM3Hkq_viewingBadge",
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
							children: [(0, react_jsx_runtime.jsx)("strong", { children: member.name }), (0, react_jsx_runtime.jsx)("span", { children: role === "" ? t("plan.member.roleFallback") : roleLabel(role, member.name, t) })]
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
		Object.freeze({
			mode: "docked",
			x: 0,
			y: 64,
			width: 388,
			height: 640,
			heightMode: "auto"
		});
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
		const CAPTAIN_ASSIGNEE = "captain";
		/** Persisted dependency rendering: the original DAT map or the vertical flow. */
		const DEPENDENCY_VIEW_KEY = "agent-teams-pixel.dependencyView";
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
		function DependencyMap({ tasks, members, t, discarded = false, workspace = false, onSelectTask }) {
			const [open, setOpen] = (0, react.useState)(true);
			const [hoverTaskId, setHoverTaskId] = (0, react.useState)(null);
			const [keyboardTaskId, setKeyboardTaskId] = (0, react.useState)(null);
			const [pinnedTaskId, setPinnedTaskId] = (0, react.useState)(null);
			const [dependencyView, setDependencyView] = (0, react.useState)(() => {
				if (typeof window === "undefined") return "flow";
				try {
					return window.localStorage.getItem(DEPENDENCY_VIEW_KEY) === "dat" ? "dat" : "flow";
				} catch {
					return "flow";
				}
			});
			const chooseDependencyView = (next) => {
				setDependencyView(next);
				try {
					window.localStorage.setItem(DEPENDENCY_VIEW_KEY, next);
				} catch {}
			};
			const hoverTimer = (0, react.useRef)(null);
			const focusedTaskId = dependencyFocusTaskId(pinnedTaskId, keyboardTaskId, hoverTaskId);
			const flow = workspace && dependencyView === "flow";
			const nodeWidth = flow ? 190 : workspace ? 164 : 92;
			const nodeHeight = workspace ? 76 : 30;
			const layout = (0, react.useMemo)(() => {
				if (flow) return compactDagLayout(tasks, {
					nodeWidth: 190,
					nodeHeight: 76,
					columnGap: 24,
					rowGap: 28,
					direction: "vertical"
				});
				if (workspace) return compactDagLayout(tasks, {
					nodeWidth: 164,
					nodeHeight: 76,
					columnGap: 36,
					rowGap: 16
				});
				return compactDagLayout(tasks);
			}, [
				tasks,
				flow,
				workspace
			]);
			const parallel = (0, react.useMemo)(() => usesParallelTaskGrid(tasks), [tasks]);
			const memberByName = (0, react.useMemo)(() => new Map(members.map((member) => [member.name, member])), [members]);
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
					}), (0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.sectionHeadRight,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.sectionHint,
							children: pinnedTaskId === null ? t(parallel ? "dependency.hint.parallel" : workspace ? "workspace.dependencies" : "dependency.hint.chain") : t("dependency.hint.pinned", { taskId: pinnedTaskId })
						}), workspace && (0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.dependencyViews,
							role: "group",
							"aria-label": t("dependency.viewAria"),
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-control": "dependency-view-dat",
								"aria-pressed": dependencyView === "dat",
								onClick: () => {
									chooseDependencyView("dat");
								},
								children: t("dependency.viewDat")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"data-control": "dependency-view-flow",
								"aria-pressed": dependencyView === "flow",
								onClick: () => {
									chooseDependencyView("flow");
								},
								children: t("dependency.viewFlow")
							})]
						})]
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
							const member = flow ? memberByName.get(task.assignee) : void 0;
							const art = flow ? memberArtUrl(task.assignee, member?.role ?? "") : null;
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
								"data-portrait": art !== null || void 0,
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
									art !== null && (0, react_jsx_runtime.jsx)("img", {
										className: ActivityPanel_module_css_default.dagPortrait,
										src: art,
										alt: "",
										"aria-hidden": true
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
		function TeamSection({ team, modelDirectory, onContinuePlanning, onDiscarded, onNavigate, onOpenCaptain, viewingSessionId, t, historic = false, workspace = false }) {
			const [selectedTaskId, setSelectedTaskId] = (0, react.useState)(null);
			const selectedAssignee = team.tasks.find((task) => task.id === selectedTaskId)?.assignee;
			const [membersOpen, setMembersOpen] = (0, react.useState)(workspace);
			const [stopOpen, setStopOpen] = (0, react.useState)(false);
			const [stopping, setStopping] = (0, react.useState)(false);
			const [stopError, setStopError] = (0, react.useState)("");
			const [resuming, setResuming] = (0, react.useState)(false);
			const [resumeError, setResumeError] = (0, react.useState)("");
			const discarded = historic && team.phase === "staged";
			const stopped = !historic && team.halted === true;
			const busyCount = team.members.filter((member) => member.activity === "working").length;
			const captainViewing = viewingSessionId !== void 0 && viewingSessionId === team.captainSessionId;
			useCultivationVersion();
			const captainCultivation = cultivationFromXp(xpOf(captainKey(team.name)));
			const assignedCount = team.tasks.filter((task) => task.assignee !== "" && task.assignee !== CAPTAIN_ASSIGNEE).length;
			const captainOwned = team.tasks.filter((task) => task.assignee === CAPTAIN_ASSIGNEE && task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled");
			const captainBusy = captainOwned.length > 0;
			const captainTaskIds = formatTaskIds(captainOwned.map((task) => task.id), t);
			const completedCount = team.tasks.filter((task) => task.status === "completed").length;
			const allCompleted = team.tasks.length > 0 && completedCount === team.tasks.length;
			const allSettled = team.tasks.length > 0 && team.tasks.every((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled");
			const unfinishedCount = team.tasks.filter((task) => task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled").length;
			const canStop = !historic && team.phase === "running" && team.halted !== true && !allCompleted && teamIsActive(team);
			const resumeTeam = async () => {
				if (resuming) return;
				setResuming(true);
				setResumeError("");
				try {
					const response = await fetch(ACTIVITY_RESUME_URL, {
						method: "POST",
						cache: "no-store",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							sessionId: team.captainSessionId,
							reason: t("team.resumeReason")
						})
					});
					if (!response.ok) {
						let message = `HTTP ${response.status}`;
						try {
							const body = await response.json();
							if (typeof body.error === "string" && body.error.trim() !== "") message = body.error;
						} catch {}
						throw new Error(message);
					}
				} catch (error) {
					setResumeError(t("team.resumeFailed", { message: error instanceof Error ? error.message : String(error) }));
				} finally {
					setResuming(false);
				}
			};
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
							!historic && team.phase === "running" && !stopped && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.statePill,
								"data-state": allCompleted ? "completed" : "running",
								children: t(allCompleted ? "team.state.completed" : "team.state.running")
							}),
							historic && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.historicPill,
								children: t(discarded ? "team.discarded" : "team.ended")
							}),
							stopped && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.historicPill,
								children: t("team.stopped")
							}),
							stopped && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.teamResumeButton,
								"data-control": "team-resume",
								disabled: resuming,
								onClick: () => {
									resumeTeam();
								},
								title: t("team.resume"),
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "▶"
								}), resuming ? t("team.resuming") : t("team.resume")]
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
					resumeError !== "" && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.teamResumeError,
						role: "alert",
						children: resumeError
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
								"data-clickable": onOpenCaptain === void 0 ? void 0 : "true",
								"data-viewing": captainViewing || void 0,
								role: onOpenCaptain === void 0 ? void 0 : "button",
								tabIndex: onOpenCaptain === void 0 ? void 0 : 0,
								onClick: onOpenCaptain,
								onKeyDown: onOpenCaptain === void 0 ? void 0 : (event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onOpenCaptain();
									}
								},
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
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: ActivityPanel_module_css_default.captainName,
													children: t("captain.name")
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: ActivityPanel_module_css_default.captainRole,
													children: t("captain.role")
												}),
												(0, react_jsx_runtime.jsxs)("span", {
													className: ActivityPanel_module_css_default.memberLevel,
													title: `${captainCultivation.xp} / ${captainCultivation.next} XP · ${captainCultivation.skills.length === 0 ? t("skill.none") : captainCultivation.skills.map((key) => t(key)).join(" / ")}`,
													children: [
														"Lv.",
														captainCultivation.level,
														" ",
														t(captainCultivation.rankKey)
													]
												}),
												captainViewing && (0, react_jsx_runtime.jsx)("span", {
													className: ActivityPanel_module_css_default.viewingBadge,
													children: t("office.viewingState")
												})
											]
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
							!workspace && (0, react_jsx_runtime.jsx)(ProgressOverview, {
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
										const progressTotal = member.total ?? 0;
										const progressDone = member.done ?? 0;
										const progressPct = progressTotal > 0 ? Math.round(progressDone / progressTotal * 100) : Math.max(0, Math.min(100, member.progress ?? 0));
										const viewing = viewingSessionId !== void 0 && member.id === viewingSessionId;
										const cultivation = cultivationFromXp(xpOf(memberKey(member.name)));
										const progressState = progressTotal > 0 && progressDone >= progressTotal ? "completed" : owned.some((task) => task.state === "failed") ? "failed" : void 0;
										const handoff = team.tasks.find((task) => task.status !== "completed" && task.assignee !== member.name && task.dependencies.some((id) => owned.some((own) => own.id === id && own.status === "completed")));
										return (0, react_jsx_runtime.jsxs)("div", {
											className: ActivityPanel_module_css_default.memberBlock,
											"data-activity": member.activity,
											"data-realm": (member.progress ?? 0) >= 40 ? "high" : void 0,
											"data-viewing": viewing || void 0,
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
															children: [
																(0, react_jsx_runtime.jsxs)("span", {
																	className: ActivityPanel_module_css_default.memberLine,
																	children: [
																		(0, react_jsx_runtime.jsx)("span", {
																			className: ActivityPanel_module_css_default.memberName,
																			children: member.name
																		}),
																		member.role !== "" && (0, react_jsx_runtime.jsx)("span", {
																			className: ActivityPanel_module_css_default.memberRole,
																			children: roleLabel(member.role, member.name, t)
																		}),
																		(0, react_jsx_runtime.jsxs)("span", {
																			className: ActivityPanel_module_css_default.memberLevel,
																			title: `${cultivation.xp} / ${cultivation.next} XP · ${cultivation.skills.length === 0 ? t("skill.none") : cultivation.skills.map((key) => t(key)).join(" / ")}`,
																			children: [
																				"Lv.",
																				cultivation.level,
																				" ",
																				t(cultivation.rankKey)
																			]
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
																			"data-viewing": viewing || void 0,
																			children: [(0, react_jsx_runtime.jsx)(WorkGlyph, { active: member.activity === "working" }), viewing ? t("office.viewingState") : discarded ? t("member.state.notCreated") : stopped ? t("member.state.stopped") : team.phase === "staged" ? t("member.state.staged") : memberStateLabel(member, team.tasks, historic, t)]
																		})
																	]
																}),
																(0, react_jsx_runtime.jsx)("span", {
																	className: ActivityPanel_module_css_default.memberStatusLine,
																	children: discarded ? t("member.status.discarded") : stopped ? t("member.status.stopped") : team.phase === "staged" ? t("member.status.staged") : historic && owned.length > 0 && owned.every((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled") ? t("member.status.settled") : memberStatusText(member, team.tasks, t)
																}),
																(0, react_jsx_runtime.jsx)("span", {
																	className: ActivityPanel_module_css_default.memberProgress,
																	"data-state": progressState,
																	children: (0, react_jsx_runtime.jsx)("span", {
																		className: ActivityPanel_module_css_default.memberProgressTrack,
																		children: (0, react_jsx_runtime.jsx)("span", {
																			className: ActivityPanel_module_css_default.memberProgressFill,
																			"data-state": progressState,
																			style: { width: `${progressPct}%` }
																		})
																	})
																}),
																handoff !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
																	className: ActivityPanel_module_css_default.memberRel,
																	children: [(0, react_jsx_runtime.jsx)("span", {
																		"aria-hidden": true,
																		children: "→"
																	}), t("member.rel.handoff", {
																		name: handoff.assignee || t("task.assignee.unclaimed"),
																		taskId: handoff.id
																	})]
																})
															]
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
					!workspace && (0, react_jsx_runtime.jsx)(DependencyMap, {
						tasks: team.tasks,
						members: team.members,
						t,
						discarded,
						workspace,
						onSelectTask: setSelectedTaskId
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
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\TeamConfigPanel.module.css.mjs
		const css$3 = ".FZXPhq_panel{flex-direction:column;gap:14px;display:flex}.FZXPhq_facts{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;display:grid}.FZXPhq_fact{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-direction:column;gap:3px;min-width:0;padding:10px 12px;display:flex}.FZXPhq_label{color:var(--dsw-alias-label-secondary);font-size:11px}.FZXPhq_value{overflow-wrap:anywhere;font-size:14px;font-weight:650}.FZXPhq_sub{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;font-size:10px}.FZXPhq_heading{color:var(--dsw-alias-label-secondary);margin:4px 0 0;font-size:12px;font-weight:650}.FZXPhq_tableWrap{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:12px;overflow-x:auto}.FZXPhq_table{border-collapse:collapse;width:100%;font-size:12px}.FZXPhq_table th,.FZXPhq_table td{text-align:left;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l2);overflow-wrap:anywhere;padding:8px 10px}.FZXPhq_table thead th{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, var(--dsw-alias-bg-base));white-space:nowrap;font-weight:600}.FZXPhq_table tbody tr:last-child td{border-bottom:none}.FZXPhq_mono{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}.FZXPhq_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px;line-height:1.7}";
		const tagId$3 = "agent-teams-pixel/TeamConfigPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
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
			useCultivationVersion();
			const completed = team.tasks.filter((task) => task.status === "completed").length;
			const allCompleted = team.tasks.length > 0 && completed === team.tasks.length;
			const facts = [
				{
					label: t("config.team"),
					value: team.name,
					sub: team.teamId
				},
				{
					label: t("config.phase"),
					value: team.halted === true ? t("config.halted") : t(team.phase === "staged" ? "config.phaseStaged" : allCompleted ? "config.phaseCompleted" : "config.phaseRunning")
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
								(0, react_jsx_runtime.jsx)("th", { children: t("config.realm") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.model") }),
								(0, react_jsx_runtime.jsx)("th", { children: t("config.effort") })
							] }) }), (0, react_jsx_runtime.jsx)("tbody", { children: team.members.map((member) => {
								const cultivation = cultivationFromXp(xpOf(memberKey(member.name)));
								return (0, react_jsx_runtime.jsxs)("tr", { children: [
									(0, react_jsx_runtime.jsx)("td", { children: member.name }),
									(0, react_jsx_runtime.jsx)("td", { children: roleLabel(member.role, member.name, t) }),
									(0, react_jsx_runtime.jsx)("td", { children: `Lv.${cultivation.level} ${t(cultivation.rankKey)}` }),
									(0, react_jsx_runtime.jsx)("td", {
										className: TeamConfigPanel_module_css_default.mono,
										children: memberRoute(member)
									}),
									(0, react_jsx_runtime.jsx)("td", { children: member.reasoningEffort ?? "—" })
								] }, member.id);
							}) })]
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
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\QuickStartDialog.module.css.mjs
		const css$2 = ".N5ZfSa_entry{color:#16241b;letter-spacing:.3px;cursor:pointer;white-space:nowrap;isolation:isolate;text-shadow:0 1px #ffffff59;background:linear-gradient(118deg,#f8e6b0 0%,#f2c14e 38%,#8fdcae 72%,#4ec98a 100%);border:1px solid #c4c35f;border-radius:999px;align-items:center;gap:6px;height:28px;padding:0 14px;font-size:12px;font-weight:700;transition:transform .12s,box-shadow .16s,filter .16s;animation:3.6s ease-in-out infinite N5ZfSa_entryBreathe;display:inline-flex;position:relative;overflow:hidden;box-shadow:0 0 0 1px #f2c14e38,0 3px 12px #4ec98a42,inset 0 1px #ffffff8c}.N5ZfSa_entry>span[aria-hidden]{filter:drop-shadow(0 0 4px #fffc);font-size:15px;line-height:1}.N5ZfSa_entry:after{z-index:-1;content:\"\";pointer-events:none;background:linear-gradient(90deg,#0000,#ffffffc7,#0000);width:22%;animation:4.4s ease-in-out infinite N5ZfSa_entryShine;position:absolute;top:-60%;bottom:-60%;left:-34%;transform:skew(-18deg)}.N5ZfSa_entry:hover{filter:saturate(1.12)brightness(1.05);transform:translateY(-1px);box-shadow:0 0 0 1px #f2c14e7a,0 6px 20px #4ec98a73,inset 0 1px #ffffffb3}.N5ZfSa_entry:active{transform:scale(.97)}.N5ZfSa_entry:focus-visible{outline-offset:2px;outline:2px solid #f2c14e}@keyframes N5ZfSa_entryBreathe{0%,to{box-shadow:0 0 0 1px #f2c14e38,0 3px 12px #4ec98a42,inset 0 1px #ffffff8c}50%{box-shadow:0 0 0 1px #f2c14e61,0 4px 16px #4ec98a6b,inset 0 1px #ffffffb3}}@keyframes N5ZfSa_entryShine{0%,52%{opacity:0;left:-34%}60%{opacity:1}86%,to{opacity:0;left:128%}}@media (prefers-reduced-motion:reduce){.N5ZfSa_entry{animation:none}.N5ZfSa_entry:after{display:none}}.N5ZfSa_actions{justify-content:flex-end;gap:8px;display:flex}.N5ZfSa_wizard{flex-direction:column;gap:12px;min-height:100%;display:flex}.N5ZfSa_wizard .N5ZfSa_form,.N5ZfSa_wizard .N5ZfSa_stepPane{flex:auto;min-height:0}.N5ZfSa_wizard .N5ZfSa_templates{flex:auto;grid-auto-rows:minmax(52px,1fr);align-content:stretch;min-height:0;max-height:none}.N5ZfSa_wizardActions{z-index:1;border-top:1px solid var(--dsw-alias-border-l2);background:#151a21;justify-content:flex-end;gap:8px;margin:0 -14px -14px;padding:10px 14px;display:flex;position:sticky;bottom:0;box-shadow:0 -8px 16px #0000002e}.N5ZfSa_wizardActions>button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;padding:7px 14px;font-size:12px}.N5ZfSa_wizardActions>button[data-primary]{color:#16241b;background:linear-gradient(118deg,#f8e6b0,#f2c14e);border-color:#f2c14e;font-weight:700}.N5ZfSa_wizardActions>button:disabled{opacity:.55;cursor:default}.N5ZfSa_form{flex-direction:column;gap:12px;display:flex}.N5ZfSa_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.6}.N5ZfSa_field{flex-direction:column;gap:6px;font-size:12px;display:flex}.N5ZfSa_field>span{color:var(--dsw-alias-label-secondary)}.N5ZfSa_field textarea,.N5ZfSa_field input,.N5ZfSa_field select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);font:inherit;box-sizing:border-box;border-radius:8px;padding:8px 9px}.N5ZfSa_field textarea{resize:vertical}.N5ZfSa_error{color:var(--dsw-alias-state-error-primary,#ef6b6b);margin:0;font-size:12px}.N5ZfSa_success{color:var(--dsw-alias-state-success-primary,#3fbf9a);margin:0;font-size:12px}.N5ZfSa_sectRow{flex-wrap:wrap;gap:6px;display:flex}.N5ZfSa_sectChip{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;border-radius:999px;align-items:center;gap:4px;padding:4px 10px;font-size:11px;line-height:15px;display:inline-flex}.N5ZfSa_sectChip:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary,#5b8def);color:var(--dsw-alias-label-primary)}.N5ZfSa_sectChip[data-active=true]{background:color-mix(in srgb, #4ec98a 12%, var(--dsw-alias-bg-layer-1));color:#4ec98a;border-color:#4ec98a}.N5ZfSa_sectChip:disabled{opacity:.55;cursor:default}.N5ZfSa_sectRoster{flex-wrap:wrap;gap:4px;margin-top:2px;display:flex}.N5ZfSa_multi{position:relative}.N5ZfSa_multiTrigger{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;min-height:34px;color:var(--dsw-alias-label-primary);font:inherit;box-sizing:border-box;text-align:left;cursor:pointer;border-radius:8px;align-items:center;gap:6px;padding:5px 9px;font-size:12px;display:flex}.N5ZfSa_multiTrigger:hover{border-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_chips{flex-wrap:wrap;flex:1;gap:4px;min-width:0;display:flex}.N5ZfSa_chip{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#5b8def) 14%, transparent);color:var(--dsw-alias-state-business-primary,#5b8def);border-radius:999px;align-items:center;gap:5px;padding:1px 8px 1px 3px;font-size:11px;display:inline-flex}.N5ZfSa_chipAvatar{object-fit:cover;width:20px;height:20px;image-rendering:pixelated;background:#00000040;border-radius:4px;flex:none}.N5ZfSa_chipLetter{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#5b8def) 22%, transparent);border-radius:4px;flex:none;place-items:center;width:20px;height:20px;font-size:10px;font-weight:700;display:grid}.N5ZfSa_optionAvatar{object-fit:cover;width:24px;height:24px;image-rendering:pixelated;background:#0003;border-radius:5px;flex:none}.N5ZfSa_placeholder{color:var(--dsw-alias-label-secondary);font-size:12px}.N5ZfSa_caret{color:var(--dsw-alias-label-secondary);margin-left:auto;font-size:10px}.N5ZfSa_multiPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);border-radius:10px;max-height:200px;margin-top:4px;padding:6px;position:static;overflow:auto;box-shadow:0 8px 22px #00000059}.N5ZfSa_option{cursor:pointer;border-radius:6px;align-items:center;gap:8px;padding:4px 6px;font-size:12px;display:flex}.N5ZfSa_option:hover{background:var(--dsw-alias-bg-layer-1)}.N5ZfSa_option input{accent-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_customRow{border-top:1px solid var(--dsw-alias-border-l2);gap:6px;margin-top:4px;padding:6px 4px 2px;display:flex}.N5ZfSa_customRow input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-primary);font:inherit;border-radius:7px;flex:1;padding:6px 8px;font-size:12px}.N5ZfSa_customRow button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:7px;padding:6px 10px;font-size:12px}.N5ZfSa_customRow button:disabled{opacity:.5;cursor:default}.N5ZfSa_templateDesc{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.5}.N5ZfSa_option{flex-wrap:wrap}.N5ZfSa_optionName{font-weight:600}.N5ZfSa_optionId{color:var(--dsw-alias-label-secondary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px}.N5ZfSa_optionAbility{color:var(--dsw-alias-label-secondary);flex-basis:100%;padding-left:22px;font-size:10px}.N5ZfSa_replaceRow{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warning-primary) 40%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-warning-primary) 8%, transparent);border-radius:8px;flex-wrap:wrap;align-items:center;gap:8px;margin:0;padding:8px 10px;font-size:11px;display:flex}.N5ZfSa_replaceRow button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:7px;padding:5px 10px;font-size:11px}.N5ZfSa_templates{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:2px;display:grid;overflow:auto}.N5ZfSa_templateCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);text-align:left;cursor:pointer;border-radius:8px;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 9px;display:flex}.N5ZfSa_templateCard:hover{border-color:var(--dsw-alias-state-business-primary,#5b8def)}.N5ZfSa_templateCard[aria-checked=true]{border-color:var(--dsw-alias-state-business-primary,#5b8def);background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#5b8def) 12%, var(--dsw-alias-bg-layer-1))}.N5ZfSa_templateName{font-size:12px;font-weight:650}.N5ZfSa_templateCard .N5ZfSa_templateDesc{color:var(--dsw-alias-label-secondary);font-size:10px;line-height:1.45}.N5ZfSa_steps{align-items:center;gap:4px;margin:0;padding:0;list-style:none;display:flex}.N5ZfSa_stepItem{flex:1;min-width:0}.N5ZfSa_stepButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;border-radius:999px;align-items:center;gap:6px;padding:5px 8px;font-size:11px;display:flex;overflow:hidden}.N5ZfSa_stepButton:disabled{cursor:default;opacity:.7}.N5ZfSa_stepItem[data-state=current] .N5ZfSa_stepButton{color:#f2c14e;background:color-mix(in srgb, #f2c14e 12%, var(--dsw-alias-bg-layer-1));border-color:#f2c14e}.N5ZfSa_stepItem[data-state=done] .N5ZfSa_stepButton{border-color:color-mix(in srgb, #4ec98a 60%, var(--dsw-alias-border-l2));color:#4ec98a}.N5ZfSa_stepDot{background:color-mix(in srgb, currentcolor 18%, transparent);border-radius:50%;flex:none;justify-content:center;align-items:center;width:16px;height:16px;font-size:10px;font-weight:700;display:inline-flex}.N5ZfSa_stepLabel{text-overflow:ellipsis;overflow:hidden}.N5ZfSa_stepPane{flex-direction:column;gap:10px;display:flex}.N5ZfSa_templateMeta{color:var(--dsw-alias-label-secondary);opacity:.8;margin-top:2px;font-size:10px}.N5ZfSa_goalMeta{color:var(--dsw-alias-label-secondary);justify-content:space-between;gap:8px;margin:0;font-size:10px;display:flex}.N5ZfSa_summary{border:1px solid color-mix(in srgb, #f2c14e 40%, var(--dsw-alias-border-l2));background:color-mix(in srgb, #f2c14e 6%, var(--dsw-alias-bg-layer-1));border-radius:10px;flex-direction:column;gap:6px;margin:0;padding:10px 12px;display:flex}.N5ZfSa_summaryRow{grid-template-columns:64px 1fr;gap:8px;margin:0;display:grid}.N5ZfSa_summaryRow dt{color:var(--dsw-alias-label-secondary);margin:0;font-size:11px}.N5ZfSa_summaryRow dd{color:var(--dsw-alias-label-primary);word-break:break-word;white-space:pre-wrap;margin:0;font-size:12px;line-height:1.5}.N5ZfSa_oath{border:1px solid color-mix(in srgb, #4ec98a 45%, var(--dsw-alias-border-l2));color:var(--dsw-alias-label-secondary);background:#4ec98a17;border-radius:8px;margin:0;padding:8px 10px;font-size:11px;line-height:1.6}";
		const tagId$2 = "agent-teams-pixel/QuickStartDialog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var QuickStartDialog_module_css_default = {
			"actions": "N5ZfSa_actions",
			"caret": "N5ZfSa_caret",
			"chip": "N5ZfSa_chip",
			"chipAvatar": "N5ZfSa_chipAvatar",
			"chipLetter": "N5ZfSa_chipLetter",
			"chips": "N5ZfSa_chips",
			"customRow": "N5ZfSa_customRow",
			"entry": "N5ZfSa_entry",
			"entryBreathe": "N5ZfSa_entryBreathe",
			"entryShine": "N5ZfSa_entryShine",
			"error": "N5ZfSa_error",
			"field": "N5ZfSa_field",
			"form": "N5ZfSa_form",
			"goalMeta": "N5ZfSa_goalMeta",
			"hint": "N5ZfSa_hint",
			"multi": "N5ZfSa_multi",
			"multiPanel": "N5ZfSa_multiPanel",
			"multiTrigger": "N5ZfSa_multiTrigger",
			"oath": "N5ZfSa_oath",
			"option": "N5ZfSa_option",
			"optionAbility": "N5ZfSa_optionAbility",
			"optionAvatar": "N5ZfSa_optionAvatar",
			"optionId": "N5ZfSa_optionId",
			"optionName": "N5ZfSa_optionName",
			"placeholder": "N5ZfSa_placeholder",
			"replaceRow": "N5ZfSa_replaceRow",
			"sectChip": "N5ZfSa_sectChip",
			"sectRoster": "N5ZfSa_sectRoster",
			"sectRow": "N5ZfSa_sectRow",
			"stepButton": "N5ZfSa_stepButton",
			"stepDot": "N5ZfSa_stepDot",
			"stepItem": "N5ZfSa_stepItem",
			"stepLabel": "N5ZfSa_stepLabel",
			"stepPane": "N5ZfSa_stepPane",
			"steps": "N5ZfSa_steps",
			"success": "N5ZfSa_success",
			"summary": "N5ZfSa_summary",
			"summaryRow": "N5ZfSa_summaryRow",
			"templateCard": "N5ZfSa_templateCard",
			"templateDesc": "N5ZfSa_templateDesc",
			"templateMeta": "N5ZfSa_templateMeta",
			"templateName": "N5ZfSa_templateName",
			"templates": "N5ZfSa_templates",
			"wizard": "N5ZfSa_wizard",
			"wizardActions": "N5ZfSa_wizardActions"
		};
		//#endregion
		//#region lib/client/hall-events.js
		/** Window event used by the hall overlay to open one of its content sheets. */
		const OPEN_HALL_SHEET_EVENT = "agent-teams:open-sheet";
		//#endregion
		//#region lib/client/team-reveal.js
		/**
		* Reveal rules for the team workspace tab.
		*
		* Two independent signals can make a team appear while the user is looking at
		* the conversation: an explicit creation the quick-start dialog just announced,
		* and the monitor discovering a team created elsewhere. They are deliberately
		* asymmetric. An explicit creation always reveals the tab — the user just
		* clicked "生成草案", and reviewing that draft is the only next step — even when
		* the right column is already expanded on another page (the discard button
		* closes the tab but keeps the column open, which used to swallow the next
		* draft). A discovered team only claims a collapsed column, so polling can
		* never replace a file or terminal the user is reading.
		*/
		/** Window event dispatched after the quick-start dialog staged a team. */
		const TEAM_CREATED_EVENT = "agent-teams:team-created";
		/**
		* Whether the workspace tab must be opened for a team that just appeared.
		* @param input - the signal, both session identities, the team id, and the
		*   column's current expansion.
		* @returns `true` when the tab should be opened/focused.
		*/
		function shouldRevealTeam(input) {
			if (input.sessionId === void 0 || input.sessionId === "") return false;
			if (input.teamId === void 0 || input.teamId === "") return false;
			if (input.onScreenSessionId !== input.sessionId) return false;
			return input.source === "created" || !input.expanded;
		}
		//#endregion
		//#region lib/client/sects.js
		/** 内置门派；新增门派只改这里。 */
		const SECT_PRESETS = [
			{
				id: "jian",
				nameKey: "sect.jian.name",
				descKey: "sect.jian.desc",
				roles: [
					"implementer",
					"reviewer",
					"planner"
				]
			},
			{
				id: "dan",
				nameKey: "sect.dan.name",
				descKey: "sect.dan.desc",
				roles: [
					"verifier",
					"healer",
					"reviewer"
				]
			},
			{
				id: "fuzhen",
				nameKey: "sect.fuzhen.name",
				descKey: "sect.fuzhen.desc",
				roles: [
					"talisman",
					"architect",
					"puppeteer"
				]
			},
			{
				id: "mo",
				nameKey: "sect.mo.name",
				descKey: "sect.mo.desc",
				roles: [
					"demon",
					"poisoner",
					"tester"
				]
			},
			{
				id: "fo",
				nameKey: "sect.fo.name",
				descKey: "sect.fo.desc",
				roles: [
					"monk",
					"tester",
					"documenter"
				]
			},
			{
				id: "sanxiu",
				nameKey: "sect.sanxiu.name",
				descKey: "sect.sanxiu.desc",
				roles: [
					"researcher",
					"analyst",
					"writer"
				]
			},
			{
				id: "yushou",
				nameKey: "sect.yushou.name",
				descKey: "sect.yushou.desc",
				roles: [
					"beastmaster",
					"musician",
					"auditor"
				]
			},
			{
				id: "lianqi",
				nameKey: "sect.lianqi.name",
				descKey: "sect.lianqi.desc",
				roles: [
					"operator",
					"implementer",
					"verifier"
				]
			}
		];
		/** 按 id 找门派（未知 id 返回 undefined）。 */
		function sectPreset(id) {
			return SECT_PRESETS.find((preset) => preset.id === id);
		}
		/** 随机抽一个门派（「系统动态分配」）。 */
		function randomSect(current) {
			const pool = SECT_PRESETS.filter((preset) => preset.id !== current);
			const list = pool.length > 0 ? pool : SECT_PRESETS;
			return list[Math.floor(Math.random() * list.length)];
		}
		//#endregion
		//#region lib/client/QuickStartDialog.js
		/** Click-to-dispatch entry: a header button that stages a plan from a small wizard. */
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
		/** 开宗四步：道统 → 立派之志 → 宗门 → 立誓。 */
		const STEPS = [
			"doctrine",
			"vow",
			"sect",
			"oath"
		];
		const STEP_LABEL = {
			doctrine: "quickstart.stepDoctrine",
			vow: "quickstart.stepVow",
			sect: "quickstart.stepSect",
			oath: "quickstart.stepOath"
		};
		function templateOf(id) {
			return TEMPLATES.find((entry) => entry.id === id) ?? TEMPLATES[0];
		}
		function QuickStartWizard({ sessionId, t, onDone, onFounded }) {
			const [step, setStep] = (0, react.useState)(0);
			const [goal, setGoal] = (0, react.useState)("");
			const [template, setTemplate] = (0, react.useState)(TEMPLATES[0]?.id ?? "fix");
			const [roles, setRoles] = (0, react.useState)([...TEMPLATES[0]?.roles ?? []]);
			const [sectMode, setSectMode] = (0, react.useState)("random");
			const [rolledSect, setRolledSect] = (0, react.useState)(() => randomSect().id);
			const [customRole, setCustomRole] = (0, react.useState)("");
			const [rolesOpen, setRolesOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [blocked, setBlocked] = (0, react.useState)(false);
			const [created, setCreated] = (0, react.useState)();
			const multiRef = (0, react.useRef)(null);
			const goalRef = (0, react.useRef)(null);
			const foundedTimer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => () => {
				if (foundedTimer.current !== void 0) window.clearTimeout(foundedTimer.current);
			}, []);
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
			const close = () => {
				if (busy) return;
				onDone?.();
			};
			const activeSect = sectMode === "custom" ? void 0 : sectPreset(sectMode === "random" ? rolledSect : sectMode);
			const sectRoles = activeSect?.roles ?? roles;
			const chooseTemplate = (id) => {
				setTemplate(id);
				if (sectMode === "custom") setRoles([...templateOf(id).roles]);
			};
			const chooseSect = (id) => {
				setSectMode(id);
				const preset = sectPreset(id);
				if (preset !== void 0) setRoles([...preset.roles]);
			};
			const rollSect = () => {
				const next = randomSect(rolledSect);
				setRolledSect(next.id);
				setSectMode("random");
				setRoles([...next.roles]);
			};
			const chooseCustom = () => {
				setSectMode("custom");
				if (roles.length === 0) setRoles([...templateOf(template).roles]);
			};
			const toggleRole = (role) => {
				setRoles((current) => current.includes(role) ? current.filter((entry) => entry !== role) : [...current, role]);
			};
			const roleName = (id) => {
				const meta = ROLE_META.find((entry) => entry.id === id);
				return meta === void 0 ? id : t(meta.nameKey);
			};
			/** 一枚修士 chip：优先用像素人立绘，找不到对应道途时退回首字徽记。 */
			const personChip = (role) => {
				const label = roleName(role);
				const art = memberArtUrl(label, role);
				return (0, react_jsx_runtime.jsxs)("span", {
					className: QuickStartDialog_module_css_default.chip,
					title: role,
					children: [art === null ? (0, react_jsx_runtime.jsx)("span", {
						className: QuickStartDialog_module_css_default.chipLetter,
						"aria-hidden": true,
						children: label.slice(0, 1)
					}) : (0, react_jsx_runtime.jsx)("img", {
						className: QuickStartDialog_module_css_default.chipAvatar,
						src: art,
						alt: ""
					}), label]
				}, role);
			};
			const addCustomRole = () => {
				const trimmed = customRole.trim();
				if (trimmed === "") return;
				setRoles((current) => current.includes(trimmed) ? current : [...current, trimmed]);
				setCustomRole("");
			};
			const goalTrimmed = goal.trim();
			const currentStep = STEPS[step] ?? STEPS[0];
			const canAdvance = (0, react.useMemo)(() => {
				if (busy) return false;
				switch (currentStep) {
					case "vow": return goalTrimmed.length >= 2;
					case "sect": return sectMode !== "custom" || sectRoles.length > 0;
					default: return true;
				}
			}, [
				busy,
				currentStep,
				goalTrimmed,
				sectMode,
				sectRoles.length
			]);
			const submit = async (replace) => {
				if (goalTrimmed === "") {
					setError(t("quickstart.goalRequired"));
					setStep(1);
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
							goal: goalTrimmed,
							template,
							roles: sectMode === "custom" ? roles : [...activeSect?.roles ?? roles],
							replace
						})
					});
					const body = await response.json().catch(() => null);
					if (!response.ok || body?.ok !== true) {
						const raw = body?.error ?? "HTTP " + response.status;
						const existing = /already lead team/i.test(raw);
						setBlocked(existing);
						throw new Error(existing ? t("quickstart.teamExists") : raw);
					}
					setCreated(t("quickstart.created", {
						team: body.teamId ?? "",
						sect: activeSect === void 0 ? t("quickstart.sectCustomPicked") : t(activeSect.nameKey)
					}));
					if (body.teamId !== void 0) window.dispatchEvent(new CustomEvent(TEAM_CREATED_EVENT, { detail: { teamId: body.teamId } }));
					setGoal("");
					foundedTimer.current = window.setTimeout(() => {
						onFounded?.();
					}, 1400);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusy(false);
				}
			};
			const goTo = (next) => {
				if (busy) return;
				setError("");
				setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
			};
			const next = () => {
				if (step === STEPS.length - 1) {
					submit(false);
					return;
				}
				if (!canAdvance) return;
				goTo(step + 1);
			};
			const doctrineName = t(templateOf(template).labelKey);
			const sectName = activeSect === void 0 ? t("quickstart.sectCustom") : t(activeSect.nameKey);
			const roster = sectMode === "custom" ? roles : [...sectRoles];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: QuickStartDialog_module_css_default.wizard,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: QuickStartDialog_module_css_default.form,
					children: [
						(0, react_jsx_runtime.jsx)("ol", {
							className: QuickStartDialog_module_css_default.steps,
							"aria-label": t("quickstart.title"),
							children: STEPS.map((entry, index) => {
								const state = index === step ? "current" : index < step ? "done" : "todo";
								return (0, react_jsx_runtime.jsx)("li", {
									className: QuickStartDialog_module_css_default.stepItem,
									"data-state": state,
									children: (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: QuickStartDialog_module_css_default.stepButton,
										"data-control": "quickstart-step-" + index,
										"aria-current": state === "current" ? "step" : void 0,
										disabled: busy || index > step,
										onClick: () => {
											goTo(index);
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.stepDot,
											children: index < step ? "✓" : index + 1
										}), (0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.stepLabel,
											children: t(STEP_LABEL[entry])
										})]
									})
								}, entry);
							})
						}),
						currentStep === "doctrine" && (0, react_jsx_runtime.jsxs)("section", {
							className: QuickStartDialog_module_css_default.stepPane,
							"data-step": "doctrine",
							children: [(0, react_jsx_runtime.jsx)("p", {
								className: QuickStartDialog_module_css_default.hint,
								children: t("quickstart.doctrineHint")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: QuickStartDialog_module_css_default.templates,
								role: "radiogroup",
								"aria-label": t("quickstart.template"),
								children: TEMPLATES.map((entry) => (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "radio",
									"aria-checked": template === entry.id,
									className: QuickStartDialog_module_css_default.templateCard,
									"data-control": "quickstart-template-" + entry.id,
									disabled: busy,
									onClick: () => {
										chooseTemplate(entry.id);
									},
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.templateName,
											children: t(entry.labelKey)
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.templateDesc,
											children: t(entry.descKey)
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: QuickStartDialog_module_css_default.templateMeta,
											children: [
												entry.roles.length,
												" ",
												t("quickstart.roleCount")
											]
										})
									]
								}, entry.id))
							})]
						}),
						currentStep === "vow" && (0, react_jsx_runtime.jsxs)("section", {
							className: QuickStartDialog_module_css_default.stepPane,
							"data-step": "vow",
							children: [
								(0, react_jsx_runtime.jsx)("p", {
									className: QuickStartDialog_module_css_default.hint,
									children: t("quickstart.vowHint")
								}),
								(0, react_jsx_runtime.jsxs)("label", {
									className: QuickStartDialog_module_css_default.field,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.goal") }), (0, react_jsx_runtime.jsx)("textarea", {
										ref: goalRef,
										value: goal,
										rows: 5,
										autoFocus: true,
										disabled: busy,
										placeholder: t("quickstart.goalPlaceholder"),
										onChange: (event) => {
											setGoal(event.target.value);
										},
										onKeyDown: (event) => {
											if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
												event.preventDefault();
												next();
											}
										}
									})]
								}),
								(0, react_jsx_runtime.jsxs)("p", {
									className: QuickStartDialog_module_css_default.goalMeta,
									children: [(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.goalLength", { count: goalTrimmed.length }) }), (0, react_jsx_runtime.jsx)("span", { children: t("quickstart.goalShortcut") })]
								})
							]
						}),
						currentStep === "sect" && (0, react_jsx_runtime.jsxs)("section", {
							className: QuickStartDialog_module_css_default.stepPane,
							"data-step": "sect",
							children: [
								(0, react_jsx_runtime.jsx)("p", {
									className: QuickStartDialog_module_css_default.hint,
									children: t("quickstart.sectHint")
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: QuickStartDialog_module_css_default.field,
									children: [
										(0, react_jsx_runtime.jsx)("span", { children: t("quickstart.sect") }),
										(0, react_jsx_runtime.jsxs)("div", {
											className: QuickStartDialog_module_css_default.sectRow,
											children: [
												(0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: QuickStartDialog_module_css_default.sectChip,
													"data-active": sectMode === "random" || void 0,
													disabled: busy,
													onClick: rollSect,
													children: [(0, react_jsx_runtime.jsx)("span", {
														"aria-hidden": true,
														children: "🎲"
													}), t("quickstart.sectRandom")]
												}),
												SECT_PRESETS.map((preset) => (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: QuickStartDialog_module_css_default.sectChip,
													"data-active": sectMode === preset.id || void 0,
													disabled: busy,
													onClick: () => {
														chooseSect(preset.id);
													},
													children: t(preset.nameKey)
												}, preset.id)),
												(0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: QuickStartDialog_module_css_default.sectChip,
													"data-active": sectMode === "custom" || void 0,
													disabled: busy,
													onClick: chooseCustom,
													children: t("quickstart.sectCustom")
												})
											]
										}),
										(0, react_jsx_runtime.jsx)("small", {
											className: QuickStartDialog_module_css_default.templateDesc,
											children: sectMode === "custom" ? t("quickstart.sectCustomHint") : sectMode === "random" ? t("quickstart.sectRolled", { sect: activeSect === void 0 ? "" : t(activeSect.nameKey) }) : activeSect === void 0 ? "" : t(activeSect.descKey)
										}),
										sectMode !== "custom" && (0, react_jsx_runtime.jsx)("span", {
											className: QuickStartDialog_module_css_default.sectRoster,
											children: sectRoles.map(personChip)
										})
									]
								}),
								sectMode === "custom" && (0, react_jsx_runtime.jsxs)("div", {
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
												}) : roles.map(personChip)
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
													(() => {
														const art = memberArtUrl(t(meta.nameKey), meta.id);
														return art === null ? null : (0, react_jsx_runtime.jsx)("img", {
															className: QuickStartDialog_module_css_default.optionAvatar,
															src: art,
															alt: ""
														});
													})(),
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
								})
							]
						}),
						currentStep === "oath" && (0, react_jsx_runtime.jsxs)("section", {
							className: QuickStartDialog_module_css_default.stepPane,
							"data-step": "oath",
							children: [
								(0, react_jsx_runtime.jsx)("p", {
									className: QuickStartDialog_module_css_default.hint,
									children: t("quickstart.oathHint")
								}),
								(0, react_jsx_runtime.jsxs)("dl", {
									className: QuickStartDialog_module_css_default.summary,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: QuickStartDialog_module_css_default.summaryRow,
											children: [(0, react_jsx_runtime.jsx)("dt", { children: t("quickstart.summaryDoctrine") }), (0, react_jsx_runtime.jsx)("dd", { children: doctrineName })]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: QuickStartDialog_module_css_default.summaryRow,
											children: [(0, react_jsx_runtime.jsx)("dt", { children: t("quickstart.summarySect") }), (0, react_jsx_runtime.jsx)("dd", { children: sectName })]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: QuickStartDialog_module_css_default.summaryRow,
											children: [(0, react_jsx_runtime.jsx)("dt", { children: t("quickstart.summaryRoster") }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("span", {
												className: QuickStartDialog_module_css_default.chips,
												children: roster.map(personChip)
											}) })]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: QuickStartDialog_module_css_default.summaryRow,
											children: [(0, react_jsx_runtime.jsx)("dt", { children: t("quickstart.summaryVow") }), (0, react_jsx_runtime.jsx)("dd", { children: goalTrimmed })]
										})
									]
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: QuickStartDialog_module_css_default.oath,
									children: t("quickstart.oathNotice")
								})
							]
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
							children: created
						})
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: QuickStartDialog_module_css_default.wizardActions,
					children: [
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: close,
							children: t("quickstart.cancel")
						}),
						step > 0 && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"data-control": "quickstart-back",
							disabled: busy,
							onClick: () => {
								goTo(step - 1);
							},
							children: t("quickstart.back")
						}),
						step < STEPS.length - 1 ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"data-primary": true,
							"data-control": "quickstart-next",
							disabled: !canAdvance,
							onClick: next,
							children: t("quickstart.next")
						}) : (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"data-primary": true,
							"data-control": "quickstart-submit",
							disabled: busy || !canAdvance,
							onClick: () => {
								submit(false);
							},
							children: busy ? t("quickstart.busy") : t("quickstart.found")
						})
					]
				})]
			});
		}
		/** 对话头部的开宗入口：统一打开洞府里的内容气泡，不再弹独立窗口。 */
		function TeamQuickStart({ t }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: QuickStartDialog_module_css_default.entry,
				"data-quick-start-entry": true,
				title: t("quickstart.entryTitle"),
				onClick: () => {
					window.dispatchEvent(new CustomEvent(OPEN_HALL_SHEET_EVENT, { detail: { action: "start" } }));
				},
				children: [(0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					children: "⛩"
				}), t("quickstart.entry")]
			});
		}
		/** 气泡在当前窗口下的实际宽度：不超过 480，也不超出窗口（两侧各留 16）。 */
		function hallSheetWidth(viewportWidth) {
			return Math.max(0, Math.min(480, viewportWidth - 32));
		}
		/** 面板给对话让出的宽度：面板宽度的三分之二，且至少给对话留 360px。 */
		function hallYieldWidth(panelWidth, viewportWidth) {
			const width = Math.min(panelWidth, Math.max(0, viewportWidth - 32));
			return Math.max(0, Math.min(Math.round(width * 2 / 3), viewportWidth - 360));
		}
		/** 气泡的落点：左缘 + 宽度。右缘严格等于面板左缘 − 8px，除非被窗口夹取。 */
		function hallSheetPlacement(panelLeft, viewportWidth) {
			const width = hallSheetWidth(viewportWidth);
			const desired = panelLeft - width - 8;
			const rightmostLeft = viewportWidth - width - 16;
			return {
				width,
				left: Math.max(16, Math.min(desired, rightmostLeft))
			};
		}
		//#endregion
		//#region \0dsh-css:F:\MyApp\eternal\agent-teams-pixel\src\client\SectHallOverlay.module.css.mjs
		const css$1 = ".H3f_gW_window{z-index:11000;resize:both;border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 85%, transparent);background:#151a21;border-radius:12px;flex-direction:column;width:min(620px,100vw - 32px);min-width:380px;max-width:calc(100vw - 32px);min-height:240px;max-height:calc(100vh - 32px);display:flex;position:fixed;bottom:16px;right:16px;overflow:hidden;box-shadow:0 22px 60px #00000085,inset 0 2px #ffffff0a}html{--agent-teams-hall-shift:0px}html[data-agent-teams-hall-open] [data-phase=active]{box-sizing:border-box;padding-right:var(--agent-teams-hall-shift);transition:padding-right .18s}html[data-agent-teams-hall-open]:has([data-sidebar-right-open]) [data-phase=active]{padding-right:0}html[data-agent-teams-hall-open]:has([data-sidebar-right-open]) :has(>[data-shell-overlay]){box-sizing:border-box;padding-right:var(--agent-teams-hall-shift);transition:padding-right .18s}.H3f_gW_token{z-index:11000;cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;background:0 0;border:0;padding:0;animation:.16s ease-out H3f_gW_hall-token-fade;position:fixed}.H3f_gW_token:active{cursor:grabbing}.H3f_gW_token:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px;border-radius:9px}.H3f_gW_tokenInner{transform-origin:0 0;width:38px;height:68px;position:absolute;top:0;left:0}.H3f_gW_tokenBody{background:linear-gradient(158deg,#4c6e6af5,#182d31fa 45%,#0a1618);border:1px solid #c9a45fd9;border-radius:9px 9px 6px 6px;transition:filter .16s;animation:4.6s ease-in-out infinite H3f_gW_hall-token-sway;position:absolute;inset:0 0 12px;overflow:hidden;box-shadow:inset 0 0 0 2px #e8c37829,inset 0 7px 10px #fff0cd17,inset 0 -7px 10px #00000073,0 7px 18px #0000006b,0 0 18px #ffc66024}.H3f_gW_tokenBody:before{content:\"\";background:#0a1416;border-radius:50%;width:6px;height:6px;position:absolute;top:8px;left:50%;translate:-50%;box-shadow:inset 0 0 0 1px #e8c378b3}.H3f_gW_tokenBody:after{content:\"\";pointer-events:none;border-radius:7px;position:absolute;inset:3px;box-shadow:inset 0 0 0 1px #e8c3782e}.H3f_gW_tokenGlyph{color:#f2d9a0;font-family:\"STKaiti\", \"KaiTi\", var(--dsw-alias-font-family,serif);text-shadow:0 0 9px #ffd0708c;place-items:center;font-size:17px;font-weight:700;line-height:1;display:grid;position:absolute;inset:14px 0 0}.H3f_gW_token:hover .H3f_gW_tokenBody{filter:brightness(1.16)}.H3f_gW_token:hover .H3f_gW_tokenGlyph{text-shadow:0 0 13px #ffd682d9}.H3f_gW_tokenTassel{background:linear-gradient(#c9a45f,#7a2f2a);width:2px;height:12px;position:absolute;bottom:0;left:50%;translate:-50%}.H3f_gW_tokenTassel:after{content:\"\";background:radial-gradient(circle at 50% 20%,#cf5a4e,#7d211d 72%);border-radius:0 0 50% 50%;width:9px;height:8px;position:absolute;bottom:-7px;left:50%;translate:-50%;box-shadow:0 0 7px #b43c3259}@keyframes H3f_gW_hall-token-fade{0%{opacity:0}}@keyframes H3f_gW_hall-token-sway{0%,to{transform:translateY(0)rotate(-1.4deg)}50%{transform:translateY(-2px)rotate(1.4deg)}}@media (prefers-reduced-motion:reduce){.H3f_gW_token,.H3f_gW_tokenBody{animation:none}}.H3f_gW_window::-webkit-resizer{background:linear-gradient(135deg, transparent 0 46%, var(--dsw-alias-label-tertiary) 46% 52%, transparent 52% 62%, var(--dsw-alias-label-tertiary) 62% 68%, transparent 68%)}.H3f_gW_head{border-bottom:1px solid var(--dsw-alias-border-l2);cursor:grab;touch-action:none;user-select:none;flex:none;align-items:center;gap:8px;padding:8px 10px 8px 12px;display:flex}.H3f_gW_head:active{cursor:grabbing}.H3f_gW_caret{color:var(--dsw-alias-label-tertiary);flex:none;font-size:11px}.H3f_gW_title{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;font-weight:650;line-height:18px;overflow:hidden}.H3f_gW_meta{color:var(--dsw-alias-label-secondary);flex:none;margin-left:auto;font-size:11px}.H3f_gW_viewer{font:inherit;cursor:pointer;border:1px solid var(--dsw-alias-border-l2);white-space:nowrap;border-radius:999px;flex:none;padding:1px 7px;font-size:10.5px;line-height:16px}.H3f_gW_viewer[data-kind=captain]{border-color:color-mix(in srgb, #f2c14e 55%, var(--dsw-alias-border-l2));color:#f2c14e;background:#f2c14e1f}.H3f_gW_viewer[data-kind=member]{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent);color:var(--dsw-alias-state-business-primary)}.H3f_gW_headButton{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;flex:none;padding:3px 10px;font-size:11px}.H3f_gW_headButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}.H3f_gW_canvas{flex:auto;min-height:160px}.H3f_gW_floor{border-top:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 55%, #151a21);flex-wrap:wrap;flex:none;align-items:center;gap:6px;padding:8px 10px;display:flex}.H3f_gW_portal,.H3f_gW_floorButton{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, transparent);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:999px;align-items:center;gap:6px;padding:6px 12px;font-size:14px;line-height:19px;transition:border-color .14s,color .14s,background-color .14s;display:inline-flex}.H3f_gW_portal:hover,.H3f_gW_floorButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}.H3f_gW_portalGlyph{font-size:16px;line-height:1;transition:transform .24s}.H3f_gW_floorButton span[aria-hidden=true]{font-size:15px;line-height:1}.H3f_gW_portal:active .H3f_gW_portalGlyph{transform:rotate(180deg)scale(.9)}.H3f_gW_floorButton[data-active=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}.H3f_gW_startButton{border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-border-l2));color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent)}.H3f_gW_startButton:hover{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent)}.H3f_gW_settings{flex-direction:column;gap:8px;display:flex}.H3f_gW_settingsHint,.H3f_gW_settingsMeta{color:var(--dsw-alias-label-secondary);margin:0;font-size:10.5px;line-height:1.6}.H3f_gW_sizeRow{flex-wrap:wrap;gap:6px;display:flex}.H3f_gW_inventorySection{flex-direction:column;gap:5px;display:flex}.H3f_gW_inventory{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;display:grid}.H3f_gW_item{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:8px;flex-direction:column;align-items:center;gap:1px;padding:6px 3px;display:flex;position:relative}.H3f_gW_item:hover:not(:disabled){border-color:var(--dsw-alias-state-business-primary)}.H3f_gW_item[data-equipped=true]{background:color-mix(in srgb, #f2c14e 10%, var(--dsw-alias-bg-layer-1));border-color:#f2c14e;box-shadow:0 0 0 1px #f2c14e73}.H3f_gW_item[data-locked=true]{opacity:.42;cursor:not-allowed}.H3f_gW_itemIcon{font-size:15px;line-height:18px}.H3f_gW_itemName{max-width:100%;color:var(--dsw-alias-label-primary);text-align:center;text-overflow:ellipsis;white-space:nowrap;font-size:9px;line-height:12px;overflow:hidden}.H3f_gW_itemLevel{color:var(--dsw-alias-label-tertiary);font-size:8px;line-height:10px}.H3f_gW_itemEquipped{color:#f2c14e;font-size:9px;font-weight:700;position:absolute;top:1px;right:4px}.H3f_gW_itemLock{font-size:8px;position:absolute;top:1px;right:4px}.H3f_gW_sizeChip{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:999px;padding:4px 12px;font-size:10.5px}.H3f_gW_sizeChip:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}.H3f_gW_sizeChip[data-active=true]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent)}.H3f_gW_settingsButton{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:7px;align-self:flex-start;padding:4px 10px;font-size:10.5px}.H3f_gW_settingsButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}.H3f_gW_history{flex-direction:column;gap:12px;display:flex}.H3f_gW_character{flex-direction:column;gap:10px;display:flex}.H3f_gW_characterHead{justify-content:space-between;align-items:center;gap:8px;display:flex}.H3f_gW_characterName{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:650}.H3f_gW_characterLevel{color:#f2c14e;font-size:11.5px;font-weight:650}.H3f_gW_xpTrack{background:var(--dsw-alias-border-l3);border-radius:3px;height:6px;overflow:hidden}.H3f_gW_xpTrack>span{border-radius:inherit;background:#4f9a57;height:100%;transition:width .16s;display:block}.H3f_gW_sizeChip:disabled{opacity:.42;cursor:not-allowed}.H3f_gW_historyStart{border:1px solid color-mix(in srgb, #f2c14e 55%, var(--dsw-alias-border-l2));color:#f2c14e;width:100%;font:inherit;cursor:pointer;background:#f2c14e1a;border-radius:8px;justify-content:center;align-items:center;gap:6px;padding:8px 12px;font-size:11.5px;font-weight:650;display:inline-flex}.H3f_gW_historyStart:hover{background:#f2c14e2e;border-color:#f2c14e}.H3f_gW_historyBlock{flex-direction:column;gap:6px;display:flex}.H3f_gW_historyTitle{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:650}.H3f_gW_historyList{flex-direction:column;gap:4px;display:flex}.H3f_gW_historyItem{border:1px solid var(--dsw-alias-border-l2);width:100%;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;background:0 0;border-radius:8px;flex-direction:column;align-items:flex-start;gap:2px;padding:7px 9px;display:flex}.H3f_gW_historyItem:hover{border-color:var(--dsw-alias-state-business-primary)}.H3f_gW_historyItem[data-active=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)}.H3f_gW_historyItem[data-current=true]{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 55%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent)}.H3f_gW_historyItem[data-current=true][data-active=true]{border-color:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 1px color-mix(in srgb, var(--dsw-alias-state-success-primary) 45%, transparent)}.H3f_gW_historyName{font-size:12px;font-weight:600}.H3f_gW_historyMeta{color:var(--dsw-alias-label-secondary);font-size:10.5px}.H3f_gW_historyDetail{border-top:1px dashed var(--dsw-alias-border-l2);padding-top:8px}.H3f_gW_historyTasks{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}.H3f_gW_historyTask{border:1px solid var(--dsw-alias-border-l2);border-radius:6px;grid-template-columns:40px minmax(0,1fr) auto auto;align-items:center;gap:6px;padding:5px 8px;font-size:10.5px;display:grid}.H3f_gW_historyTaskId{color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.H3f_gW_historyTaskSubject{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.H3f_gW_historyTaskWho{color:var(--dsw-alias-label-secondary)}.H3f_gW_historyTaskState{color:var(--dsw-alias-label-tertiary);font-size:10px}.H3f_gW_historyTaskState[data-state=completed]{color:var(--dsw-alias-state-success-primary)}.H3f_gW_historyTaskState[data-state=failed]{color:var(--dsw-alias-state-error-primary)}.H3f_gW_sheet{z-index:12000;box-sizing:border-box;width:min(480px,100vw - 32px);max-height:min(calc(100vh - 32px), var(--hall-sheet-max,calc(100vh - 32px)));border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 85%, transparent);background:#151a21;border-radius:12px;flex-direction:column;display:flex;position:fixed;overflow:hidden;box-shadow:0 18px 48px #00000080}.H3f_gW_sheetHead{border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;align-items:center;gap:8px;padding:8px 10px 8px 12px;display:flex}.H3f_gW_sheetTitle{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;flex:auto;font-size:15px;font-weight:650;overflow:hidden}.H3f_gW_sheetAction{border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--dsw-alias-border-l2));color:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer;background:0 0;border-radius:6px;flex:none;margin-left:auto;padding:3px 9px;font-size:10.5px}.H3f_gW_sheetAction:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 10%, transparent)}.H3f_gW_sheetClose{width:26px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;flex:none;place-items:center;padding:0;font-size:16px;display:grid}.H3f_gW_sheetClose:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}.H3f_gW_sheetBody{zoom:1.3;scrollbar-width:thin;flex:auto;min-height:0;padding:12px 14px 14px;overflow:auto}.H3f_gW_inboxList{flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;display:flex}.H3f_gW_inboxRow{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;flex-direction:column;gap:2px;padding:6px 8px;font-size:11px;display:flex}.H3f_gW_inboxFrom{color:var(--dsw-alias-label-secondary);font-size:10px}.H3f_gW_inboxText{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;line-height:1.6}";
		const tagId$1 = "agent-teams-pixel/SectHallOverlay.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SectHallOverlay_module_css_default = {
			"canvas": "H3f_gW_canvas",
			"caret": "H3f_gW_caret",
			"character": "H3f_gW_character",
			"characterHead": "H3f_gW_characterHead",
			"characterLevel": "H3f_gW_characterLevel",
			"characterName": "H3f_gW_characterName",
			"floor": "H3f_gW_floor",
			"floorButton": "H3f_gW_floorButton",
			"hall-token-fade": "H3f_gW_hall-token-fade",
			"hall-token-sway": "H3f_gW_hall-token-sway",
			"head": "H3f_gW_head",
			"headButton": "H3f_gW_headButton",
			"history": "H3f_gW_history",
			"historyBlock": "H3f_gW_historyBlock",
			"historyDetail": "H3f_gW_historyDetail",
			"historyItem": "H3f_gW_historyItem",
			"historyList": "H3f_gW_historyList",
			"historyMeta": "H3f_gW_historyMeta",
			"historyName": "H3f_gW_historyName",
			"historyStart": "H3f_gW_historyStart",
			"historyTask": "H3f_gW_historyTask",
			"historyTaskId": "H3f_gW_historyTaskId",
			"historyTaskState": "H3f_gW_historyTaskState",
			"historyTaskSubject": "H3f_gW_historyTaskSubject",
			"historyTaskWho": "H3f_gW_historyTaskWho",
			"historyTasks": "H3f_gW_historyTasks",
			"historyTitle": "H3f_gW_historyTitle",
			"inboxFrom": "H3f_gW_inboxFrom",
			"inboxList": "H3f_gW_inboxList",
			"inboxRow": "H3f_gW_inboxRow",
			"inboxText": "H3f_gW_inboxText",
			"inventory": "H3f_gW_inventory",
			"inventorySection": "H3f_gW_inventorySection",
			"item": "H3f_gW_item",
			"itemEquipped": "H3f_gW_itemEquipped",
			"itemIcon": "H3f_gW_itemIcon",
			"itemLevel": "H3f_gW_itemLevel",
			"itemLock": "H3f_gW_itemLock",
			"itemName": "H3f_gW_itemName",
			"meta": "H3f_gW_meta",
			"portal": "H3f_gW_portal",
			"portalGlyph": "H3f_gW_portalGlyph",
			"settings": "H3f_gW_settings",
			"settingsButton": "H3f_gW_settingsButton",
			"settingsHint": "H3f_gW_settingsHint",
			"settingsMeta": "H3f_gW_settingsMeta",
			"sheet": "H3f_gW_sheet",
			"sheetAction": "H3f_gW_sheetAction",
			"sheetBody": "H3f_gW_sheetBody",
			"sheetClose": "H3f_gW_sheetClose",
			"sheetHead": "H3f_gW_sheetHead",
			"sheetTitle": "H3f_gW_sheetTitle",
			"sizeChip": "H3f_gW_sizeChip",
			"sizeRow": "H3f_gW_sizeRow",
			"startButton": "H3f_gW_startButton",
			"title": "H3f_gW_title",
			"token": "H3f_gW_token",
			"tokenBody": "H3f_gW_tokenBody",
			"tokenGlyph": "H3f_gW_tokenGlyph",
			"tokenInner": "H3f_gW_tokenInner",
			"tokenTassel": "H3f_gW_tokenTassel",
			"viewer": "H3f_gW_viewer",
			"window": "H3f_gW_window",
			"xpTrack": "H3f_gW_xpTrack"
		};
		//#endregion
		//#region lib/client/SectHallOverlay.js
		/**
		* 宗门洞府浮层：整块洞府场景浮在 DSH 窗口上，可拖动、可收起、可传送回右侧栏。
		*
		* 由 shell.overlay 的常驻监视器渲染；墙面设施、剑盒、名册等在浮层内部展开
		* （内容气泡贴在面板左侧）。展开时像右侧栏一样给对话让位；收起成一枚可拖动的
		* 令牌；「归栏」收起浮层并在右侧栏打开洞府页面。
		*/
		const COLLAPSED_KEY = "agent-teams-pixel.hallCollapsed";
		const DOCKED_KEY = "agent-teams-pixel.hallDocked";
		const PANEL_RECT_KEY = "agent-teams-pixel.hallRect";
		const TOKEN_KEY = "agent-teams-pixel.hallToken";
		/** 名册历史列表里的“当前宗门”哨兵。 */
		const CURRENT_TEAM_SENTINEL = "__current__";
		/** 展开的面板给对话让位：写在 html 上的属性与位移变量（与右侧栏同一手法）。 */
		const HALL_OPEN_ATTRIBUTE = "data-agent-teams-hall-open";
		const HALL_SHIFT_PROPERTY = "--agent-teams-hall-shift";
		/** 收起后的令牌基准尺寸（标准面板），实际按面板大小缩放。 */
		const TOKEN_SIZE = {
			w: 38,
			h: 68
		};
		/** 把令牌夹在窗口内；留 8px 边缘，拖不出屏。 */
		function clampToken(x, y, w, h) {
			const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
			const vh = typeof window === "undefined" ? 800 : window.innerHeight;
			return {
				x: Math.max(8, Math.min(x, vw - w - 8)),
				y: Math.max(8, Math.min(y, vh - h - 8))
			};
		}
		function readTokenPoint() {
			if (typeof window === "undefined") return {
				x: 16,
				y: 16
			};
			try {
				const raw = window.localStorage.getItem(TOKEN_KEY);
				if (raw !== null) {
					const parsed = JSON.parse(raw);
					if (typeof parsed.x === "number" && Number.isFinite(parsed.x) && typeof parsed.y === "number" && Number.isFinite(parsed.y)) return clampToken(parsed.x, parsed.y, TOKEN_SIZE.w, TOKEN_SIZE.h);
				}
			} catch {}
			return clampToken(window.innerWidth - TOKEN_SIZE.w - 16, window.innerHeight - TOKEN_SIZE.h - 16, TOKEN_SIZE.w, TOKEN_SIZE.h);
		}
		function writeTokenPoint(point) {
			try {
				window.localStorage.setItem(TOKEN_KEY, JSON.stringify(point));
			} catch {}
		}
		function readBool(key) {
			if (typeof window === "undefined") return false;
			try {
				return window.localStorage.getItem(key) === "1";
			} catch {
				return false;
			}
		}
		function writeBool(key, value) {
			try {
				window.localStorage.setItem(key, value ? "1" : "0");
			} catch {}
		}
		function readPanelRect() {
			if (typeof window === "undefined") return {
				x: 0,
				y: 0
			};
			try {
				const raw = window.localStorage.getItem(PANEL_RECT_KEY);
				if (raw === null) return {
					x: 0,
					y: 0
				};
				const parsed = JSON.parse(raw);
				return {
					x: typeof parsed.x === "number" && Number.isFinite(parsed.x) ? parsed.x : 0,
					y: typeof parsed.y === "number" && Number.isFinite(parsed.y) ? parsed.y : 0,
					w: typeof parsed.w === "number" && parsed.w > 240 ? parsed.w : void 0,
					h: typeof parsed.h === "number" && parsed.h > 160 ? parsed.h : void 0
				};
			} catch {
				return {
					x: 0,
					y: 0
				};
			}
		}
		function writePanelRect(rect) {
			try {
				window.localStorage.setItem(PANEL_RECT_KEY, JSON.stringify(rect));
			} catch {}
		}
		/** 面板预设尺寸：初始给大一些。 */
		const PANEL_SIZES = {
			compact: {
				w: 460,
				h: 380
			},
			normal: {
				w: 620,
				h: 500
			},
			large: {
				w: 820,
				h: 640
			},
			huge: {
				w: 1040,
				h: 760
			}
		};
		function SectHallOverlay({ team, history = [], t, sessionId, modelDirectories, openMember, openCaptain, sidebar, tabKind }) {
			const [collapsed, setCollapsed] = (0, react.useState)(() => readBool(COLLAPSED_KEY));
			const [docked, setDocked] = (0, react.useState)(() => readBool(DOCKED_KEY));
			const [sheet, setSheet] = (0, react.useState)();
			const [pendingReview, setPendingReview] = (0, react.useState)(false);
			const [reviewing, setReviewing] = (0, react.useState)(false);
			const [historyTeamId, setHistoryTeamId] = (0, react.useState)();
			const [characterId, setCharacterId] = (0, react.useState)();
			const [equipped, setEquipped] = (0, react.useState)({});
			useCultivationVersion();
			(0, react.useEffect)(() => {
				setEquipped({});
			}, [characterId]);
			const [sheetAnchor, setSheetAnchor] = (0, react.useState)();
			const [rect, setRect] = (0, react.useState)(() => readPanelRect());
			const [token, setToken] = (0, react.useState)(() => readTokenPoint());
			const tokenDrag = (0, react.useRef)(null);
			const [size, setSize] = (0, react.useState)(() => {
				const stored = readPanelRect();
				return {
					w: stored.w ?? PANEL_SIZES.normal.w,
					h: stored.h ?? PANEL_SIZES.normal.h
				};
			});
			const panelRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const latestRect = (0, react.useRef)(rect);
			latestRect.current = rect;
			const hasTeam = team !== void 0;
			const ownerSessionId = team?.captainSessionId ?? sessionId;
			(0, react.useEffect)(() => {
				if (!pendingReview || !hasTeam) return;
				setPendingReview(false);
				setReviewing(true);
				setSheet("config");
			}, [pendingReview, hasTeam]);
			const hall = team ?? {
				workspace: "",
				teamId: "",
				name: t("office.hallEmptyName"),
				captainSessionId: "",
				phase: "running",
				members: [],
				tasks: [],
				messageCount: 0,
				captainInbox: []
			};
			const done = hall.tasks.filter((task) => task.status === "completed").length;
			const total = hall.tasks.length;
			const goHome = () => {
				if (openCaptain !== void 0 && hall.captainSessionId !== "") openCaptain(hall.captainSessionId);
			};
			const viewingCaptain = sessionId !== void 0 && sessionId === hall.captainSessionId;
			const viewingMember = sessionId === void 0 ? void 0 : hall.members.find((member) => member.id === sessionId);
			const startNewTask = () => {
				setSheet(void 0);
				goHome();
				window.setTimeout(() => {
					document.querySelector("[data-composer-card] [contenteditable=\"true\"][role=\"textbox\"], [data-composer-card] textarea")?.focus();
				}, 160);
			};
			const openGear = () => {
				const id = viewingCaptain ? hall.captainSessionId : viewingMember?.id;
				const target = id !== void 0 && id !== "" ? id : hall.captainSessionId;
				if (target !== "") {
					setCharacterId(target);
					setSheet("character");
				}
			};
			const staged = hall.phase === "staged";
			const tokenScale = Math.min(1.8, Math.max(.8, size.h / PANEL_SIZES.normal.h));
			const tokenSize = {
				w: Math.round(TOKEN_SIZE.w * tokenScale),
				h: Math.round(TOKEN_SIZE.h * tokenScale)
			};
			const tokenAt = clampToken(token.x, token.y, tokenSize.w, tokenSize.h);
			(0, react.useEffect)(() => {
				const open = (event) => {
					const action = event.detail?.action;
					if (action !== void 0) setSheet(action);
				};
				window.addEventListener(OPEN_HALL_SHEET_EVENT, open);
				return () => {
					window.removeEventListener(OPEN_HALL_SHEET_EVENT, open);
				};
			}, []);
			(0, react.useEffect)(() => {
				if (sheet === void 0) return;
				const measure = () => {
					const panel = panelRef.current;
					if (panel === null) return;
					const bounds = panel.getBoundingClientRect();
					const top = Math.max(8, bounds.top);
					const maxHeight = Math.max(160, window.innerHeight - top - 8);
					setSheetAnchor({
						...hallSheetPlacement(bounds.left, window.innerWidth),
						top,
						maxHeight
					});
				};
				measure();
				window.addEventListener("resize", measure);
				return () => {
					window.removeEventListener("resize", measure);
				};
			}, [
				sheet,
				docked,
				collapsed,
				rect,
				size
			]);
			const beginDrag = (event) => {
				if (event.target.closest("button") !== null) return;
				if (panelRef.current === null) return;
				event.preventDefault();
				dragRef.current = {
					startX: event.clientX,
					startY: event.clientY,
					baseX: rect.x,
					baseY: rect.y
				};
				const move = (moveEvent) => {
					const drag = dragRef.current;
					if (drag === null) return;
					const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
					const next = {
						...latestRect.current,
						x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), 16 - window.innerWidth, 0),
						y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), -(window.innerHeight - 96), 0)
					};
					latestRect.current = next;
					setRect(next);
				};
				const up = () => {
					dragRef.current = null;
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					writePanelRect(latestRect.current);
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
			};
			const openSidebarPage = () => {
				if (sidebar === void 0 || tabKind === void 0) return;
				try {
					sidebar.openTab(tabKind);
				} catch {}
			};
			const closeSidebarPage = () => {
				if (sidebar === void 0 || tabKind === void 0 || sessionId === void 0) return;
				const page = (sidebar.tabsIn?.(sessionId) ?? []).find((tab) => tab.kind === tabKind);
				if (page === void 0) return;
				try {
					sidebar.close(page.id);
				} catch {}
			};
			const toggleCollapsed = () => {
				const next = !collapsed;
				setCollapsed(next);
				writeBool(COLLAPSED_KEY, next);
				if (next) {
					setSheet(void 0);
					return;
				}
				if (docked) {
					setDocked(false);
					writeBool(DOCKED_KEY, false);
					closeSidebarPage();
				}
			};
			const beginTokenDrag = (event) => {
				if (event.button !== 0) return;
				event.preventDefault();
				event.currentTarget.focus();
				const drag = {
					startX: event.clientX,
					startY: event.clientY,
					baseX: tokenAt.x,
					baseY: tokenAt.y,
					lastX: tokenAt.x,
					lastY: tokenAt.y,
					moved: false
				};
				tokenDrag.current = drag;
				const cleanup = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", cancel);
				};
				const move = (moveEvent) => {
					if (tokenDrag.current !== drag) return;
					const dx = moveEvent.clientX - drag.startX;
					const dy = moveEvent.clientY - drag.startY;
					if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
					drag.moved = true;
					const next = clampToken(drag.baseX + dx, drag.baseY + dy, tokenSize.w, tokenSize.h);
					drag.lastX = next.x;
					drag.lastY = next.y;
					setToken(next);
				};
				const up = () => {
					cleanup();
					if (tokenDrag.current !== drag) return;
					tokenDrag.current = null;
					if (drag.moved) {
						writeTokenPoint({
							x: drag.lastX,
							y: drag.lastY
						});
						return;
					}
					toggleCollapsed();
				};
				const cancel = () => {
					cleanup();
					if (tokenDrag.current === drag) tokenDrag.current = null;
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", cancel);
			};
			(0, react.useEffect)(() => {
				setToken((current) => {
					const next = clampToken(current.x, current.y, tokenSize.w, tokenSize.h);
					return next.x === current.x && next.y === current.y ? current : next;
				});
			}, [tokenSize.w, tokenSize.h]);
			const dockToSidebar = () => {
				setDocked(true);
				writeBool(DOCKED_KEY, true);
				setCollapsed(true);
				writeBool(COLLAPSED_KEY, true);
				setSheet(void 0);
				openSidebarPage();
			};
			(0, react.useEffect)(() => {
				const root = document.documentElement;
				const apply = () => {
					if (collapsed) {
						root.removeAttribute(HALL_OPEN_ATTRIBUTE);
						root.style.removeProperty(HALL_SHIFT_PROPERTY);
						return;
					}
					const vw = window.innerWidth;
					const shift = hallYieldWidth(size.w, vw);
					root.setAttribute(HALL_OPEN_ATTRIBUTE, "");
					root.style.setProperty(HALL_SHIFT_PROPERTY, `${shift}px`);
				};
				apply();
				window.addEventListener("resize", apply);
				return () => {
					window.removeEventListener("resize", apply);
					root.removeAttribute(HALL_OPEN_ATTRIBUTE);
					root.style.removeProperty(HALL_SHIFT_PROPERTY);
				};
			}, [collapsed, size.w]);
			const applySize = (next) => {
				setSize(next);
				writePanelRect({
					...rect,
					...next
				});
			};
			const finishSheet = () => {
				if (reviewing) {
					setReviewing(false);
					setSheet("board");
					return;
				}
				setSheet(void 0);
			};
			const toggleSheet = (kind) => {
				if (sheet === kind) {
					finishSheet();
					return;
				}
				setReviewing(false);
				setSheet(kind);
			};
			(0, react.useEffect)(() => {
				if (collapsed) return;
				const panel = panelRef.current;
				if (panel === null || typeof ResizeObserver === "undefined") return;
				let timer;
				const observer = new ResizeObserver(() => {
					if (timer !== void 0) window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						const bounds = panel.getBoundingClientRect();
						const next = {
							w: Math.round(bounds.width),
							h: Math.round(bounds.height)
						};
						setSize((current) => Math.abs(current.w - next.w) > 1 || Math.abs(current.h - next.h) > 1 ? next : current);
						writePanelRect({
							...latestRect.current,
							...next
						});
					}, 300);
				});
				observer.observe(panel);
				return () => {
					if (timer !== void 0) window.clearTimeout(timer);
					observer.disconnect();
				};
			}, [collapsed]);
			if (typeof document === "undefined") return null;
			const panelStyle = {
				transform: `translate(${rect.x}px, ${rect.y}px)`,
				width: `${size.w}px`,
				height: `${size.h}px`
			};
			const startSect = () => {
				setSheet((current) => current === "start" ? void 0 : "start");
			};
			const renderSheet = () => {
				if (sheet === void 0 || sheetAnchor === void 0) return null;
				const noTeamHint = (0, react_jsx_runtime.jsxs)("div", {
					className: SectHallOverlay_module_css_default.settings,
					children: [
						(0, react_jsx_runtime.jsx)("p", {
							className: SectHallOverlay_module_css_default.settingsHint,
							children: t("workspace.emptyTitle")
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: SectHallOverlay_module_css_default.settingsMeta,
							children: t("workspace.emptyBody")
						}),
						(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: SectHallOverlay_module_css_default.settingsButton,
							"data-control": "hall-start",
							onClick: startSect,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "⛩"
								}),
								" ",
								t("quickstart.entry")
							]
						})
					]
				});
				const viewingCurrent = hasTeam && (historyTeamId === void 0 || historyTeamId === CURRENT_TEAM_SENTINEL);
				const selectedHistory = history.find((team) => team.teamId === historyTeamId);
				const historyTasks = hall.tasks.filter((task) => task.status === "completed" || task.status === "failed" || task.status === "cancelled");
				const taskStatusLabel = (status) => status === "completed" ? t("task.status.completed") : status === "failed" ? t("task.status.failed") : t("task.status.cancelled");
				const character = characterId === void 0 ? void 0 : characterId === hall.captainSessionId ? {
					id: hall.captainSessionId,
					name: t("office.captain"),
					key: captainKey(hall.name),
					isCaptain: true
				} : (() => {
					const member = hall.members.find((item) => item.id === characterId);
					return member === void 0 ? void 0 : {
						id: member.id,
						name: member.name,
						key: memberKey(member.name),
						isCaptain: false
					};
				})();
				const characterCultivation = character === void 0 ? void 0 : cultivationFromXp(xpOf(character.key));
				const title = sheet === "settings" ? t("office.panelConfig") : sheet === "start" ? t("quickstart.title") : sheet === "character" ? t("office.equipment") : sheet === "inbox" ? t("workspace.inbox") : sheet === "teams" ? t("office.facility.teams") : sheet === "board" ? t("workspace.tabBoard") : t("workspace.tabConfig");
				return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("aside", {
					className: SectHallOverlay_module_css_default.sheet,
					"data-sheet": sheet,
					style: {
						left: sheetAnchor.left,
						top: sheetAnchor.top,
						width: sheetAnchor.width,
						height: Math.min(size.h, sheetAnchor.maxHeight),
						maxHeight: sheetAnchor.maxHeight,
						["--hall-sheet-max"]: `${size.h}px`
					},
					role: "dialog",
					"aria-modal": "false",
					"aria-label": title,
					children: [(0, react_jsx_runtime.jsxs)("header", {
						className: SectHallOverlay_module_css_default.sheetHead,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: SectHallOverlay_module_css_default.sheetTitle,
								children: title
							}),
							sheet === "board" && hasTeam && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.sheetAction,
								onClick: startNewTask,
								title: t("office.newTaskHint"),
								children: ["＋ ", t("office.newTask")]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.sheetClose,
								onClick: finishSheet,
								"aria-label": t("office.closePanel"),
								children: "×"
							})
						]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: SectHallOverlay_module_css_default.sheetBody,
						children: sheet === "settings" ? (0, react_jsx_runtime.jsxs)("div", {
							className: SectHallOverlay_module_css_default.settings,
							children: [
								(0, react_jsx_runtime.jsx)("p", {
									className: SectHallOverlay_module_css_default.settingsHint,
									children: t("office.panelSizeHint")
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: SectHallOverlay_module_css_default.sizeRow,
									children: Object.keys(PANEL_SIZES).map((id) => {
										const preset = PANEL_SIZES[id];
										const active = size.w === preset.w && size.h === preset.h;
										return (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: SectHallOverlay_module_css_default.sizeChip,
											"data-active": active || void 0,
											onClick: () => {
												applySize(preset);
											},
											children: t(`office.panelSize.${id}`)
										}, id);
									})
								}),
								(0, react_jsx_runtime.jsxs)("p", {
									className: SectHallOverlay_module_css_default.settingsMeta,
									children: [
										size.w,
										" × ",
										size.h,
										" px"
									]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: SectHallOverlay_module_css_default.settingsButton,
									onClick: () => {
										setRect({
											x: 0,
											y: 0
										});
										writePanelRect({
											x: 0,
											y: 0,
											...size
										});
									},
									children: t("office.resetPosition")
								})
							]
						}) : sheet === "start" ? sessionId === void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: SectHallOverlay_module_css_default.settingsHint,
							children: t("workspace.emptyTitle")
						}) : (0, react_jsx_runtime.jsx)(QuickStartWizard, {
							sessionId,
							t,
							onDone: () => {
								setSheet(void 0);
							},
							onFounded: () => {
								setPendingReview(true);
							}
						}) : sheet === "character" ? character === void 0 || characterCultivation === void 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: SectHallOverlay_module_css_default.settingsHint,
							children: t("workspace.emptyTitle")
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: SectHallOverlay_module_css_default.character,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: SectHallOverlay_module_css_default.characterHead,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: SectHallOverlay_module_css_default.characterName,
										children: character.name
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: SectHallOverlay_module_css_default.characterLevel,
										children: [
											"Lv.",
											characterCultivation.level,
											" ",
											t(characterCultivation.rankKey)
										]
									})]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: SectHallOverlay_module_css_default.xpTrack,
									children: (0, react_jsx_runtime.jsx)("span", { style: { width: `${Math.round(characterCultivation.ratio * 100)}%` } })
								}),
								(0, react_jsx_runtime.jsxs)("p", {
									className: SectHallOverlay_module_css_default.settingsMeta,
									children: [
										characterCultivation.xp,
										" / ",
										characterCultivation.next,
										" XP"
									]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SectHallOverlay_module_css_default.historyTitle,
									children: t("office.levelTest")
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: SectHallOverlay_module_css_default.sizeRow,
									children: [
										1,
										5,
										20,
										50,
										150,
										350,
										700,
										1200,
										2800,
										5200,
										9e3,
										9800,
										9999
									].map((level) => (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: SectHallOverlay_module_css_default.sizeChip,
										"data-active": characterCultivation.level === level || void 0,
										onClick: () => {
											setCultivationXp(character.key, xpForLevel(level));
										},
										children: ["Lv.", level]
									}, level))
								}),
								[
									{
										kind: "weapon",
										title: t("office.weapon")
									},
									{
										kind: "mount",
										title: t("office.mounts")
									},
									{
										kind: "skill",
										title: t("office.skills")
									}
								].map((section) => (0, react_jsx_runtime.jsxs)("div", {
									className: SectHallOverlay_module_css_default.inventorySection,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: SectHallOverlay_module_css_default.historyTitle,
										children: section.title
									}), (0, react_jsx_runtime.jsx)("div", {
										className: SectHallOverlay_module_css_default.inventory,
										children: CULTIVATION_ITEMS.filter((item) => item.kind === section.kind).map((item) => {
											const locked = characterCultivation.level < item.level;
											const isEquipped = equipped[item.kind] === item.id;
											return (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: SectHallOverlay_module_css_default.item,
												"data-locked": locked || void 0,
												"data-equipped": isEquipped || void 0,
												disabled: locked,
												title: t(item.key),
												onClick: () => {
													if (locked) return;
													setEquipped((current) => ({
														...current,
														[item.kind]: item.id
													}));
													if (item.kind === "mount" && item.form !== void 0) window.dispatchEvent(new CustomEvent("agent-teams:mount", { detail: {
														id: character.id,
														form: item.form
													} }));
													else if (item.kind !== "mount") window.dispatchEvent(new CustomEvent("agent-teams:equip", { detail: {
														id: character.id,
														kind: item.kind,
														tier: item.level
													} }));
												},
												children: [
													(0, react_jsx_runtime.jsx)("span", {
														className: SectHallOverlay_module_css_default.itemIcon,
														children: item.icon
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: SectHallOverlay_module_css_default.itemName,
														children: t(item.key)
													}),
													(0, react_jsx_runtime.jsxs)("span", {
														className: SectHallOverlay_module_css_default.itemLevel,
														children: ["Lv.", item.level]
													}),
													isEquipped && (0, react_jsx_runtime.jsx)("span", {
														className: SectHallOverlay_module_css_default.itemEquipped,
														children: "✓"
													}),
													locked && (0, react_jsx_runtime.jsx)("span", {
														className: SectHallOverlay_module_css_default.itemLock,
														children: "🔒"
													})
												]
											}, item.id);
										})
									})]
								}, section.kind))
							]
						}) : sheet === "inbox" ? hall.captainInbox.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: SectHallOverlay_module_css_default.settingsHint,
							children: t("workspace.inboxEmpty")
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: SectHallOverlay_module_css_default.inboxList,
							children: hall.captainInbox.map((message, index) => (0, react_jsx_runtime.jsxs)("li", {
								className: SectHallOverlay_module_css_default.inboxRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: SectHallOverlay_module_css_default.inboxFrom,
									children: message.from
								}), (0, react_jsx_runtime.jsx)("span", {
									className: SectHallOverlay_module_css_default.inboxText,
									children: message.content
								})]
							}, `${index}:${message.from}`))
						}) : sheet === "config" ? !hasTeam ? noTeamHint : staged && sessionId !== void 0 ? (0, react_jsx_runtime.jsx)(StagingPlanEditor, {
							team: hall,
							modelDirectory: modelDirectories.directoryFor(sessionId),
							onContinuePlanning: () => {
								setSheet(void 0);
							},
							onDiscarded: () => {
								setSheet(void 0);
							},
							t
						}) : (0, react_jsx_runtime.jsx)(TeamConfigPanel, {
							team: hall,
							t
						}) : sheet === "teams" ? (0, react_jsx_runtime.jsxs)("div", {
							className: SectHallOverlay_module_css_default.history,
							children: [
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: SectHallOverlay_module_css_default.historyStart,
									onClick: startSect,
									title: t("quickstart.entryTitle"),
									children: [(0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										children: "⛩"
									}), t("quickstart.entry")]
								}),
								!hasTeam && history.length === 0 && historyTasks.length === 0 && (0, react_jsx_runtime.jsx)("p", {
									className: SectHallOverlay_module_css_default.settingsHint,
									children: t("office.historyEmpty")
								}),
								(hasTeam || history.length > 0) && (0, react_jsx_runtime.jsxs)("div", {
									className: SectHallOverlay_module_css_default.historyBlock,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: SectHallOverlay_module_css_default.historyTitle,
											children: t("office.historyTeams")
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: SectHallOverlay_module_css_default.historyList,
											children: [hasTeam && (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												className: SectHallOverlay_module_css_default.historyItem,
												"data-current": "true",
												"data-active": viewingCurrent || void 0,
												onClick: () => {
													setHistoryTeamId(CURRENT_TEAM_SENTINEL);
												},
												children: [(0, react_jsx_runtime.jsxs)("span", {
													className: SectHallOverlay_module_css_default.historyName,
													children: [
														(0, react_jsx_runtime.jsx)("span", {
															className: SectHallOverlay_module_css_default.historyCurrentDot,
															"aria-hidden": true
														}),
														hall.name,
														(0, react_jsx_runtime.jsx)("span", {
															className: SectHallOverlay_module_css_default.historyCurrentBadge,
															children: t("office.historyCurrent")
														})
													]
												}), (0, react_jsx_runtime.jsxs)("span", {
													className: SectHallOverlay_module_css_default.historyMeta,
													children: [
														done,
														"/",
														total,
														" · ",
														t("team.stats.members", { count: hall.members.length })
													]
												})]
											}), history.map((team) => {
												const done = team.tasks.filter((task) => task.status === "completed").length;
												return (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: SectHallOverlay_module_css_default.historyItem,
													"data-active": !viewingCurrent && selectedHistory?.teamId === team.teamId || void 0,
													onClick: () => {
														setHistoryTeamId(team.teamId);
													},
													children: [(0, react_jsx_runtime.jsxs)("span", {
														className: SectHallOverlay_module_css_default.historyName,
														children: [
															(0, react_jsx_runtime.jsx)("span", {
																className: SectHallOverlay_module_css_default.historyPastDot,
																"aria-hidden": true
															}),
															team.name,
															(0, react_jsx_runtime.jsx)("span", {
																className: SectHallOverlay_module_css_default.historyPastBadge,
																children: t("office.historyPast")
															})
														]
													}), (0, react_jsx_runtime.jsxs)("span", {
														className: SectHallOverlay_module_css_default.historyMeta,
														children: [
															done,
															"/",
															team.tasks.length,
															" · ",
															t("team.stats.members", { count: team.members.length })
														]
													})]
												}, team.teamId);
											})]
										}),
										selectedHistory !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
											className: SectHallOverlay_module_css_default.historyDetail,
											children: (0, react_jsx_runtime.jsx)(TeamSection, {
												team: selectedHistory,
												t,
												historic: true,
												workspace: true,
												onOpenCaptain: openCaptain === void 0 ? void 0 : () => {
													openCaptain(selectedHistory.captainSessionId);
												},
												onNavigate: (_parent, child) => {
													if (ownerSessionId !== void 0) openMember(ownerSessionId, child);
												}
											})
										}) : null
									]
								}),
								historyTasks.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
									className: SectHallOverlay_module_css_default.historyBlock,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: SectHallOverlay_module_css_default.historyTitle,
										children: t("office.taskHistory")
									}), (0, react_jsx_runtime.jsx)("ul", {
										className: SectHallOverlay_module_css_default.historyTasks,
										children: historyTasks.map((task) => (0, react_jsx_runtime.jsxs)("li", {
											className: SectHallOverlay_module_css_default.historyTask,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: SectHallOverlay_module_css_default.historyTaskId,
													children: task.id
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: SectHallOverlay_module_css_default.historyTaskSubject,
													title: task.subject,
													children: task.subject
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: SectHallOverlay_module_css_default.historyTaskWho,
													children: task.assignee || "—"
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: SectHallOverlay_module_css_default.historyTaskState,
													"data-state": task.state,
													children: taskStatusLabel(task.status)
												})
											]
										}, task.id))
									})]
								})
							]
						}) : !hasTeam ? noTeamHint : (0, react_jsx_runtime.jsx)(TeamSection, {
							team: hall,
							t,
							workspace: true,
							onOpenCaptain: goHome,
							viewingSessionId: sessionId,
							onNavigate: (_parent, child) => {
								if (ownerSessionId !== void 0) openMember(ownerSessionId, child);
							},
							onContinuePlanning: () => {
								setSheet(void 0);
							},
							onDiscarded: () => {
								setSheet(void 0);
							}
						})
					})]
				}), document.body);
			};
			const tokenTitle = hasTeam ? `${hall.name} · ${done}/${total}` : `${hall.name} · ${t("office.hallNoTeam")}`;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [collapsed ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: SectHallOverlay_module_css_default.token,
				"data-hall-token": true,
				style: {
					left: tokenAt.x,
					top: tokenAt.y,
					width: tokenSize.w,
					height: tokenSize.h
				},
				onPointerDown: beginTokenDrag,
				onClick: (event) => {
					if (event.detail === 0) toggleCollapsed();
				},
				"aria-label": t("office.expand"),
				"aria-expanded": false,
				title: `${t("office.expand")} · ${tokenTitle}`,
				children: (0, react_jsx_runtime.jsxs)("span", {
					className: SectHallOverlay_module_css_default.tokenInner,
					style: { transform: `scale(${tokenScale})` },
					"aria-hidden": true,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: SectHallOverlay_module_css_default.tokenBody,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: SectHallOverlay_module_css_default.tokenGlyph,
							"aria-hidden": true,
							children: "山"
						})
					}), (0, react_jsx_runtime.jsx)("span", {
						className: SectHallOverlay_module_css_default.tokenTassel,
						"aria-hidden": true
					})]
				})
			}), document.body) : (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("section", {
				ref: panelRef,
				className: SectHallOverlay_module_css_default.window,
				"data-hall-window": true,
				style: panelStyle,
				"aria-label": t("office.sceneAria", { name: hall.name }),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: SectHallOverlay_module_css_default.head,
						onPointerDown: beginDrag,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: SectHallOverlay_module_css_default.caret,
								"aria-hidden": true,
								children: "▾"
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: SectHallOverlay_module_css_default.title,
								children: ["⛩ ", hall.name]
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: SectHallOverlay_module_css_default.meta,
								children: hasTeam ? `${done}/${total}` : t("office.hallNoTeam")
							}),
							hasTeam && (viewingCaptain || viewingMember !== void 0) && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.viewer,
								"data-kind": viewingCaptain ? "captain" : "member",
								title: t("office.equipment"),
								onClick: () => {
									const id = viewingCaptain ? hall.captainSessionId : viewingMember?.id;
									if (id !== void 0 && id !== "") {
										setCharacterId(id);
										setSheet("character");
									}
								},
								children: viewingCaptain ? `👑 ${t("office.viewingCaptain")}` : `◈ ${t("office.viewingMember", { name: viewingMember?.name ?? "" })}`
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.headButton,
								"data-control": "hall-collapse",
								"aria-expanded": true,
								onClick: toggleCollapsed,
								children: t("office.collapse")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: SectHallOverlay_module_css_default.canvas,
						children: (0, react_jsx_runtime.jsx)(PixelOffice, {
							team: hall,
							t,
							activeAction: sheet === "character" ? "gear" : sheet === "settings" || sheet === "start" ? null : sheet ?? null,
							onAction: (action) => {
								if (action === "teams" && !hasTeam) {
									startSect();
									return;
								}
								if (action === "gear") {
									openGear();
									return;
								}
								toggleSheet(action);
							},
							onOpenMember: (memberId) => {
								if (ownerSessionId !== void 0) openMember(ownerSessionId, memberId);
							},
							onOpenCaptain: goHome,
							onOpenCharacter: (memberId) => {
								setCharacterId(memberId);
								setSheet("character");
							},
							viewingSessionId: sessionId,
							onUnavailable: () => {},
							onDock: dockToSidebar,
							onSettings: () => {
								toggleSheet("settings");
							},
							settingsOpen: sheet === "settings",
							teamless: !hasTeam
						})
					}),
					(0, react_jsx_runtime.jsxs)("footer", {
						className: SectHallOverlay_module_css_default.floor,
						children: [
							!hasTeam && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `${SectHallOverlay_module_css_default.floorButton} ${SectHallOverlay_module_css_default.startButton}`,
								"data-control": "hall-start",
								onClick: startSect,
								title: t("quickstart.entryTitle"),
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "⛩"
								}), t("quickstart.entry")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.portal,
								"data-control": "hall-dock",
								onClick: dockToSidebar,
								title: t("office.dockSidebar"),
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: SectHallOverlay_module_css_default.portalGlyph,
									"aria-hidden": true,
									children: "✥"
								}), (0, react_jsx_runtime.jsx)("span", { children: t("office.dockSidebar") })]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-roster",
								"data-active": sheet === "teams" || void 0,
								onClick: () => {
									toggleSheet("teams");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "山"
								}), t("office.roster")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-doctrine",
								"data-active": sheet === "config" || void 0,
								onClick: () => {
									toggleSheet("config");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "经"
								}), t("office.floorDoctrine")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-progress",
								"data-active": sheet === "board" || void 0,
								onClick: () => {
									toggleSheet("board");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "碑"
								}), t("office.floorProgress")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-inbox",
								"data-active": sheet === "inbox" || void 0,
								onClick: () => {
									toggleSheet("inbox");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "信"
								}), t("office.floorInbox")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-gear",
								"data-active": sheet === "character" || void 0,
								onClick: openGear,
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "阁"
								}), t("office.floorGear")]
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SectHallOverlay_module_css_default.floorButton,
								"data-control": "hall-settings",
								"data-active": sheet === "settings" || void 0,
								onClick: () => {
									toggleSheet("settings");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: "⚙"
								}), t("office.floorSettings")]
							})
						]
					})
				]
			}), document.body), renderSheet()] });
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
		const css = ".jROsYq_root{--dsw-alias-state-business-primary:light-dark(#2866d7,#82b4ff);height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 78%, var(--dsw-alias-bg-base));font-variant-numeric:tabular-nums;flex-direction:column;font-family:inherit;display:flex;position:relative;overflow:hidden;container:jROsYq_team-workspace/inline-size}.jROsYq_content{box-sizing:border-box;scrollbar-gutter:stable;scrollbar-width:thin;scrollbar-color:color-mix(in srgb, var(--dsw-alias-label-secondary) 45%, transparent) transparent;flex:0 auto;width:100%;max-width:1400px;min-height:0;margin:0 auto;padding:10px 12px 12px;overflow:auto}.jROsYq_content::-webkit-scrollbar{width:9px;height:9px}.jROsYq_content::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 42%, transparent);border-radius:8px}.jROsYq_content::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb, var(--dsw-alias-label-secondary) 62%, transparent)}.jROsYq_content::-webkit-scrollbar-track{background:0 0}.jROsYq_stage{box-sizing:border-box;flex-direction:column;flex:auto;justify-content:center;min-height:0;padding:6px 8px 8px;display:flex;position:relative;overflow:hidden}.jROsYq_stageError{z-index:7;border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, transparent);color:var(--dsw-alias-label-primary);border-radius:9px;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 10px;font-size:11px;line-height:1.5;display:flex;position:absolute;top:8px;left:8px;right:8px;box-shadow:0 4px 16px #00000047}.jROsYq_stageError>span{flex:160px}.jROsYq_stageError button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:7px;flex:none;padding:3px 9px;font-size:11px}.jROsYq_stagedRibbon{z-index:4;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent);color:var(--dsw-alias-label-secondary);border-radius:999px;align-items:center;gap:8px;padding:5px 8px 5px 12px;font-size:11px;display:inline-flex;position:absolute;bottom:14px;left:50%;transform:translate(-50%);box-shadow:0 6px 20px #00000052}.jROsYq_stagedRibbon button{border:1px solid var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:#fff;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:600}.jROsYq_scrim{z-index:3;cursor:default;background:#080c0a38;border:0;padding:0;animation:.14s ease-out jROsYq_scrimIn;position:absolute;inset:0}@keyframes jROsYq_scrimIn{0%{opacity:0}to{opacity:1}}.jROsYq_sheet{z-index:12000;transform:translate(var(--sheet-dx,0px), var(--sheet-dy,0px));border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 82%, transparent);background:var(--dsw-alias-bg-layer-1);resize:both;border-radius:12px;flex-direction:column;width:min(560px,100% - 32px);min-width:280px;max-width:calc(100% - 32px);min-height:180px;max-height:calc(100% - 32px);animation:.16s ease-out jROsYq_sheetFloatIn;display:flex;position:fixed;bottom:16px;right:16px;overflow:hidden;box-shadow:0 22px 60px #00000085,inset 0 2px #ffffff0a}@keyframes jROsYq_sheetFloatIn{0%{opacity:0}to{opacity:1}}.jROsYq_sheet:focus{outline:none}.jROsYq_sheet::-webkit-resizer{background:linear-gradient(135deg, transparent 0 46%, var(--dsw-alias-label-tertiary) 46% 52%, transparent 52% 62%, var(--dsw-alias-label-tertiary) 62% 68%, transparent 68%)}.jROsYq_sheetHead{border-bottom:1px solid var(--dsw-alias-border-l2);cursor:move;user-select:none;touch-action:none;background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 65%, var(--dsw-alias-bg-layer-1));flex:none;align-items:center;gap:8px;padding:7px 8px 7px 10px;display:flex}.jROsYq_sheetGrip{color:var(--dsw-alias-label-tertiary);letter-spacing:-1px;flex:none;font-size:12px;line-height:1}.jROsYq_sheetTitle{letter-spacing:-.2px;white-space:nowrap;font-size:12px;font-weight:650}.jROsYq_sheetMeta{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-secondary);flex:auto;font-size:10.5px;overflow:hidden}.jROsYq_sheetClose{width:24px;height:24px;color:var(--dsw-alias-label-secondary);background:0 0;border:1px solid #0000;border-radius:7px;flex:none;place-items:center;padding:0;font-size:15px;line-height:1;display:grid}.jROsYq_sheetClose:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}.jROsYq_sheetBody{scrollbar-width:thin;flex:auto;min-height:0;padding:10px 12px 14px;overflow:auto}.jROsYq_sheetSection{flex-direction:column;gap:8px;min-height:0;display:flex}.jROsYq_sheetHint{color:var(--dsw-alias-label-secondary);margin:0;font-size:10.5px;line-height:1.6}.jROsYq_sheetEmpty{color:var(--dsw-alias-label-secondary);margin:0;padding:18px 4px;font-size:11.5px;line-height:1.7}.jROsYq_sheetBack{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:8px;align-self:flex-start;margin-top:4px;padding:5px 11px;font-size:11px}.jROsYq_sheetBack:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_teamList{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}.jROsYq_teamRow{border:1px solid var(--dsw-alias-border-l2);width:100%;color:var(--dsw-alias-label-primary);text-align:left;background:0 0;border-radius:8px;grid-template-columns:minmax(0,1fr) auto auto;align-items:baseline;gap:8px;padding:6px 9px;font-size:11.5px;display:grid}.jROsYq_teamRow:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_teamRow[data-current]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}.jROsYq_teamRowName{text-overflow:ellipsis;white-space:nowrap;font-weight:600;overflow:hidden}.jROsYq_teamRowState{color:var(--dsw-alias-label-secondary);font-size:10.5px}.jROsYq_teamRowCount{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;font-size:10.5px}.jROsYq_inboxList{flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;display:flex}.jROsYq_inboxRow{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 40%, transparent);border-radius:8px;flex-direction:column;gap:2px;padding:6px 9px;font-size:11px;line-height:1.6;display:flex}.jROsYq_inboxFrom{color:var(--dsw-alias-state-business-primary);font-weight:600}.jROsYq_inboxText{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}.jROsYq_officeHint{z-index:3;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-border-l2));max-width:92%;color:var(--dsw-alias-label-primary);pointer-events:none;background:#141820f0;border-radius:8px;padding:6px 12px;font-size:11px;line-height:16px;animation:.16s ease-out jROsYq_officeHintIn;position:absolute;bottom:12px;left:50%;transform:translate(-50%);box-shadow:0 6px 18px #00000059}@keyframes jROsYq_officeHintIn{0%{opacity:0;transform:translate(-50%,4px)}to{opacity:1;transform:translate(-50%)}}.jROsYq_hallHint{z-index:4;border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 80%, transparent);color:#cbd5e1;letter-spacing:.2px;pointer-events:none;background:#101418b8;border-radius:999px;margin:0;padding:3px 9px;font-size:10px;line-height:15px;position:absolute;bottom:12px;left:12px}.jROsYq_hallGuide{z-index:5;border:1px solid color-mix(in srgb, #d4af37 45%, var(--dsw-alias-border-l2));color:#e8eef8;background:#12161af0;border-radius:12px;align-items:center;gap:10px;max-width:calc(100% - 24px);padding:7px 8px 7px 12px;font-size:11px;line-height:1.55;animation:.2s ease-out jROsYq_officeHintIn;display:flex;position:absolute;bottom:14px;left:50%;transform:translate(-50%);box-shadow:0 8px 24px #00000061}.jROsYq_hallGuide span{flex:auto}.jROsYq_hallGuide button{color:#ffe9a8;background:#d4af3724;border:1px solid #d4af378c;border-radius:8px;flex:none;padding:4px 9px;font-size:10.5px;font-weight:600}.jROsYq_hallGuide button:hover{background:#d4af3742}.jROsYq_heading{flex-wrap:wrap;align-items:center;gap:6px 8px;margin-bottom:8px;display:flex}.jROsYq_heading img{object-fit:contain;width:26px;height:26px}.jROsYq_heading h2{letter-spacing:-.4px;margin:0;font-size:15px;font-weight:650}.jROsYq_heading>span{color:var(--dsw-alias-label-secondary);font-size:11px}.jROsYq_viewTabs{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 65%, var(--dsw-alias-bg-base));border-radius:9px;gap:2px;width:fit-content;margin:0 0 0 auto;padding:2px;display:flex}.jROsYq_viewTabs button{color:var(--dsw-alias-label-secondary);background:0 0;border:none;border-radius:6px;padding:4px 11px;font-size:11px;font-weight:600}.jROsYq_viewTabs button:hover{color:var(--dsw-alias-label-primary)}.jROsYq_viewTabs button[aria-selected=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px #0000002e}.jROsYq_stagedNotice{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-direction:column;align-items:flex-start;gap:10px;padding:20px;display:flex}.jROsYq_stagedNotice h3{margin:0;font-size:15px;font-weight:650}.jROsYq_stagedNotice p{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:1.7}.jROsYq_stagedNotice button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);border-radius:9px;padding:8px 14px;font-size:12px}.jROsYq_stagedNotice button:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_teamPicker{align-items:center;gap:6px;min-width:0;margin:0;display:inline-flex}.jROsYq_teamPickerCaption{color:var(--dsw-alias-label-secondary);white-space:nowrap;font-size:10px}.jROsYq_teamPickerSelect{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);max-width:230px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;padding:4px 8px;font-size:11px}.jROsYq_teamPickerSelect:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.jROsYq_root button{cursor:pointer;font-family:inherit}.jROsYq_empty button,.jROsYq_error button{color:inherit}.jROsYq_root button:active{transform:scale(.98)}.jROsYq_root button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}.jROsYq_empty{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:18px;padding:32px 24px}.jROsYq_emptyMark{width:44px;height:44px;color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent);border-radius:13px;place-items:center;font-size:26px;display:grid}.jROsYq_empty h3{margin:20px 0 10px;font-size:16px;font-weight:600}.jROsYq_empty p{max-width:45ch;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.8}.jROsYq_empty button,.jROsYq_error button{background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:9px;padding:9px 13px;font-size:12px}.jROsYq_empty button:hover,.jROsYq_error button:hover{border-color:var(--dsw-alias-state-business-primary)}.jROsYq_error{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, var(--dsw-alias-border-l2));background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-wrap:wrap;align-items:start;gap:12px;margin-bottom:18px;padding:14px;font-size:12px;line-height:1.65;display:flex}.jROsYq_error>span{flex:180px}.jROsYq_error button{flex:none}.jROsYq_skeleton{gap:14px;display:grid}.jROsYq_skeleton i{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:16px;height:130px;animation:1.8s ease-in-out infinite alternate jROsYq_breathe}.jROsYq_skeleton i:first-child{height:74px}.jROsYq_skeleton i:last-child{animation-delay:.3s}@keyframes jROsYq_breathe{to{opacity:.45}}@container jROsYq_team-workspace (width>=720px){.jROsYq_content{padding:24px 24px 32px}.jROsYq_heading{margin-bottom:24px}}@media (prefers-reduced-motion:reduce){.jROsYq_skeleton i{animation:none}.jROsYq_root button{transition:none}.jROsYq_sheet,.jROsYq_scrim,.jROsYq_hallGuide{animation:none}}.jROsYq_teamPickerSelect[data-current=true]{color:#4ec98a;background:color-mix(in srgb, #4ec98a 10%, var(--dsw-alias-bg-layer-1));border-color:#4ec98a}";
		const tagId = "agent-teams-pixel/WorkspaceActivity.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "agent-teams-pixel";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WorkspaceActivity_module_css_default = {
			"breathe": "jROsYq_breathe",
			"content": "jROsYq_content",
			"empty": "jROsYq_empty",
			"emptyMark": "jROsYq_emptyMark",
			"error": "jROsYq_error",
			"hallGuide": "jROsYq_hallGuide",
			"hallHint": "jROsYq_hallHint",
			"heading": "jROsYq_heading",
			"inboxFrom": "jROsYq_inboxFrom",
			"inboxList": "jROsYq_inboxList",
			"inboxRow": "jROsYq_inboxRow",
			"inboxText": "jROsYq_inboxText",
			"officeHint": "jROsYq_officeHint",
			"officeHintIn": "jROsYq_officeHintIn",
			"root": "jROsYq_root",
			"scrim": "jROsYq_scrim",
			"scrimIn": "jROsYq_scrimIn",
			"sheet": "jROsYq_sheet",
			"sheetBack": "jROsYq_sheetBack",
			"sheetBody": "jROsYq_sheetBody",
			"sheetClose": "jROsYq_sheetClose",
			"sheetEmpty": "jROsYq_sheetEmpty",
			"sheetFloatIn": "jROsYq_sheetFloatIn",
			"sheetGrip": "jROsYq_sheetGrip",
			"sheetHead": "jROsYq_sheetHead",
			"sheetHint": "jROsYq_sheetHint",
			"sheetMeta": "jROsYq_sheetMeta",
			"sheetSection": "jROsYq_sheetSection",
			"sheetTitle": "jROsYq_sheetTitle",
			"skeleton": "jROsYq_skeleton",
			"stage": "jROsYq_stage",
			"stageError": "jROsYq_stageError",
			"stagedNotice": "jROsYq_stagedNotice",
			"stagedRibbon": "jROsYq_stagedRibbon",
			"team-workspace": "jROsYq_team-workspace",
			"teamList": "jROsYq_teamList",
			"teamPicker": "jROsYq_teamPicker",
			"teamPickerCaption": "jROsYq_teamPickerCaption",
			"teamPickerSelect": "jROsYq_teamPickerSelect",
			"teamRow": "jROsYq_teamRow",
			"teamRowCount": "jROsYq_teamRowCount",
			"teamRowName": "jROsYq_teamRowName",
			"teamRowState": "jROsYq_teamRowState",
			"viewTabs": "jROsYq_viewTabs"
		};
		//#endregion
		//#region lib/client/WorkspaceActivity.js
		/** Native workspace content; discovery remains mounted independently of tab lifetime. */
		const TEAM_TAB_KIND = "agent-teams";
		const TEAM_TAB_ID = "agent-teams-pixel/activity";
		/** Persisted history-page preference: progress board vs setup page. */
		const WORKSPACE_VIEW_KEY = "agent-teams-pixel.workspaceView";
		/** Floating panel geometry remembered across opens: offset + user-resized size. */
		const SHEET_RECT_KEY = "agent-teams-pixel.sheetRect";
		function readSheetRect() {
			if (typeof window === "undefined") return {
				x: 0,
				y: 0
			};
			try {
				const raw = window.localStorage.getItem(SHEET_RECT_KEY);
				if (raw === null) return {
					x: 0,
					y: 0
				};
				const parsed = JSON.parse(raw);
				return {
					x: typeof parsed.x === "number" && Number.isFinite(parsed.x) ? parsed.x : 0,
					y: typeof parsed.y === "number" && Number.isFinite(parsed.y) ? parsed.y : 0,
					w: typeof parsed.w === "number" && parsed.w > 200 ? parsed.w : void 0,
					h: typeof parsed.h === "number" && parsed.h > 120 ? parsed.h : void 0
				};
			} catch {
				return {
					x: 0,
					y: 0
				};
			}
		}
		function writeSheetRect(rect) {
			try {
				window.localStorage.setItem(SHEET_RECT_KEY, JSON.stringify(rect));
			} catch {}
		}
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
			return (0, react_jsx_runtime.jsx)(WorkspaceMonitor, {
				...props,
				sidebar,
				state
			});
		}
		function WorkspaceMonitor({ sessionsList, sidebar, state, t, openMember, openCaptain, modelDirectories }) {
			const current = currentSessionId((0, react.useSyncExternalStore)(sessionsList.subscribe, sessionsList.getSnapshot));
			const snapshots = (0, react.useSyncExternalStore)(subscribeActivitySnapshots, getActivitySnapshotsSnapshot);
			const local = (0, react.useSyncExternalStore)(state.subscribe, state.getSnapshot);
			const sessionTeams = current === void 0 ? [] : snapshots.teams.filter((team) => team.captainSessionId === current);
			const wanted = current === void 0 ? void 0 : local.selected.get(current);
			(0, react.useEffect)(() => {
				ingestCultivation(snapshots.teams, current);
			}, [snapshots, current]);
			const linkedTeam = current === void 0 ? void 0 : [...snapshots.teams, ...snapshots.archivedTeams].find((team) => team.members.some((member) => member.id === current));
			const hallTeam = sessionTeams.find((team) => team.teamId === wanted) ?? sessionTeams[0] ?? linkedTeam;
			const ownerCaptain = hallTeam?.captainSessionId ?? current;
			const historyTeams = ownerCaptain === void 0 ? [] : snapshots.archivedTeams.filter((team) => team.captainSessionId === ownerCaptain);
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
						if (added === void 0) return;
						if (!shouldRevealTeam({
							source: "discovered",
							sessionId: current,
							onScreenSessionId: sidebar?.mounted.getSnapshot() ?? current,
							teamId: added,
							expanded: sidebar?.isExpanded() ?? false
						})) return;
						state.select(current, added);
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
					if (current === void 0) return;
					if (sidebar !== void 0 && sidebar.mounted.getSnapshot() !== current) return;
					const data = event.detail;
					if (data?.captainSessionId && data.captainSessionId !== current) return;
					if (data?.teamId) state.remember(current, data);
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
			(0, react.useEffect)(() => {
				const reveal = (event) => {
					if (current === void 0) return;
					const teamId = event.detail?.teamId;
					if (teamId === void 0) return;
					if (!shouldRevealTeam({
						source: "created",
						sessionId: current,
						onScreenSessionId: sidebar?.mounted.getSnapshot() ?? current,
						teamId,
						expanded: sidebar?.isExpanded() ?? false
					})) return;
					state.select(current, teamId);
					window.dispatchEvent(new CustomEvent(OPEN_HALL_SHEET_EVENT, { detail: { action: "config" } }));
				};
				window.addEventListener(TEAM_CREATED_EVENT, reveal);
				return () => {
					window.removeEventListener(TEAM_CREATED_EVENT, reveal);
				};
			}, [
				current,
				sidebar,
				state
			]);
			return (0, react_jsx_runtime.jsx)(SectHallOverlay, {
				team: hallTeam,
				history: historyTeams,
				t,
				sessionId: current,
				modelDirectories,
				openMember,
				openCaptain,
				sidebar,
				tabKind: TEAM_TAB_KIND
			});
		}
		/** The team tab: the sect hall is the page, its wall facilities are the menu. */
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
			const [sheet, setSheet] = (0, react.useState)();
			const sheetRef = (0, react.useRef)(null);
			const rootRef = (0, react.useRef)(null);
			const [sheetRight, setSheetRight] = (0, react.useState)(16);
			(0, react.useEffect)(() => {
				if (sheet === void 0) return;
				const measure = () => {
					const root = rootRef.current;
					const paneLeft = root === null ? window.innerWidth : root.getBoundingClientRect().left;
					setSheetRight(Math.max(16, Math.round(window.innerWidth - paneLeft + 16)));
				};
				measure();
				window.addEventListener("resize", measure);
				return () => {
					window.removeEventListener("resize", measure);
				};
			}, [sheet]);
			const [sheetOffset, setSheetOffset] = (0, react.useState)(() => {
				const rect = readSheetRect();
				return {
					x: rect.x,
					y: rect.y
				};
			});
			const [sheetSize, setSheetSize] = (0, react.useState)(() => {
				const rect = readSheetRect();
				return {
					w: rect.w,
					h: rect.h
				};
			});
			const sheetOffsetRef = (0, react.useRef)(sheetOffset);
			sheetOffsetRef.current = sheetOffset;
			const sheetSizeRef = (0, react.useRef)(sheetSize);
			sheetSizeRef.current = sheetSize;
			const sheetDrag = (0, react.useRef)(null);
			const beginSheetDrag = (event) => {
				if (event.target.closest("button") !== null) return;
				const panel = sheetRef.current;
				if (panel === null) return;
				event.preventDefault();
				const pr = panel.getBoundingClientRect();
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;
				const relLeft = pr.left;
				const relTop = pr.top;
				const minX = sheetOffset.x + (8 - relLeft);
				const maxX = sheetOffset.x + (viewportWidth - 8 - (relLeft + pr.width));
				const minY = sheetOffset.y + (8 - relTop);
				const maxY = sheetOffset.y + (viewportHeight - 8 - (relTop + pr.height));
				const clampAxis = (low, high, base) => high < low ? [base, base] : [low, high];
				const [clampedMinX, clampedMaxX] = clampAxis(minX, maxX, sheetOffset.x);
				const [clampedMinY, clampedMaxY] = clampAxis(minY, maxY, sheetOffset.y);
				sheetDrag.current = {
					startX: event.clientX,
					startY: event.clientY,
					baseX: sheetOffset.x,
					baseY: sheetOffset.y,
					minX: clampedMinX,
					maxX: clampedMaxX,
					minY: clampedMinY,
					maxY: clampedMaxY
				};
				const onMove = (moveEvent) => {
					const drag = sheetDrag.current;
					if (drag === null) return;
					const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
					setSheetOffset({
						x: clamp(drag.baseX + (moveEvent.clientX - drag.startX), drag.minX, drag.maxX),
						y: clamp(drag.baseY + (moveEvent.clientY - drag.startY), drag.minY, drag.maxY)
					});
				};
				const onUp = () => {
					sheetDrag.current = null;
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					writeSheetRect({
						...sheetOffsetRef.current,
						...sheetSizeRef.current
					});
				};
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
			};
			(0, react.useEffect)(() => {
				if (sheet === void 0) return;
				const frame = window.requestAnimationFrame(() => {
					const panel = sheetRef.current;
					if (panel === null) return;
					const pr = panel.getBoundingClientRect();
					const vw = window.innerWidth;
					const vh = window.innerHeight;
					if (!(pr.bottom > 0 && pr.top < vh && pr.right > 0 && pr.left < vw)) {
						setSheetOffset({
							x: 0,
							y: 0
						});
						return;
					}
					setSheetOffset((current) => {
						const lowX = current.x + (8 - pr.left);
						const highX = current.x + (vw - 8 - pr.right);
						const lowY = current.y + (8 - pr.top);
						const highY = current.y + (vh - 8 - pr.bottom);
						return {
							x: highX < lowX ? current.x : Math.min(highX, Math.max(lowX, current.x)),
							y: highY < lowY ? current.y : Math.min(highY, Math.max(lowY, current.y))
						};
					});
				});
				return () => {
					window.cancelAnimationFrame(frame);
				};
			}, [sheet]);
			(0, react.useEffect)(() => {
				const panel = sheetRef.current;
				if (sheet === void 0 || panel === null || typeof ResizeObserver === "undefined") return;
				let timer;
				const observer = new ResizeObserver(() => {
					if (timer !== void 0) window.clearTimeout(timer);
					timer = window.setTimeout(() => {
						const rect = panel.getBoundingClientRect();
						const next = {
							w: Math.round(rect.width),
							h: Math.round(rect.height)
						};
						setSheetSize((current) => Math.abs((current.w ?? 0) - next.w) > 1 || Math.abs((current.h ?? 0) - next.h) > 1 ? next : current);
						writeSheetRect({
							...sheetOffsetRef.current,
							...next
						});
					}, 400);
				});
				observer.observe(panel);
				return () => {
					if (timer !== void 0) window.clearTimeout(timer);
					observer.disconnect();
				};
			}, [sheet]);
			(0, react.useEffect)(() => {
				if (sheet === void 0) return;
				const frame = window.requestAnimationFrame(() => {
					sheetRef.current?.focus();
				});
				return () => {
					window.cancelAnimationFrame(frame);
				};
			}, [sheet]);
			(0, react.useEffect)(() => {
				if (sheet === void 0) return;
				const close = (event) => {
					if (event.key === "Escape") setSheet(void 0);
				};
				window.addEventListener("keydown", close);
				return () => {
					window.removeEventListener("keydown", close);
				};
			}, [sheet]);
			(0, react.useEffect)(() => {
				const open = (event) => {
					const action = event.detail?.action;
					if (action !== void 0) setSheet(action);
				};
				window.addEventListener(OPEN_HALL_SHEET_EVENT, open);
				return () => {
					window.removeEventListener(OPEN_HALL_SHEET_EVENT, open);
				};
			}, []);
			const live = snapshots.teams.filter((team) => team.captainSessionId === sessionId);
			const archived = snapshots.archivedTeams.filter((team) => team.captainSessionId === sessionId && !live.some((item) => item.teamId === team.teamId));
			const historic = [...local.history.values()].filter((team) => team.captainSessionId === sessionId && !live.some((item) => item.teamId === team.teamId) && !archived.some((item) => item.teamId === team.teamId)).map((team) => historicCardTeam(team, sessionId));
			const records = [
				...live,
				...archived,
				...historic
			];
			const linked = records.length === 0 ? [...snapshots.teams, ...snapshots.archivedTeams].find((team) => team.members.some((member) => member.id === sessionId)) : void 0;
			const candidates = linked === void 0 ? records : [linked];
			const selected = candidates.find((team) => team.teamId === local.selected.get(sessionId)) ?? candidates[0];
			const liveSelected = selected !== void 0 && (live.includes(selected) || snapshots.teams.some((team) => team.teamId === selected.teamId));
			const history = selected !== void 0 && !liveSelected;
			const status = local.statuses.get(sessionId) ?? "loading";
			const completedCount = selected === void 0 ? 0 : selected.tasks.filter((task) => task.status === "completed").length;
			(0, react.useEffect)(() => {
				const onCreated = (event) => {
					const detail = event.detail;
					if (detail?.teamId === void 0) return;
					state.select(sessionId, detail.teamId);
					setSheet("config");
				};
				window.addEventListener(TEAM_CREATED_EVENT, onCreated);
				return () => {
					window.removeEventListener(TEAM_CREATED_EVENT, onCreated);
				};
			}, [sessionId, state]);
			const lastTeamRef = (0, react.useRef)(void 0);
			const lastPhaseRef = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (selected === void 0 || !liveSelected) return;
				if (lastTeamRef.current !== selected.teamId) {
					lastTeamRef.current = selected.teamId;
					setSheet(selected.phase === "staged" ? "config" : void 0);
				} else if (lastPhaseRef.current === "staged" && selected.phase === "running") setSheet(void 0);
				lastPhaseRef.current = selected.phase;
			}, [
				liveSelected,
				selected?.teamId,
				selected?.phase
			]);
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
			const sheetTitle = (kind) => t(kind === "board" ? "workspace.tabBoard" : kind === "config" ? "workspace.tabConfig" : kind === "teams" ? "workspace.switchTeam" : "workspace.inbox");
			const sheetBody = (kind, team) => {
				if (team === void 0) return null;
				if (kind === "config") return live.includes(team) && team.phase === "staged" ? (0, react_jsx_runtime.jsx)(StagingPlanEditor, {
					team,
					modelDirectory: modelDirectories.directoryFor(sessionId),
					onContinuePlanning: backToChat,
					onDiscarded: backToChat,
					t
				}) : (0, react_jsx_runtime.jsx)(TeamConfigPanel, {
					team,
					t
				});
				if (kind === "board") {
					if (live.includes(team) && team.phase === "staged") return (0, react_jsx_runtime.jsxs)("section", {
						className: WorkspaceActivity_module_css_default.stagedNotice,
						"data-staged-notice": true,
						children: [
							(0, react_jsx_runtime.jsx)("h3", { children: t("config.stagedTitle") }),
							(0, react_jsx_runtime.jsx)("p", { children: t("config.stagedBody") }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setSheet("config");
								},
								children: t("config.openConfig")
							})
						]
					});
					return (0, react_jsx_runtime.jsx)(TeamSection, {
						team,
						workspace: true,
						viewingSessionId: sessionId,
						historic: !live.includes(team),
						modelDirectory: team.phase === "staged" ? modelDirectories.directoryFor(sessionId) : void 0,
						onContinuePlanning: backToChat,
						onDiscarded: backToChat,
						onNavigate: openMember,
						t
					}, `${sessionId}:${team.teamId}`);
				}
				if (kind === "teams") return (0, react_jsx_runtime.jsxs)("div", {
					className: WorkspaceActivity_module_css_default.sheetSection,
					children: [
						(0, react_jsx_runtime.jsx)("p", {
							className: WorkspaceActivity_module_css_default.sheetHint,
							children: t("office.teamsHint")
						}),
						(0, react_jsx_runtime.jsx)("ul", {
							className: WorkspaceActivity_module_css_default.teamList,
							children: records.map((team) => {
								const current = selected !== void 0 && team.teamId === selected.teamId;
								const isLive = live.includes(team);
								const done = team.tasks.filter((task) => task.status === "completed").length;
								const stateLabel = isLive ? t(team.phase === "staged" ? "captain.state.staged" : team.halted === true ? "team.stopped" : done === team.tasks.length && team.tasks.length > 0 ? "team.state.completed" : "team.state.running") : t("workspace.history");
								return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: WorkspaceActivity_module_css_default.teamRow,
									"data-current": current || void 0,
									"aria-current": current ? "true" : void 0,
									onClick: () => {
										state.select(sessionId, team.teamId);
										setSheet(void 0);
									},
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: WorkspaceActivity_module_css_default.teamRowName,
											children: team.name
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: WorkspaceActivity_module_css_default.teamRowState,
											children: stateLabel
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: WorkspaceActivity_module_css_default.teamRowCount,
											children: t("team.stats.completed", {
												completed: done,
												total: team.tasks.length
											})
										})
									]
								}) }, team.teamId);
							})
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: WorkspaceActivity_module_css_default.sheetBack,
							onClick: backToChat,
							children: t("workspace.back")
						})
					]
				});
				if (team.captainInbox.length === 0) return (0, react_jsx_runtime.jsx)("p", {
					className: WorkspaceActivity_module_css_default.sheetEmpty,
					children: t("workspace.inboxEmpty")
				});
				return (0, react_jsx_runtime.jsxs)("div", {
					className: WorkspaceActivity_module_css_default.sheetSection,
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: WorkspaceActivity_module_css_default.sheetHint,
						children: t("office.inboxCount", { count: team.captainInbox.length })
					}), (0, react_jsx_runtime.jsx)("ul", {
						className: WorkspaceActivity_module_css_default.inboxList,
						children: team.captainInbox.map((message, index) => (0, react_jsx_runtime.jsxs)("li", {
							className: WorkspaceActivity_module_css_default.inboxRow,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: WorkspaceActivity_module_css_default.inboxFrom,
								children: message.from
							}), (0, react_jsx_runtime.jsx)("span", {
								className: WorkspaceActivity_module_css_default.inboxText,
								children: message.content
							})]
						}, `${index}:${message.from}`))
					})]
				});
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: WorkspaceActivity_module_css_default.root,
				"data-agent-teams-workspace": true,
				"data-session-id": sessionId,
				children: [
					selected !== void 0 && liveSelected && status === "error" && (0, react_jsx_runtime.jsxs)("div", {
						className: WorkspaceActivity_module_css_default.stageError,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("workspace.error") }), (0, react_jsx_runtime.jsx)("button", {
							onClick: () => setRetry((value) => value + 1),
							children: t("workspace.retry")
						})]
					}),
					selected === void 0 ? status === "loading" ? (0, react_jsx_runtime.jsx)("div", {
						className: WorkspaceActivity_module_css_default.content,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: WorkspaceActivity_module_css_default.skeleton,
							role: "status",
							"aria-label": t("workspace.loading"),
							children: [
								(0, react_jsx_runtime.jsx)("i", {}),
								(0, react_jsx_runtime.jsx)("i", {}),
								(0, react_jsx_runtime.jsx)("i", {})
							]
						})
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: WorkspaceActivity_module_css_default.content,
						children: (0, react_jsx_runtime.jsxs)("section", {
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
						})
					}) : liveSelected ? (0, react_jsx_runtime.jsx)("div", {
						className: WorkspaceActivity_module_css_default.content,
						"data-workspace-board": true,
						children: (0, react_jsx_runtime.jsx)(TeamSection, {
							team: selected,
							t,
							workspace: true,
							viewingSessionId: sessionId,
							onNavigate: (_parent, child) => {
								openMember(selected.captainSessionId, child);
							},
							onContinuePlanning: backToChat,
							onDiscarded: backToChat
						})
					}) : (0, react_jsx_runtime.jsxs)("div", {
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
											value: selected.teamId,
											"aria-label": t("workspace.switchTeam"),
											"data-control": "team-picker",
											"data-current": history ? void 0 : "true",
											onChange: (event) => {
												state.select(sessionId, event.target.value);
											},
											children: records.map((team) => (0, react_jsx_runtime.jsx)("option", {
												value: team.teamId,
												children: live.includes(team) ? team.name : `${team.name} · ${t("workspace.history")}`
											}, team.teamId))
										})]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
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
							view === "config" ? selected.phase === "staged" ? (0, react_jsx_runtime.jsx)(StagingPlanEditor, {
								team: selected,
								modelDirectory: modelDirectories.directoryFor(sessionId),
								onContinuePlanning: backToChat,
								onDiscarded: backToChat,
								t
							}) : (0, react_jsx_runtime.jsx)(TeamConfigPanel, {
								team: selected,
								t
							}) : selected.phase === "staged" ? (0, react_jsx_runtime.jsxs)("section", {
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
								historic: history,
								viewingSessionId: sessionId,
								onContinuePlanning: backToChat,
								onDiscarded: backToChat,
								onNavigate: openMember,
								t
							}, `${sessionId}:${selected.teamId}`)
						]
					}),
					selected !== void 0 && sheet !== void 0 && typeof document !== "undefined" && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("aside", {
						ref: sheetRef,
						className: WorkspaceActivity_module_css_default.sheet,
						"data-sheet": sheet,
						role: "dialog",
						"aria-modal": "false",
						"aria-label": sheetTitle(sheet),
						tabIndex: -1,
						style: {
							"--sheet-dx": `${sheetOffset.x}px`,
							"--sheet-dy": `${sheetOffset.y}px`,
							right: `${sheetRight}px`,
							...sheetSize.w === void 0 ? {} : { width: `${sheetSize.w}px` },
							...sheetSize.h === void 0 ? {} : { height: `${sheetSize.h}px` }
						},
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: WorkspaceActivity_module_css_default.sheetHead,
							onPointerDown: beginSheetDrag,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: WorkspaceActivity_module_css_default.sheetGrip,
									"aria-hidden": true,
									children: "⠿"
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: WorkspaceActivity_module_css_default.sheetTitle,
									children: sheetTitle(sheet)
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: WorkspaceActivity_module_css_default.sheetMeta,
									children: [
										selected.name,
										" · ",
										t("team.stats.completed", {
											completed: completedCount,
											total: selected.tasks.length
										})
									]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: WorkspaceActivity_module_css_default.sheetClose,
									"data-control": "sheet-close",
									"aria-label": t("office.closePanel"),
									title: t("office.closePanel"),
									onClick: () => {
										setSheet(void 0);
									},
									children: "×"
								})
							]
						}), (0, react_jsx_runtime.jsx)("div", {
							className: WorkspaceActivity_module_css_default.sheetBody,
							children: sheetBody(sheet, selected)
						})]
					}), document.body)
				]
			});
		}
		//#endregion
		//#region lib/client/agent-teams-card-definition.js
		/**
		* AgentTeams conversation card: a lightweight in-conversation summary shown
		* when a team is created — the captain's name, the member roster with 道途
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
		//#region lib/client/locales.js
		/** `agentTeams` namespace dictionaries for every plugin-owned Web surface. */
		/** Dictionary namespace owned by the AgentTeams client plugin. */
		const AGENT_TEAMS_LOCALE_NAMESPACE = "agentTeams";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"workspace.dependencies": "从左到右：完成前置后解锁 · 点击查看详情",
			"workspace.title": "宗门协作",
			"workspace.guide": "查看修士分工、任务依赖与执行进度",
			"workspace.eyebrow": "修仙大世界",
			"workspace.description": "掌门统筹分工，修士按任务依赖并行协作。",
			"workspace.relationships": "掌门协调修士分工；任务连线表示前置依赖。点击任务可定位负责修士。",
			"workspace.emptyTitle": "当前会话还没有宗门",
			"workspace.emptyBody": "点右上角「开宗立派」，或在聊天里描述目标并确认计划，就能在这里查看宗门进度。",
			"workspace.loading": "正在读取宗门状态",
			"workspace.error": "暂时无法连接宗门服务，正在自动重试。已加载的状态可能不是最新。",
			"workspace.retry": "重新连接",
			"workspace.current": "当前宗门",
			"workspace.history": "历史记录",
			"workspace.back": "返回对话",
			"workspace.tasks": "项任务",
			"workspace.members": "名修士",
			"workspace.completed": "已了结",
			"workspace.focus": "查看宗门",
			"workspace.noTasks": "等待掌门拆解任务",
			"workspace.inbox": "掌门收件箱",
			"workspace.inboxHint": "最近 5 条未读消息",
			"workspace.inboxEmpty": "暂无未读消息。修士回报会在这里显示，掌门读取后移出。",
			"workspace.taskSummary": "任务完成情况",
			"workspace.verdictStale": "结论已过期",
			"card.memberCount": "{count} 名修士",
			"card.comms": "掌门 ↔ 修士 · 实时",
			"card.task.start": "任务开始 · {taskId} · {assignee}",
			"card.task.completed": "任务完成 · {taskId} · {assignee}",
			"card.task.failed": "任务失败 · {taskId} · {assignee}",
			"action.openActivityPanel": "打开活动面板",
			"activity.panelButton": "活动面板",
			"activity.badgeAria": "修仙大世界活动与历史，{count} 条宗门记录",
			"activity.panelAria": "修仙大世界活动面板",
			"activity.title": "宗门活动",
			"activity.float": "切换为浮动面板",
			"activity.dockRight": "停靠到右侧",
			"activity.collapse": "收起活动面板",
			"activity.empty": "暂无宗门活动",
			"team.stop": "停止宗门",
			"team.stopped": "已停止",
			"team.stopTitle": "确认停止“{team}”？",
			"team.stopDescription": "将取消 {tasks} 项未完成任务，并停止 {members} 名正在工作的修士。已了结的结果会保留。",
			"team.stopCancel": "继续运行",
			"team.stopConfirm": "确认停止",
			"team.stopping": "正在停止…",
			"team.stopFailed": "停止道基受损：{message}",
			"team.stopRequestFailed": "服务器未能停止宗门，请重试",
			"team.state.running": "任务中",
			"team.state.completed": "已完成",
			"team.resume": "重新开始",
			"team.resuming": "正在恢复…",
			"team.resumeReason": "从宗门面板重新开始",
			"team.resumeFailed": "恢复失败：{message}",
			"team.discarded": "已放弃",
			"format.listSeparator": "、",
			"task.status.pending": "待接令",
			"task.status.claimed": "已认领",
			"task.status.inProgress": "进行中",
			"task.status.completed": "已了结",
			"task.status.failed": "道基受损",
			"task.status.cancelled": "已弃",
			"task.status.notRun": "未执行",
			"member.state.working": "修炼中",
			"member.state.failed": "有道基受损",
			"member.state.waiting": "等待",
			"member.state.delivered": "已了结",
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
			"member.rel.handoff": "交给 {name} · {taskId}",
			"member.status.waitingPrerequisite": "等待前置任务",
			"member.status.waitingAssignment": "等待掌门派工",
			"member.status.delivered": "任务已了结",
			"member.status.idle": "待继续执行",
			"member.status.unknown": "状态未知",
			"member.status.staged": "确认后创建并启动",
			"member.status.settled": "任务均已终结",
			"member.status.discarded": "计划已放弃，未创建",
			"member.status.stopped": "宗门已停止，需显式恢复",
			"task.assignee.unclaimed": "待认领",
			"task.summary.waitingBreakdown": "等待掌门拆解任务",
			"task.summary.staged": "{count} 项计划等待确认",
			"task.summary.discarded": "{count} 项计划已放弃，均未执行",
			"task.summary.allDelivered": "全部 {count} 项任务已了结",
			"task.summary.ended": "终态：{completed} 已了结 · {cancelled} 已弃 · {failed} 道基受损",
			"task.summary.blockedAndRunning": "{tasks}{more} 等待前置，其余已开工",
			"task.summary.more": " 等 {count} 项",
			"task.summary.running": "{tasks} 正在执行",
			"task.summary.claimed": "已认领：{tasks}",
			"task.summary.ready": "{tasks} 已就绪待开工",
			"task.summary.blocked": "{tasks} 等待前置",
			"task.summary.failedSettled": "{count} 项已道基受损，自动循环已停止",
			"task.summary.waitingSchedule": "等待下一轮调度",
			"progress.aria": "宗门气运",
			"progress.title": "宗门气运",
			"progress.running": "■ 进行中 {count}",
			"progress.claimed": "■ 已认领 {count}",
			"progress.blocked": "■ 等待依赖 {count}",
			"progress.delivered": "■ 已了结 {count}",
			"dependency.aria": "任务依赖链",
			"dependency.viewAria": "依赖图样式",
			"dependency.viewDat": "DAT 版",
			"dependency.viewFlow": "拓扑流",
			"dependency.parallel": "并行历练",
			"dependency.title": "任务依赖",
			"dependency.hint.parallel": "无前后依赖 · 点击查看详情",
			"dependency.hint.chain": "悬停高亮依赖链 · 点击固定",
			"dependency.hint.pinned": "{taskId} 已固定 · Esc 取消",
			"task.runningAria": "运行中",
			"task.model": "{model}",
			"task.detail.cancelled": "任务已弃，不会继续执行",
			"task.detail.failed": "任务道基受损，等待明确重试",
			"task.detail.completed": "已了结并交付",
			"task.detail.noPrerequisite": "无前置，可立即开工",
			"task.detail.ready": "前置已就绪，可开工",
			"task.detail.waitingOn": "等待 {tasks}",
			"task.detail.notRun": "计划已放弃，任务未执行",
			"task.detail.noDownstream": "无下游任务",
			"task.detail.unlocks": "完成后解锁 {tasks}",
			"team.ended": "已结束",
			"plan.badge": "待确认",
			"plan.title": "执行前计划审查",
			"plan.description": "修士尚未创建、任务尚未调度。可直接调整计划，也可返回对话告诉掌门哪里需要修改。",
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
			"plan.model.triggerAria": "选择修士模型，当前 {model}，推理等级 {effort}",
			"plan.model.back": "返回",
			"plan.model.loading": "正在加载模型…",
			"plan.model.empty": "暂无可用模型",
			"plan.model.partialFailure": "{count} 个 Provider 的模型目录加载道基受损",
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
			"plan.readySummary": "{members} 名修士 · {tasks} 项任务 · {links} 条依赖",
			"plan.flow.aria": "宗门开启流程",
			"plan.flow.review": "审查计划",
			"plan.flow.spawn": "创建修士",
			"plan.flow.run": "开始执行",
			"plan.members.title": "修士与模型路由",
			"plan.members.count": "{count} 名修士",
			"plan.members.empty": "尚未规划修士",
			"plan.tasks.title": "任务与依赖",
			"plan.tasks.count": "{count} 项任务 · {links} 条依赖",
			"plan.tasks.empty": "尚未规划任务",
			"plan.dependencies.none": "无依赖",
			"plan.dependencies.count": "{count} 条依赖",
			"plan.approve": "确认并开启宗门",
			"plan.approving": "正在创建修士…",
			"plan.approveTitle": "计划检查完毕？",
			"plan.approveHint": "确认后将创建 {members} 名修士并调度 {tasks} 项任务。",
			"plan.approveConfirmTitle": "确认开启此宗门",
			"plan.approveWarning": "启动后不能再在此处编辑修士和依赖。",
			"plan.approveConfirm": "确认启动",
			"plan.continue": "返回对话修改",
			"plan.returnToChat": "回到对话",
			"plan.feedbackTitle": "正在等你说明修改方向",
			"plan.feedbackHint": "掌门会在对话中追问；收到你的回复后，只修改这份草案并再次等待确认。",
			"plan.discard": "放弃本次计划",
			"plan.discardConfirmTitle": "放弃本次计划？",
			"plan.discardWarning": "该计划会结束并归档；尚未创建任何修士，也不会执行任务。",
			"plan.discardConfirm": "确认放弃",
			"plan.discarding": "正在放弃…",
			"plan.pendingEdits": "请先保存当前修改，再开启宗门。",
			"plan.saved": "计划已保存",
			"plan.failed": "操作道基受损：{message}",
			"team.stats.members": "{count} 名修士",
			"team.stats.completed": "{completed}/{total} 完成",
			"team.stats.messages": "{count} 条消息",
			"delegation.aria": "掌门派工关系",
			"captain.name": "掌门",
			"captain.role": "拆解 · 派发 · 汇总",
			"captain.summary": "已派发 {tasks} 项任务给 {members} 名修士",
			"captain.summary.staged": "已规划 {tasks} 项任务与 {members} 名修士，等待确认",
			"captain.summary.awaitingFeedback": "草案已保留，等待你在对话中说明修改方向",
			"captain.summary.discarded": "计划已放弃：{members} 名修士未创建，{tasks} 项任务未执行",
			"captain.summary.withTakeover": "已派发 {tasks} 项给修士 · 掌门接管 {captainTasks}",
			"captain.state.working": "{count} 人执行中",
			"captain.state.takeover": "正在执行 {tasks}",
			"captain.state.collected": "已收齐",
			"captain.state.waiting": "等待回报",
			"captain.state.staged": "待确认",
			"captain.state.awaitingFeedback": "待反馈",
			"captain.state.discarded": "已放弃",
			"captain.state.settled": "已终结",
			"members.toggle": "{count} 名修士",
			"members.collapse": "收起",
			"members.expand": "展开",
			"members.expandFinished": "展开已结束（{count}）",
			"members.empty": "暂无修士，等待掌门组建宗门",
			"assignment.label": "掌门派发",
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
			"office.empty": "暂无修士",
			"office.captain": "掌门",
			"office.working": "修炼中",
			"office.idle": "静修",
			"office.unknown": "未知",
			"office.showBoard": "看板",
			"office.noConversation": "「{name}」暂无对话：任务开始后才会生成",
			"office.showOffice": "山门洞府",
			"office.hallEmptyName": "山门洞府",
			"office.hallNoTeam": "未开宗",
			"office.collapse": "收起山门洞府",
			"office.expand": "展开山门洞府",
			"office.resize": "拖动调整山门洞府高度",
			"office.hint": "点修士看会话；点山门、藏经阁、功德碑、传音阁打开对应面板",
			"office.hintShort": "点修士看会话 · 点墙上设施开面板",
			"office.dockSidebar": "归栏",
			"office.dockFloating": "浮空",
			"office.swordBox": "剑盒",
			"office.roster": "名册",
			"office.floorDoctrine": "道统",
			"office.floorProgress": "进度",
			"office.floorInbox": "收信",
			"office.floorSettings": "配置",
			"office.floorGear": "天机阁",
			"office.historyTeams": "历史宗门",
			"office.historyCurrent": "当前",
			"office.viewingState": "对话中",
			"office.levelUp": "升级！",
			"office.equipment": "装备",
			"office.weapon": "法器",
			"office.mounts": "坐骑",
			"office.inventory": "物品栏",
			"item.weapon.tao": "桃木剑",
			"item.weapon.spirit": "灵剑",
			"item.weapon.treasure": "灵宝",
			"item.weapon.immortal": "仙器",
			"item.weapon.divine": "神器",
			"item.weapon.core": "法宝",
			"item.weapon.spiritTreasure": "灵宝",
			"item.weapon.immortalHigh": "仙器",
			"item.weapon.trueImmortal": "真仙器",
			"item.weapon.dao": "道器",
			"item.mount.sword": "飞剑",
			"item.mount.beast": "灵兽",
			"item.mount.crane": "仙鹤",
			"item.mount.qilin": "麒麟",
			"item.mount.dragon": "神龙",
			"item.mount.jiao": "蛟龙",
			"item.mount.immortalCrane": "仙鹤",
			"item.mount.kirin": "麒麟",
			"item.mount.trueDragon": "真龙",
			"item.mount.phoenix": "凤凰",
			"item.mount.daoBeast": "道兽",
			"skill.swordArray": "剑阵",
			"skill.gale": "御风",
			"skill.law": "法相",
			"skill.swordQi": "剑气",
			"skill.pillFire": "丹火",
			"skill.infantFire": "婴火",
			"skill.divinePower": "神通",
			"skill.domain": "领域",
			"skill.dharma": "法相真身",
			"skill.immortalArt": "仙术",
			"skill.daoArt": "道法",
			"office.levelTest": "等级测试",
			"office.mountAuto": "自动",
			"office.mountSword": "御剑",
			"office.mountBeast": "神兽",
			"office.mountWalk": "步行",
			"office.skills": "已解锁",
			"skill.none": "尚未解锁",
			"skill.aura": "灵光护体",
			"skill.weapon": "本命法器",
			"skill.sword": "御剑术",
			"skill.shield": "护体灵盾",
			"skill.beast": "驭兽术",
			"skill.treasure": "灵宝",
			"office.viewingCaptain": "掌门 · 主对话",
			"office.viewingMember": "{name} · 修士对话",
			"office.viewingHint": "当前打开的是谁的对话",
			"office.newTask": "新建任务",
			"office.newTaskHint": "回到主对话框，告诉掌门要新建的任务",
			"office.historyPast": "历史",
			"office.taskHistory": "已完成任务",
			"office.historyEmpty": "暂无历史宗门或已了结任务",
			"office.scene.dockHint": "收起洞府，回到右侧栏",
			"office.scene.settingsHint": "调整面板大小与位置",
			"office.panelConfig": "面板配置",
			"office.panelSizeHint": "选择面板初始大小；也可拖面板右下角自由缩放。",
			"office.panelSize.compact": "紧凑",
			"office.panelSize.normal": "标准",
			"office.panelSize.large": "宽大",
			"office.panelSize.huge": "超大",
			"office.resetPosition": "重置位置",
			"office.chatter.1": "今日香火不错",
			"office.chatter.2": "等掌门派活",
			"office.chatter.3": "这炉丹快成了",
			"office.chatter.4": "剑意又进一寸",
			"office.chatter.5": "隔壁宗门好热闹",
			"office.chatter.6": "歇会儿再战",
			"office.chatter.7": "誊抄经卷中",
			"office.chatter.8": "谁在论道？",
			"office.sceneAria": "{name} 的山门洞府",
			"office.rail": "洞府操作",
			"office.closePanel": "收起面板",
			"office.guide": "点墙上的山门、藏经阁、功德碑、传音阁打开对应面板；点修士看他的会话。",
			"office.guideDismiss": "知道了",
			"office.teamsHint": "选中要查看的宗门；历史宗门只读。",
			"office.inboxCount": "{count} 条未读来音",
			"office.stagedReview": "审阅开宗计划",
			"office.facility.teams": "山门·名册",
			"office.facility.board": "功德碑·进度",
			"office.facility.config": "藏经阁·道统",
			"office.facility.gear": "天机阁·装备",
			"office.facility.inbox": "传音阁·收信",
			"office.action.teamsHint": "切换宗门、查看历史名册",
			"office.action.boardHint": "查看任务依赖与派发进度",
			"office.action.configHint": "查看成员、任务契约与开宗计划",
			"office.action.gearHint": "查看法器、坐骑与技能",
			"office.action.inboxHint": "查看掌门未读来音",
			"app.title": "修仙大世界",
			"quickstart.entry": "开宗",
			"quickstart.entryTitle": "不输入命令，点这里开宗立派",
			"quickstart.title": "开宗立派",
			"quickstart.desc": "选道统模板与修士，先生成开宗草案；你点「批准」后才会真正开山。",
			"quickstart.goal": "目标（写清验收标准更好）",
			"quickstart.goalPlaceholder": "例如：修复登录接口偶发 500，测试在 tests/auth",
			"quickstart.template": "任务模板",
			"quickstart.roles": "角色（多选，可自定义）",
			"quickstart.stepDoctrine": "道统",
			"quickstart.stepVow": "志向",
			"quickstart.stepSect": "宗门",
			"quickstart.stepOath": "立誓",
			"quickstart.doctrineHint": "先定道统：道统决定首批修士的职责配置，也决定山门立派后的行事风格。",
			"quickstart.vowHint": "写下立派之志：要解决什么、验收标准是什么。掌门会据此摆出开宗草案。",
			"quickstart.sectHint": "给宗门取个名号：随机重抽、挑一个现成门派，或自定道途。",
			"quickstart.oathHint": "立誓前再过一眼：确认道统、宗门与首批修士。",
			"quickstart.next": "下一步",
			"quickstart.back": "上一步",
			"quickstart.found": "立誓开宗",
			"quickstart.roleCount": "名修士",
			"quickstart.goalLength": "已写 {count} 字",
			"quickstart.goalShortcut": "Ctrl/⌘ + Enter 进入下一步",
			"quickstart.summaryDoctrine": "道统",
			"quickstart.summarySect": "宗门",
			"quickstart.summaryRoster": "首批修士",
			"quickstart.summaryVow": "立派之志",
			"quickstart.oathNotice": "立誓后只生成开宗草案；你在计划里点「批准」后，山门才会真正开工。",
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
			"role.talisman.name": "符修",
			"role.talisman.ability": "符箓与封印",
			"role.healer.name": "医修",
			"role.healer.ability": "疗伤与续命",
			"role.beastmaster.name": "驭兽师",
			"role.beastmaster.ability": "驭兽与侦察",
			"role.puppeteer.name": "傀儡师",
			"role.puppeteer.ability": "傀儡与操控",
			"role.musician.name": "音修",
			"role.musician.ability": "音律与扰乱",
			"role.poisoner.name": "毒修",
			"role.poisoner.ability": "用毒与克制",
			"role.monk.name": "佛修",
			"role.monk.ability": "禅定与护持",
			"role.demon.name": "魔修",
			"role.demon.ability": "魔道与险招",
			"sect.jian.name": "剑宗",
			"sect.jian.desc": "一剑破万法 · 主攻伐与执行",
			"sect.dan.name": "丹宗",
			"sect.dan.desc": "炼丹济世 · 主校验与疗伤",
			"sect.fuzhen.name": "符阵宗",
			"sect.fuzhen.desc": "符箓布阵 · 主封印与控制",
			"sect.mo.name": "魔宗",
			"sect.mo.desc": "魔道险招 · 出奇制胜",
			"sect.fo.name": "佛门",
			"sect.fo.desc": "禅定护持 · 稳中求进",
			"sect.sanxiu.name": "散修盟",
			"sect.sanxiu.desc": "三教九流 · 善取证推演",
			"sect.yushou.name": "御兽宗",
			"sect.yushou.desc": "驭兽音律 · 长于侦察巡查",
			"sect.lianqi.name": "炼器宗",
			"sect.lianqi.desc": "铸器交付 · 重构建发布",
			"quickstart.sect": "门派",
			"quickstart.sectRandom": "随机门派",
			"quickstart.sectCustom": "自定义",
			"quickstart.sectCustomHint": "手动挑选道途（可多选）",
			"quickstart.sectRolled": "随机到「{sect}」 · 再点一次重新抽",
			"quickstart.sectCustomPicked": "当前为自定义道途",
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
			"quickstart.teamExists": "当前会话已有宗门：请先在右栏「宗门协作」里继续或结束它，再开新宗。",
			"quickstart.cancel": "取消",
			"quickstart.submit": "生成草案",
			"quickstart.busy": "生成中…",
			"quickstart.goalRequired": "请先填写目标",
			"quickstart.created": "草案已生成：{team}（{sect}），请在右侧「宗门协作」中批准",
			"workspace.tabBoard": "宗门进度",
			"workspace.tabConfig": "道统配置",
			"workspace.switchTeam": "切换宗门",
			"config.team": "宗门",
			"config.phase": "阶段",
			"config.halted": "已停止",
			"realm.qi": "炼气",
			"realm.foundation": "筑基",
			"realm.golden": "结丹",
			"realm.nascent": "元婴",
			"realm.spirit": "化神",
			"realm.void": "炼虚",
			"realm.mahayana": "大乘",
			"realm.mortal": "凡人",
			"realm.integration": "合体",
			"realm.tribulation": "渡劫",
			"realm.trueImmortal": "真仙",
			"realm.goldenImmortal": "金仙",
			"realm.taiyi": "太乙",
			"realm.daluo": "大罗",
			"realm.dao": "道祖",
			"config.realm": "境界",
			"office.realm": "境界",
			"config.phaseStaged": "计划待批准",
			"config.phaseRunning": "进行中",
			"config.phaseCompleted": "已完成",
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
			"config.stagedHint": "计划尚未批准：先在「操作配置」里改修士与任务，再回到这里批准。",
			"config.hint": "运行中修士与任务为只读；调整请通过聊天让掌门处理。",
			"config.stagedTitle": "计划待批准",
			"config.stagedBody": "批准后才会创建修士、派发任务。",
			"config.openConfig": "去操作配置"
		};
		/** English dictionary, checked complete against the Chinese source key set. */
		const en = {
			"workspace.dependencies": "Left to right: prerequisites unlock tasks · Select for details",
			"workspace.title": "Sect hall",
			"workspace.guide": "Members, task dependencies, and execution progress",
			"workspace.eyebrow": "CULTIVATION WORLD",
			"workspace.description": "The captain coordinates. Members work in parallel as dependencies clear.",
			"workspace.relationships": "The captain coordinates members. Connections show task prerequisites. Select a task to locate its owner.",
			"workspace.emptyTitle": "No team in this conversation yet",
			"workspace.emptyBody": "Use the Found a sect button, or describe your goal in chat and approve the plan, to follow the sect here.",
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
			"card.comms": "Captain ↔ cultivators · live",
			"card.task.start": "Task started · {taskId} · {assignee}",
			"card.task.completed": "Task completed · {taskId} · {assignee}",
			"card.task.failed": "Task failed · {taskId} · {assignee}",
			"action.openActivityPanel": "Open activity panel",
			"activity.panelButton": "Activity panel",
			"activity.badgeAria": "Cultivation World activity and history, {count} sect records",
			"activity.panelAria": "Cultivation World activity panel",
			"activity.title": "Sect activity",
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
			"team.state.running": "In progress",
			"team.state.completed": "Completed",
			"team.resume": "Restart",
			"team.resuming": "Resuming…",
			"team.resumeReason": "Restarted from the sect panel",
			"team.resumeFailed": "Resume failed: {message}",
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
			"member.rel.handoff": "Hands off to {name} · {taskId}",
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
			"dependency.viewAria": "Diagram style",
			"dependency.viewDat": "Classic",
			"dependency.viewFlow": "Flow",
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
			"office.noConversation": "“{name}” has no conversation yet — one starts with the first task.",
			"office.showOffice": "Sect hall",
			"office.hallEmptyName": "Sect hall",
			"office.hallNoTeam": "No sect yet",
			"office.collapse": "Hide sect hall",
			"office.expand": "Show sect hall",
			"office.resize": "Drag to resize the sect hall",
			"office.hint": "Click a cultivator for their session; click the gate, library, stele or post for its panel",
			"office.hintShort": "Click a cultivator for their session · click a wall fixture for its panel",
			"office.dockSidebar": "Dock",
			"office.dockFloating": "Float",
			"office.swordBox": "Sword box",
			"office.roster": "Roster",
			"office.floorDoctrine": "Doctrine",
			"office.floorProgress": "Progress",
			"office.floorInbox": "Inbox",
			"office.floorSettings": "Settings",
			"office.floorGear": "Astral pavilion",
			"office.historyTeams": "Past sects",
			"office.historyCurrent": "Current",
			"office.viewingState": "In chat",
			"office.levelUp": "Level up!",
			"office.equipment": "Equipment",
			"office.weapon": "Artifacts",
			"office.mounts": "Mounts",
			"office.inventory": "Inventory",
			"item.weapon.tao": "Taoist sword",
			"item.weapon.spirit": "Spirit sword",
			"item.weapon.treasure": "Spirit treasure",
			"item.weapon.immortal": "Immortal artifact",
			"item.weapon.divine": "Divine artifact",
			"item.weapon.core": "Magic treasure",
			"item.weapon.spiritTreasure": "Spirit treasure",
			"item.weapon.immortalHigh": "Immortal artifact",
			"item.weapon.trueImmortal": "True-immortal artifact",
			"item.weapon.dao": "Dao artifact",
			"item.mount.sword": "Flying sword",
			"item.mount.beast": "Spirit beast",
			"item.mount.crane": "Immortal crane",
			"item.mount.qilin": "Qilin",
			"item.mount.dragon": "Divine dragon",
			"item.mount.jiao": "Jiao dragon",
			"item.mount.immortalCrane": "Immortal crane",
			"item.mount.kirin": "Kirin",
			"item.mount.trueDragon": "True dragon",
			"item.mount.phoenix": "Phoenix",
			"item.mount.daoBeast": "Dao beast",
			"skill.swordArray": "Sword array",
			"skill.gale": "Gale riding",
			"skill.law": "Dharma form",
			"skill.swordQi": "Sword qi",
			"skill.pillFire": "Pill fire",
			"skill.infantFire": "Infant fire",
			"skill.divinePower": "Divine power",
			"skill.domain": "Domain",
			"skill.dharma": "Dharma body",
			"skill.immortalArt": "Immortal art",
			"skill.daoArt": "Dao art",
			"office.levelTest": "Level test",
			"office.mountAuto": "Auto",
			"office.mountSword": "Sword",
			"office.mountBeast": "Beast",
			"office.mountWalk": "Walk",
			"office.skills": "Unlocked",
			"skill.none": "None yet",
			"skill.aura": "Spirit aura",
			"skill.weapon": "Natal artifact",
			"skill.sword": "Sword flight",
			"skill.shield": "Spirit shield",
			"skill.beast": "Beast taming",
			"skill.treasure": "Spirit treasure",
			"office.viewingCaptain": "Captain · main",
			"office.viewingMember": "{name} · cultivator",
			"office.viewingHint": "Whose conversation is currently open",
			"office.newTask": "New task",
			"office.newTaskHint": "Return to the main chat and tell the captain what task to create",
			"office.historyPast": "History",
			"office.taskHistory": "Completed work",
			"office.historyEmpty": "No past sects or finished work yet",
			"office.scene.dockHint": "Minimize the hall into the right sidebar",
			"office.scene.settingsHint": "Resize and reposition the panel",
			"office.panelConfig": "Panel settings",
			"office.panelSizeHint": "Pick the panel size; you can also drag its bottom-right corner to resize freely.",
			"office.panelSize.compact": "Compact",
			"office.panelSize.normal": "Normal",
			"office.panelSize.large": "Large",
			"office.panelSize.huge": "Huge",
			"office.resetPosition": "Reset position",
			"office.chatter.1": "Incense is good today",
			"office.chatter.2": "Waiting for the captain",
			"office.chatter.3": "This pill is nearly done",
			"office.chatter.4": "My sword intent grew",
			"office.chatter.5": "Next sect is lively",
			"office.chatter.6": "A short rest, then again",
			"office.chatter.7": "Copying the sutras",
			"office.chatter.8": "Who is debating?",
			"office.sceneAria": "Sect hall of {name}",
			"office.rail": "Sect hall actions",
			"office.closePanel": "Close panel",
			"office.guide": "Click the gate, library, stele or post on the wall for its panel; click a cultivator for their session.",
			"office.guideDismiss": "Got it",
			"office.teamsHint": "Pick a sect to inspect; history is read-only.",
			"office.inboxCount": "{count} unread message(s)",
			"office.stagedReview": "Review founding plan",
			"office.facility.teams": "Gate · roster",
			"office.facility.board": "Stele · progress",
			"office.facility.config": "Library · doctrine",
			"office.facility.gear": "Astral pavilion · gear",
			"office.facility.inbox": "Post · inbox",
			"office.action.teamsHint": "Switch sects and read the roster history",
			"office.action.boardHint": "Open task dependencies and dispatch progress",
			"office.action.configHint": "Open members, task contracts and the founding plan",
			"office.action.gearHint": "Open artifacts, mounts and skills",
			"office.action.inboxHint": "Read unread messages to the captain",
			"app.title": "Cultivation World",
			"quickstart.entry": "Found sect",
			"quickstart.entryTitle": "Found a sect without typing a command",
			"quickstart.title": "Found a sect",
			"quickstart.desc": "Pick a doctrine and cultivators, then stage a sect plan. Nothing starts until you approve it.",
			"quickstart.goal": "Goal (include acceptance criteria if you can)",
			"quickstart.goalPlaceholder": "e.g. Fix the intermittent 500 on the login API; tests live in tests/auth",
			"quickstart.template": "Template",
			"quickstart.roles": "Roles (multi-select, custom allowed)",
			"quickstart.stepDoctrine": "Doctrine",
			"quickstart.stepVow": "Vow",
			"quickstart.stepSect": "Sect",
			"quickstart.stepOath": "Oath",
			"quickstart.doctrineHint": "Pick a doctrine first: it fixes the initial roster and how the sect will act.",
			"quickstart.vowHint": "Write the founding vow: what to solve and how completion is judged. The plan is staged from it.",
			"quickstart.sectHint": "Name the sect: reroll, pick a ready-made school, or define custom roles.",
			"quickstart.oathHint": "One last look before the oath: doctrine, sect and the first cultivators.",
			"quickstart.next": "Next",
			"quickstart.back": "Back",
			"quickstart.found": "Swear the oath",
			"quickstart.roleCount": "cultivators",
			"quickstart.goalLength": "{count} characters",
			"quickstart.goalShortcut": "Ctrl/⌘ + Enter for next step",
			"quickstart.summaryDoctrine": "Doctrine",
			"quickstart.summarySect": "Sect",
			"quickstart.summaryRoster": "First cultivators",
			"quickstart.summaryVow": "Founding vow",
			"quickstart.oathNotice": "The oath only stages a founding plan; the sect starts after you approve the plan.",
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
			"role.talisman.name": "Talisman adept",
			"role.talisman.ability": "ward & seal",
			"role.healer.name": "Healer",
			"role.healer.ability": "heal & sustain",
			"role.beastmaster.name": "Beast tamer",
			"role.beastmaster.ability": "beasts & scouting",
			"role.puppeteer.name": "Puppeteer",
			"role.puppeteer.ability": "puppets & control",
			"role.musician.name": "Sound cultivator",
			"role.musician.ability": "sound & disruption",
			"role.poisoner.name": "Poison cultivator",
			"role.poisoner.ability": "venom & counter",
			"role.monk.name": "Monk",
			"role.monk.ability": "meditation & protection",
			"role.demon.name": "Demonic cultivator",
			"role.demon.ability": "dark arts & risk",
			"sect.jian.name": "Sword sect",
			"sect.jian.desc": "One blade breaks all arts · strikes and ships",
			"sect.dan.name": "Pill sect",
			"sect.dan.desc": "Alchemy and healing · verifies and restores",
			"sect.fuzhen.name": "Talisman sect",
			"sect.fuzhen.desc": "Talismans and arrays · seals and controls",
			"sect.mo.name": "Demonic sect",
			"sect.mo.desc": "Dark arts and bold moves · wins by surprise",
			"sect.fo.name": "Buddhist order",
			"sect.fo.desc": "Meditation and protection · steady progress",
			"sect.sanxiu.name": "Wanderers",
			"sect.sanxiu.desc": "Mixed paths · evidence and analysis",
			"sect.yushou.name": "Beast sect",
			"sect.yushou.desc": "Beasts and sound · scouting and inspection",
			"sect.lianqi.name": "Artifact sect",
			"sect.lianqi.desc": "Forging and delivery · build and release",
			"quickstart.sect": "Sect",
			"quickstart.sectRandom": "Random sect",
			"quickstart.sectCustom": "Custom",
			"quickstart.sectCustomHint": "Pick the 道途 yourself (multi-select)",
			"quickstart.sectRolled": "Rolled {sect} · click again to reroll",
			"quickstart.sectCustomPicked": "Custom 道途",
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
			"quickstart.created": "Plan staged: {team} ({sect}). Approve it in the team pane on the right.",
			"workspace.tabBoard": "Sect progress",
			"workspace.tabConfig": "Doctrine",
			"workspace.switchTeam": "Switch sect",
			"config.team": "Sect",
			"config.phase": "Phase",
			"config.halted": "Stopped",
			"realm.qi": "Qi refining",
			"realm.foundation": "Foundation",
			"realm.golden": "Golden core",
			"realm.nascent": "Nascent soul",
			"realm.spirit": "Spirit transformation",
			"realm.void": "Void refining",
			"realm.mahayana": "Mahayana",
			"realm.mortal": "Mortal",
			"realm.integration": "Body integration",
			"realm.tribulation": "Tribulation",
			"realm.trueImmortal": "True immortal",
			"realm.goldenImmortal": "Golden immortal",
			"realm.taiyi": "Taiyi",
			"realm.daluo": "Daluo",
			"realm.dao": "Dao ancestor",
			"config.realm": "Realm",
			"office.realm": "Realm",
			"config.phaseStaged": "Awaiting approval",
			"config.phaseRunning": "Running",
			"config.phaseCompleted": "Completed",
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
			const openCaptain = (captainSessionId) => {
				try {
					openAgentTeamCaptain(ctx.sessions, captainSessionId, ctx.layout, ctx.get("uiWorkspace"));
				} catch (error) {
					console.warn(`agent-teams: failed to open captain transcript ${captainSessionId}: ${String(error)}`);
				}
			};
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
					openCaptain,
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