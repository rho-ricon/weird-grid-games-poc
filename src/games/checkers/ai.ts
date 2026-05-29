import {
  applyMove,
  checkersSize,
  legalMovesForSide,
  type Move,
  otherSide,
  type Piece,
  type Side,
} from './rules';

export type ComputerDifficulty = 'gentle' | 'trained';

export function chooseComputerMove(
  pieces: Piece[],
  side: Side,
  continuingPieceId?: string,
  difficulty: ComputerDifficulty = 'gentle',
): Move | null {
  const moves = legalMovesForSide(pieces, side, continuingPieceId);

  if (moves.length === 0) return null;

  return [...moves].sort((first, second) => {
    const scoreDifference =
      scoreMoveForDifficulty(pieces, side, second, difficulty) -
      scoreMoveForDifficulty(pieces, side, first, difficulty);

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

function scoreMoveForDifficulty(
  pieces: Piece[],
  side: Side,
  move: Move,
  difficulty: ComputerDifficulty,
) {
  if (difficulty === 'trained') return scoreTrainedMove(pieces, side, move);

  return scoreGentleMove(pieces, side, move);
}

function scoreGentleMove(pieces: Piece[], side: Side, move: Move) {
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

function scoreTrainedMove(pieces: Piece[], side: Side, move: Move) {
  const result = applyMove(pieces, move);
  const opponent = otherSide(side);
  const opponentReplies = legalMovesForSide(result.pieces, opponent);

  if (opponentReplies.length === 0) return 10_000 + scoreGentleMove(pieces, side, move);

  const worstReplyScore = Math.min(
    ...opponentReplies.map((reply) => scoreAfterReply(result.pieces, opponent, reply, side)),
  );

  return worstReplyScore + scoreGentleMove(pieces, side, move) * 0.25;
}

function scoreAfterReply(pieces: Piece[], movingSide: Side, move: Move, scoredSide: Side): number {
  const result = applyMove(pieces, move);

  if (result.captured && !result.becameKing) {
    const followUpJumps = legalMovesForSide(result.pieces, movingSide, result.movedPiece.id);

    if (followUpJumps.length > 0) {
      const scores = followUpJumps.map((followUp) =>
        scoreAfterReply(result.pieces, movingSide, followUp, scoredSide),
      );

      return movingSide === scoredSide ? Math.max(...scores) : Math.min(...scores);
    }
  }

  return scoreBoard(result.pieces, scoredSide);
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
