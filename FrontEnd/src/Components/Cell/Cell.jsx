import { useRecoilState } from "recoil";
import { grid_init } from "../../Store/grid";
import { king, selected, turn } from "../../Store/other";
import { revert } from "../../Logic/RevertMoves";
import { Moves } from "../../Logic/PossibleMoves";
import { Check_Validate } from "../../Logic/CheckLogic";

export const Cell = ({ row, col }) => {
    // Use Recoil state to manage grid, selected piece, and turn
    const [grid, setGrid] = useRecoilState(grid_init);
    const [sel, setSel] = useRecoilState(selected);
    const [t, setT] = useRecoilState(turn);
    const [K, setK] = useRecoilState(king);
    // console.log(K);
    

    // Get the piece information from the grid
    let name = grid[row][col].piece; // Current piece in the cell
    // let piece_color = name.slice(0, 1);
    let piece = name.slice(1); // Extract the type of piece (e.g., "r" for rook)
    let path = `/${name}.png`; // Path to the image of the piece
    let color = (row + col) % 2 ? "dark" : "light"; // Set color based on cell position

    // Update cell color based on selection or attack status
    if (sel.isSelected) {
        // Highlight the selected cell
        if (row === sel.row && sel.col === col) color = "select";
        // Highlight cells where moves are possible
        if (grid[row][col].highlight) color = "highlight";
        // Mark opponent's pieces as under attack
        if (grid[row][col].underAttack) color = "underAttack";
    }

    if ((row === K.b.pos.row && col === K.b.pos.col) && K.b.check.status) color = "Check";
    if (row === K.w.pos.row && col === K.w.pos.col && K.w.check.status) color = "Check";

    // Main click handler for the cell
    const click = () => {
        console.log(`Turn = ${t[0]}`); // Log the current turn
        let mat = grid.map((row) => row.map((cell) => ({ ...cell }))); // Create a copy of the grid

        // If a piece is already selected
        if (sel.isSelected) {
            handleSelectedCellClick(row, col, mat); // Handle logic for selected cell
        } else if (name !== "" && t[0] === name[0]) {
            // If the clicked cell has a piece of the current turn's color
            selectPiece(row, col, mat); // Select the piece
        }
    };

    // Handle the case when a cell is clicked while a piece is selected
    const handleSelectedCellClick = (row, col, mat) => {
        // Check if the clicked cell is highlighted or under attack
        if (grid[row][col].highlight || grid[row][col].underAttack) {
            movePiece(row, col, mat); // Move the piece to the clicked cell
        } else if (name === "" || t !== name[0]) {
            // Reset selection if the clicked cell is empty or not the correct color
            resetSelection();
        } else {
            // Select a new piece
            selectPiece(row, col, mat);
        }
    };

    // Move the selected piece to the clicked cell
    const movePiece = (row, col, mat) => {
        // Update the grid with the new piece position
        mat[row][col].piece = mat[sel.row][sel.col].piece; // Move the piece to the new cell
        mat[sel.row][sel.col].piece = ""; // Empty the previous cell
        let piece = mat[row][col].piece;
        let piece_name = piece.slice(1);
        let new_row = -1;
        let new_col = -1;
        if (piece_name == "king") {
            new_row = row;
            new_col = col;
        }
        let nextT = t === "w" ? "b" : "w";
        
        updateKing(mat,nextT,t,new_row,new_col);
        // Consolidate state updates in a single function
        updateStateAfterMove(mat);
    };

    const updateKing = (mat,nextT,curT,new_row,new_col) => {
        let oppKing = nextT === "w" ? K.w : K.b;
        let myKing = curT === "w" ? K.w : K.b;
        console.log("nextT = "+nextT);
        console.log("curT = "+curT);
        console.log(myKing.pos);
        console.log(oppKing.pos);
        new_row = new_row === -1 ? myKing.pos.row : new_row;
        new_col = new_col === -1 ? myKing.pos.col : new_col;
        let Check_Object_My = Check_Validate(new_row, new_col, mat);
        let Check_Object_Opp = Check_Validate(oppKing.pos.row, oppKing.pos.col, mat);
        // console.log(Check_Object_Opp); 
        // console.log(Check_Object_My);
        setK((prevK) => ({
            ...prevK,
            [curT]: Check_Object_My,
            [nextT]: Check_Object_Opp,
        }));
    }
    // Select a piece when clicked
    const selectPiece = (row, col, mat) => {
        setSel({
            // Update selected piece state
            isSelected: true,
            row,
            col,
        });
        mat = revert(mat); // Create a revertible state of the grid
        let myKing = t === "w" ? K.w : K.b;
        const fn = Moves[piece]; // Get the function for calculating possible moves for the piece
        setGrid(fn(row, col, mat,myKing)); // Update the grid with the possible moves
    };

    // Consolidate state updates after moving a piece
    const updateStateAfterMove = (mat) => {
        // Set the grid with the updated moves
        setGrid(revert(mat)); // Update the grid state with the new move
        // Toggle turn and reset selection
        setT(t === "w" ? "b" : "w"); // Switch the turn
        resetSelection(); // Reset selection state
    };

    // Reset the selection state
    const resetSelection = () => {
        setSel({
            // Set selection state to unselected
            isSelected: false,
            row: -1,
            col: -1,
        });
    };

    return (
        // Render the cell with the corresponding color and piece
        <div className={`square ${color}`} onClick={click}>
            {name !== "" && <img src={path} alt={name} />}{" "}
            {/* Display the piece image if present */}
        </div>
    );
};
