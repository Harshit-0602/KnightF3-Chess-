// Helper function to handle highlighting or marking under attack
const fn = (cell, my) => {
  if (cell.piece[0] === my.piece[0]) return; // Same color piece, can't move
  else if (cell.piece !== "" && cell.piece[0] !== my.piece[0]) {
    cell.underAttack = true; // Opponent piece, mark as under attack
    return;
  }
  cell.highlight = true; // Empty cell, highlight it
};

// Main knight function
export const knight = (r, c, mat, king) => {
    let grid = mat.map((row) => row.map((cell) => ({ ...cell }))); // Copy the grid
    let my = grid[r][c]; // Current knight's position

    // All possible moves for the knight
    let moves = [
        [r - 2, c - 1], // Up-left
        [r - 2, c + 1], // Up-right
        [r + 2, c - 1], // Down-left
        [r + 2, c + 1], // Down-right
        [r - 1, c - 2], // Left-up
        [r + 1, c - 2], // Left-down
        [r - 1, c + 2], // Right-up
        [r + 1, c + 2], // Right-down
    ];

    // Check if the knight's moves are affected by the king's status
    let pinned = -1;
    for (let i = 0; i < king.pinned.length; i++) {
        if (king.pinned[i].row === r && king.pinned[i].col === c) {
            pinned = i; // Find if the knight is pinned
            break;
        }
    }

    // Iterate over all possible knight moves
    moves.forEach(([newR, newC]) => {
        // Check if the move is within the board boundaries
        if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
            const cell = grid[newR][newC];

            // If the king is in check, validate the allowed moves
            if (king.check.status) {
                if (
                    king.check.allowed.some((pos) => pos[0] === newR && pos[1] === newC)
                ) {
                    fn(cell, my); // Call the function to highlight or mark under attack
                }
            }
            // If the knight is pinned, validate the allowed moves for the pinned piece
            else if (pinned !== -1) {
                if (
                    king.pinned[pinned].pinned_allowed.some(
                        (pos) => pos[0] === newR && pos[1] === newC
                    )
                ) {
                    fn(cell, my); // Call the function to highlight or mark under attack
                }
            }
            // If the knight is neither pinned nor the king is in check, highlight or mark under attack normally
            else {
                fn(cell, my); // Call the function to highlight or mark under attack
            }
        }
    });

    return grid;
};
