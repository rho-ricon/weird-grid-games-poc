import { describe, expect, it } from 'vitest';
import {
  applyMove,
  initialPieces,
  legalMovesForPiece,
  legalMovesForSide,
  type Piece,
  winnerFor,
} from './rules';

describe('checkers logic', () => {
  it('sets up twelve pieces per side', () => {
    const pieces = initialPieces();

    expect(pieces.filter((piece) => piece.side === 'black')).toHaveLength(12);
    expect(pieces.filter((piece) => piece.side === 'red')).toHaveLength(12);
    expect(legalMovesForSide(pieces, 'black')).toHaveLength(7);
  });

  it('moves pieces diagonally forward', () => {
    const pieces = initialPieces();
    const piece = pieces.find((candidate) => candidate.id === 'black-2-1');

    if (!piece) throw new Error('Expected black-2-1 to exist');

    expect(legalMovesForPiece(pieces, piece, false)).toEqual([
      { pieceId: 'black-2-1', toRow: 3, toColumn: 2 },
      { pieceId: 'black-2-1', toRow: 3, toColumn: 0 },
    ]);
  });

  it('captures opponent pieces and forces captures when available', () => {
    const pieces: Piece[] = [
      { id: 'black-a', side: 'black', row: 2, column: 1, king: false },
      { id: 'red-a', side: 'red', row: 3, column: 2, king: false },
      { id: 'black-b', side: 'black', row: 2, column: 5, king: false },
    ];

    expect(legalMovesForSide(pieces, 'black')).toEqual([
      { pieceId: 'black-a', toRow: 4, toColumn: 3, capturedPieceId: 'red-a' },
    ]);

    const result = applyMove(pieces, legalMovesForSide(pieces, 'black')[0]);

    expect(result.captured).toBe(true);
    expect(result.pieces.find((piece) => piece.id === 'red-a')).toBeUndefined();
    expect(result.movedPiece).toMatchObject({ row: 4, column: 3 });
  });

  it('lets kings move backward and forward', () => {
    const pieces: Piece[] = [{ id: 'red-king', side: 'red', row: 3, column: 2, king: true }];

    expect(legalMovesForSide(pieces, 'red')).toEqual([
      { pieceId: 'red-king', toRow: 4, toColumn: 3 },
      { pieceId: 'red-king', toRow: 4, toColumn: 1 },
      { pieceId: 'red-king', toRow: 2, toColumn: 3 },
      { pieceId: 'red-king', toRow: 2, toColumn: 1 },
    ]);
  });

  it('kings pieces that reach the far row', () => {
    const pieces: Piece[] = [{ id: 'black-a', side: 'black', row: 6, column: 1, king: false }];
    const result = applyMove(pieces, { pieceId: 'black-a', toRow: 7, toColumn: 2 });

    expect(result.becameKing).toBe(true);
    expect(result.movedPiece.king).toBe(true);
  });

  it('detects a winner when the opponent has no pieces', () => {
    expect(
      winnerFor([{ id: 'black-a', side: 'black', row: 0, column: 1, king: false }], 'black'),
    ).toBe('black');
  });
});
