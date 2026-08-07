# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mentat Orchestration (READ FIRST)

Before doing anything else, read `../Mentat/CLAUDE.md`, `../Mentat/TASKS.md`, `../Mentat/standards/coding-standards.md`, and every file in `../Mentat/in-flight/`. Mentat is the orchestration layer for the entire CourtHive ecosystem; its standards override per-repo conventions when they conflict. If you are about to start **building** (not just planning), you must claim a surface in `../Mentat/in-flight/` and run the air-traffic-control conflict check first. See the parent `../CLAUDE.md` "Mentat Orchestration" section for the full protocol.

## Project Overview

INTENNSE arena scoreboard for the CourtHive ecosystem. A standalone Svelte 5 web app that connects to the score relay over Socket.IO and renders live, large-format match displays for venue screens. It is a pure relay **consumer** — it holds no tournament data of its own and issues no mutations; it subscribes to live match snapshots/ticks and paints them.

It displays a single match at a time (selected from an active-match list) using one of five swappable "skins" — Arena, Broadcast, Jumbotron, Dashboard, Minimal — each optimized for a different screen (venue wall, stream overlay, stadium jumbotron, stats dashboard, minimal bug). Scoreboard state includes INTENNSE-specific bolt/arc scores, serve indicator, penalty box, and live clocks (bolt timer, serve clock, timeout/break).

Private package (`private: true`, not published to npm). Deployed as a static web app; defaults to LAN-friendly URLs so it works on a venue network without configuration.

## Commands

```bash
pnpm install              # Install dependencies (pnpm only — npm is blocked via engines)
pnpm dev                  # Vite dev server
pnpm build                # Vite production build → dist/
pnpm preview              # Preview the production build
pnpm check-types          # svelte-check --tsconfig ./tsconfig.json
pnpm lint                 # ESLint — non-mutating, fails on any warning
pnpm lint:fix             # ESLint with auto-fix (rewrites source)
pnpm format               # Prettier on src/
pnpm test                 # Vitest (TZ=UTC, watch mode)
pnpm test:run             # Vitest single run
pnpm test:ui              # Vitest interactive UI
pnpm commit               # Interactive conventional commit (cz-git)
```

## Architecture

### Entry Flow

`index.html` → `src/main.ts` (`mount(App, …)`) → `App.svelte`.

`App.svelte` reads a match id from the `?match=<id>` URL query param. When empty it renders `MatchList` (the active-match picker + skin/theme config panel); when set it renders `Scoreboard` for that match. Skin and theme can also be forced via `?skin=` / `?theme=` URL params (`applyUrlOverrides()`).

### Relay Consumer Model

```
score-relay (/live namespace)  ──Socket.IO──▶  src/relay/client.ts
                                                     │  (event handlers)
                                                     ▼
                                       src/stores/matchState.svelte.ts   ($state singleton)
                                                     │  ($derived)
                                                     ▼
                                       Scoreboard.svelte → <Skin>.svelte components
```

`src/relay/client.ts` is the Socket.IO client. It connects to the `/live` namespace of the relay at `VITE_RELAY_URL` (default `http://<page-hostname>:8384`), websocket transport with reconnection. It exposes:

- `subscribeToMatch(matchUpId)` — emits `subscribe`, filters incoming events to the given `matchUpId`.
- `subscribeToTournament(tournamentId)` — emits `subscribe:tournament`.
- `subscribeAll(onChange)` — emits `subscribe:all`, maintains a live `Map` of active matches for the home list (listens for `active`, plus `intennse`/`score` enrichment).

**Relay events consumed** (inbound listeners):

| Event           | Purpose                                                                                                              | Applied via             |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `intennse`      | Full INTENNSE match snapshot (teams, bolt/arc score, active players, server, penalty box, clocks, embedded `roster`) | `applyIntennseSnapshot` |
| `score`         | Score-string / set / status update                                                                                   | `applyScoreUpdate`      |
| `scorebug-tick` | ~10Hz clock tick (bolt timer, serve clock) — subscribed as `onTick`                                                  | `applyClockTick`        |
| `clockSync`     | Authoritative clock resync                                                                                           | `applyClockSync`        |
| `history`       | Point history (subscription slot exists via `onHistory`)                                                             | —                       |
| `active`        | List of currently active `matchUpId`s (home page only)                                                               | `subscribeAll`          |

**Outbound emits**: `subscribe` / `unsubscribe`, `subscribe:tournament` / `unsubscribe:tournament`, `subscribe:all` / `unsubscribe:all`.

`src/relay/roster.ts` resolves participant IDs to display data (name, jersey number, image). The relay's `intennse` snapshot carries an embedded `roster` map that is merged into a local cache (`mergeRelayRoster`); as a fallback it can POST to the factory server's `/factory/participants` (`VITE_FACTORY_URL`, default `http://<page-hostname>:8383`). This is read-only enrichment, not a mutation path.

