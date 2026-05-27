import type { GameDefinition } from '../components/GameShell';
import { FifteenPuzzle } from './fifteen/FifteenPuzzle';

export const games: GameDefinition[] = [
  {
    id: 'fifteen',
    title: '15 Puzzle',
    tagline: 'slide the numbers',
    description:
      'Click a square next to the blank space. It slides. That is the whole magic trick.',
    component: FifteenPuzzle,
  },
];
