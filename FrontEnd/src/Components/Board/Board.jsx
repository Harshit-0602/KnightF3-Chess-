import "./Board.css";
import { Cell } from "../Cell/Cell";

const Board = () => {
  const renderCell = () => {
    const cells = [];
    for (let i = 7; i >= 0; i--) {
      for (let j = 7; j >= 0; j--) {
        cells.push(<Cell key={`${i}-${j}`} row={i} col={j} />);
      }
    }
    return cells;
  };

  const columnLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const rowLabels = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="board-bg">
      <div className="outer-box">
        <div className="inner-box">
          <div className="board">
            <div className="column-labels">
              {columnLabels.map((label, index) => (
                <div key={index} className="column-label">
                  {label}
                </div>
              ))}
            </div>
            {renderCell()}
            <div className="row-labels">
              {rowLabels.map((label, index) => (
                <div key={index} className="row-label">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Board };
