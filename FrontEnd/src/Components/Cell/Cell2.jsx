import { useRecoilState } from "recoil";
import { grid_init } from "../../Store/grid";
import { selected, turn, king } from "../../Store/other";
import PromotionModal from "./Promotion";
import GameOverModal from "./GameOverModal";

export const Cell = ({ row, col }) => {
  const [grid, setGrid] = useRecoilState(grid_init);
  const [sel, setSel] = useRecoilState(selected);
  const [t, setT] = useRecoilState(turn);
  const [K, setK] = useRecoilState(king);

  const [show, setShow] = useState(false);
  const [promote, setPromote] = useState({ row: -1, col: -1 });

  const [isMate, setIsMate] = useState(false);
  const [play, setPlay] = useState("Black");
  const [winner, setWinner] = useState("Black");

  let cell = grid[row][col];
  let name = cell.piece;
  let piece = name.slice(1);
  let path = `/${name}.png`;
  let color = (row + col) % 2 ? "dark" : "light";

  // Apply highlights based on backend CurState
  if (cell.highlight) color = "highlight";
  if (cell.underAttack) color = "underAttack";
  if (sel.isSelected && sel.row === row && sel.col === col) color = "select";
  if ((row === K.w.pos.row && col === K.w.pos.col && K.w.check.status) ||
      (row === K.b.pos.row && col === K.b.pos.col && K.b.check.status)) {
    color = "Check";
  }


  const click=async()=>{
    fetch("Backend API",{  // Hit the backend API
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({row,col})
    })
    .then(response=>response.json())
    .then((data)=>{
        setGrid(data.grid);
        setSel(data.selected);
        setT(data.turn);
        setK(data.king);

        if (data.promotion) {
            setPromote(data.promotion);
            setShow(true);
        }

        if (data.isMate) {
            setIsMate(data.isMate);
            setPlay(data.play);
            setWinner(data.winner);
        }
    })
    .catch((err)=>{
        console.log("Backend Fetching Error Occurred : ",err);
    })
  }

  const Handle_Promotion=(row,col,promoteTo)=>{
    fetch("",{ // hit the Promotion API
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({row,col,promoteTo})
    })
    .then(response=>response.json())
    .then((data)=>{
        setGrid(data.grid);
        setSel(data.selected);
        setT(data.turn);
        setK(data.king);

        setPromote({ row: -1, col: -1 });
        setShow(false);
      
        if (data.isMate) {
            setIsMate(data.isMate);
            setPlay(data.play);
            setWinner(data.winner);
        }
    })  
    .catch((err)=>{
        console.log("Error Occurred While Hitting the Promotion API : "+err);
    })  
  };

  return (
    <>
      <PromotionModal
        show={show}
        onPromote={Handle_Promotion}
        color={t}
        row={promote.row}
        col={promote.col}
      />
      <GameOverModal show={isMate} winner={winner} play={play} />
      <div className={`square ${color}`} onClick={click}>
        {name !== "" && <img src={path} alt={name} />}
      </div>
    </>
  );
};