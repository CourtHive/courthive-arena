# courthive-arena

INTENNSE arena scoreboard for the CourtHive ecosystem. Standalone Svelte 5 web app that connects to the score relay over Socket.IO and renders live, large-format match displays for venue screens.

Private package (not published to npm). Deployed as a static web app.

## Status

Live. Consumes `liveBoltScores` and related events from the relay; rendering pipeline is component-driven Svelte 5 with runes.

## Stack

| Layer      | Library                     |
| ---------- | --------------------------- |
| UI         | `svelte` v5 (runes)         |
| Build      | Vite                        |
| Transport  | `socket.io-client`          |
| Type-check | `svelte-check` + TypeScript |

## Commands

```bash
pnpm install
pnpm dev               # vite dev server
pnpm build             # production build → dist/
pnpm preview           # preview production build
pnpm check-types       # svelte-check
pnpm lint              # ESLint with --fix --cache
pnpm test              # vitest (TZ=UTC, watch mode)
pnpm test:run          # single run
```

## Source layout

```
src/
├── App.svelte        # root component
├── main.ts           # entry
├── components/       # arena UI components
├── relay/            # Socket.IO relay client
├── stores/           # Svelte stores (match state, theme, …)
└── styles/           # global CSS
```

## Related

- [`epixodic`](https://github.com/CourtHive/epixodic) — interactive point-by-point scoring (sister Svelte 5 app)
- [`tods-competition-factory`](https://github.com/CourtHive/tods-competition-factory) — scoring + matchUp format authority
- [Score relay reference](../Mentat/planning/RELAY_SERVER_REFERENCE.md) — relay event schema and deployment

## Ecosystem standards

Follows the CourtHive ecosystem coding standards documented in [`Mentat/standards/coding-standards.md`](../Mentat/standards/coding-standards.md). pnpm-only; npm is blocked via `package.json#engines.npm`.
