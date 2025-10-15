/**
 * @brief Highlights the en passant capture square if the move is valid.
 *
 * En passant is a special pawn capture that can only occur immediately after
 * an opponent's pawn moves two squares forward from its starting position.
 * This function checks if the currently selected pawn can perform such a capture.
 *
 * @param {object} selectedPawn - The pawn that the player has selected. Contains {piece, row, col}.
 * @param {object} el_passant_state - The global state tracking the pawn vulnerable to en passant.
 * @param {Array<Array<object>>} grid - The current game board state.
 * @returns {Array<Array<object>>} The updated grid with the en passant square highlighted.
 */

export const highlightEnPassant = (selectedPawn, el_passant_state, grid) => {
    // Condition 1: The selected piece must be a pawn.
    const isPawn = selectedPawn.piece === 'p';

    // Condition 2: The selected pawn must be on the correct row to attack.
    // (Row 4 for white, Row 3 for black).
    const isCorrectRow = selectedPawn.row === el_passant_state.row;

    // Condition 3: The selected pawn must be directly adjacent to the vulnerable pawn.
    const isAdjacent = Math.abs(selectedPawn.col - el_passant_state.col) === 1;

    // If all conditions for an en passant capture are met...
    if (isPawn && isCorrectRow && isAdjacent) {
        // Determine the landing square for the capture.
        // For a white capture, the pawn moves from row 4 to 5 (index-wise).
        // For a black capture, the pawn moves from row 3 to 2 (index-wise).
        const landingRow = el_passant_state.color === 'w' 
            ? el_passant_state.row + 1 // White moves "up" the board (increasing index)
            : el_passant_state.row - 1; // Black moves "down" the board (decreasing index)

        // Mark the landing square as a valid attack move.
        grid[landingRow][el_passant_state.col].underAttack = true;
    }

    return grid;
};