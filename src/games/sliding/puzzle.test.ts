import { describe, expect, it } from 'vitest';
import {
  canMove,
  isSolved,
  movableIndices,
  moveTile,
  shuffleBoard,
  solvedBoardForSize,
  swapTileWithEmpty,
} from './puzzle';

describe('sliding number puzzle logic', () => {
  const solved15 = solvedBoardForSize(4);
  const solved8 = solvedBoardForSize(3);

  it('creates solved boards for 8 and 15 puzzle sizes', () => {
    expect(solved8).toEqual([1, 2, 3, 4, 5, 6, 7, 8, null]);
    expect(solved15).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null]);
    expect(isSolved(solved8, 3)).toBe(true);
    expect(isSolved(solved15, 4)).toBe(true);
  });

  it('moves a tile adjacent to the empty square', () => {
    const nextBoard = moveTile(solved15, 14, 4);

    expect(nextBoard).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, null, 15]);
  });

  it('leaves stuck tiles alone for normal moves', () => {
    const nextBoard = moveTile(solved15, 0, 4);

    expect(nextBoard).toBe(solved15);
  });

  it('can swap any tile with the empty square for drag mode', () => {
    const nextBoard = swapTileWithEmpty(solved15, 0);

    expect(nextBoard).toEqual([null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1]);
  });

  it('knows which solved-board tiles can move for each size', () => {
    expect(movableIndices(solved8, 3)).toEqual([5, 7]);
    expect(movableIndices(solved15, 4)).toEqual([11, 14]);
    expect(canMove(solved15, 11, 4)).toBe(true);
    expect(canMove(solved15, 14, 4)).toBe(true);
    expect(canMove(solved15, 10, 4)).toBe(false);
  });

  it('shuffles by valid moves, keeping the same tile set', () => {
    const shuffled = shuffleBoard({ size: 4, startingBoard: solved15, steps: 20, random: () => 0 });

    expect(isSolved(shuffled, 4)).toBe(false);
    expect([...shuffled].sort()).toEqual([...solved15].sort());
  });
});
