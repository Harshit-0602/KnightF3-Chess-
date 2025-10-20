import { activeConnections } from "./Connection.controller.js";

export const closeGame = async (data) => {
    const { ws, commandClient } = data;
    const gameId = ws.gameId;
    const gameKey = `game:${gameId}`;
    const MAX_RETRIES = 3; // Attempt to delete 3 times before giving up.

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            // 1. WATCH the game key to ensure an atomic deletion.
            await commandClient.watch(gameKey);

            // 2. Check if the game still exists in Redis.
            const gameExists = await commandClient.exists(gameKey);
            if (!gameExists) {
                console.log(`Game ${gameId} already deleted. No action needed.`);
                await commandClient.unwatch();
                // Even if the key is gone, clean up any lingering local connections.
                break; 
            }

            // 3. Start a transaction to delete the key.
            const transaction = commandClient.multi().del(gameKey);
            const result = await transaction.exec();

            // 4. Check if the transaction was successful.
            if (result !== null) {
                console.log(`Successfully deleted game ${gameId} from Redis.`);
                break; // Exit the retry loop on success.
            }

            // If result is null, a race condition occurred. The loop will retry.
            console.warn(`Race condition on game ${gameId} during deletion. Retrying... (${i + 1}/${MAX_RETRIES})`);

        } catch (err) {
            console.error(`Error during game deletion for ${gameId}:`, err);
            await commandClient.unwatch(); // Clean up on error.
            return; // Exit on a critical error.
        }
    }

    // 5. After the loop, clean up the local server connections.
    const gameConnections = activeConnections.get(gameId);
    if (gameConnections) {
        console.log(`Closing WebSocket connections for game ${gameId}.`);
        Object.values(gameConnections).forEach(clientWs => {
            // 1000 is a normal closure code.
            clientWs.close(1000, "Game Over");
        });
        // Remove the game from the local map.
        activeConnections.delete(gameId);
    }
};