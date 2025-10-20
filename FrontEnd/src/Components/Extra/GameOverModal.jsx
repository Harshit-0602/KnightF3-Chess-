
import { useNavigate } from "react-router-dom";
import './GameOverModal.css'; // Import the new stylesheet

export const GameOverModal = ({show, result, winner }) => {
    if(!show) return null;
    const navigate = useNavigate();

    const onRestart = () => {
        sessionStorage.clear(); // Clear the old game token and ID
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
