// src/Logic/Controller/Promote_Pawn.js

import { Check_Validate } from "../Utils/CheckLogic.js";
import { CheckingMate } from "../Utils/CheckingMate.js";
import { revert } from "../Utils/RevertMoves.js";

/**
 * Finds both kings and updates their check, checkmate, and stalemate status.
 * This is the same helper function used in MakeMove.js for consistency.
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
 * Executes a pawn promotion and returns the fully updated game state.
 */
export const Promote_Pawn = (promoteTo, CurState) => {
    const { grid, turn, king, promotion } = CurState;

    // --- 1. Validation ---
    // If this function is called when no promotion is active, return the state unchanged.
    if (!promotion || !promotion.isPromoting) {
        console.error("Promote_Pawn called when no promotion was pending.");
        return CurState;
    }

    // --- 2. Make a deep copy of the grid ---
    let newGrid = JSON.parse(JSON.stringify(grid));

    // --- 3. Update the piece on the board ---
    const { row, col } = promotion.to; // Get coordinates from the promotion state
    const color = turn=='w'?'b':'w';                // The current player's turn is the color of the promoting pawn
    newGrid[row][col].piece = color + promoteTo; // e.g., 'w' + 'q' = 'wq'

    // --- 4. Update king state, check, and checkmate status ---
    // This is the same critical logic from MakeMove to determine the game's outcome
    const { newKingState, isMate, play, winner } = updateKing(newGrid, turn, king);

    // --- 5. Return the complete, updated game state ---
    return {
        // Clear any highlights from the grid before returning
        grid: revert(newGrid),
        // Switch the turn to the other player
        turn: turn === "w" ? "b" : "w",
        // Reset selection state
        selected: { isSelected: false, row: -1, col: -1 },
        // The new king state
        king: newKingState,
        // Reset the promotion state now that it's complete
        promotion: { isPromoting: false, from: null, to: null },
        // Pass through other states that were not affected by this action
        enPassant: CurState.enPassant,
        castling: CurState.castling,
        // Updated game-end states
        isMate,
        result: play,
        winner,
        // Pass through player connection statuses
        status_p1: CurState.status_p1,
        status_p2: CurState.status_p2,
    };
};