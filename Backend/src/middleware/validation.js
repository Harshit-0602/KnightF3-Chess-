const { getCommandClient } = require("../../../Common/RedisClientSetup.js"); // Adjust path as needed

const validateRequestAndConnectRedis = (req, res, next) => {
    // --- Part 1: Check for email ---
    const email = req.body.email;
    if (!email) {
        // End the request here if email is missing
        return res.status(400).json({
            success: false,
            message: "Email is required to start the game"
        });
    }

    // --- Part 2: Connect to Redis ---
    let RedisClient;
    try {
        RedisClient = getCommandClient();
    } catch (error) {
        console.error("Middleware failed to get Redis Client => " + error);
        // End the request here if Redis is unavailable
        return res.status(500).json({
            success: false,
            message: "Unable to connect to the game server. Please try again later."
        });
    }

    // --- Part 3: Pass data and control ---
    // If we reach here, everything is valid.
    // Attach the client to the `req` object so the next function can use it.
    req.redisClient = RedisClient;
    req.email = email; // Also attach email for convenience

    // This is the most important part: call next() to pass control
    // to the actual route handler (your CreateGame function).
    next();
};

module.exports = { validateRequestAndConnectRedis };