# Changelog

## [0.2.0](https://github.com/CourtHive/courthive-arena/compare/v0.1.0...v0.2.0) (2026-07-04)


### Features

* active match list on home page ([f47a03a](https://github.com/CourtHive/courthive-arena/commit/f47a03a06244d3f89d3991c3d43db32437585b13))
* add test harness, linting, and git hooks ([4f4c903](https://github.com/CourtHive/courthive-arena/commit/4f4c90360733ff9cf545b18096a40a6c640e0fc9))
* consume relay roster in match state store ([3dc78eb](https://github.com/CourtHive/courthive-arena/commit/3dc78ebed3d99f5d6b4cb1116fb44ca1471ea0f7))
* initial arena scoreboard scaffold ([735dfd6](https://github.com/CourtHive/courthive-arena/commit/735dfd64b81986888e483944ec039696c01847ae))
* LAN access for arena scoreboard ([c260789](https://github.com/CourtHive/courthive-arena/commit/c2607892e8a59090d15088a02dc1cec4885c74a4))
* scoreboard skins system with configurable entry page ([32ea2d6](https://github.com/CourtHive/courthive-arena/commit/32ea2d621d2f335225cea0d9a3e78d5bb7b7685d))
* scoreboard views with player cards, penalty box, break overlay ([0aac2f1](https://github.com/CourtHive/courthive-arena/commit/0aac2f1b66802c357730f7dffaa538ce39dc4450))


### Bug Fixes

* arc score display, clock layout, serve indicator ([ef4d522](https://github.com/CourtHive/courthive-arena/commit/ef4d522eed9637a0d4177ff98f89dd34d80ddc0c))
* layout — bolt score below arc, serve clock below indicator ([e7e55bd](https://github.com/CourtHive/courthive-arena/commit/e7e55bd68cbd82b8853595718eeb1572aaa17014))
* match list reconnect, score display, fallback names ([05e9629](https://github.com/CourtHive/courthive-arena/commit/05e962975909ea6abdf3d5d672cfc3fc2ddc8492))
* pnpm 11 install — kebab-case .npmrc + ignoredBuiltDependencies ([08d9d21](https://github.com/CourtHive/courthive-arena/commit/08d9d21dd2f8b35e04c840580bd0bf056c7b6c6c))
* scoreboard layout — clocks centered, teams on sides ([afe4045](https://github.com/CourtHive/courthive-arena/commit/afe404529a9ea1fa4b6b3e398e734b3e9b18f109))
* **types:** align skin/relay/score-panel types with current MatchState ([45c21a3](https://github.com/CourtHive/courthive-arena/commit/45c21a3e56fb83fb6dfef62fed5e8e8db3f90a8c))


### Documentation

* add CLAUDE.md and CHANGELOG ([2381583](https://github.com/CourtHive/courthive-arena/commit/2381583bd3ea386a3856523823347091b2605f68))
* **readme:** add initial readme ([d8b183c](https://github.com/CourtHive/courthive-arena/commit/d8b183c52bd3f8a1995a206e1814fd8b9547cc54))

## 0.1.0 (2026-04-19)

### Features

- initial arena scoreboard scaffold — Svelte 5 + Vite + Socket.IO relay consumer
- scoreboard views: player cards, penalty box, break overlay
- consume relay roster in match state store (with factory-server fallback)
- LAN access for arena scoreboard (hostname-derived relay/factory URLs)
- active match list on the home page (`subscribe:all`)
- scoreboard skins system with configurable entry page — Arena, Broadcast, Jumbotron, Dashboard, Minimal
- test harness, linting, and git hooks (Vitest, ESLint, Husky, commitlint)
