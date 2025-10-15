/**
 * Generates a rich object representing the initial state of a chess game.
 * This function creates the complete, authoritative state for a new match,
 * formatted to be compatible with the client-side Recoil state model.
 */
const Generate_New_Game = () => {
    // Represents the 8x8 board with rich cell objects.
    const initialGrid = [
        [ // Row 0 (Black back rank)
            { piece: "br", highlight: false, underAttack: false }, { piece: "bk", highlight: false, underAttack: false },
            { piece: "bb", highlight: false, underAttack: false }, { piece: "bq", highlight: false, underAttack: false },
            { piece: "bking", highlight: false, underAttack: false },{ piece: "bb", highlight: false, underAttack: false },
            { piece: "bk", highlight: false, underAttack: false }, { piece: "br", highlight: false, underAttack: false }
        ],
        [ // Row 1 (Black pawns)
            { piece: "bp", highlight: false, underAttack: false }, { piece: "bp", highlight: false, underAttack: false },
            { piece: "bp", highlight: false, underAttack: false }, { piece: "bp", highlight: false, underAttack: false },
            { piece: "bp", highlight: false, underAttack: false }, { piece: "bp", highlight: false, underAttack: false },
            { piece: "bp", highlight:false, underAttack: false },  { piece: "bp", highlight: false, underAttack: false }
        ],
        // Rows 2-5 are empty
        ...Array(4).fill(Array(8).fill({ piece: "", highlight: false, underAttack: false })),
        [ // Row 6 (White pawns)
            { piece: "wp", highlight: false, underAttack: false }, { piece: "wp", highlight: false, underAttack: false },
            { piece: "wp", highlight: false, underAttack: false }, { piece: "wp", highlight: false, underAttack: false },
            { piece: "wp", highlight: false, underAttack: false }, { piece: "wp", highlight: false, underAttack: false },
            { piece: "wp", highlight: false, underAttack: false }, { piece: "wp", highlight: false, underAttack: false }
        ],
        [ // Row 7 (White back rank)
            { piece: "wr", highlight: false, underAttack: false }, { piece: "wk", highlight: false, underAttack: false },
            { piece: "wb", highlight: false, underAttack: false }, { piece: "wq", highlight: false, underAttack: false },
            { piece: "wking", highlight: false, underAttack: false },{ piece: "wb", highlight: false, underAttack: false },
            { piece: "wk", highlight: false, underAttack: false }, { piece: "wr", highlight: false, underAttack: false }
        ]
    ];

    // Stores the position, check status, and pinned pieces for both kings.
    const initialKingState = {
        b: {
            pos: { row: 0, col: 4 },
            check: { status: false, allowed: [] },
            pinned: []
        },
        w: {
            pos: { row: 7, col: 4 },
            check: { status: false, allowed: [] },
            pinned: []
        }
    };

    // Stores the detailed castling rights for both players.
    const initialCastleState = {
        b: {
            king: true,
            q_r: { row: 0, col: 0, eligible: true },
            r: { row: 0, col: 7, eligible: true }
        },
        w: {
            king: true,
            q_r: { row: 7, col: 0, eligible: true },
            r: { row: 7, col: 7, eligible: true }
        }
    };

    // The complete initial state object, matching the Recoil structure.
    const newGameState = {
        // Core game state
        grid: initialGrid,
        turn: 'w', // White always starts
        king: initialKingState,
        enPassant: { row: -1, col: -1, color: "none" }, // No en passant target at the start
        castling: initialCastleState,
        promotion: null, // No active pawn promotion

        // Game lifecycle state
        play: true, // The game is active and playable
        isMate: false, // Not checkmate or stalemate
        winner: null, // No winner yet

        // Purely UI-related state, initialized for the client
        selected: { isSelected: false, row: -1, col: -1 }
    };

    return newGameState;
};

module.exports = { Generate_New_Game };

