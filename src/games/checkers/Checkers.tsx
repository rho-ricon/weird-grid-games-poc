import { useEffect, useMemo, useState } from 'react';
import { playBlockedMove, playTilePress } from '../../utils/sound';
import {
  applyMove,
  checkersSize,
  initialPieces,
  isPlayableSquare,
  legalMovesForSide,
  type Move,
  otherSide,
  type Piece,
  pieceAt,
  type Side,
  winnerFor,
} from './rules';

type SavedCheckers = {
  pieces: Piece[];
  turn: Side;
  moves: number;
  winner: Side | null;
};

const checkersStorageKey = 'weird-grid-games:checkers:v1';

export function Checkers() {
  const savedGame = useMemo(readSavedCheckers, []);
  const [pieces, setPieces] = useState<Piece[]>(() => savedGame?.pieces || initialPieces());
  const [turn, setTurn] = useState<Side>(() => savedGame?.turn || 'black');
  const [moves, setMoves] = useState(() => savedGame?.moves || 0);
  const [winner, setWinner] = useState<Side | null>(() => savedGame?.winner || null);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [mustContinuePieceId, setMustContinuePieceId] = useState<string | null>(null);
  const [message, setMessage] = useState(() =>
    savedGame
      ? 'Welcome back to the checkerboard.'
      : 'Black goes first. Click a piece, then a glowing square.',
  );

  const legalMoves = useMemo(
    () => (winner ? [] : legalMovesForSide(pieces, turn, mustContinuePieceId || undefined)),
    [mustContinuePieceId, pieces, turn, winner],
  );
  const selectedMoves = legalMoves.filter((move) => move.pieceId === selectedPieceId);
  const captureRequired = legalMoves.some((move) => move.capturedPieceId);

  useEffect(() => {
    writeSavedCheckers({ pieces, turn, moves, winner });
  }, [moves, pieces, turn, winner]);

  function reset() {
    setPieces(initialPieces());
    setTurn('black');
    setMoves(0);
    setWinner(null);
    setSelectedPieceId(null);
    setMustContinuePieceId(null);
    setMessage('Fresh board. Black goes first.');
  }

  function handleSquare(row: number, column: number) {
    if (!isPlayableSquare(row, column)) return;

    if (winner) {
      playBlockedMove();
      setMessage(`${labelFor(winner)} already won. Reset for a new game.`);
      return;
    }

    const move = selectedMoves.find(
      (candidate) => candidate.toRow === row && candidate.toColumn === column,
    );

    if (move) {
      playTilePress();
      playMove(move);
      return;
    }

    const piece = pieceAt(pieces, row, column);

    if (piece?.side === turn) {
      selectPiece(piece);
      return;
    }

    playBlockedMove();
    setMessage(
      captureRequired
        ? `${labelFor(turn)} has a jump available.`
        : 'That square is sleepy. Pick one of your pieces.',
    );
  }

  function selectPiece(piece: Piece) {
    if (mustContinuePieceId && piece.id !== mustContinuePieceId) {
      playBlockedMove();
      setMessage('That piece needs to finish jumping.');
      return;
    }

    const pieceMoves = legalMoves.filter((move) => move.pieceId === piece.id);

    if (pieceMoves.length === 0) {
      playBlockedMove();
      setSelectedPieceId(piece.id);
      setMessage(
        captureRequired ? `${labelFor(turn)} has a different jump.` : 'That piece is stuck.',
      );
      return;
    }

    playTilePress();
    setSelectedPieceId(piece.id);
    setMessage(
      pieceMoves.some((move) => move.capturedPieceId)
        ? 'Jump time! Pick a glowing landing square.'
        : 'Pick a glowing landing square.',
    );
  }

  function playMove(move: Move) {
    const result = applyMove(pieces, move);
    const nextMoves = moves + 1;
    const nextWinner = winnerFor(result.pieces, turn);

    setPieces(result.pieces);
    setMoves(nextMoves);

    if (nextWinner) {
      setWinner(nextWinner);
      setSelectedPieceId(null);
      setMustContinuePieceId(null);
      setMessage(`${labelFor(nextWinner)} wins in ${nextMoves} move${nextMoves === 1 ? '' : 's'}!`);
      return;
    }

    if (result.captured && !result.becameKing) {
      const followUpJumps = legalMovesForSide(result.pieces, turn, result.movedPiece.id);

      if (followUpJumps.length > 0) {
        setSelectedPieceId(result.movedPiece.id);
        setMustContinuePieceId(result.movedPiece.id);
        setMessage('Jump again with the same piece!');
        return;
      }
    }

    const nextTurn = otherSide(turn);
    setTurn(nextTurn);
    setSelectedPieceId(null);
    setMustContinuePieceId(null);
    setMessage(`${labelFor(nextTurn)}'s turn.`);
  }

  return (
    <div className="checkersGame">
      <div className="checkersBoardCard">
        <div className="checkersBoard">
          {Array.from({ length: checkersSize * checkersSize }, (_, index) => {
            const row = Math.floor(index / checkersSize);
            const column = index % checkersSize;
            const playable = isPlayableSquare(row, column);
            const piece = pieceAt(pieces, row, column);
            const legalMove = selectedMoves.find(
              (candidate) => candidate.toRow === row && candidate.toColumn === column,
            );

            return (
              <button
                className="checkerSquare"
                data-playable={playable ? 'true' : undefined}
                data-selected={piece?.id === selectedPieceId ? 'true' : undefined}
                data-legal={legalMove ? 'true' : undefined}
                data-capture={legalMove?.capturedPieceId ? 'true' : undefined}
                type="button"
                disabled={!playable}
                onClick={() => handleSquare(row, column)}
                key={`${row}-${column}`}
                aria-label={squareLabel(row, column, piece, legalMove)}
              >
                {piece && (
                  <span
                    className="checkerPiece"
                    data-side={piece.side}
                    data-king={piece.king ? 'true' : undefined}
                  >
                    {piece.king ? '★' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="puzzlePanel checkersPanel">
        <div>
          <p className="eyebrow">how to play</p>
          <p>
            Two players share the board. Click a piece, then a glowing square. Jumps are required.
          </p>
        </div>

        <div className="turnCard" data-turn={winner || turn}>
          <p>{winner ? 'winner' : 'turn'}</p>
          <span>{labelFor(winner || turn)}</span>
        </div>

        <div className="moveCounter" aria-live="polite">
          <span>{moves}</span>
          <p>moves</p>
        </div>

        <p className="puzzleMessage" aria-live="polite">
          {message}
        </p>

        <div className="puzzleActions">
          <button className="actionButton" type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </aside>
    </div>
  );
}

function labelFor(side: Side) {
  return side === 'black' ? 'Black' : 'Red';
}

function squareLabel(
  row: number,
  column: number,
  piece: Piece | undefined,
  move: Move | undefined,
) {
  if (piece) {
    return `${labelFor(piece.side)} ${piece.king ? 'king' : 'piece'} on row ${row + 1}, column ${column + 1}`;
  }

  if (move?.capturedPieceId) return `Jump landing on row ${row + 1}, column ${column + 1}`;
  if (move) return `Move landing on row ${row + 1}, column ${column + 1}`;

  return `Square row ${row + 1}, column ${column + 1}`;
}

function readSavedCheckers(): SavedCheckers | null {
  try {
    const rawGame = localStorage.getItem(checkersStorageKey);
    if (!rawGame) return null;

    const game: unknown = JSON.parse(rawGame);
    if (!isRecord(game) || !isPieceArray(game.pieces)) return null;
    if (game.turn !== 'black' && game.turn !== 'red') return null;
    if (game.winner !== null && game.winner !== 'black' && game.winner !== 'red') return null;
    if (typeof game.moves !== 'number' || !Number.isInteger(game.moves) || game.moves < 0) {
      return null;
    }

    return { pieces: game.pieces, turn: game.turn, moves: game.moves, winner: game.winner };
  } catch {
    return null;
  }
}

function writeSavedCheckers(game: SavedCheckers) {
  try {
    if (game.moves === 0 && !game.winner) {
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
