import { type CSSProperties, type PointerEvent, useMemo, useRef, useState } from 'react';
import {
  type Board,
  canMove,
  getEmptyIndex,
  isSolved,
  moveTile,
  puzzleSize,
  shuffleBoard,
  solvedBoard,
} from './puzzle';

type PuzzleSquare = {
  tile: number;
  index: number;
};

type MoveGesture = 'click' | 'drag';

type ActiveDrag = {
  tile: number;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

export function FifteenPuzzle() {
  const [board, setBoard] = useState<Board>(solvedBoard);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Shuffle the board, then put the numbers back in order.');
  const [lastNopeIndex, setLastNopeIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState(false);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const gapRef = useRef<HTMLDivElement>(null);

  const squares = useMemo(
    () =>
      Array.from({ length: puzzleSize * puzzleSize - 1 }, (_, tileIndex) => {
        const tile = tileIndex + 1;
        return { tile, index: board.indexOf(tile) } satisfies PuzzleSquare;
      }),
    [board],
  );
  const emptyIndex = getEmptyIndex(board);
  const won = moves > 0 && isSolved(board);

  function slideSquare(square: PuzzleSquare, gesture: MoveGesture = 'click') {
    if (!canMove(board, square.index)) {
      setLastNopeIndex(square.index);
      setMessage(
        gesture === 'drag'
          ? 'That tile cannot reach the moon. Drag one touching the gap.'
          : 'That square is stuck. Try one touching the blank space.',
      );
      return;
    }

    const nextBoard = moveTile(board, square.index);
    const nextMoves = moves + 1;

    setBoard(nextBoard);
    setMoves(nextMoves);
    setLastNopeIndex(null);
    setMessage(
      isSolved(nextBoard)
        ? `You solved it in ${nextMoves} move${nextMoves === 1 ? '' : 's'}!`
        : gesture === 'drag'
          ? 'Nice drop.'
          : 'Nice slide.',
    );
  }

  function shuffle() {
    setBoard(shuffleBoard());
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
        ? 'Drag mode! Drag a number into the moon gap.'
        : 'Click mode is back. Tap a square touching the gap.',
    );
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const droppedOnGap = elementsOverlap(event.currentTarget, gapRef.current);
    setActiveDrag(null);

    if (!droppedOnGap) {
      setMessage('Almost. Drop the tile so it touches the moon gap.');
      return;
    }

    const tileIndex = board.indexOf(square.tile);
    slideSquare({ tile: square.tile, index: tileIndex }, 'drag');
  }

  function cancelDrag(square: PuzzleSquare, event: PointerEvent<HTMLButtonElement>) {
    if (activeDrag?.tile !== square.tile || activeDrag.pointerId !== event.pointerId) return;

    setActiveDrag(null);
    setMessage('The tile slipped back home.');
  }

  return (
    <div className="fifteenPuzzle">
      <div className="puzzleBoardCard" data-won={won ? 'true' : undefined}>
        <div className="slidingBoard">
          <div
            className="square squareEmpty boardSpace"
            data-status="empty"
            data-drop-target={dragMode ? 'true' : undefined}
            role="img"
            aria-label="moon gap"
            ref={gapRef}
            style={squareStyle(emptyIndex)}
          />
          {squares.map((square) => {
            const movable = canMove(board, square.index);
            const isDragging = activeDrag?.tile === square.tile;

            return (
              <button
                className="square slidingTile"
                data-status={square.index === lastNopeIndex ? 'nope' : movable ? 'movable' : 'tile'}
                data-draggable={dragMode ? 'true' : undefined}
                data-dragging={isDragging ? 'true' : undefined}
                type="button"
                style={squareStyle(square.index, isDragging ? activeDrag : null)}
                onClick={(event) => {
                  if (dragMode) {
                    event.preventDefault();
                    return;
                  }

                  slideSquare(square);
                }}
                onPointerDown={(event) => startDrag(square, event)}
                onPointerMove={(event) => moveDrag(square, event)}
                onPointerUp={(event) => endDrag(square, event)}
                onPointerCancel={(event) => cancelDrag(square, event)}
                key={square.tile}
                aria-label={`Tile ${square.tile}${movable ? ', can slide' : ''}`}
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
          <p>Click a number next to the moon gap. The goal is 1 through 15, left to right.</p>
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
            onClick={toggleDragMode}
          >
            {dragMode ? 'Drag: on' : 'Drag mode'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function squareStyle(index: number, drag?: ActiveDrag | null) {
  return {
    '--tile-column': index % puzzleSize,
    '--tile-row': Math.floor(index / puzzleSize),
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
