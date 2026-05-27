# Weird Grid Games

A tiny Bun + Vite + React prototype for kid-friendly square-grid games.

Live app: https://rho-ricon.github.io/weird-grid-games-poc/

The app currently includes two sliding number puzzles:

- **8 Puzzle** — a smaller 3×3 grid with 8 numbered squares and one moon gap.
- **15 Puzzle** — a bigger 4×4 grid with 15 numbered squares and one moon gap.

Both games include:

- click a square next to the gap to slide it,
- moon-magic drag mode for swapping any tile into the gap,
- shuffle/reset buttons,
- move counter and solved message,
- optional tiny synthesized tile-press and blocked-move sounds,
- separate local puzzle-state persistence across refreshes.

The app is intentionally shaped like a future suite, with a tiny game rail/menu already in place.

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
- `src/games/catalog.tsx` — game registry for the rail/menu.
- `src/games/eight/` and `src/games/fifteen/` — thin game wrappers.
- `src/games/sliding/` — shared sliding puzzle UI and pure puzzle logic.
- `src/styles/` — Sass partials for the playful square-grid look.

## Possible next experiments

- Open games in Base UI drawers, like the earlier grid explorer PoCs.
- Add separate sounds for shuffle, reset, drag drop, and solved.
- Add a second kind of tiny learning toy: pattern copying, number bonds, or shape sorting.
