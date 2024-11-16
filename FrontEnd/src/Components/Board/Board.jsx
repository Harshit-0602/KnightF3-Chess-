import './Board.css'
import { Cell } from '../Cell/Cell';
const Board = () => {
      const renderCell = () => {
        const cells = [];
        // for (let i = 0; i < 8; i++) {
        //   for (let j = 0; j < 8; j++) {
        //     cells.push(<Cell key={`${i}-${j}`} row={i} col={j} />);
        //   }
        // }

        for (let i = 7; i >=0 ; i--) {
          for (let j = 7; j >=0 ; j--) {
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
