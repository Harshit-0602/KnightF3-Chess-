import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './Waiting.css';
import { useNavigate } from 'react-router-dom';

/**
 * A waiting screen for the player who created the game.
 * It displays the game ID and allows the user to copy it.
 */
const Waiting = () => {
    const { gameId } = useParams();
    const navigate=useNavigate();
    if(!sessionStorage.getItem("gameId")) navigate("/");
    // State to give feedback when the user copies the ID
    const [copyText, setCopyText] = useState('Copy Game ID'); // Changed text

    /**
     * Copies the Game ID to the user's clipboard.
     */
    const handleCopyGameId = () => {
        // The only logic change is here: we copy gameId directly
        navigator.clipboard.writeText(gameId).then(() => {
            setCopyText('Copied!');
            // Reset the button text after 3 seconds
            setTimeout(() => {
                setCopyText('Copy Game ID'); // Changed text
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy ID. Please copy it manually.');
        });
    };

    return (
        <div className="waiting-container">
            <div className="waiting-box">
                <h2 className="waiting-title">Waiting for Opponent</h2>
                <div className="loader"></div>
                <p className="waiting-subtitle">
                    {/* Updated descriptive text */}
                    Share this Game ID with your friend. They can use it to join the match.
                </p>
                <div className="game-id-display">
                    <span>{gameId}</span>
                </div>
                {/* The button now calls the new handler */}
                <button onClick={handleCopyGameId} className="copy-btn">
                    {copyText}
                </button>
            </div>
        </div>
    );
};

export default Waiting;