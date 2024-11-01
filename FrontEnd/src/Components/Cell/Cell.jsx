import { useRecoilState } from "recoil";
import { grid_init } from "../../Store/grid";
import { Elpassant, king, selected, turn } from "../../Store/other";
import { revert } from "../../Logic/RevertMoves";
import { Moves } from "../../Logic/PossibleMoves";
import { Check_Validate } from "../../Logic/CheckLogic";
import { CheckingMate } from "../../Logic/CheckingMate";

export const Cell = ({ row, col }) => {
  const [grid, setGrid] = useRecoilState(grid_init);
  const [sel, setSel] = useRecoilState(selected);
  const [t, setT] = useRecoilState(turn);
  const [K, setK] = useRecoilState(king);
  const [El_passant, setEl_passant] = useRecoilState(Elpassant);

  let isMate = false;
  let play = "Black";
  let winner = "Black";

  let name = grid[row][col].piece;
  let piece = name.slice(1);
  let path = `/${name}.png`;
  let color = (row + col) % 2 ? "dark" : "light";

  // Visual highlights for selected cell, highlights, under attack, and check status
  if (sel.isSelected) {
    if (row === sel.row && sel.col === col) color = "select";
    if (grid[row][col].highlight) color = "highlight";
    if (grid[row][col].underAttack) color = "underAttack";
  }

  if (row === K.b.pos.row && col === K.b.pos.col && K.b.check.status)
    color = "Check";
  if (row === K.w.pos.row && col === K.w.pos.col && K.w.check.status)
    color = "Check";

  // Click handler for each cell, which decides the interaction type
  const click = () => {
    console.log(`Turn = ${t[0]}`);
    let mat = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (sel.isSelected) {
      handleSelectedCellClick(row, col, mat);
    } else if (name !== "" && t[0] === name[0]) {
      selectPiece(row, col, mat);
    }
  };

  // Handles clicking on a selected cell or an empty cell
  const handleSelectedCellClick = (row, col, mat) => {
    if (grid[row][col].highlight || grid[row][col].underAttack) {
      movePiece(row, col, mat);
    } else if (name === "" || t !== name[0]) {
      resetSelection();
    } else {
      selectPiece(row, col, mat);
    }
  };

  // Handles en passant moves by tracking pawns that moved two squares
  const handle_El_passant = (row, col, mat, name) => {
    // Sets the en passant state when a pawn moves two squares
    if (name == "p" && Math.abs(row - sel.row) == 2) {
      setEl_passant({
        row,
        col,
        color: mat[row][col].piece[0],
      });
    } else {
      // Resets en passant if no pawn moves two squares
      setEl_passant({
        row: -1,
        col: -1,
        color: "none",
      });
    }
  };

  // Executes piece movement and updates relevant states (like en passant)
  const movePiece = (row, col, mat) => {
    // If en passant capture is occurring, clear the captured pawn's position
    if (mat[row][col].underAttack == true && mat[row][col].piece == "") {
      mat[El_passant.row][El_passant.col].piece = "";
      mat[El_passant.row][El_passant.col].underAttack = false;
    }

    // Move piece to the new location and clear the previous cell
    mat[row][col].piece = mat[sel.row][sel.col].piece;
    mat[sel.row][sel.col].piece = "";
    let piece = mat[row][col].piece;
    let piece_name = piece.slice(1);

    let new_row = -1;
    let new_col = -1;

    // Track en passant state for the next turn
    handle_El_passant(row, col, mat, piece_name);

    // Update king position if it was the moved piece
    if (piece_name == "king") {
      new_row = row;
      new_col = col;
    }

    let nextT = t === "w" ? "b" : "w";
    updateKing(mat, nextT, t, new_row, new_col);

    // Set a timeout for UI updates before checking for checkmate/stalemate
    setTimeout(() => {
      if (isMate) {
        if (play == "Check-Mate") alert(`${play}!! ${winner} wins. Game Over`);
        else alert(`${play}!! Match Draw. Game Over`);
      }
    }, 100); // Adjust the timeout duration if necessary

    // Consolidate state updates in a single function
    updateStateAfterMove(mat);
  };

  // Updates king position, checks if it's in check or checkmate
  const updateKing = (mat, nextT, curT, new_row, new_col) => {
    let oppKing = nextT === "w" ? K.w : K.b;
    let myKing = curT === "w" ? K.w : K.b;
    winner = curT === "w" ? "White" : "Black";
    new_row = new_row === -1 ? myKing.pos.row : new_row;
    new_col = new_col === -1 ? myKing.pos.col : new_col;

    let Check_Object_My = Check_Validate(new_row, new_col, mat);
    let Check_Object_Opp = Check_Validate(
      oppKing.pos.row,
      oppKing.pos.col,
      mat
    );

    // Update king states with check information
    setK((prevK) => ({
      ...prevK,
      [curT]: Check_Object_My,
      [nextT]: Check_Object_Opp,
    }));

    // Determine if the game is in a mate position
    isMate = !CheckingMate(mat, Check_Object_Opp);
    play = Check_Object_Opp.check.status ? "Check-Mate" : "Stale-Mate";
  };

  // Handles selecting a piece and updating possible moves
  const selectPiece = (row, col, mat) => {
    setSel({
      isSelected: true,
      row,
      col,
    });

    // Revert any previous move highlights
    mat = revert(mat);

    // Get the active king and generate moves for the selected piece
    let myKing = t === "w" ? K.w : K.b;
    const fn = Moves[piece];
    mat = fn(row, col, mat, myKing).grid;

    // Handle en passant attack highlight for pawns
    if (
      piece == "p" &&
      row == El_passant.row &&
      Math.abs(col - El_passant.col) == 1
    ) {
      let next_row = El_passant.color == "w" ? 1 : -1;
      mat[next_row + El_passant.row][El_passant.col].underAttack = true;
    }

    setGrid(mat);
  };

  // Updates the board state and turn, then resets selection
  const updateStateAfterMove = (mat) => {
    setGrid(revert(mat));
    setT(t === "w" ? "b" : "w");
    resetSelection();
  };

  // Resets piece selection
  const resetSelection = () => {
    setSel({
      isSelected: false,
      row: -1,
      col: -1,
    });
  };

  return (
    <div className={`square ${color}`} onClick={click}>
      {name !== "" && <img src={path} alt={name} />}
    </div>
  );
};
