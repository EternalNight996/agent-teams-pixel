/** 境界：按修士当前任务完成度映射凡人流五境。 */
export declare const REALM_KEYS: readonly ["realm.qi", "realm.foundation", "realm.golden", "realm.nascent", "realm.spirit"];
export declare function realmKey(progress: number): (typeof REALM_KEYS)[number];
