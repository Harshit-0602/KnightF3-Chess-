const crypto = require("crypto");
// Assuming your path is correct

const CreateGame = async (req, res) => {
    // --- Your existing logic continues here ---

    // game id = hash(email_prefix + timestamp)
    const timestamp = Date.now();
    const dataToHash = `${req.email}-${timestamp}`;
    const gameId = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    // As per our discussion, you need two player-specific tokens
    const player1_token = crypto.randomBytes(16).toString('hex');
    const player2_token = crypto.randomBytes(16).toString('hex');
    
    // store this game info in Redis
    try {
        const gameData = {
            player1_token: player1_token,
            player2_token: player2_token,
            player1_email:req.email,
            player2_email:null
            // You can add more initial data if needed
            // e.g., created_by: email, status: 'waiting'
        };
        
        // Use HSET to store the game object. Set a 1-minute TTL.
        await req.redisClient.hSet(`game:${gameId}`, gameData);
        await req.redisClient.expire(`game:${gameId}`, 60);

        // respond with the game id and the player's specific token
        return res.status(200).json({
            success: true,
            message: "Game created successfully.",
            gameId: gameId,
            token: player1_token // Send Player 1 their unique token
        });

    } catch (redisError) {
        console.error("Failed to create game in Redis => " + redisError);
        return res.status(500).json({
            success: false,
            message: "Could not create the game due to a server error."
        });
    }
};

module.exports = CreateGame;