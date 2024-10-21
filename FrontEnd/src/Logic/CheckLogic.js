// Object to store the final status of the king regarding check and pinned pieces
let Final_object = {
    pos: {
        row: -1,
        col:-1
    },
    check: {
        status: false, // Indicates whether the king is in check
        allowed: [], // Array to track allowed moves while in check
    },
    pinned: [], // Array to track pinned pieces
};

// Object to keep track of the king's status regarding check and pinned pieces
let king_underAttack = {
    check: false,
    pinned_row: -1,
    pinned_col: -1,
    allowed: [],
};

// Helper function to check if a given position is valid on the chessboard
const isValidPosition = (row, col) =>
  row >= 0 && row < 8 && col >= 0 && col < 8;

// Reset the king_underAttack object for each validation check
const resetKingUnderAttack = () => {
    king_underAttack = {
        check: false,
        pinned_row: -1,
        pinned_col: -1,
        allowed: [],
    };
};
const resetFinalObject = () => {
    Final_object = {
        pos: {
            row: -1,
            col: -1,
        },
        check: {
            status: false, // Indicates whether the king is in check
            allowed: [], // Array to track allowed moves while in check
        },
        pinned: [], // Array to track pinned pieces
    };
};

// Handle the attack logic for the current square
const handleAttack = (row, col, validOpponent, grid, myColor, king) => {
    const cur = grid[row][col].piece;
    
    // If the current square is empty, the move is valid
    if (cur === "") {
        return true; // Empty square, valid move
    }
    // If it's a friendly piece, it blocks the path
    else if (cur[0] === myColor) {
        return false; // Same color piece blocks the path
    }
    // If the current square has an opponent's piece
    else if (!validOpponent.includes(cur)) {
        return false; // Invalid opponent piece
    } else {
        if ((cur.slice(1) == "p")) {
            console.log(Math.abs(king.row - row));
            if (Math.abs(king.row - row) > 1) return false;
        }
        if (cur.slice(1) == "king") {
            let rowDiff = Math.abs(king.row - row);
            let colDiff = Math.abs(king.col - col);

            // Check if the kings are too close (adjacent or invalid)
            if (rowDiff > 1 || colDiff > 1) {
                return false; // Invalid move since kings are too close
            }
        }
        king_underAttack.check = true; // Mark as under attack
        king_underAttack.allowed.push([row, col]); // Track the allowed attack position
        return true; // Found a valid attack
    }
};

// Recursive function to simulate moving the king
const makeMove = (
    myColor,
    row,
    col,
    nextRow,
    nextCol,
    pinned,
    grid,
    validOpponent,
    king
) => {
    // console.log(row+" "+col);
    
    // If pinned or out of bounds, stop the recursion
    if (pinned > 1 || !isValidPosition(row, col)) return false;

    const cur = grid[row][col].piece; // Current piece on the board
    let moveFound = false; // Track if a valid move was found

    // if (cur != "") {
    //     console.log("CURRENT = "+cur+" = "+row+ " , "+col);   
    // }
    
    // If the current square is empty, continue moving
    if (cur === "") {
        moveFound = makeMove(
            myColor,
            row + nextRow,
            col + nextCol,
            nextRow,
            nextCol,
            pinned,
            grid,
            validOpponent,
            king
        );
    }
    // If the current square has a friendly piece, increase the pinned count
    else if (cur[0] === myColor) {
        moveFound = makeMove(
            myColor,
            row + nextRow,
            col + nextCol,
            nextRow,
            nextCol,
            pinned + 1,
            grid,
            validOpponent,
            king
        );
    }
    // If the current square has an opponent's piece, check for an attack
    else {
        moveFound = handleAttack(row, col, validOpponent, grid, myColor, king);
        // console.log("LAST = " + cur + " = " + row + " , " + col+" = "+moveFound);
        return moveFound;
    }

    // If no valid move was found, return false
    if (!moveFound) return false;

    // If the square was empty, push the move into allowed moves
    if (cur === "") king_underAttack.allowed.push([row, col]);
    else {
        king_underAttack.check = false; // Reset check status
        king_underAttack.pinned_row = row; // Update pinned piece position
        king_underAttack.pinned_col = col;
    }

    return true; // Valid move found
};

