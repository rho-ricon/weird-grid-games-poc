export type Side = 'black' | 'red';

export type Piece = {
  id: string;
  side: Side;
  row: number;
  column: number;
  king: boolean;
};

export type Move = {
  pieceId: string;
  toRow: number;
  toColumn: number;
  capturedPieceId?: string;
};

export type MoveResult = {
  pieces: Piece[];
  movedPiece: Piece;
  captured: boolean;
  becameKing: boolean;
};

export const checkersSize = 8;

export function initialPieces(): Piece[] {
  const pieces: Piece[] = [];

  for (let row = 0; row < checkersSize; row += 1) {
    for (let column = 0; column < checkersSize; column += 1) {
      if (!isPlayableSquare(row, column)) continue;

      if (row < 3) {
        pieces.push({ id: `black-${row}-${column}`, side: 'black', row, column, king: false });
      } else if (row > 4) {
        pieces.push({ id: `red-${row}-${column}`, side: 'red', row, column, king: false });
      }
    }
  }

  return pieces;
}

export function isPlayableSquare(row: number, column: number) {
  return isInsideBoard(row, column) && (row + column) % 2 === 1;
}

export function otherSide(side: Side): Side {
  return side === 'black' ? 'red' : 'black';
}

export function pieceAt(pieces: Piece[], row: number, column: number) {
  return pieces.find((piece) => piece.row === row && piece.column === column);
}

export function legalMovesForSide(pieces: Piece[], side: Side, continuingPieceId?: string): Move[] {
  const sidePieces = pieces.filter((piece) => piece.side === side);
  const candidatePieces = continuingPieceId
    ? sidePieces.filter((piece) => piece.id === continuingPieceId)
    : sidePieces;
  const captures = candidatePieces.flatMap((piece) => legalMovesForPiece(pieces, piece, true));

  if (captures.length > 0 || continuingPieceId) return captures;

  return candidatePieces.flatMap((piece) => legalMovesForPiece(pieces, piece, false));
}

export function legalMovesForPiece(pieces: Piece[], piece: Piece, capturesOnly: boolean): Move[] {
  const moves: Move[] = [];

  for (const [rowDelta, columnDelta] of directionsFor(piece)) {
    const row = piece.row + rowDelta;
    const column = piece.column + columnDelta;
    const landingRow = piece.row + rowDelta * 2;
    const landingColumn = piece.column + columnDelta * 2;
    const neighbor = pieceAt(pieces, row, column);
    const landingPiece = pieceAt(pieces, landingRow, landingColumn);

    if (
      neighbor &&
      neighbor.side !== piece.side &&
      isPlayableSquare(landingRow, landingColumn) &&
      !landingPiece
    ) {
      moves.push({
        pieceId: piece.id,
        toRow: landingRow,
        toColumn: landingColumn,
        capturedPieceId: neighbor.id,
      });
      continue;
    }

    if (!capturesOnly && isPlayableSquare(row, column) && !neighbor) {
      moves.push({ pieceId: piece.id, toRow: row, toColumn: column });
    }
  }

  return capturesOnly ? moves.filter((move) => move.capturedPieceId) : moves;
}

export function applyMove(pieces: Piece[], move: Move): MoveResult {
  const piece = pieces.find((candidate) => candidate.id === move.pieceId);

  if (!piece) {
    throw new Error(`Cannot move missing piece ${move.pieceId}`);
  }

  const becameKing = !piece.king && reachesKingRow(piece.side, move.toRow);
  const movedPiece = {
    ...piece,
    row: move.toRow,
    column: move.toColumn,
    king: piece.king || becameKing,
  };
  const nextPieces = pieces
    .filter((candidate) => candidate.id !== move.capturedPieceId)
    .map((candidate) => (candidate.id === piece.id ? movedPiece : candidate));

  return {
    pieces: nextPieces,
    movedPiece,
    captured: Boolean(move.capturedPieceId),
    becameKing,
  };
}

export function winnerFor(pieces: Piece[], turn: Side): Side | null {
  const opponent = otherSide(turn);
  const opponentPieces = pieces.filter((piece) => piece.side === opponent);

  if (opponentPieces.length === 0) return turn;
  if (legalMovesForSide(pieces, opponent).length === 0) return turn;

  return null;
}

function directionsFor(piece: Piece) {
  if (piece.king) {
    return [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  }

  return piece.side === 'black'
    ? [
        [1, 1],
        [1, -1],
      ]
    : [
        [-1, 1],
        [-1, -1],
      ];
}

function reachesKingRow(side: Side, row: number) {
  return (side === 'black' && row === checkersSize - 1) || (side === 'red' && row === 0);
}

function isInsideBoard(row: number, column: number) {
  return row >= 0 && row < checkersSize && column >= 0 && column < checkersSize;
}
