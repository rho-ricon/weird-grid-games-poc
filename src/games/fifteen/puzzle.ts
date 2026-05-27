export type Tile = number | null;
export type Board = Tile[];

export const puzzleSize = 4;
export const solvedBoard: Board = Array.from({ length: puzzleSize * puzzleSize }, (_, index) =>
  index === puzzleSize * puzzleSize - 1 ? null : index + 1,
);

export function getEmptyIndex(board: Board) {
  return board.indexOf(null);
}

export function isAdjacent(firstIndex: number, secondIndex: number, size = puzzleSize) {
  const firstRow = Math.floor(firstIndex / size);
  const firstColumn = firstIndex % size;
  const secondRow = Math.floor(secondIndex / size);
  const secondColumn = secondIndex % size;

  return Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1;
}

export function canMove(board: Board, tileIndex: number) {
  const emptyIndex = getEmptyIndex(board);
  return board[tileIndex] !== null && emptyIndex >= 0 && isAdjacent(tileIndex, emptyIndex);
}

export function moveTile(board: Board, tileIndex: number) {
  if (!canMove(board, tileIndex)) return board;

  const emptyIndex = getEmptyIndex(board);
  const nextBoard = [...board];
  nextBoard[emptyIndex] = board[tileIndex];
  nextBoard[tileIndex] = null;
  return nextBoard;
}

export function movableIndices(board: Board) {
  return board.flatMap((tile, index) => (tile !== null && canMove(board, index) ? [index] : []));
}

export function isSolved(board: Board) {
  return solvedBoard.every((tile, index) => board[index] === tile);
}

export function shuffleBoard(
  startingBoard: Board = solvedBoard,
  steps = 96,
  random: () => number = Math.random,
) {
  let board = [...startingBoard];
  let previousEmptyIndex = -1;

  for (let step = 0; step < steps; step += 1) {
    const emptyIndex = getEmptyIndex(board);
    const choices = movableIndices(board).filter((index) => index !== previousEmptyIndex);
    const safeChoices = choices.length > 0 ? choices : movableIndices(board);
    const choice = safeChoices[Math.floor(random() * safeChoices.length)];

    board = moveTile(board, choice);
    previousEmptyIndex = emptyIndex;
  }

  if (isSolved(board)) {
    return moveTile(board, movableIndices(board)[0]);
  }

  return board;
}
