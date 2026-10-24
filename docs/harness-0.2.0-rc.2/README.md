# Harness 0.2.0-rc.2 migration

Target: official tag `dsh-v0.2.0-rc.2`, commit `639ed015397290b3745d163aafe02ffee4aa3f84`, published npm cohort `0.2.0-rc.2`. Compared with the prior source preview `21638c56315ae6a2b552d6091945d3144c9af32e`.

AgentTeams 0.1.22 sets this exact version as its recommended and development host. The seven previously supported published hosts remain regression targets. The predicted unreleased 0.2.0 source candidate is removed; it does not imply acceptance of a future GA build.

## Source review

Two independent reviews found no changed backend contract requiring plugin business-code migration: agent, agent-loop, session, subagent, tools and app-boot implementations remain unchanged. Session format/storage/query schema remain 4/1/8. pi-ai changes and Anthropic replay behavior require real-provider testing beyond the deterministic fixture suite.

The desktop-installed CLI carrier can now manage its desktop profile; the ordinary standalone CLI still cannot. Desktop still bundles pnpm 11.7.0 and its installer code is unchanged. Checked-in lib entries remain required for script-free Git installation. The sidebar mounted-state timing changes, while the public openTab/isExpanded signatures remain compatible with the plugin's effect-driven use.

## Release verification

The release pipeline tests one immutable candidate against eight exact npm host cohorts, plus Ubuntu and Windows static checks. Consumer artifact verification uses the published 0.2.0-rc.2 npm host in an isolated profile. The user manages their already-installed official desktop application; no desktop installation changes are part of this release. Final run results and registry artifact identity are archived with the GitHub release.

This targets a published RC, not a GA release. Browser Web UI verification is not a packaged Electron launch or a real-provider acceptance test.
