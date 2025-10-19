const JoinGame = async (req, res) => {
    // --- Initial Validation ---
    const gameId = req.body.gameId;
    if (!gameId) {
        return res.status(400).json({
            success: false,
            message: "Game Id is required to join the game"
        });
    }

    // --- Fetch Game and Handle Errors ---
    let gameInfo;
    try {
        gameInfo = await req.redisClient.hGetAll(`game:${gameId}`);
    } catch (error) {
        console.error("Failed to get game info from Redis", error);
        return res.status(500).json({
            success: false,
            message: "A server error occurred while retrieving game data."
        });
    }

    // --- Validate Game Existence and Creator ---
    if (Object.keys(gameInfo).length === 0) {
        return res.status(404).json({
            success: false,
            message: "Game not found."
        });
    }

    if (gameInfo.player1_email === req.email) {
        return res.status(400).json({
            success: false,
            message: "You cannot join a game that you created."
        });
    }

    // --- Atomically Join the Game ---
    try {
        // The one and only check to see if the spot is available.
        // This atomically sets player2_email ONLY if it doesn't exist.
        const result = await req.redisClient.hSetNX(`game:${gameId}`, 'player2_email', req.email);

        // If result is 0, the spot was already taken (either normally or by another player in a race).
        if (result === 0) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: "This game is already full or another player joined just before you."
            });
        }

        // --- If we get here, we successfully claimed the spot! ---
        // await req.redisClient.hSet(`game:${gameId}`, 'status', 'active');
        await req.redisClient.persist(`game:${gameId}`); // Remove the TTL

        // Fetch the player2_token to send back to the client
        const player2_token = await req.redisClient.hGet(`game:${gameId}`, 'player2_token');

        return res.status(200).json({
            success: true,
            message: "Game Joined successfully.",
            gameId: gameId,
            token: player2_token,
            status_p1:'waiting',
            status_p2:"waiting"
        });

    } catch (redisError) {
        console.error("Failed to join game in Redis => " + redisError);
        return res.status(500).json({
            success: false,
            message: "Could not join the game due to a server error."
        });
    }
};

module.exports = JoinGame;
