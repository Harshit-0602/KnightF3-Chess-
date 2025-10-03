import { MakeMove } from "../Controller/MakeMove.js";
import { Moves_Highlighter } from "../Controller/Moves_Highlighter.js";

// Initial Chess State for Testing
let CurState = {
  grid: [
    [
      { piece: "br", highlight: false, underAttack: false },
      { piece: "bk", highlight: false, underAttack: false },
      { piece: "bb", highlight: false, underAttack: false },
      { piece: "bq", highlight: false, underAttack: false },
      { piece: "bking", highlight: false, underAttack: false },
      { piece: "bb", highlight: false, underAttack: false },
      { piece: "bk", highlight: false, underAttack: false },
      { piece: "br", highlight: false, underAttack: false },
    ],
    [
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
      { piece: "bp", highlight: false, underAttack: false },
    ],
    Array(8).fill({ piece: "", highlight: false, underAttack: false }),
    Array(8).fill({ piece: "", highlight: false, underAttack: false }),
    Array(8).fill({ piece: "", highlight: false, underAttack: false }),
    Array(8).fill({ piece: "", highlight: false, underAttack: false }),
    [
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
      { piece: "wp", highlight: false, underAttack: false },
    ],
    [
      { piece: "wr", highlight: false, underAttack: false },
      { piece: "wk", highlight: false, underAttack: false },
      { piece: "wb", highlight: false, underAttack: false },
      { piece: "wq", highlight: false, underAttack: false },
      { piece: "wking", highlight: false, underAttack: false },
      { piece: "wb", highlight: false, underAttack: false },
      { piece: "wk", highlight: false, underAttack: false },
      { piece: "wr", highlight: false, underAttack: false },
    ],
  ],

  turn: "w",

  selected: {
    isSelected: false,
    row: -1,
    col: -1,
  },

  enPassant: {
    row: -1,
    col: -1,
    color: "none",
  },

  king: {
    b: {
      pos: { row: 0, col: 4 },
      check: { status: false, allowed: [] },
      pinned: [],
    },
    w: {
      pos: { row: 7, col: 4 },
      check: { status: false, allowed: [] },
      pinned: [],
    },
  },

  castling: {
    b: {
      king: true,
      q_r: { row: 0, col: 0, eligible: true },
      r: { row: 0, col: 7, eligible: true },
    },
    w: {
      king: true,
      q_r: { row: 7, col: 0, eligible: true },
      r: { row: 7, col: 7, eligible: true },
    },
  },
};

let cell = {
  row: 6,
  col: 4 ,
  piece: "wp", // ✅ match with the board
};

let movecell = {
  row: 5,
  col: 4 ,
  piece: "", // ✅ match with the board
};


function printBoard(CurState) {
    const pieceSymbols = {
        br: "♜", bk: "♞", bb: "♝", bq: "♛", bking: "♚", bp: "♟",
        wr: "♖", wk: "♘", wb: "♗", wq: "♕", wking: "♔", wp: "♙",
        "": "." // empty square
    };
    
    console.log("  a b c d e f g h"); // column headers
    for (let i = 0; i < 8; i++) {
        let rowStr = (8 - i) + " "; // row numbers
        for (let j = 0; j < 8; j++) {
            const cell = CurState.grid[i][j];
            let symbol = pieceSymbols[cell.piece] || "?";
            if (cell.highlight) symbol = `[${symbol}]`; // show highlighted
            rowStr += symbol + " ";
        }
        console.log(rowStr + (8 - i)); // show row number at end too
    }
    console.log("  a b c d e f g h\n");
}

// Usage
CurState = Moves_Highlighter(cell, CurState);
printBoard(CurState);
CurState =MakeMove(movecell,CurState);
printBoard(CurState);

CurState = Moves_Highlighter({row:1,col:1,piece:"bp"}, CurState);
printBoard(CurState);
CurState =MakeMove({row:2,col:1,piece:""},CurState);
printBoard(CurState);

CurState = Moves_Highlighter({row:6,col:3,piece:"wp"}, CurState);
printBoard(CurState);
CurState =MakeMove({row:2,col:1,piece:""},CurState);
printBoard(CurState);