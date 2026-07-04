# Changelog

## 0.1.0 (2026-04-19)

### Features

- initial arena scoreboard scaffold — Svelte 5 + Vite + Socket.IO relay consumer
- scoreboard views: player cards, penalty box, break overlay
- consume relay roster in match state store (with factory-server fallback)
- LAN access for arena scoreboard (hostname-derived relay/factory URLs)
- active match list on the home page (`subscribe:all`)
- scoreboard skins system with configurable entry page — Arena, Broadcast, Jumbotron, Dashboard, Minimal
- test harness, linting, and git hooks (Vitest, ESLint, Husky, commitlint)
