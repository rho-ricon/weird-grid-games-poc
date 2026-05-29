import {
  applyMove,
  checkersSize,
  legalMovesForSide,
  type Move,
  otherSide,
  type Piece,
  type Side,
} from './rules';

export function chooseComputerMove(
  pieces: Piece[],
  side: Side,
  continuingPieceId?: string,
): Move | null {
  const moves = legalMovesForSide(pieces, side, continuingPieceId);

  if (moves.length === 0) return null;

  return [...moves].sort((first, second) => {
    const scoreDifference = scoreMove(pieces, side, second) - scoreMove(pieces, side, first);

    if (scoreDifference !== 0) return scoreDifference;

    return moveKey(first).localeCompare(moveKey(second));
  })[0];
}

export function scoreBoard(pieces: Piece[], side: Side) {
  return pieces.reduce((score, piece) => {
    const pieceScore = scorePiece(piece);
    return score + (piece.side === side ? pieceScore : -pieceScore);
  }, 0);
}

function scoreMove(pieces: Piece[], side: Side, move: Move) {
  const result = applyMove(pieces, move);
  const opponent = otherSide(side);
  const opponentReplies = legalMovesForSide(result.pieces, opponent);
  const movedPieceCanBeCaptured = opponentReplies.some(
    (reply) => reply.capturedPieceId === result.movedPiece.id,
  );

  return (
    scoreBoard(result.pieces, side) +
    (move.capturedPieceId ? 45 : 0) +
    (result.becameKing ? 70 : 0) -
    (movedPieceCanBeCaptured ? 35 : 0)
  );
}

function scorePiece(piece: Piece) {
  return 100 + (piece.king ? 35 : 0) + advancementScore(piece) + centerScore(piece);
}

function advancementScore(piece: Piece) {
  if (piece.king) return 0;

  const rowsAdvanced = piece.side === 'black' ? piece.row : checkersSize - 1 - piece.row;
  return rowsAdvanced * 4;
}

function centerScore(piece: Piece) {
  const distanceFromCenter = Math.abs(piece.column - 3.5);
  return Math.max(0, 8 - distanceFromCenter * 2);
}

function moveKey(move: Move) {
  return `${move.pieceId}:${move.toRow}:${move.toColumn}`;
}
