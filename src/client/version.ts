/**
 * 客户端版本号：反馈异常的诊断信息会带上它。
 *
 * 与 package.json 的 version 保持一致，scripts/verify.mjs 会核对；
 * 客户端不能直接 import package.json（rootDir 只含 src），所以在这里显式声明。
 */
export const PLUGIN_VERSION = '0.3.0-rc.3'
