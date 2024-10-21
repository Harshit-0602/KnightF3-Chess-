// Helper function to compare positions
const positionsEqual = (pos1, pos2) =>
  pos1[0] === pos2[0] && pos1[1] === pos2[1];

// Helper function to check if a position is valid
const valid = (i, j) => {
  return i >= 0 && j >= 0 && i < 8 && j < 8;
};

// Helper function to handle pawn movements
const handlePawnMove = (grid, r, c, direction, color, myPiece, king) => {
  // Declare and initialize isPinned outside to make it available in all cases
  let isPinned = -1;
  for (let i = 0; i < king.pinned.length; i++) {
    if (king.pinned[i].row === r && king.pinned[i].col === c) {
      isPinned = i; // Find if the pawn is pinned
      break;
    }
  }

  // Single forward move
  if (valid(r + direction, c) && grid[r + direction][c].piece === "") {
    const targetRow = r + direction;

    // Handle king's check status and pawn's pinned status
    if (king.check.status) {
      const isAllowed = king.check.allowed.some((pos) =>
        positionsEqual(pos, [targetRow, c])
      );
      if (isAllowed) {
        grid[targetRow][c].highlight = true; // Highlight valid move
      }
    } else if (isPinned !== -1) {
      const isPinnedAllowed = king.pinned[isPinned].pinned_allowed.some((pos) =>
        positionsEqual(pos, [targetRow, c])
      );
      if (isPinnedAllowed) {
        grid[targetRow][c].highlight = true; // Highlight valid move if pinned
      }
    } else {
      grid[targetRow][c].highlight = true; // Highlight valid move if neither checked nor pinned
    }
  }

  // Double move from starting position
  if ((color === "w" && r === 6) || (color === "b" && r === 1)) {
    const doubleMoveRow = r + direction * 2;
    if (valid(doubleMoveRow, c) && grid[doubleMoveRow][c].piece === "") {
      // Check for pin or check when doing a double move
      if (king.check.status) {
        const isAllowed = king.check.allowed.some((pos) =>
          positionsEqual(pos, [doubleMoveRow, c])
        );
        if (isAllowed) {
          grid[doubleMoveRow][c].highlight = true; // Highlight valid double move
        }
      } else if (isPinned !== -1) {
        const isPinnedAllowed = king.pinned[isPinned].pinned_allowed.some(
          (pos) => positionsEqual(pos, [doubleMoveRow, c])
        );
        if (isPinnedAllowed) {
          grid[doubleMoveRow][c].highlight = true; // Highlight valid double move if pinned
        }
      } else {
        grid[doubleMoveRow][c].highlight = true; // Highlight valid double move if not pinned or checked
      }
    }
  }

  // Diagonal captures
  const diagonalMoves = [
    [direction, -1], // Left diagonal
    [direction, +1], // Right diagonal
  ];

  diagonalMoves.forEach(([dRow, dCol]) => {
    if (valid(r + dRow, c + dCol)) {
      const targetCell = grid[r + dRow][c + dCol];
      if (targetCell.piece !== "" && targetCell.piece[0] !== color) {
        // Check for king's status when capturing
        if (king.check.status) {
          const isAllowed = king.check.allowed.some((pos) =>
            positionsEqual(pos, [r + dRow, c + dCol])
          );
          if (isAllowed) targetCell.underAttack = true; // Mark as under attack
        } else if (isPinned !== -1) {
          const isPinnedAllowed = king.pinned[isPinned].pinned_allowed.some(
            (pos) => positionsEqual(pos, [r + dRow, c + dCol])
          );
          if (isPinnedAllowed) targetCell.underAttack = true; // Mark as under attack if pinned
        } else {
          targetCell.underAttack = true; // Mark as under attack if not in check or pinned
        }
      }
    }
  });
};

// Main function for pawn movement
export const pawn = (r, c, mat, king) => {
  let grid = mat.map((row) => row.map((cell) => ({ ...cell }))); // Create a copy of the grid
  let myPiece = grid[r][c].piece;
  let color = myPiece[0]; // Get the color of the pawn
  let direction = color === "w" ? -1 : 1; // Set direction based on color

  // Handle pawn movements
  handlePawnMove(grid, r, c, direction, color, myPiece, king);

  return grid; // Return the modified grid
};
