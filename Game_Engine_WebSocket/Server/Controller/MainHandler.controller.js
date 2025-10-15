const {ConnectionHandler,activeConnections}=require("./Connection.controller.js");
const {getSubscriberClient}=require("../../../Common/RedisClientSetup.js");

const MainHandler=(wss)=>{
    wss.on("connection",ConnectionHandler);    
    wss.on('error', (error) => {
        console.error('WebSocket Server Error:', error.message);
    }); 
    
    let subscriberClient;
    try {
        subscriberClient=getSubscriberClient();
    } catch (error) {
        console.log("Error while fetching the Subscriber Client");
    }

    const redisListener = (message, channel) => {
        // 'channel' will be the specific game channel, e.g., "game:a1b2-c3d4"
        // 'message' will be the JSON string payload, e.g., '{"type":"opponent-reconnected",...}'

        console.log(`Received message from Redis on channel: ${channel}`);
        
        // Extract the gameId from the channel name.
        const gameId = channel.split(':')[1];
        
        // 4. Look up the game in THIS server's local connection map.
        // This is the crucial step to see if we have any players for this game.
        const gameConnections = activeConnections.get(gameId);

        // 5. If no players for this game are on THIS server, simply do nothing.
        if (!gameConnections) {
            return;
        }

        // 6. If players are found, broadcast the message to all of them connected to THIS server.
        // This logic handles the case where one or both players are connected locally.
        Object.values(gameConnections).forEach(ws => {
            // 'ws' is the direct WebSocket connection object
            if (ws && ws.readyState === 1) { // 1 means the connection is OPEN
                ws.send(message); 
            }
        });
    };

    subscriberClient.pSubscribe('game:*', redisListener);
}

module.exports=MainHandler;