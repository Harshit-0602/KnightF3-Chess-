// src/Components/Cell/Cell.jsx


export const Cell = ({ cellData, row, col, selection, kingState, onCellClick }) => {

    let color = (row + col) % 2 ? "dark" : "light";
    
    // Determine color based on props passed down from the Board
    if (cellData.highlight) color = "highlight";
    if (cellData.underAttack) color = "underAttack";
    if (selection.isSelected && selection.row === row && selection.col === col) color = "select";
    if ((row === kingState.w.pos.row && col === kingState.w.pos.col && kingState.w.check.status) ||
        (row === kingState.b.pos.row && col === kingState.b.pos.col && kingState.b.check.status)) {
        color = "Check";
    }

    const pieceName = cellData.piece;
    const path = pieceName ? `/${pieceName}.png` : null;

    return (
        <div 
            className={`square ${color}`} 
            onClick={() => onCellClick(row, col)} // Simply call the function from props
        >
            {pieceName && <img src={path} alt={pieceName} />}
        </div>
    );
};