### State Model (Svelte 5 runes)

State lives in two rune-based singleton stores (files use the `.svelte.ts` extension so runes compile):

- `src/stores/matchState.svelte.ts` — `let state = $state<MatchState>(…)` singleton for the one match on screen. Relay handlers call `applyIntennseSnapshot` / `applyScoreUpdate` / `applyClockTick` / `applyClockSync` to mutate fields in place; components read via `getMatchState()` behind `$derived`.
- `src/stores/skinConfig.svelte.ts` — `let config = $state<SkinConfig>(…)` for the chosen skin, theme preset, custom colors, and per-skin options. Persisted to `localStorage` (`arena-skin-config`). `applyTheme()` writes the resolved preset to `--arena-*` CSS variables on `:root`.

Components use Svelte 5 runes throughout: `$props()` for inputs, `$state` for local UI state, `$derived` / `$derived.by` for computed values, `onMount`/`onDestroy` for subscription lifecycle. `Scoreboard.svelte` owns the relay subscription for its match and tears it down on destroy.

### Key Dependencies

| Package            | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `svelte` (v5)      | UI framework — runes mode, no store library   |
| `socket.io-client` | Relay transport (the only runtime dependency) |
| `vite`             | Dev server + build                            |
| `svelte-check`     | Type checking                                 |

The factory / TODS types are **not** a dependency — relay payloads are consumed as loosely-typed shapes (local `MatchState` / `PlayerInfo` interfaces), keeping the arena a thin display client.

## Component Inventory

`src/components/` — 8 top-level components + 5 skins + a shared props type:

| Component                    | Responsibility                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `Scoreboard.svelte`          | Subscribes to one match, wires relay events into `matchState`, resolves active players, and renders the selected skin |
| `MatchList.svelte`           | Home page: live active-match list (`subscribeAll`) plus the skin / theme / per-skin-option config panel               |
| `PlayerCard.svelte`          | Player avatar (image or initials), jersey number, name, and serving indicator; `compact` variant                      |
| `PenaltyBox.svelte`          | Penalized players with per-player countdown timers                                                                    |
| `MatchComplete.svelte`       | FINAL screen — winner highlight and final arc score                                                                   |
| `BreakOverlay.svelte`        | Break-time view: player stats split by side                                                                           |
| `Clock.svelte`               | Bolt timer + serve clock, with timeout/break as a secondary display                                                   |
| `ScorePanel.svelte`          | Team names with arc + bolt scores and serve indicator                                                                 |
| `skins/ArenaSkin.svelte`     | Default — full 3-column layout with player cards and clocks; switches between play / break / complete                 |
| `skins/BroadcastSkin.svelte` | Compact scorebug bar for stream overlays (top/bottom, configurable opacity)                                           |
| `skins/JumbotronSkin.svelte` | Massive numbers for stadium screens (toggle bolt / serve clock)                                                       |
| `skins/DashboardSkin.svelte` | Data-dense layout with live per-player stats                                                                          |
| `skins/MinimalSkin.svelte`   | Just score and clock                                                                                                  |
| `skins/skinProps.ts`         | Shared `SkinProps` type passed from `Scoreboard` to every skin                                                        |

## Code Style / Conventions

- **Svelte 5 runes only** — `$state` / `$derived` / `$props` / `$effect`; no legacy stores, no `export let`. Rune-bearing `.ts` files use the `.svelte.ts` extension.
- **Package manager**: pnpm only (`pnpm@11.9.0` pinned; `engines.npm` set to `please-use-pnpm`). Node `>=22`.
- **Styling**: component-scoped Svelte `<style>` blocks. There is no `styles/` CSS (the directory is empty) and there is no CSS framework. Theming is driven by `--arena-*` CSS variables (`--arena-accent`, `--arena-side1`, `--arena-side2`, `--arena-bg`, `--arena-text`) written to `:root` by `applyTheme()` from a chosen `THEME_PRESET`.
- **Dark-only — does NOT follow the ecosystem `--tmx-*` light/dark token convention.** This app is intentionally dark-only for venue/broadcast screens: every theme preset uses a near-black background and light text, and `App.svelte` hardcodes a dark `body` background. There is no light mode and no `--tmx-*` tokens. Do not "add a light fallback" here as you would in TMX; if a genuine theming need arises, extend the `--arena-*` presets in `skinConfig.svelte.ts`.
- **Config over routing**: no router — state is driven by URL query params (`?match=`, `?skin=`, `?theme=`) and `localStorage`.
- **Linting**: ESLint (flat config) with the `sonarjs` plugin; Prettier (with `prettier-plugin-svelte`); Husky pre-commit + commitlint (conventional commits). Imports are sorted longest-first per ecosystem standards.

## Ecosystem Standards

This repo follows CourtHive ecosystem coding standards documented in the Mentat orchestration repo at `../Mentat/standards/coding-standards.md`, which override per-repo conventions when they conflict.
