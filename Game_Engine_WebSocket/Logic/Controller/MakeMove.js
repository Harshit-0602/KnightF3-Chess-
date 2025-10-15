import { Check_Validate } from "../Utils/CheckLogic.js";
import { CheckingMate } from "../Utils/CheckingMate.js";
import { revert } from "../Utils/RevertMoves.js";

/**
 * Calculates the next en passant state based on a pawn's move.
 */
const handle_El_passant = (destRow, destCol, selected, piece) => {
  const pieceType = piece.slice(1);
  const color = piece[0];

  if (pieceType === "p" && Math.abs(destRow - selected.row) === 2) {
    return { row: destRow, col: destCol, color: color };
  }
  return { row: -1, col: -1, color: "none" };
};

/**
 * Updates castling rights after a king or rook has moved.
 */
const Blocking_Castling = (piece, selected, currentCastleState) => {
  const piece_name = piece.slice(1);
  const color = piece[0];
  const newCastleState = JSON.parse(JSON.stringify(currentCastleState));

  if (piece_name === "king") {
    newCastleState[color].king = false;
    return newCastleState;
  }
  if (piece_name === "r") {
    if (selected.col === 0) newCastleState[color].q_r.eligible = false;
    else if (selected.col === 7) newCastleState[color].r.eligible = false;
  }
  return newCastleState;
};

/**
 * Finds both kings and updates their check, checkmate, and stalemate status.
 */
const updateKing = (grid, turn, currentKingState) => {
  const nextT = turn === "w" ? "b" : "w";
  let myKingPos = null;
  let oppKingPos = null;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (grid[r][c].piece === `${turn}king`) myKingPos = { row: r, col: c };
      if (grid[r][c].piece === `${nextT}king`) oppKingPos = { row: r, col: c };
    }
  }

  const Check_Object_My = Check_Validate(myKingPos.row, myKingPos.col, grid);
  const Check_Object_Opp = Check_Validate(oppKingPos.row, oppKingPos.col, grid);

  const newKingState = {
    ...currentKingState,
    [turn]: Check_Object_My,
    [nextT]: Check_Object_Opp,
  };

  const isMate = !CheckingMate(grid, Check_Object_Opp);
  const play = Check_Object_Opp.check.status ? "Check-Mate" : "Stale-Mate";
  const winner = turn === "w" ? "White" : "Black";

  return { newKingState, isMate, play, winner };
};

/**
 * Executes a chess move and returns the updated game state.
 */
export const MakeMove = (destinationCell, CurState) => {
  const { selected, turn, king, enPassant, castling, grid } = CurState;

  // --- Validation checks ---
  const piece = grid[selected.row]?.[selected.col]?.piece;

  if (
    !selected.isSelected ||     // nothing selected
    !piece ||                   // selected cell is empty
    piece[0] !== turn ||         // not this player's turn
    !grid[destinationCell.row][destinationCell.col].highlight // invalid destination
  ) {
    // Reset selection and revert highlights
    return {
      ...CurState,
      grid: revert(grid),
      selected: { isSelected: false, row: -1, col: -1 }
    };
  }

  // --- 1. Make a deep copy of the grid ---
  let newGrid = JSON.parse(JSON.stringify(grid));
  const { row, col } = destinationCell;

  // --- 2. En passant capture ---
  if (newGrid[row][col].underAttack && newGrid[row][col].piece === "") {
    newGrid[enPassant.row][enPassant.col].piece = "";
  }

  // --- 3. Move the piece ---
  newGrid[row][col].piece = piece;
  newGrid[selected.row][selected.col].piece = "";

  // --- 4. Castling rook move ---
  const diff = selected.col - col;
  if (piece.slice(1) === "king" && Math.abs(diff) === 2) {
    const rook_col = diff === -2 ? 7 : 0;
    const rook_new_col = diff === -2 ? selected.col + 1 : selected.col - 1;
    newGrid[row][rook_new_col].piece = newGrid[row][rook_col].piece;
    newGrid[row][rook_col].piece = "";
  }

  // --- 5. Pawn promotion ---
  let promotion = null;
  if (piece.slice(1) === "p" && (row === 0 || row === 7)) {
    promotion = { row, col };
  }

  // --- 6. Update castling, en passant, and king states ---
  const newCastleState = Blocking_Castling(piece, selected, castling);
  const newElpassantState = handle_El_passant(row, col, selected, piece);
  const { newKingState, isMate, play, winner } = updateKing(newGrid, turn, king);

  // --- 7. Return updated game state ---
  return {
    grid: revert(newGrid),
    turn: turn === "w" ? "b" : "w",
    selected: { isSelected: false, row: -1, col: -1 },
    king: newKingState,
    enPassant: newElpassantState,
    castling: newCastleState,
    isMate,
    play,
    winner,
    promotion,
  };
};

