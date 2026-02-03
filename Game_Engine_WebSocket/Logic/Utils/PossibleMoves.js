import { bishop } from "../Pieces Moves/bishop.js";
import { king } from "../Pieces Moves/king.js";
import { knight } from "../Pieces Moves/knight.js";
import { pawn } from "../Pieces Moves/pawn.js";
import { queen } from "../Pieces Moves/queen.js";
import { rook } from "../Pieces Moves/rook.js";

export const Moves = {
    "r": rook,
    "b": bishop,
    "k": knight,
    "q": queen,
    "king": king,
    "p":pawn
}