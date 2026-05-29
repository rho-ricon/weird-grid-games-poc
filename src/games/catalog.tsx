import type { GameDefinition } from '../components/GameShell';
import { Checkers } from './checkers/Checkers';
import { EightPuzzle } from './eight/EightPuzzle';
import { FifteenPuzzle } from './fifteen/FifteenPuzzle';

export const games: GameDefinition[] = [
  {
    id: 'eight',
    title: '8 Puzzle',
    tagline: 'small moon slide',
    description:
      'A smaller 3×3 sliding puzzle. Click next to the moon, or try moon-magic drag mode.',
    component: EightPuzzle,
  },
  {
    id: 'fifteen',
    title: '15 Puzzle',
    tagline: 'bigger number slide',
    description: 'A bigger 4×4 sliding puzzle. Same moon gap, more square chaos.',
    component: FifteenPuzzle,
  },
  {
    id: 'checkers',
    title: 'Checkers',
    tagline: 'two-player jumps',
    description:
      'A local two-player checkerboard with required jumps, kings, and very serious tiny circles.',
    component: Checkers,
  },
];
