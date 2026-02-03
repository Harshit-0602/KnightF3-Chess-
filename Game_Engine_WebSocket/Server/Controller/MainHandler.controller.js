import { ConnectionHandler, activeConnections } from "./Connection.controller.js";
import { getSubscriberClient } from "../../../Backend/Common/RedisClientSetup.js";

export const MainHandler = (wss) => {
    wss.on("connection", ConnectionHandler);
    wss.on('error', (error) => {
        console.error('WebSocket Server Error:', error.message);
    });

    let subscriberClient;
    try {
        subscriberClient = getSubscriberClient();
    } catch (error) {
        console.log("Error while fetching the Subscriber Client");
        // In a real app, you might want to exit here as the server can't function
        // process.exit(1); 
        return; // Stop execution if the client isn't available
    }

    const redisListener = (message, channel) => {
        // 'channel' will be the specific game channel, e.g., "game:a1b2-c3d4"
        // 'message' will be the JSON string payload, e.g., '{"type":"opponent-reconnected",...}'

        console.log(`Received message from Redis on channel: ${channel}`);

        // Extract the gameId from the channel name.
        const gameId = channel.split(':')[1];

        // 4. Look up the game in THIS server's local connection map.
        const gameConnections = activeConnections.get(gameId);

        // 5. If no players for this game are on THIS server, simply do nothing.
        if (!gameConnections) {
            return;
        }

        // 6. If players are found, broadcast the message to all of them connected to THIS server.
        console.log("BroadCasting");
        Object.values(gameConnections).forEach(ws => {
            // 'ws' is the direct WebSocket connection object
            if (ws) { // 1 means the connection is OPEN
                ws.send(message);
            }
        });
        console.log("BroadCasted");
    };

    subscriberClient.pSubscribe('game:*', redisListener);

    console.log("Redis Pub/Sub listener is now subscribed to the 'game:*' channel pattern.");
};

