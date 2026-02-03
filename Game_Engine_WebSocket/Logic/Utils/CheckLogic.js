const isValidPosition = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

/**
 * A pure, stateless function that traces a single line of sight from the king.
 * It identifies the first threat (either a check or a pin) it encounters.
 * @returns {object|null} An object describing the threat, or null if no threat is found.
 */
const traceLine = (kingRow, kingCol, dr, dc, grid, myColor, opponentPieceTypes) => {
    let path = [];
    let friendlyPieceOnPath = null;

    let r = kingRow + dr;
    let c = kingCol + dc;

    while (isValidPosition(r, c)) {
        const piece = grid[r][c].piece;

        if (piece) {
            if (piece.startsWith(myColor)) { // It's a friendly piece
                if (friendlyPieceOnPath) return null; // Second friendly piece, so the line is blocked.
                friendlyPieceOnPath = { row: r, col: c };
            } else { // It's an opponent piece
                const pieceType = piece.slice(1);
                if (opponentPieceTypes.includes(pieceType)) {
                    // This is a valid attacker for this line of sight.
                    path.push([r, c]); // The attacker's square is part of the path.
                    if (friendlyPieceOnPath) {
                        // A friendly piece was in the way, so it's a pin.
                        return { type: 'pin', pinned: friendlyPieceOnPath, path };
                    } else {
                        // No friendly piece was in the way, so it's a direct check.
                        return { type: 'check', path };
                    }
                }
                // It's an opponent piece, but not a valid attacker on this line.
                return null;
            }
        } else { // It's an empty square.
            path.push([r, c]);
        }
        r += dr;
        c += dc;
    }
    return null; // Reached the edge of the board.
};

/**
 * The main validation function.
 * This is the only function that creates and returns the legacy object structure.
 */
export const Check_Validate = (row, col, mat) => {
    // The final object structure that MUST be returned.
    const Final_object = {
        pos: { row, col },
        check: { status: false, allowed: [] },
        pinned: [],
    };

    const grid = mat;
    const kingPiece = grid[row]?.[col]?.piece;
    if (!kingPiece) return Final_object; // King not found, return default.

    const myColor = kingPiece[0];
    const opponentColor = myColor === 'w' ? 'b' : 'w';

    // Temporary arrays to collect ALL threats before processing.
    let allChecksPaths = [];
    let allPins = [];

    // 1. Find all line-of-sight threats (from Rooks, Bishops, Queens).
    const lineDirections = [
        { dr: 0, dc: -1, pieces: ['r', 'q'] }, { dr: 0, dc: 1, pieces: ['r', 'q'] },
        { dr: -1, dc: 0, pieces: ['r', 'q'] }, { dr: 1, dc: 0, pieces: ['r', 'q'] },
        { dr: -1, dc: -1, pieces: ['b', 'q'] }, { dr: -1, dc: 1, pieces: ['b', 'q'] },
        { dr: 1, dc: -1, pieces: ['b', 'q'] }, { dr: 1, dc: 1, pieces: ['b', 'q'] },
    ];
    for (const { dr, dc, pieces } of lineDirections) {
        const threat = traceLine(row, col, dr, dc, grid, myColor, pieces);
        if (threat) {
            if (threat.type === 'check') {
                allChecksPaths.push(...threat.path);
            } else if (threat.type === 'pin') {
                // Format the pin object as required by the legacy structure.
                allPins.push({
                    row: threat.pinned.row,
                    col: threat.pinned.col,
                    pinned_allowed: threat.path
                });
            }
        }
    }

    // 2. Find all Knight checks.
    const knightMoves = [ [-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2] ];
    for (const [dr, dc] of knightMoves) {
        const r = row + dr;
        const c = col + dc;
        if (isValidPosition(r, c) && grid[r][c].piece === `${opponentColor}k`) {
            allChecksPaths.push([r, c]); // Add attacker's square.
        }
    }

    // 3. Find all Pawn checks.
    const pawnAttackDR = myColor === 'w' ? -1 : 1;
    const pawnAttacks = [[pawnAttackDR, -1], [pawnAttackDR, 1]];
    for (const [dr, dc] of pawnAttacks) {
        const r = row + dr;
        const c = col + dc;
        if (isValidPosition(r, c) && grid[r][c].piece === `${opponentColor}p`) {
            allChecksPaths.push([r, c]); // Add attacker's square.
        }
    }

    // 4. Assemble the final legacy object from all collected threats.
    if (allChecksPaths.length > 0) {
        Final_object.check.status = true;
        // Use a Map to ensure all squares in the 'allowed' path are unique.
        // This correctly handles double-check scenarios.
        const uniquePaths = [...new Map(allChecksPaths.map(item => [`${item[0]}-${item[1]}`, item])).values()];
        Final_object.check.allowed = uniquePaths;
    }
    
    Final_object.pinned = allPins;

    return Final_object;
};

