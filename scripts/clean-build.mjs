#!/usr/bin/env node
// Clean build artifacts before rebuild. Mirrors the script shipped with
// @nanmicoder/dsh-agent-teams: wipes `lib/` so stale sub-trees from prior
// builds cannot leak into the new artifact (especially `lib/types/`).
import { rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const libDir = resolve(process.cwd(), 'lib')
if (existsSync(libDir)) {
  rmSync(libDir, { recursive: true, force: true })
}
console.log('[clean-build] lib/ removed')