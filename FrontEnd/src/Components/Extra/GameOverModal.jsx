
import { useNavigate } from "react-router-dom";
import './GameOverModal.css'; // Import the new stylesheet
import { useGame } from "../../GameProvider";

export const GameOverModal = ({show, result, winner }) => {
    if(!show) return null;
    const navigate = useNavigate();
    const {sendMessage}=useGame();

    const onRestart = () => {
        sessionStorage.clear();
        sendMessage("Game_Over",{}); // Clear the old game token and ID
        navigate('/'); // Navigate back to the home page
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-header">{result}</h2>
                <p className="modal-message">
                    {result === "Check-Mate" ? `${winner} wins!` : "It's a draw!"}
                </p>
                <button className="modal-button" onClick={onRestart}>
                    Play Again
                </button>
            </div>
        </div>
    );
};
