import { useRecoilState } from 'recoil';
import './Board.css'
import { grid_init } from '../../Store/grid';

const Cell = ({row, col}) => {
    // console.log(`row = ${row} ,  col = ${col} , type = ${type}`);
    let color = "light";
    if ((row + col) % 2) {
      color = "dark";
  }
  const [grid, setGrid] = useRecoilState(grid_init);
  const name = grid[row][col].piece;
  const path = `/${name}.png`;
    return (
      <div className={`square ${color}`}>
        {name !== "" && <img src={path} alt={name} />}
      </div>
    );
}

const Board = () => {
      const renderCell = () => {
        const cells = [];
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            cells.push(<Cell key={`${i}-${j}`} row={i} col={j} />);
          }
        }
        return cells;
      };
        return (
          <div className="board-bg">
        <div className="outer-box">
          <div className="inner-box">
            <div className="board">
              {renderCell()}
            </div>
          </div>
        </div>
      </div>
    );
}
export {Board}
