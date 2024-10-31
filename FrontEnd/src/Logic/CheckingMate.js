    import { Moves } from "./PossibleMoves";

    export const CheckingMate = (grid,king) => {
        let color = grid[king.pos.row][king.pos.col].piece[0];
        let can_move = false;
        for (let i = 0; i < 8; i++)
        {
            for (let j = 0; j < 8; j++)
            {
                let cur = grid[i][j].piece;
                if (cur != "" && cur[0] == color) {
                    let name = cur.slice(1);
                    const fn = Moves[name];
                    can_move = fn(i, j, grid, king).can_move;
                    // console.log(`${i} , ${j} = ${can_move}  King = ${king.pos.row} , ${king.pos.col} , ${king.check.status}`);
                    if (can_move) return true;
                }
            }
        }
        return false;
    }