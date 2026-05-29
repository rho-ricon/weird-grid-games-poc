import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { playBlockedMove, playTilePress } from '../../utils/sound';
import { chooseComputerMove } from './ai';
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
import { type ComputerSide, readSavedCheckers, writeSavedCheckers } from './storage';

const openingSide: Side = 'red';
const computerMoveDelay = 460;
const computerJumpDelay = 320;

export function Checkers() {
  const savedGame = useMemo(readSavedCheckers, []);
  const [pieces, setPieces] = useState<Piece[]>(() => savedGame?.pieces || initialPieces());
  const [turn, setTurn] = useState<Side>(() => savedGame?.turn || openingSide);
  const [moves, setMoves] = useState(() => savedGame?.moves || 0);
  const [winner, setWinner] = useState<Side | null>(() => savedGame?.winner || null);
  const [computerSide, setComputerSide] = useState<ComputerSide>(
    () => savedGame?.computerSide ?? null,
  );
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [mustContinuePieceId, setMustContinuePieceId] = useState<string | null>(null);
  const [message, setMessage] = useState(() =>
    savedGame
      ? 'Welcome back to the checkerboard.'
      : 'Red goes first. Click a piece, then a glowing square.',
  );

  const isComputerTurn = computerSide === turn && !winner;
  const legalMoves = useMemo(
    () => (winner ? [] : legalMovesForSide(pieces, turn, mustContinuePieceId || undefined)),
    [mustContinuePieceId, pieces, turn, winner],
  );
  const selectedMoves = legalMoves.filter((move) => move.pieceId === selectedPieceId);
  const captureRequired = legalMoves.some((move) => move.capturedPieceId);

  useEffect(() => {
    writeSavedCheckers({ pieces, turn, moves, winner, computerSide });
  }, [computerSide, moves, pieces, turn, winner]);

  useEffect(() => {
    if (!isComputerTurn) return;

    const move = chooseComputerMove(pieces, turn, mustContinuePieceId || undefined);

    if (!move) {
      setMessage(`${labelFor(turn)} is stuck.`);
      return;
    }

    setSelectedPieceId(move.pieceId);
    setMessage(
      mustContinuePieceId
        ? `${labelFor(turn)} lines up another jump...`
        : `${labelFor(turn)} is thinking...`,
    );

    const timer = window.setTimeout(
      () => {
        playTilePress();
        playMove(move, 'computer');
      },
      mustContinuePieceId ? computerJumpDelay : computerMoveDelay,
    );

    return () => window.clearTimeout(timer);
  }, [isComputerTurn, mustContinuePieceId, pieces, turn]);

  function reset() {
    setPieces(initialPieces());
    setTurn(openingSide);
    setMoves(0);
    setWinner(null);
    setSelectedPieceId(null);
    setMustContinuePieceId(null);
    setMessage(
      computerSide
        ? 'Fresh board. Red goes first; the computer has Black.'
        : 'Fresh board. Red goes first.',
    );
  }

  function toggleComputerSide() {
    const nextComputerSide: ComputerSide = computerSide ? null : 'black';

    setComputerSide(nextComputerSide);
    setSelectedPieceId(null);
    setMessage(
      nextComputerSide
        ? 'Computer has Black. Red still goes first.'
        : 'Two-player mode. Share the board.',
    );
  }

  function handleSquare(row: number, column: number) {
    if (!isPlayableSquare(row, column)) return;

    if (winner) {
      playBlockedMove();
      setMessage(`${labelFor(winner)} already won. Reset for a new game.`);
      return;
    }

    if (isComputerTurn) {
      playBlockedMove();
      setMessage(`${labelFor(turn)} is thinking.`);
      return;
    }

    const move = selectedMoves.find(
      (candidate) => candidate.toRow === row && candidate.toColumn === column,
    );

    if (move) {
      playTilePress();
      playMove(move, 'human');
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

  function playMove(move: Move, actor: 'human' | 'computer') {
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
        setMessage(
          actor === 'computer'
            ? `${labelFor(turn)} keeps jumping...`
            : 'Jump again with the same piece!',
        );
        return;
      }
    }

    const nextTurn = otherSide(turn);
    setTurn(nextTurn);
    setSelectedPieceId(null);
    setMustContinuePieceId(null);
    setMessage(
      nextTurn === computerSide
        ? `${labelFor(nextTurn)} is thinking...`
        : `${labelFor(nextTurn)}'s turn.`,
    );
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
              />
            );
          })}
          {pieces.map((piece) => (
            <span
              className="checkerPiece"
              data-side={piece.side}
              data-king={piece.king ? 'true' : undefined}
              style={pieceStyle(piece)}
              aria-hidden="true"
              key={piece.id}
            >
              {piece.king ? '★' : ''}
            </span>
          ))}
        </div>
      </div>

      <aside className="puzzlePanel checkersPanel">
        <div>
          <p className="eyebrow">how to play</p>
          <p>
            {computerSide
              ? 'You play Red. The computer plays Black. Click a piece, then a glowing square.'
              : 'Two players share the board. Click a piece, then a glowing square. Jumps are required.'}
          </p>
        </div>

        <div
          className="turnCard"
          data-turn={winner || turn}
          data-computer={isComputerTurn ? 'true' : undefined}
        >
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
          <button
            className="actionButton"
            type="button"
            data-active={computerSide ? 'true' : undefined}
            aria-pressed={Boolean(computerSide)}
            onClick={toggleComputerSide}
          >
            {computerSide ? 'Computer: Black' : 'Computer: off'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function labelFor(side: Side) {
  return side === 'black' ? 'Black' : 'Red';
}

function pieceStyle(piece: Piece) {
  return {
    '--checker-row': piece.row,
    '--checker-column': piece.column,
  } as CSSProperties;
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
