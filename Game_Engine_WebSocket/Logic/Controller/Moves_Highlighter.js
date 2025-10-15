import { Moves } from "../Utils/PossibleMoves.js";
import { revert } from "../Utils/RevertMoves.js";
import { highlightEnPassant } from "../Utils/En_Passant.js";
import { Castle_highlight } from "../Utils/Castling.js";

/**
 * @brief Highlights all valid moves for a selected piece, including special moves.
 *
 * This function serves as the central handler for piece selection. It validates
 * that the selected piece belongs to the current player, calculates its standard
 * moves, and then incorporates special moves like en passant (for pawns) and
 * castling (for the king).
 *
 * @param {object} cell - The cell object that was clicked by the user. Expected to have {piece, row, col}.
 * @param {object} CurState - The complete current state of the game, including the grid, turn, king, and special move states (Elpassant, Castling).
 * @returns {object} The updated CurState object with the new highlights on the grid and updated selection status.
 */


export const Moves_Highlighter = (cell, CurState) => {
    console.log(CurState.selected);
    
    // Check if the current cell is empty; if so, revert and return.
    if (cell.piece === "") {
        CurState.grid = revert(CurState.grid);
        return CurState;
    }

    // If the piece is of a different color, revert and return.
    if (cell.piece[0] !== CurState.turn) {
        CurState.grid = revert(CurState.grid);
        return CurState;
    }

    // Mark the selected cell
    CurState.selected.isSelected = true;
    CurState.selected.row = cell.row;
    CurState.selected.col = cell.col;

    // Get the piece name
    let piece_name = cell.piece.slice(1);

    // Revert previous highlights
    CurState.grid = revert(CurState.grid);

    // Get standard moves for the piece
    let myKing = CurState.turn === 'w' ? CurState.king.w : CurState.king.b;
    CurState.grid = Moves[piece_name](cell.row, cell.col, CurState.grid, myKing).grid;

    // 1. If the selected piece is a pawn, check for en passant.
    if (piece_name === 'p') {
        const selectedPawn = { piece: piece_name, row: cell.row, col: cell.col };
        // FIX: Use 'Elpassant' to match your Recoil atom's name
        CurState.grid = highlightEnPassant(selectedPawn, CurState.enPassant, CurState.grid);
    }

    // 2. If the selected piece is a king, check for castling.
    if (piece_name === 'king') {
        // FIX: Assign the returned grid back to the state
        // FIX: Use 'Castling' to match your Recoil atom's name
        CurState.grid = Castle_highlight(cell.row, cell.col, CurState.grid, CurState.turn, CurState.castling);
    }
    
    return CurState;
};