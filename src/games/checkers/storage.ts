import { isPlayableSquare, type Piece, type Side } from './rules';

export type ComputerSide = Side | null;

export type SavedCheckers = {
  pieces: Piece[];
  turn: Side;
  moves: number;
  winner: Side | null;
  computerSide: ComputerSide;
};

const checkersStorageKey = 'weird-grid-games:checkers:v1';

export function readSavedCheckers(): SavedCheckers | null {
  try {
    if (typeof localStorage === 'undefined') return null;

    const rawGame = localStorage.getItem(checkersStorageKey);
    if (!rawGame) return null;

    const game: unknown = JSON.parse(rawGame);
    if (!isRecord(game) || !isPieceArray(game.pieces)) return null;
    if (game.turn !== 'black' && game.turn !== 'red') return null;
    if (game.winner !== null && game.winner !== 'black' && game.winner !== 'red') return null;
    if (
      game.computerSide !== undefined &&
      game.computerSide !== null &&
      game.computerSide !== 'black'
    ) {
      return null;
    }
    if (typeof game.moves !== 'number' || !Number.isInteger(game.moves) || game.moves < 0) {
      return null;
    }

    return {
      pieces: game.pieces,
      turn: game.turn,
      moves: game.moves,
      winner: game.winner,
      computerSide: game.computerSide === 'black' ? 'black' : null,
    };
  } catch {
    return null;
  }
}

export function writeSavedCheckers(game: SavedCheckers) {
  try {
    if (typeof localStorage === 'undefined') return;

    if (game.moves === 0 && !game.winner && !game.computerSide) {
      localStorage.removeItem(checkersStorageKey);
      return;
    }

    localStorage.setItem(checkersStorageKey, JSON.stringify(game));
  } catch {
    // localStorage can be unavailable in private/restricted browsing; the game still works.
  }
}

function isPieceArray(value: unknown): value is Piece[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();

  for (const piece of value) {
    if (!isRecord(piece)) return false;
    if (typeof piece.id !== 'string' || ids.has(piece.id)) return false;
    if (piece.side !== 'black' && piece.side !== 'red') return false;
    if (typeof piece.row !== 'number' || !Number.isInteger(piece.row)) return false;
    if (typeof piece.column !== 'number' || !Number.isInteger(piece.column)) return false;
    if (!isPlayableSquare(piece.row, piece.column)) return false;
    if (typeof piece.king !== 'boolean') return false;
    ids.add(piece.id);
  }

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
