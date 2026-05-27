import { useMemo, useState } from 'react';
import { SquareGrid } from '../../components/SquareGrid';
import {
  type Board,
  canMove,
  isSolved,
  moveTile,
  puzzleSize,
  shuffleBoard,
  solvedBoard,
} from './puzzle';

type PuzzleSquare = {
  tile: number | null;
  index: number;
};

export function FifteenPuzzle() {
  const [board, setBoard] = useState<Board>(solvedBoard);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('Shuffle the board, then put the numbers back in order.');
  const [lastNopeIndex, setLastNopeIndex] = useState<number | null>(null);

  const squares = useMemo(
    () => board.map((tile, index) => ({ tile, index }) satisfies PuzzleSquare),
    [board],
  );
  const won = moves > 0 && isSolved(board);

  function slideSquare(square: PuzzleSquare) {
    if (!canMove(board, square.index)) {
      setLastNopeIndex(square.index);
      setMessage('That square is stuck. Try one touching the blank space.');
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

  return (
    <div className="fifteenPuzzle">
      <div className="puzzleBoardCard" data-won={won ? 'true' : undefined}>
        <SquareGrid
          items={squares}
          columns={puzzleSize}
          getKey={(square) => square.index}
          getLabel={(square) => square.tile}
          getIsEmpty={(square) => square.tile === null}
          getStatus={(square) => {
            if (square.tile === null) return 'empty';
            if (square.index === lastNopeIndex) return 'nope';
            return canMove(board, square.index) ? 'movable' : 'tile';
          }}
          onPick={slideSquare}
        />
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
        </div>
      </aside>
    </div>
  );
}
