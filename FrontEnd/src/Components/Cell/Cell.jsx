import { useRecoilState } from "recoil";
import { grid_init } from "../../Store/grid";
import { selected, turn } from "../../Store/other";
import { revert } from "../../Logic/RevertMoves";
import { queen } from "../../Logic/Pieces Moves/queen";
import { Moves } from "../../Logic/PossibleMoves";

export const Cell = ({ row, col }) => {
    //Initializing important variable and setting up the color of each cell according to their state
        console.log("Render");
        const [grid, setGrid] = useRecoilState(grid_init);
        const [sel, setSel] = useRecoilState(selected);
        const [t, setT] = useRecoilState(turn);
        let name = grid[row][col].piece;
        let piece = name.slice(1);
        let path = `/${name}.png`;
        let color = "light";
        if ((row + col) % 2) color = "dark";
        if (sel.isSelected) {
            if (row == sel.row && sel.col == col) color = "select";
            if (grid[row][col].highlight) color = "highlight";
            if (grid[row][col].underAttack) color = "underAttack";
        }
    //Logic When a cell is clicked
    const click = () => {
        console.log(`Turn = ${t[0]}`);
        let mat = grid.map((row) => row.map((cell) => ({ ...cell })));
        if (sel.isSelected) {
            if (grid[row][col].highlight || grid[row][col].underAttack) {
                mat[row][col].piece = mat[sel.row][sel.col].piece;
                mat[sel.row][sel.col].piece = "";
                setGrid(revert(mat));
                if (t == 'w') setT('b');
                else setT('w');
                setSel({
                    isSelected: false,
                    row: -1,
                    col: -1
                })
            } else if (name == "" || t !== name[0]) {
                setGrid(revert(mat));
                setSel({
                    isSelected: false,
                    row: -1,
                    col: -1,
                });
            }
            else {
                console.log("Reverting");
                // setGrid(revert(mat));
                setSel({
                    isSelected: true,
                    row,
                    col
                })
                mat = revert(mat);
                const fn = Moves[piece];
                setGrid(fn(row, col, mat));
                //TODO: Call move
            }
        }
        else if (name != "" && t[0] === name[0]) {
            setSel({
                isSelected: true,
                row,
                col,
            });
            mat = revert(mat);
            const fn = Moves[piece];
            setGrid(fn(row, col, mat));
            //TODO: Call move
        }
    };

    return (
        <div className={`square ${color}`} onClick={click}>
            {name !== "" && <img src={path} alt={name} />}
        </div>
    );
};
