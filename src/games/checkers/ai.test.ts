import { describe, expect, it } from 'vitest';
import { chooseComputerMove, scoreBoard } from './ai';
import type { Piece } from './rules';

describe('checkers computer player', () => {
  it('chooses a forced capture', () => {
    const pieces: Piece[] = [
      { id: 'black-a', side: 'black', row: 2, column: 1, king: false },
      { id: 'red-a', side: 'red', row: 3, column: 2, king: false },
      { id: 'black-b', side: 'black', row: 2, column: 5, king: false },
    ];

    expect(chooseComputerMove(pieces, 'black')).toEqual({
      pieceId: 'black-a',
      toRow: 4,
      toColumn: 3,
      capturedPieceId: 'red-a',
    });
  });

  it('prefers making a king over a quiet non-king move', () => {
    const pieces: Piece[] = [
      { id: 'black-quiet', side: 'black', row: 2, column: 1, king: false },
      { id: 'black-crown', side: 'black', row: 6, column: 1, king: false },
    ];

    expect(chooseComputerMove(pieces, 'black')).toMatchObject({ pieceId: 'black-crown' });
  });

  it('uses trained lookahead to choose a different move than gentle scoring', () => {
    const pieces: Piece[] = [
      { id: 'black-0', side: 'black', row: 5, column: 4, king: false },
      { id: 'black-1', side: 'black', row: 4, column: 1, king: true },
      { id: 'black-2', side: 'black', row: 2, column: 7, king: false },
      { id: 'black-3', side: 'black', row: 5, column: 6, king: false },
      { id: 'black-4', side: 'black', row: 3, column: 2, king: false },
      { id: 'red-0', side: 'red', row: 0, column: 7, king: false },
      { id: 'red-1', side: 'red', row: 6, column: 7, king: false },
      { id: 'red-2', side: 'red', row: 4, column: 3, king: false },
    ];

    expect(chooseComputerMove(pieces, 'black', undefined, 'gentle')).toEqual({
      pieceId: 'black-2',
      toRow: 3,
      toColumn: 6,
    });
    expect(chooseComputerMove(pieces, 'black', undefined, 'trained')).toEqual({
      pieceId: 'black-3',
      toRow: 6,
      toColumn: 5,
    });
  });

  it('scores material advantage for the computer side', () => {
    const pieces: Piece[] = [
      { id: 'black-a', side: 'black', row: 4, column: 3, king: false },
      { id: 'black-b', side: 'black', row: 5, column: 4, king: true },
      { id: 'red-a', side: 'red', row: 2, column: 1, king: false },
    ];

    expect(scoreBoard(pieces, 'black')).toBeGreaterThan(0);
    expect(scoreBoard(pieces, 'red')).toBeLessThan(0);
  });
});
