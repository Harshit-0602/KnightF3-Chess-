import { useRecoilState } from "recoil";
import { grid_init } from "../../Store/grid";
import { king, selected, turn } from "../../Store/other";
import { revert } from "../../Logic/RevertMoves";
import { Moves } from "../../Logic/PossibleMoves";
import { Check_Validate } from "../../Logic/CheckLogic";
import { CheckingMate } from "../../Logic/CheckingMate";
import { useEffect } from "react";

export const Cell = ({ row, col }) => {
  const [grid, setGrid] = useRecoilState(grid_init);
  const [sel, setSel] = useRecoilState(selected);
  const [t, setT] = useRecoilState(turn);
  const [K, setK] = useRecoilState(king);

  let isMate = false;
  let play = "Black";
  let winner = "Black";

    // console.log(row + " "+ );
    
  let name = grid[row][col].piece;
  let piece = name.slice(1);
  let path = `/${name}.png`;
  let color = (row + col) % 2 ? "dark" : "light";

  if (sel.isSelected) {
    if (row === sel.row && sel.col === col) color = "select";
    if (grid[row][col].highlight) color = "highlight";
    if (grid[row][col].underAttack) color = "underAttack";
  }

  if (row === K.b.pos.row && col === K.b.pos.col && K.b.check.status)
    color = "Check";
  if (row === K.w.pos.row && col === K.w.pos.col && K.w.check.status)
    color = "Check";

  const click = () => {
    console.log(`Turn = ${t[0]}`);
    let mat = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (sel.isSelected) {
      handleSelectedCellClick(row, col, mat);
    } else if (name !== "" && t[0] === name[0]) {
      selectPiece(row, col, mat);
    }
  };

  const handleSelectedCellClick = (row, col, mat) => {
    if (grid[row][col].highlight || grid[row][col].underAttack) {
      movePiece(row, col, mat);
    } else if (name === "" || t !== name[0]) {
      resetSelection();
    } else {
      selectPiece(row, col, mat);
    }
  };

  const movePiece = (row, col, mat) => {
    mat[row][col].piece = mat[sel.row][sel.col].piece;
    mat[sel.row][sel.col].piece = "";
    let piece = mat[row][col].piece;
    let piece_name = piece.slice(1);
    let new_row = -1;
    let new_col = -1;
    if (piece_name == "king") {
      new_row = row;
      new_col = col;
    }
    let nextT = t === "w" ? "b" : "w";

    updateKing(mat, nextT, t, new_row, new_col);
    // Use setTimeout to allow the UI to update before checking for mate
    setTimeout(() => {
        if (isMate) {
            if (play == "Check-Mate") alert(`${play}!! ${winner} wins. Game Over`);
            else alert(`${play}!! Match Draw. Game Over`);
      }
    }, 100); // Adjust the timeout duration if necessary

    // Consolidate state updates in a single function
    updateStateAfterMove(mat);
  };

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
    setK((prevK) => ({
      ...prevK,
      [curT]: Check_Object_My,
      [nextT]: Check_Object_Opp,
    }));
    // console.log("Checking Mate Started .............................");
    isMate = !CheckingMate(mat, Check_Object_Opp);
    // console.log("Checking for Mate: " + isMate);
    play = Check_Object_Opp.check.status ? "Check-Mate" : "Stale-Mate";
  };

  const selectPiece = (row, col, mat) => {
    setSel({
      isSelected: true,
      row,
      col,
    });
    mat = revert(mat);
    let myKing = t === "w" ? K.w : K.b;
    const fn = Moves[piece];
    setGrid(fn(row, col, mat, myKing).grid);
  };

  const updateStateAfterMove = (mat) => {
    setGrid(revert(mat));
    setT(t === "w" ? "b" : "w");
    resetSelection();
  };

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
