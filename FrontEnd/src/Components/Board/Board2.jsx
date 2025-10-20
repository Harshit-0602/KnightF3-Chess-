// src/Components/Board/Board.jsx

import { useRecoilValue } from 'recoil';
import { useGame } from '../../GameProvider';
import { grid_init } from '../../Store/grid';
import { selected, turn, king, isMate, winner, promotion, myColor, result } from '../../Store/other';
import './Board.css';

import { Cell } from '../Cell/Cell2';
import { PromotionModal } from '../Extra/Promotion';
import { GameOverModal } from '../Extra/GameOverModal';

export const Board = () => {
    // Read all necessary state from Recoil
    const grid = useRecoilValue(grid_init);
    const currentTurn = useRecoilValue(turn);
    const currentSelection = useRecoilValue(selected);
    const kingState = useRecoilValue(king);
    const mateState = useRecoilValue(isMate);
    const winnerState = useRecoilValue(winner);
    const resultState=useRecoilValue(result);
    const promotionState = useRecoilValue(promotion);
    const playerColor = useRecoilValue(myColor); // This is the key: 'w' or 'b'

    const { sendMessage } = useGame();

    const handleCellClick = (row, col) => {
        if (currentTurn !== playerColor) {
            console.log("Not your turn!");
            return;
        }
        const clickedCell = grid[row][col];
        if (currentSelection.isSelected) {
            sendMessage('makeMove', { 
                cell: { row, col,piece: clickedCell.piece } 
            });
        } else{
            sendMessage('giveMove', { 
                cell: { row, col, piece: clickedCell.piece }
            });
        }
    };

    const handlePromotion = (promoteTo) => {
        // Send only the selected piece type.
        // The server will use the promotionState it has saved in Redis
        // to know which pawn to update.
        sendMessage('promotePawn', {
            promoteTo: promoteTo
        });
    };

    const renderCell = () => {
        if (!grid) return null;

        const cells = [];
        // If the player is black, reverse the rendering order
        if (playerColor === 'w') {
            // Render rows from 0 to 7 (bottom to top for black)
            for (let i = 0; i <= 7; i++) {
                // Render columns from 7 to 0 (right to left)
                for (let j = 7; j >= 0; j--) {
                    cells.push(
                        <Cell 
                            key={`${i}-${j}`} 
                            row={i} 
                            col={j}
                            cellData={grid[i][j]}
                            selection={currentSelection}
                            kingState={kingState}
                            onCellClick={handleCellClick} 
                        />
                    );
                }
            }
        } else {
            // Default rendering for white player
            // Render rows from 7 to 0 (top to bottom for white)
            for (let i = 7; i >= 0; i--) {
                // Render columns from 0 to 7 (left to right)
                for (let j = 0; j < 8; j++) {
                    cells.push(
                        <Cell 
                            key={`${i}-${j}`} 
                            row={i} 
                            col={j}
                            cellData={grid[i][j]}
                            selection={currentSelection}
                            kingState={kingState}
                            onCellClick={handleCellClick} 
                        />
                    );
                }
            }
        }
        return cells;
    };

    // Labels for both orientations
    const columnLabels = playerColor === 'b' ? ["H", "G", "F", "E", "D", "C", "B", "A"] : ["A", "B", "C", "D", "E", "F", "G", "H"];
    const rowLabels = playerColor === 'b' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

    return (
        <>
            <PromotionModal show={promotionState.isPromoting} onPromote={handlePromotion} color={currentTurn} playerColor={playerColor} />
            <GameOverModal show={mateState} result={resultState} winner={winnerState} />
            <div className="board-bg">
                <div className="outer-box">
                    <div className="inner-box">
                        <div className="board">
                            <div className="column-labels">
                                {columnLabels.map((label) => <div key={label} className="column-label">{label}</div>)}
                            </div>
                            {renderCell()}
                            <div className="row-labels">
                                {rowLabels.map((label) => <div key={label} className="row-label">{label}</div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};