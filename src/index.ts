/**
 * agent-teams-pixel host entry.
 *
 * The cordis loader imports the package's main entry (`lib/index.js`) for the
 * `agent-teams-pixel` bundle row and consumes its exported `name` / `apply` /
 * `Config`. TypeScript builds src/ with `rootDir: src` and the host
 * implementation lives under `src/host/` (so it alone would only emit
 * `lib/host/*.js`, never `lib/index.js`). This top-level re-export guarantees
 * the loader-resolvable entry always exists at the documented path.
 */
export * from './host/index.ts'
export { applyPixelHostLayer } from './host/pixel-integration.ts'
