import { describe, expect, it } from 'vitest';
import {
  canMove,
  isSolved,
  movableIndices,
  moveTile,
  shuffleBoard,
  solvedBoard,
  swapTileWithEmpty,
} from './puzzle';

describe('15 puzzle logic', () => {
  it('starts with a solved board', () => {
    expect(isSolved(solvedBoard)).toBe(true);
  });

  it('moves a tile adjacent to the empty square', () => {
    const nextBoard = moveTile(solvedBoard, 14);

    expect(nextBoard).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, null, 15]);
  });

  it('leaves stuck tiles alone for normal moves', () => {
    const nextBoard = moveTile(solvedBoard, 0);

    expect(nextBoard).toBe(solvedBoard);
  });

  it('can swap any tile with the empty square for drag mode', () => {
    const nextBoard = swapTileWithEmpty(solvedBoard, 0);

    expect(nextBoard).toEqual([null, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1]);
  });

  it('knows which solved-board tiles can move', () => {
    expect(movableIndices(solvedBoard)).toEqual([11, 14]);
    expect(canMove(solvedBoard, 11)).toBe(true);
    expect(canMove(solvedBoard, 14)).toBe(true);
    expect(canMove(solvedBoard, 10)).toBe(false);
  });

  it('shuffles by valid moves, keeping the same tile set', () => {
    const shuffled = shuffleBoard(solvedBoard, 20, () => 0);

    expect(isSolved(shuffled)).toBe(false);
    expect([...shuffled].sort()).toEqual([...solvedBoard].sort());
  });
});
