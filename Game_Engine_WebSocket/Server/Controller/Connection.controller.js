const { getCommandClient} = require("../../../Common/RedisClientSetup.js");
const giveMoveController=require("./giveMove.controller.js");
const makeMoveController=require("./makeMove.controller.js");

// This Map is our "directory" of all live games and player connections on THIS server.
const activeConnections = new Map();

const ConnectionHandler = async (ws, req) => {
    // 1. Get connection parameters from the URL
    const urlParams = new URLSearchParams(req.url.slice(1));
    const gameId = urlParams.get('gameId');
    const token = urlParams.get('token');

    if (!gameId || !token) {
        return ws.close(1008, "Missing Connection Parameters");
    }

    // 2. Get the correct Redis client and validate against Redis
    let commandClient;
    try {
        commandClient=getCommandClient();
    } catch (error) {
        console.log("Error occured in fetching the Redis Clients Closing the Connection.");
        ws.close(1011, "A critical redis client-server error occurred.");
    }
    let rawGameInfo;
    try {
        rawGameInfo = await commandClient.hGetAll(`game:${gameId}`);
    } catch (error) {
        console.error("Failed to get game info from Redis", error);
        return ws.close(1011, "A server error occurred while retrieving game data.");
    }

    if (Object.keys(rawGameInfo).length === 0) {
        return ws.close(1008, "Game not Found, Please Create the Game first");
    }

    // 3. Securely Determine Player Role ('player1'/'player2' for Redis, 'w'/'b' for game logic)
    const redisPlayerRole = rawGameInfo.player1_token === token ? 'player1' :
                            rawGameInfo.player2_token === token ? 'player2' : null;
    
    if (!redisPlayerRole) {
        return ws.close(1008, "Invalid User Token");
    }
    const playerColor = redisPlayerRole === 'player1' ? 'w' : 'b';

    // 4. "Rehydrate" the Rich Game State from Redis strings
    const gameInfo = {
        ...rawGameInfo,
        grid: JSON.parse(rawGameInfo.grid),
        kingState: JSON.parse(rawGameInfo.kingState),
        enPassantState: JSON.parse(rawGameInfo.enPassantState),
        castlingState: JSON.parse(rawGameInfo.castlingState),
        promotionState: JSON.parse(rawGameInfo.promotionState),
        selectedState: JSON.parse(rawGameInfo.selectedState),
        version: parseInt(rawGameInfo.version, 10)
    };

    console.log(`Player ${playerColor} (${gameInfo[redisPlayerRole + '_email']}) authenticated for game ${gameId}`);

    // 5. Attach state to the ws object for this session
    ws.gameId = gameId;
    ws.playerColor = playerColor; // Using 'w' or 'b'

    // 6. Manage the Connection State in the Local Map
    if (!activeConnections.has(gameId)) {
        activeConnections.set(gameId, {});
    }
    const gameConnections = activeConnections.get(gameId);
    gameConnections[playerColor] = ws; // Storing the raw 'ws' object as you requested

    // 7. Construct the clean payload for the client (no security info)
    const payloadForClient = {
        grid: gameInfo.grid,
        turn: gameInfo.turn,
        selected: gameInfo.selectedState,
        king: gameInfo.kingState,
        enPassant: gameInfo.enPassantState,
        castling: gameInfo.castlingState,
        isMate: gameInfo.isMate === 'true',
        play: gameInfo.status === 'active' || gameInfo.status === 'waiting',
        winner: JSON.parse(gameInfo.result),
        promotion: gameInfo.promotionState,
        status: gameInfo.status,
        version: gameInfo.version
    };

    // 8. Send the initial state to the connecting player
    ws.send(JSON.stringify({
        type: "game-sync",
        payload: payloadForClient,
        color: playerColor // Tell the client their color ('w' or 'b')
    }));

    // status active we need to publish for the gameID and all server must send the latest game state to every client
    //   
    // ... Pub/Sub and other event listeners would follow ...
    if(gameInfo.status==="active"){
        const Notification={type : "Connection",payload : "Opponent Connected Successfully !!"}
        try {
            await commandClient.publish(`game:${gameId}`,JSON.stringify(Notification));
        } catch (error) {
            console.log("Error While Publishing = "+error);
            ws.close(1011, "A server error occurred during publishing.")
        }
    }

    // when asking for give moves
    // This logic goes inside your ConnectionHandler, after a player is authenticated.

ws.on('message', async (rawMessage) => {
    let message;
    try {
        // Step 1: "Open the envelope" - Parse the JSON string into an object.
        message = JSON.parse(rawMessage);
    } catch (error) {
        console.error("Received invalid JSON from client:", rawMessage);
        // If the message is not valid JSON, ignore it and do nothing.
        return;
    }

    // Now 'message' is a proper object with a 'type' property.

    // Step 2: Bundle the data for your controllers, as you designed.
    const dataContext = {
        message: message,    // The parsed message object
        ws: ws,              // The WebSocket connection for this player
        commandClient: commandClient,
    };

    // Step 3: Use the 'type' to route to the correct controller.
    // A switch statement is often cleaner for this.
    switch (message.type) {
        case 'giveMove':
            await giveMoveController(dataContext);
            console.log("Handler for 'giveMove' would be called here.");
            break;
        
        case 'makeMove':
            // This is where you would call your main move handler.
            await makeMoveController(dataContext);
            console.log("Handler for 'makeMove' would be called here.");
            break;
        
        default:
            console.log(`Received unknown message type: ${message.type}`);
    }
});
    
    ws.on('close', () => {
        console.log(`Player ${ws.playerColor} disconnected from game ${ws.gameId}.`);
        const connections = activeConnections.get(ws.gameId);
        if (!connections) return;

        // Notify opponent via Pub/Sub
        const disconnectNotification = { type: 'opponent-disconnected', payload: { playerColor: ws.playerColor } };
        commandClient.publish(`game:${ws.gameId}`, JSON.stringify(disconnectNotification));

        // Clean up this player's connection from the local map
        delete connections[ws.playerColor];
        if (Object.keys(connections).length === 0) {
            activeConnections.delete(ws.gameId);
        }
    });
};

module.exports = {ConnectionHandler,activeConnections};