// Array of knight moves (relative positions)
const knight_moves = [
    [-2, -1],
    [-2, +1],
    [+2, -1],
    [+2, +1],
    [-1, -2],
    [-1, +2],
    [+1, -2],
    [+1, +2],
];

// Function to check if the king is under threat from a knight
const knightCheck = (row, col, opponent, grid) => {
    for (let [dr, dc] of knight_moves) {
        const newRow = row + dr; // Calculate new row position
        const newCol = col + dc; // Calculate new column position
        // Check if the new position is valid
        if (isValidPosition(newRow, newCol)) {
            const piece = grid[newRow][newCol].piece; // Get the piece at the new position
            // If it's the opponent's knight
            if (piece === opponent) {
                Final_object.check.status = true; // King is in check
                Final_object.check.allowed.push([newRow, newCol]); // Track allowed knight attack
                return true;
            }
        }
    }
    return false; // No knight threat found
};

// Function to process the results of attack checks
const resultMaking = (o) => {
    if (o.check) {
        Final_object.check.status = true; // Update check status
        Final_object.check.allowed = o.allowed; // Update allowed moves
    } else if (o.pinned_row !== -1) {
        // If a piece is pinned, record its position and allowed moves
        Final_object.pinned.push({
            row: o.pinned_row,
            col: o.pinned_col,
            pinned_allowed: o.allowed,
        });
    }
};

// Function to check the king's threats based on its current position
// Deep clone helper function
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Function to check the king's threats based on its current position
export const Check_Validate = (row, col, mat) => {
    console.log("Checking  = " + row +" " +col);
    
    let grid = mat.map((row) => row.map((cell) => ({ ...cell }))); // Create a deep copy of the board
    let king = grid[row][col]; // Get the king piece
    let opponent = king.piece[0] === "b" ? "w" : "b"; // Determine the opponent's color
    // console.log("Opp color = " + opponent);
    resetFinalObject(Final_object);
    // console.log(Final_object);

    

    // Deep clone Final_object to avoid mutating immutable properties
    
    // Define the valid opponent pieces for each direction
    const directions = [
      {
        dir: [0, -1],
        pieces: [`${opponent}r`, `${opponent}q`, `${opponent}king`],
      }, // Left
      {
        dir: [0, 1],
        pieces: [`${opponent}r`, `${opponent}q`, `${opponent}king`],
      }, // Right
      {
        dir: [-1, 0],
        pieces: [`${opponent}r`, `${opponent}q`, `${opponent}king`],
      }, // Up
      {
        dir: [1, 0],
        pieces: [`${opponent}r`, `${opponent}q`, `${opponent}king`],
      }, // Down
      {
        dir: [-1, -1],
        pieces: [`${opponent}b`, `${opponent}q`, `${opponent}king`, `bp`],
      }, // Up-Left
      {
        dir: [-1, 1],
        pieces: [`${opponent}b`, `${opponent}q`, `${opponent}king`, `bp`],
      }, // Up-Right
      {
        dir: [1, -1],
        pieces: [`${opponent}b`, `${opponent}q`, `${opponent}king`, `wp`],
      }, // Down-Left
      {
        dir: [1, 1],
        pieces: [`${opponent}b`, `${opponent}q`, `${opponent}king`, `wp`],
      }, // Down-Right
    ];
    
    // Check for threats in each direction
    for (let { dir, pieces } of directions) {
        makeMove(
            king.piece[0],
            row + dir[0],
            col + dir[1],
            dir[0],
            dir[1],
            0,
            grid,
            pieces,
            {row,col}
        );
        // console.log(king_underAttack);
        resultMaking(king_underAttack);
        resetKingUnderAttack(); // Reset for the next direction check
    }
    
    // Check for threats from knights
    knightCheck(row, col, `${opponent}k`, grid); // Check knight threats against the king
    
    // Update the cloned object with the king's current position
    let clonedFinalObject = deepClone(Final_object);
    clonedFinalObject.pos.row = row;
    clonedFinalObject.pos.col = col;
    console.log(clonedFinalObject);
    
    // Return the cloned object with updated check and pin status
    return clonedFinalObject;
};
