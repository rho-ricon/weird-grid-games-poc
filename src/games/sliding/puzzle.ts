export type Tile = number | null;
export type Board = Tile[];

export function solvedBoardForSize(size: number): Board {
  return Array.from({ length: size * size }, (_, index) =>
    index === size * size - 1 ? null : index + 1,
  );
}

export function getEmptyIndex(board: Board) {
  return board.indexOf(null);
}

export function isAdjacent(firstIndex: number, secondIndex: number, size: number) {
  const firstRow = Math.floor(firstIndex / size);
  const firstColumn = firstIndex % size;
  const secondRow = Math.floor(secondIndex / size);
  const secondColumn = secondIndex % size;

  return Math.abs(firstRow - secondRow) + Math.abs(firstColumn - secondColumn) === 1;
}

export function canMove(board: Board, tileIndex: number, size: number) {
  const emptyIndex = getEmptyIndex(board);
  return board[tileIndex] !== null && emptyIndex >= 0 && isAdjacent(tileIndex, emptyIndex, size);
}

export function moveTile(board: Board, tileIndex: number, size: number) {
  if (!canMove(board, tileIndex, size)) return board;

  return swapTileWithEmpty(board, tileIndex);
}

export function swapTileWithEmpty(board: Board, tileIndex: number) {
  const emptyIndex = getEmptyIndex(board);

  if (board[tileIndex] === null || emptyIndex < 0) return board;

  const nextBoard = [...board];
  nextBoard[emptyIndex] = board[tileIndex];
  nextBoard[tileIndex] = null;
  return nextBoard;
}

export function movableIndices(board: Board, size: number) {
  return board.flatMap((tile, index) =>
    tile !== null && canMove(board, index, size) ? [index] : [],
  );
}

export function isSolved(board: Board, size: number) {
  const solvedBoard = solvedBoardForSize(size);
  return solvedBoard.every((tile, index) => board[index] === tile);
}

export function shuffleBoard({
  size,
  startingBoard = solvedBoardForSize(size),
  steps = size * size * 6,
  random = Math.random,
}: {
  size: number;
  startingBoard?: Board;
  steps?: number;
  random?: () => number;
}) {
  let board = [...startingBoard];
  let previousEmptyIndex = -1;

  for (let step = 0; step < steps; step += 1) {
    const emptyIndex = getEmptyIndex(board);
    const choices = movableIndices(board, size).filter((index) => index !== previousEmptyIndex);
    const safeChoices = choices.length > 0 ? choices : movableIndices(board, size);
    const choice = safeChoices[Math.floor(random() * safeChoices.length)];

    board = moveTile(board, choice, size);
    previousEmptyIndex = emptyIndex;
  }

  if (isSolved(board, size)) {
    return moveTile(board, movableIndices(board, size)[0], size);
  }

  return board;
}
