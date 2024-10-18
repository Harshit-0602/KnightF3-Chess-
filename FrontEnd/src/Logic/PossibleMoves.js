import { bishop } from "./Pieces Moves/bishop";
import { king } from "./Pieces Moves/king";
import { knight } from "./Pieces Moves/knight";
import { pawn } from "./Pieces Moves/pawn";
import { queen } from "./Pieces Moves/queen";
import { rook } from "./Pieces Moves/rook";

export const Moves = {
    "r": rook,
    "b": bishop,
    "k": knight,
    "q": queen,
    "king": king,
    "p":pawn
}