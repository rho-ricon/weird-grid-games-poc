import { SlidingNumberPuzzle } from '../sliding/SlidingNumberPuzzle';

export function FifteenPuzzle() {
  return <SlidingNumberPuzzle size={4} storageKey="fifteen-puzzle" shuffleSteps={96} />;
}
