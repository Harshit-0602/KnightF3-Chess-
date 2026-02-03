const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid'); // Use UUID for guaranteed unique game IDs
const { Generate_New_Game } = require("../utils/Generate_New_Game.js"); // Import your game state generator

/**
 * Creates a new game session with a complete initial state and stores it in Redis.
 */
const CreateGame = async (req, res) => {
    // These are provided by your validation middleware
    const RedisClient = req.redisClient;
    const email = req.email;

    // --- 1. Generate IDs and Tokens ---
    const gameId = uuidv4(); // Guaranteed unique
    const player1_token = crypto.randomBytes(16).toString('hex');
    const player2_token = crypto.randomBytes(16).toString('hex');

    // --- 2. Generate the Full, Initial Game State ---
    // This creates the rich object with the grid, king state, etc.
    const initialGame = Generate_New_Game();

    // --- 3. Prepare the Data for Redis ---
    // We must convert nested objects and arrays into JSON strings to store them in a Redis Hash.
    const gameDataForRedis = {
    grid: JSON.stringify(initialGame.grid),
    turn: initialGame.turn,
    kingState: JSON.stringify(initialGame.king),
    enPassantState: JSON.stringify(initialGame.enPassant),
    castlingState: JSON.stringify(initialGame.castling),
    promotionState: JSON.stringify(initialGame.promotion),
    selectedState: JSON.stringify(initialGame.selected),
    isMate: initialGame.isMate.toString(),
    result:JSON.stringify(initialGame.play),
    winner: JSON.stringify(initialGame.winner),
    // version: "0",
    // createdAt: Date.now().toString(),
    player1_token: player1_token,
    player2_token: player2_token,
    player1_email: email,
    status_p1:'waiting',
    status_p2:"waiting"
};

    
    // --- 4. Store in Redis and Respond ---
    try {
        // Use HSET to store the complete game object.
        await RedisClient.hSet(`game:${gameId}`, gameDataForRedis);
        // Set a 60-second TTL. If no one joins, the game will be auto-cleaned.
        await RedisClient.expire(`game:${gameId}`, 60);

        // Respond with the game ID and the player's specific token
        return res.status(200).json({
            success: true,
            message: "Game created successfully.",
            gameId: gameId,
            token: player1_token,
            status_p1:'waiting',
            status_p2:"waiting"
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


