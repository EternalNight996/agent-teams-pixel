window.__ModuleLoader__.load({
  id: "agent-teams-pixel",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var ReactMod = require("react");
    var React = (ReactMod && ReactMod.createElement) ? ReactMod : (ReactMod && ReactMod.default) ? ReactMod.default : ReactMod;
    /* 角色精简清单不再内嵌进 bundle（原先占 160 KB / 包体 46%）：改为向宿主
     * `GET /agents-pixe/roles/index` 一次性拉取 + localStorage 版本化缓存（见 ROLES_STORE）。
     * 这里只留空壳，加载完成后由 REBUILD_INDEX() 重建索引。宿主是唯一真相源 → 永不漂移。 */
    var ROLES_DATA = { en: { divisions: {}, roles: [] }, zh: { divisions: {}, roles: [] } };
