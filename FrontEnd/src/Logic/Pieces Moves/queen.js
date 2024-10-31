// Helper function to process individual cells based on the queen's movement

let can_move = false;

const processMove = (grid, r, c, my, king, pinned) => {
    let cell = grid[r][c];

    // Check if the king is in check and adjust the allowed moves accordingly
    if (king.check.status) {
        if (king.check.allowed.some((pos) => pos[0] === r && pos[1] === c)) {
            if (cell.piece[0] === my.piece[0]) return false; // Same color piece blocks the path
            if (cell.piece !== "" && cell.piece[0] !== my.piece[0]) {
                can_move = true;
                cell.underAttack = true; // Opponent's piece under attack
                return false; // Stop after attacking opponent's piece
            }
            can_move = true;
            cell.highlight = true; // Highlight as valid move
            return true; // Continue moving in this direction
        }
    }
    // If the queen is pinned
    else if (pinned !== -1) {
        if (
            king.pinned[pinned].pinned_allowed.some(
                (pos) => pos[0] === r && pos[1] === c
            )
        ) {
            if (cell.piece[0] === my.piece[0]) return false; // Same color piece blocks the path
            if (cell.piece !== "" && cell.piece[0] !== my.piece[0]) {
                can_move = true;
                cell.underAttack = true; // Opponent's piece under attack
                return false; // Stop after attacking opponent's piece
            }
            can_move = true;
            cell.highlight = true; // Highlight as valid move
            return true; // Continue moving in this direction
        }
    }
    // Normal movement behavior
    else {
        if (cell.piece[0] === my.piece[0]) return false; // Same color piece blocks the path
        if (cell.piece !== "" && cell.piece[0] !== my.piece[0]) {
            can_move = true;
            cell.underAttack = true; // Opponent's piece under attack
            return false; // Stop after attacking opponent's piece
        }
        can_move = true;
        cell.highlight = true; // Highlight as valid move
        return true; // Continue moving in this direction
    }
};

// Helper function to handle directional movement (for both diagonals and straight lines)
const moveInDirection = (grid, r, c, dr, dc, my, king, pinned) => {
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (!processMove(grid, r, c, my, king, pinned)) break; // Stop if piece blocks or attack is made
        r += dr; // Update row for next move in direction
        c += dc; // Update column for next move in direction
    }
};

// Main function for queen's movement
export const queen = (r, c, mat, king) => {
    let grid = mat.map((row) => row.map((cell) => ({ ...cell })));
    let my = grid[r][c];
    can_move = false;
    // Determine if the queen is pinned
    let pinned = -1;
    for (let i = 0; i < king.pinned.length; i++) {
        if (king.pinned[i].row === r && king.pinned[i].col === c) {
            pinned = i; // Find if the queen is pinned
            break;
        }
    }

    // Define all directions the queen can move in: diagonals, rows, and columns
    const directions = [
        [-1, -1],
        [-1, +1],
        [+1, +1],
        [+1, -1], // Diagonals
        [0, -1],
        [0, +1],
        [-1, 0],
        [+1, 0], // Horizontal and vertical
    ];

    // Iterate over each direction and apply the movement
    for (let [dr, dc] of directions) {
        moveInDirection(grid, r + dr, c + dc, dr, dc, my, king, pinned);
    }

    return {grid,can_move};
};
