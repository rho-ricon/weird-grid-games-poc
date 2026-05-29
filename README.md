# Weird Grid Games

A tiny Bun + Vite + React prototype for kid-friendly square-grid games.

Live app: https://rho-ricon.github.io/weird-grid-games-poc/

The app currently includes three little grid toys:

- **8 Puzzle** — a smaller 3×3 grid with 8 numbered squares and one moon gap.
- **15 Puzzle** — a bigger 4×4 grid with 15 numbered squares and one moon gap.
- **Checkers** — a playful checkerboard with required jumps, kings, sliding pieces, optional computer Black, and a hidden stronger opponent after the human wins once.

Shared suite behavior:

- the active game tab is preserved across refreshes,
- each game keeps its own local state,
- buttons, boards, and pieces use the same chunky square-grid visual language.

The sliding puzzles include:

- click a square next to the gap to slide it,
- moon-magic drag mode for swapping any tile into the gap,
- shuffle/reset buttons,
- move counter and solved message,
- optional tiny synthesized tile-press and blocked-move sounds.

Checkers includes:

- Red starts from the bottom side,
- required jumps and multi-jump turns,
- kings,
- a local two-player mode,
- **Computer: Black** mode with automatic moves,
- a hidden trained computer mode that unlocks after Red beats the computer once.

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
- `src/games/checkers/` — checkers UI, pure rules, storage, and computer-move scoring.
- `src/styles/` — Sass partials for the playful square-grid look.

## Possible next experiments

- Open games in Base UI drawers, like the earlier grid explorer PoCs.
- Add separate sounds for shuffle, reset, drag drop, and solved.
- Add another tiny learning toy: pattern copying, number bonds, shape sorting, or word-building.
