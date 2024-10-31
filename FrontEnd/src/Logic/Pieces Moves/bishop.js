// Helper function to compare positions
const positionsEqual = (pos1, pos2) => pos1[0] === pos2[0] && pos1[1] === pos2[1];

let can_move = false;

// Helper function to handle diagonal movements
const handleDiagonalMove = (grid, r, c, rowInc, colInc, myPiece, king, p) => {
    let i = r + rowInc;
    let j = c + colInc;

    while (i >= 0 && i < 8 && j >= 0 && j < 8) {
        let cell = grid[i][j];
        
        // Handle king under check
        if (king.check.status && p === -1) {
            const isAllowed = king.check.allowed.some(pos => positionsEqual(pos, [i, j]));
            if (isAllowed) {
                if (cell.piece === "") {
                    cell.highlight = true;
                    can_move = true;
                }
                else {
                    cell.underAttack = true;
                    can_move = true;
                    break;
                }
            } else break;
        }
        // Handle pinned piece
        else if (p !== -1) {
            const isPinnedAllowed = king.pinned[p].pinned_allowed.some(pos => positionsEqual(pos, [i, j]));
            if (isPinnedAllowed) {
                if (cell.piece === "") {
                    cell.highlight = true;
                    can_move = true;
                }
                else {
                    cell.underAttack = true;
                    can_move = true;
                    break;
                }
            } else break;
        }
        // Normal movement logic when not pinned or checked
        else if (cell.piece[0] === myPiece[0]) break; // Same color piece blocks the path
        else if (cell.piece !== "" && cell.piece[0] !== myPiece[0]) {
            can_move = true;
            cell.underAttack = true; // Mark the opponent's piece as under attack
            break; // Stop after attacking
        } 
        else {
            cell.highlight = true;
            can_move = true;
        } // Highlight the cell for valid move
        
        i += rowInc;
        j += colInc;
    }
};

// Main bishop function
export const bishop = (r, c, mat, king) => {
    can_move = false;
    let grid = mat.map((row) => row.map((cell) => ({ ...cell })));
    let myPiece = grid[r][c].piece;
    let pinned = -1;

    // Check if the bishop is pinned
    for (let i = 0; i < king.pinned.length; i++) {
        if (king.pinned[i].row === r && king.pinned[i].col === c) {
            pinned = i;
            break;
        }
    }

    // Handle all 4 diagonal directions
    handleDiagonalMove(grid, r, c, -1, -1, myPiece, king, pinned); // Up-left
    handleDiagonalMove(grid, r, c, -1, +1, myPiece, king, pinned); // Up-right
    handleDiagonalMove(grid, r, c, +1, +1, myPiece, king, pinned); // Down-right
    handleDiagonalMove(grid, r, c, +1, -1, myPiece, king, pinned); // Down-left

    return {grid,can_move};
};
