import { atom } from "recoil";

// Initial Chess Board Setup with Modified Properties
const grid = [
  [
    { piece: "br", highlight: false, underAttack: false }, // Black rook
    { piece: "bk", highlight: false, underAttack: false }, // Black knight
    { piece: "bb", highlight: false, underAttack: false }, // Black bishop
    { piece: "bq", highlight: false, underAttack: false }, // Black queen
    { piece: "bking", highlight: false, underAttack: false }, // Black king
    { piece: "bb", highlight: false, underAttack: false }, // Black bishop
    { piece: "bk", highlight: false, underAttack: false }, // Black knight
    { piece: "br", highlight: false, underAttack: false }, // Black rook
  ], // Black pieces
  [
    { piece: "bp", highlight: false, underAttack: false }, // Black pawn
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
    { piece: "bp", highlight: false, underAttack: false },
  ], // Black pawns
  [
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
    { piece: "", highlight: false, underAttack: false },
  ], // Empty row
  [
    { piece: "wp", highlight: false, underAttack: false }, // White pawn
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
    { piece: "wp", highlight: false, underAttack: false },
  ], // White pawns
  [
    { piece: "wr", highlight: false, underAttack: false }, // White rook
    { piece: "wk", highlight: false, underAttack: false }, // White knight
    { piece: "wb", highlight: false, underAttack: false }, // White bishop
    { piece: "wq", highlight: false, underAttack: false }, // White queen
    { piece: "wking", highlight: false, underAttack: false }, // White king
    { piece: "wb", highlight: false, underAttack: false }, // White bishop
    { piece: "wk", highlight: false, underAttack: false }, // White knight
    { piece: "wr", highlight: false, underAttack: false }, // White rook
  ], // White pieces
];

const stalemateGrid = [
  [
    { piece: "", highlight: false, underAttack: false }, // Black rook
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Black bishop
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "bking", highlight: false, underAttack: false }, // Black king
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Black rook
  ], // Black pieces
  [
    { piece: "", highlight: false, underAttack: false }, // Black pawn
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "wq", highlight: false, underAttack: false }, // Black pawn
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "wp", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
    { piece: "", highlight: false, underAttack: false }, // Empty row
  ], // Empty row
  [
    { piece: "", highlight: false, underAttack: false }, // White pawn
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "wb", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "wking", highlight: false, underAttack: false }, // White king
    { piece: "", highlight: false, underAttack: false }, // White pawn
    { piece: "", highlight: false, underAttack: false }, // Empty cell
    { piece: "", highlight: false, underAttack: false }, // Empty cell
  ], // White pieces
];



export const grid_init = atom({
  key: "grid_init",
  default: grid, // Set the default value to the initialized grid
});
