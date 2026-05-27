import { type CSSProperties, type DragEvent, useMemo, useState } from 'react';
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

const draggedTileFormat = 'application/x-weird-grid-tile';

export function FifteenPuzzle() {
  const [board, setBoard] = useState<Board>(solvedBoard);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Shuffle the board, then put the numbers back in order.');
  const [lastNopeIndex, setLastNopeIndex] = useState<number | null>(null);
  const [dragMode, setDragMode] = useState(false);

  const squares = useMemo(
    () =>
      board.flatMap((tile, index) =>
        tile === null ? [] : [{ tile, index } satisfies PuzzleSquare],
      ),
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
    setMessage('Okay, tiny chaos. Click a square next to the blank space.');
  }

  function reset() {
    setBoard(solvedBoard);
    setMoves(0);
    setLastNopeIndex(null);
    setMessage('Back to the tidy board. Shuffle when you are ready.');
  }

  function toggleDragMode() {
    const nextDragMode = !dragMode;
    setDragMode(nextDragMode);
    setLastNopeIndex(null);
    setMessage(
      nextDragMode
        ? 'Drag mode! Drag a number into the moon gap.'
        : 'Click mode is back. Tap a square touching the gap.',
    );
  }

  function startDrag(square: PuzzleSquare, event: DragEvent<HTMLButtonElement>) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(draggedTileFormat, String(square.tile));
    event.dataTransfer.setData('text/plain', String(square.tile));
    setMessage('Drop it on the moon gap.');
  }

  function dropOnGap(event: DragEvent<HTMLDivElement>) {
    if (!dragMode) return;

    event.preventDefault();
    const tile = Number(
      event.dataTransfer.getData(draggedTileFormat) || event.dataTransfer.getData('text/plain'),
    );
    const tileIndex = board.indexOf(tile);

    if (!Number.isInteger(tile) || tileIndex < 0) {
      setMessage('The moon only wants numbered tiles.');
      return;
    }

    slideSquare({ tile, index: tileIndex }, 'drag');
  }

  return (
    <div className="fifteenPuzzle">
      <div className="puzzleBoardCard" data-won={won ? 'true' : undefined}>
        <div className="slidingBoard">
          <div
            className="square squareEmpty boardSpace"
            data-status="empty"
            role="img"
            aria-label="moon gap"
            style={squareStyle(emptyIndex)}
            onDragOver={(event) => {
              if (!dragMode) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={dropOnGap}
          />
          {squares.map((square) => {
            const movable = canMove(board, square.index);

            return (
              <button
                className="square slidingTile"
                data-status={square.index === lastNopeIndex ? 'nope' : movable ? 'movable' : 'tile'}
                data-draggable={dragMode ? 'true' : undefined}
                type="button"
                draggable={dragMode}
                style={squareStyle(square.index)}
                onClick={() => slideSquare(square)}
                onDragStart={(event) => startDrag(square, event)}
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

function squareStyle(index: number) {
  return {
    '--tile-column': index % puzzleSize,
    '--tile-row': Math.floor(index / puzzleSize),
  } as CSSProperties;
}
