import { Check_Validate } from "../CheckLogic";

// Helper function to check if a position is valid
const isValidPosition = (r, c,grid,cur_r,cur_c) => {
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        let temp = grid[r][c].piece;
        if (temp != "" && temp[0] == grid[cur_r][cur_c].piece[0]) return false;
        grid[r][c].piece = grid[cur_r][cur_c].piece;
        grid[cur_r][cur_c].piece = "";
        let res = Check_Validate(r, c, grid);
        grid[cur_r][cur_c].piece = grid[r][c].piece;
        grid[r][c].piece = temp;
        return !res.check.status;
    }
    else return false;
}

// Helper function to handle cell highlighting and attack marking
const handleCell = (cell, myPiece) => {
    // console.log("Handle King Move");
    // console.log(myPiece);
    // console.log(cell);
    
    if (cell.piece !== "" && cell.piece[0] === myPiece[0]) return; // Same color piece, cannot move
    if (cell.piece !== "" && cell.piece[0] != myPiece[0]) {
        
        cell.underAttack = true; // Mark opponent's piece as under attack
        return;
    }
    cell.highlight = true; // Highlight the cell for a valid move
};

// Function to check surrounding cells for the king's movements
const checkSurroundingCells = (grid, r, c, myPiece) => {
    const directions = [
        [1, 0], // Down
        [-1, 0], // Up
        [0, -1], // Left
        [0, 1], // Right
        [-1, -1], // Up-left
        [-1, 1], // Up-right
        [1, -1], // Down-left
        [1, 1], // Down-right
    ];

    for (const [rowInc, colInc] of directions) {
        const newRow = r + rowInc;
        const newCol = c + colInc;
        if (isValidPosition(newRow, newCol,grid,r,c)) {
            handleCell(grid[newRow][newCol], myPiece);
        }
    }
};

// Main function for the king's movement
export const king = (r, c, mat,king) => {
    const grid = mat.map((row) => row.map((cell) => ({ ...cell }))); // Create a copy of the grid
    const myPiece = grid[r][c]; // Get the king's piece
    checkSurroundingCells(grid, r, c, myPiece); // Check surrounding cells for movements
    return grid; // Return the modified grid
};
