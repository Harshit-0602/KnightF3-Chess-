const fn = (cell, my) => {
    if (cell.piece[0] == my.piece[0]) return; // Same color piece, can't move
    else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
        cell.underAttack = true; // Opponent piece, mark as under attack
        return;
    }
    cell.highlight = true; // Empty cell, highlight it
};

export const knight = (r, c, mat) => {
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

    // Iterate over all possible knight moves
    moves.forEach(([newR, newC]) => {
        if (newR >= 0 && newR < 8 && newC >= 0 && newC < 8) {
            fn(grid[newR][newC], my); // Call the function to either highlight or mark under attack
        }
    });

    return grid;
};
