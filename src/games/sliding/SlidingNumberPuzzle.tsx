import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { playBlockedMove, playTilePress } from '../../utils/sound';
import {
  type Board,
  canMove,
  getEmptyIndex,
  isSolved,
  moveTile,
  shuffleBoard,
  solvedBoardForSize,
  swapTileWithEmpty,
} from './puzzle';

type SlidingNumberPuzzleProps = {
  size: number;
  storageKey: string;
  shuffleSteps?: number;
};

type PuzzleSquare = {
  tile: number;
  index: number;
};

type ActiveDrag = {
  tile: number;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

type SavedPuzzle = {
  board: Board;
  moves: number;
};

const soundStorageKey = 'weird-grid-games:sound:v1';

export function SlidingNumberPuzzle({ size, storageKey, shuffleSteps }: SlidingNumberPuzzleProps) {
  const solvedBoard = useMemo(() => solvedBoardForSize(size), [size]);
  const puzzleStorageKey = `weird-grid-games:${storageKey}:v1`;
  const initialPuzzle = useMemo(
    () => readSavedPuzzle(puzzleStorageKey, size, solvedBoard),
    [puzzleStorageKey, size, solvedBoard],
  );
  const [board, setBoard] = useState<Board>(() => initialPuzzle?.board || solvedBoard);
  const [moves, setMoves] = useState(() => initialPuzzle?.moves || 0);
  const [message, setMessage] = useState(() =>
    initialPuzzle
      ? 'Welcome back. Your puzzle waited for you.'
      : 'Shuffle the board, then put the numbers back in order.',
  );
  const [lastNopeIndex, setLastNopeIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(readSavedSoundEnabled);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const gapRef = useRef<HTMLDivElement>(null);

  const squares = useMemo(
    () =>
      Array.from({ length: size * size - 1 }, (_, tileIndex) => {
        const tile = tileIndex + 1;
        return { tile, index: board.indexOf(tile) } satisfies PuzzleSquare;
      }),
    [board, size],
  );
  const emptyIndex = getEmptyIndex(board);
  const won = moves > 0 && isSolved(board, size);

  useEffect(() => {
    writeSavedPuzzle(puzzleStorageKey, { board, moves }, size);
  }, [board, moves, puzzleStorageKey, size]);

  useEffect(() => {
    writeSavedSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  function slideSquare(square: PuzzleSquare) {
    if (!canMove(board, square.index, size)) {
      if (soundEnabled) playBlockedMove();
      setLastNopeIndex(square.index);
      setMessage('That square is stuck. Try one touching the blank space.');
      return;
    }

    if (soundEnabled) playTilePress();
    applyMove(moveTile(board, square.index, size), 'Nice slide.');
  }

  function dropSquare(square: PuzzleSquare) {
    const tileIndex = board.indexOf(square.tile);
    if (soundEnabled) playTilePress();
    applyMove(swapTileWithEmpty(board, tileIndex), 'Nice drop.');
  }

  function applyMove(nextBoard: Board, nextMessage: string) {
    const nextMoves = moves + 1;

    setBoard(nextBoard);
    setMoves(nextMoves);
    setLastNopeIndex(null);
    setMessage(
      isSolved(nextBoard, size)
        ? `You solved it in ${nextMoves} move${nextMoves === 1 ? '' : 's'}!`
        : nextMessage,
    );
  }

  function shuffle() {
    setBoard(shuffleBoard({ size, steps: shuffleSteps }));
    setMoves(0);
    setLastNopeIndex(null);
    setActiveDrag(null);
    setMessage('Okay, tiny chaos. Click a square next to the blank space.');
  }

  function reset() {
    setBoard(solvedBoard);
    setMoves(0);
    setLastNopeIndex(null);
    setActiveDrag(null);
    setMessage('Back to the tidy board. Shuffle when you are ready.');
  }

  function toggleDragMode() {
    const nextDragMode = !dragMode;
    setDragMode(nextDragMode);
    setLastNopeIndex(null);
    setActiveDrag(null);
    setMessage(
      nextDragMode
        ? 'Drag mode! Drag any number into the moon gap.'
        : 'Click mode is back. Tap a square touching the gap.',
    );
  }

  function toggleSound() {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);
    setMessage(nextSoundEnabled ? 'Tiny bloops are on.' : 'Quiet mode.');
  }

  function pressSquare(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (dragMode && event.button === 0 && soundEnabled) {
      playTilePress();
    }

    startDrag(square, event);
  }

  function startDrag(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (!dragMode || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveDrag({
      tile: square.tile,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0,
    });
    setMessage('Drop it on the moon gap.');
  }

  function moveDrag(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag?.tile !== square.tile || activeDrag.pointerId !== event.pointerId) return;

    event.preventDefault();
    setActiveDrag((drag) => {
      if (!drag || drag.tile !== square.tile || drag.pointerId !== event.pointerId) return drag;

      return {
        ...drag,
        x: event.clientX - drag.startX,
        y: event.clientY - drag.startY,
      };
    });
  }

  function endDrag(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag?.tile !== square.tile || activeDrag.pointerId !== event.pointerId) return;

    event.preventDefault();
    const droppedOnGap = elementsOverlap(event.currentTarget, gapRef.current);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setActiveDrag(null);

    if (!droppedOnGap) {
      setMessage('Almost. Drop the tile so it touches the moon gap.');
      return;
    }

    dropSquare(square);
  }

  function cancelDrag(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag?.tile !== square.tile || activeDrag.pointerId !== event.pointerId) return;

    setActiveDrag(null);
    setMessage('The tile slipped back home.');
  }

  return (
    <div className="fifteenPuzzle">
      <div className="puzzleBoardCard" data-won={won ? 'true' : undefined}>
        <div className="slidingBoard" data-board-size={size} style={boardStyle(size)}>
          <div
            className="square squareEmpty boardSpace"
            data-status="empty"
            data-drop-target={dragMode ? 'true' : undefined}
            role="img"
            aria-label="moon gap"
            ref={gapRef}
            style={squareStyle(emptyIndex, size)}
          />
          {squares.map((square) => {
            const movable = canMove(board, square.index, size);
            const isDragging = activeDrag?.tile === square.tile;
            const canInteract = dragMode || movable;

            return (
              <button
                className="square slidingTile"
                data-status={
                  square.index === lastNopeIndex ? 'nope' : canInteract ? 'movable' : 'tile'
                }
                data-draggable={dragMode ? 'true' : undefined}
                data-dragging={isDragging ? 'true' : undefined}
                type="button"
                style={squareStyle(square.index, size, isDragging ? activeDrag : null)}
                onClick={(event) => {
                  if (dragMode) {
                    event.preventDefault();
                    return;
                  }

                  slideSquare(square);
                }}
                onPointerDown={(event) => pressSquare(square, event)}
                onPointerMove={(event) => moveDrag(square, event)}
                onPointerUp={(event) => endDrag(square, event)}
                onPointerCancel={(event) => cancelDrag(square, event)}
                key={square.tile}
                aria-label={`Tile ${square.tile}${canInteract ? ', can move' : ''}`}
              >
                {square.tile}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="puzzlePanel">
        <div>
          <p className="eyebrow">how to play</p>
          <p>
            Click a number next to the moon gap. The goal is 1 through {size * size - 1}, left to
            right.
          </p>
        </div>

        <div className="moveCounter" aria-live="polite">
          <span>{moves}</span>
          <p>moves</p>
        </div>

        <p className="puzzleMessage" aria-live="polite">
          {message}
        </p>

        <div className="puzzleActions">
          <button className="actionButton" type="button" onClick={shuffle}>
            Shuffle
          </button>
          <button className="actionButton" type="button" onClick={reset}>
            Reset
          </button>
          <button
            className="actionButton"
            type="button"
            data-active={dragMode ? 'true' : undefined}
            aria-pressed={dragMode}
            onClick={toggleDragMode}
          >
            {dragMode ? 'Drag: on' : 'Drag mode'}
          </button>
          <button
            className="actionButton"
            type="button"
            data-active={soundEnabled ? 'true' : undefined}
            aria-pressed={soundEnabled}
            onClick={toggleSound}
          >
            {soundEnabled ? 'Sound: on' : 'Sound: off'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function boardStyle(size: number) {
  return {
    '--board-size': size,
  } as CSSProperties;
}

function squareStyle(index: number, size: number, drag?: ActiveDrag | null) {
  return {
    '--tile-column': index % size,
    '--tile-row': Math.floor(index / size),
    '--drag-x': drag ? `${drag.x}px` : '0px',
    '--drag-y': drag ? `${drag.y}px` : '0px',
  } as CSSProperties;
}

function elementsOverlap(firstElement: HTMLElement, secondElement: HTMLElement | null) {
  if (!secondElement) return false;

  const first = firstElement.getBoundingClientRect();
  const second = secondElement.getBoundingClientRect();

  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

function readSavedPuzzle(
  puzzleStorageKey: string,
  size: number,
  solvedBoard: Board,
): SavedPuzzle | null {
  try {
    const rawPuzzle = localStorage.getItem(puzzleStorageKey);
    if (!rawPuzzle) return null;

    const puzzle: unknown = JSON.parse(rawPuzzle);
    if (!isRecord(puzzle) || !isSavedBoard(puzzle.board, size, solvedBoard)) return null;
    if (typeof puzzle.moves !== 'number' || !Number.isInteger(puzzle.moves) || puzzle.moves < 0) {
      return null;
    }

    return { board: puzzle.board, moves: puzzle.moves };
  } catch {
    return null;
  }
}

function writeSavedPuzzle(puzzleStorageKey: string, { board, moves }: SavedPuzzle, size: number) {
  try {
    if (moves === 0 && isSolved(board, size)) {
      localStorage.removeItem(puzzleStorageKey);
      return;
    }

    localStorage.setItem(puzzleStorageKey, JSON.stringify({ board, moves }));
  } catch {
    // localStorage can be unavailable in private/restricted browsing; the game still works.
  }
}

function readSavedSoundEnabled() {
  try {
    return localStorage.getItem(soundStorageKey) !== 'false';
  } catch {
    return true;
  }
}

function writeSavedSoundEnabled(soundEnabled: boolean) {
  try {
    localStorage.setItem(soundStorageKey, String(soundEnabled));
  } catch {
    // Sound preference persistence is a nice-to-have.
  }
}

function isSavedBoard(value: unknown, size: number, solvedBoard: Board): value is Board {
  if (!Array.isArray(value) || value.length !== size * size) return false;

  const expectedTiles = new Set<number | null>(solvedBoard);

  for (const tile of value) {
    if (tile !== null && (typeof tile !== 'number' || !Number.isInteger(tile))) return false;
    if (!expectedTiles.delete(tile)) return false;
  }

  return expectedTiles.size === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
