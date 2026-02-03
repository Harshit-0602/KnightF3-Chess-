import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook
import { useGame } from '../../GameProvider';
import './Home.css'
/**
 * The main landing page component for creating or joining a chess game.
 */
const Home = () => {
    const navigate = useNavigate(); // 2. Initialize the navigate function

    // State to manage the input fields for each form
    const [createEmail, setCreateEmail] = useState('');
    const [joinEmail, setJoinEmail] = useState('');
    const [gameId, setGameId] = useState('');
    const {connectAndListen}=useGame();

    /**
     * Handles the form submission for creating a new game.
     */
    const handleCreateGame = (e) => {
        e.preventDefault();
        if (!createEmail) {
            alert('Please enter an email to create a game.');
            return;
        }
        
        fetch("http://localhost:5000/create_game", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: createEmail })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                sessionStorage.setItem("gameId", data.gameId);
                sessionStorage.setItem("token", data.token);

                // 3. Call connectAndListen to establish the WebSocket connection
                connectAndListen(); 
                
                // Navigate to the waiting page
                navigate(`/waiting/${data.gameId}`);
            }
        })
        .catch(err => console.log("Error while hitting the create Game API = " + err));
    };
    
    const handleJoinGame = (e) => {
        e.preventDefault();
        if (!joinEmail || !gameId) {
            alert('Please enter both an email and a Game ID to join.');
            return;
        }
        
        fetch('http://localhost:5000/join_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: joinEmail, gameId: gameId })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.success) {
                sessionStorage.setItem("gameId", data.gameId);
                sessionStorage.setItem("token", data.token);

                // 3. Call connectAndListen to establish the WebSocket connection
                connectAndListen();
                
                // NOTE: The navigation will now be handled automatically by your
                // GameContext's onmessage handler when it receives the 'Game_Ready' event.
            } else {
                alert(data.message || 'Failed to join the game.');
            }
        })
        .catch(err => console.log("Error while Joining the Game"));
    };

    return (
        <div className="home-container">
            <div className="form-wrapper">
                
                <div className="header">
                    <h1 className="title">KnightF3 Chess</h1>
                    <p className="subtitle">Create a new game or join an existing one.</p>
                </div>

                {/* --- Create Game Form --- */}
                <form onSubmit={handleCreateGame} className="form-section">
                    <h2 className="form-title">Create Game</h2>
                    <div className="input-group">
                        <label htmlFor="create-email">Your Email</label>
                        <input
                            id="create-email"
                            type="email"
                            required
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <button type="submit" className="btn btn-create">
                        Create New Game
                    </button>
                </form>

                {/* --- Divider --- */}
                <div className="divider">
                    <span>OR</span>
                </div>

                {/* --- Join Game Form --- */}
                <form onSubmit={handleJoinGame} className="form-section">
                    <h2 className="form-title">Join Game</h2>
                    <div className="input-group">
                        <label htmlFor="join-email">Your Email</label>
                        <input
                            id="join-email"
                            type="email"
                            required
                            value={joinEmail}
                            onChange={(e) => setJoinEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="game-id">Game ID</label>
                        <input
                            id="game-id"
                            type="text"
                            required
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            placeholder="Enter the game ID from your friend"
                        />
                    </div>
                    <button type="submit" className="btn btn-join">
                        Join Game
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;