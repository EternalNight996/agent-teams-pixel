# Release checklist (dsh-pixel-team)

Date: 2026-10-27. Automated gates are reproducible; manual gates are still required
before a public release.

## Automated (green)

| Gate | Command | Status |
|---|---|---|
| TypeScript | pnpm typecheck | pass |
| Build + artifact stamp | pnpm build | pass |
| Browser-side contracts | pnpm verify:web-routes | 56/56 |
| Release metadata + package smoke | pnpm verify:release | pass |
| Source/build/config stamps | node scripts/verify.mjs | pass |
| Full suite | pnpm verify | exit 0 |

## Package smoke

pnpm verify:release now runs npm pack --dry-run and asserts:

- lib/index.js, lib/client.js and the pixel-office scene are shipped;
- assets/support/group-qr.jpg, wechat-pay.jpg, wechat-reward.jpg are shipped and
  match the host route allowlist;
- SPONSOR.md, README.md, cordis.patch.yml and package.json are shipped;
- no src/, docs/ or *.test.mjs ships; only the three intended runtime scripts
  (compatibility, doctor, legacy-session-source-repair) are included;
- tarball is non-trivial and under the 8 MB budget.

Current artifact (dry-run): dsh-pixel-team-0.3.0-rc.1.tgz, ~1.8 MB packed,
~4.1 MB unpacked.

## Manual gates (not yet run for this build)

1. Real browser smoke: 6 wall facilities + 7 bottom-bar entries, 宗门志 scroll and
   QR loading, equipment switch feedback, feedback copy/prefilled issue.
2. Packaged artifact into an isolated profile: cold start + real host support
   route /plugins/dsh-pixel-team/support/*.
3. Real-model minimal business: create → dispatch → execute → verify → review.
4. A/B: single agent vs 5-person fullstack, compare wall clock, tokens, first-pass
   pass rate (suggest wall clock -25%, tokens <=1.3x, pass rate not lower).

## Deploy note

The desktop profile currently points at an older tarball
(dsh-pixel-team-0.3.0-rc.1.tgz). Updating node_modules works for a restart, but
a plugin-manager reinstall would restore the old package until the tarball and
lockfile are regenerated.
