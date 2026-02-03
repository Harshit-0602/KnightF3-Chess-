import { Check_Validate } from "./CheckLogic.js";

/**
 * @brief Validates a single castling path and modifies the grid if valid.
 * @description This function checks if a castling move is legal. It mutates the grid object
 * that is passed to it by setting the 'highlight' property on the destination square.
 *
 * It checks three rules:
 * 1. The path between the king and rook must be clear.
 * 2. The king cannot be in check currently.
 * 3. The king cannot pass through or land on a square under attack.
 *
 * @param {number} row - The king's current row.
 * @param {number} king_col - The king's current column.
 * @param {number} direction - The direction to check (-1 for queenside, 1 for kingside).
 * @param {Array<Array<object>>} mat - The game board to be checked and modified.
 */


const castle_row_checkandmove = (row, king_col, direction, mat) => {
    // Rule 1: Check if the path between king and rook is clear.
    const rook_col = direction === 1 ? 7 : 0;
    for (let i = king_col + direction; i !== rook_col; i += direction) {
        if (mat[row][i].piece !== "") {
            return; // Path is blocked, castling is not allowed.
        }
    }

    // Rule 2: Check if the king is currently in check.
    const isKingInCheck = Check_Validate(row, king_col, mat).check.status;
    if (isKingInCheck) {
        return; // King is in check, cannot castle.
    }
    
    // Rule 3: Check if the king passes through or lands on an attacked square.
    // To do this safely, we simulate the moves on a DEEP COPY of the board.
    const temp_mat = JSON.parse(JSON.stringify(mat));

    // Simulate the first step
    temp_mat[row][king_col + direction].piece = temp_mat[row][king_col].piece;
    temp_mat[row][king_col].piece = "";
    const isFirstStepSafe = !Check_Validate(row, king_col + direction, temp_mat).check.status;
    
    // Simulate the second step (final destination)
    temp_mat[row][king_col + 2 * direction].piece = temp_mat[row][king_col + direction].piece;
    temp_mat[row][king_col + direction].piece = "";
    const isSecondStepSafe = !Check_Validate(row, king_col + 2 * direction, temp_mat).check.status;

    // If both squares the king moves over are safe...
    if (isFirstStepSafe && isSecondStepSafe) {
        // ...highlight the king's final destination on the REAL board.
        mat[row][king_col + 2 * direction].highlight = true;
    }
};


/**
 * @brief Checks castling eligibility and returns a new grid with valid moves highlighted.
 * @description This function is the pure-function entry point for highlighting castling moves.
 * It creates a copy of the board and calls a helper to validate and modify the copy,
 * ensuring the original game state is not changed directly.
 *
 * @param {number} row - The row of the selected king.
 * @param {number} col - The column of the selected king.
 * @param {Array<Array<object>>} mat - The current, unmodified game board.
 * @param {string} turn - The current player's turn ('w' or 'b').
 * @param {object} CastleState - The global state object for castling rights.
 * @returns {Array<Array<object>>} A new grid object with castling moves highlighted.
 */


export const Castle_highlight = (row, col, mat, turn, CastleState) => {
    // Create a deep copy of the grid to avoid modifying the original state.
    const gridCopy = JSON.parse(JSON.stringify(mat));

    // Determine which player's castling rights to check.
    const myCastle = turn === 'w' ? CastleState.w : CastleState.b;

    // --- Check Queenside Castling (long castle) ---
    if (myCastle.king && myCastle.q_r.eligible) {
        // Validate the path to the left on the copied grid.
        castle_row_checkandmove(row, col, -1, gridCopy);
    }

    // --- Check Kingside Castling (short castle) ---
    if (myCastle.king && myCastle.r.eligible) {
        // Validate the path to the right on the copied grid.
        castle_row_checkandmove(row, col, 1, gridCopy);
    }

    // Return the modified copy of the grid.
    return gridCopy;
};