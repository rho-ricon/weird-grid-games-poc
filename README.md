# Weird Grid Games

A tiny Bun + Vite + React prototype for kid-friendly square-grid games.

Live app: https://rho-ricon.github.io/weird-grid-games-poc/

The first game is a minimal **15 Puzzle**:

- one 4×4 grid,
- 15 numbered squares and one moon gap,
- click a square next to the gap to slide it,
- shuffle/reset buttons,
- move counter and solved message,
- optional tiny synthesized tile-press sound.

The app is intentionally shaped like a future suite, but only one game is active for now.

## Run locally

```bash
bun install
bun run dev
```

Open http://localhost:5173/.

## Quality checks

```bash
bun run check
```

Or run pieces individually:

```bash
bun run lint
bun run test
bun run build
```

## Project shape

- `src/components/` — tiny suite shell and square grid primitive.
- `src/games/catalog.tsx` — game registry for future menu/drawer work.
- `src/games/fifteen/` — 15 Puzzle UI and pure puzzle logic.
- `src/styles/` — Sass partials for the playful square-grid look.

## Possible next experiments

- Turn the game rail into a clickable menu when a second game exists.
- Open games in Base UI drawers, like the earlier grid explorer PoCs.
- Add sound/animation toggles.
- Add a second tiny learning toy: pattern copying, number bonds, or shape sorting.
