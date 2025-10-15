const { MakeMove } = require("../../Logic/Controller/MakeMove.js"); // Using your game logic

const makeMoveController = async (data) => {
    try {
        const { message, ws, commandClient } = data;
        const { destinationCell, version: clientVersion } = message.payload;

        // 1. Fetch and validate the authoritative game state from Redis
        const rawGameInfo = await commandClient.hGetAll(`game:${ws.gameId}`);
        if (Object.keys(rawGameInfo).length === 0) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Game not found." } }));
        }
        const authoritativeVersion = parseInt(rawGameInfo.version, 10);

        // 2. Perform critical validations (version and turn)
        if (clientVersion !== authoritativeVersion) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Your game state is out of date. Move rejected." } }));
        }
        if (rawGameInfo.turn !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Not your turn." } }));
        }

        // 3. "Rehydrate" the state to pass to your game logic
        const currentState = {
            grid: JSON.parse(rawGameInfo.grid),
            turn: rawGameInfo.turn,
            selected: JSON.parse(rawGameInfo.selectedState),
            king: JSON.parse(rawGameInfo.kingState),
            enPassant: JSON.parse(rawGameInfo.enPassantState),
            castling: JSON.parse(rawGameInfo.castlingState),
        };

        // 4. Execute your core game logic to get the new state
        const nextState = MakeMove(destinationCell, currentState);
        const newVersion = authoritativeVersion + 1;

        // 5. --- PREPARE THE REDIS PAYLOAD (as per your schema) ---
        // This object contains all fields that change during a move.
        const newStateForRedis = {
            grid: JSON.stringify(nextState.grid),
            turn: nextState.turn,
            kingState: JSON.stringify(nextState.king),
            enPassantState: JSON.stringify(nextState.enPassant),
            castlingState: JSON.stringify(nextState.castling),
            promotionState: JSON.stringify(nextState.promotion),
            selectedState: JSON.stringify(nextState.selected),
            
            status: nextState.play === true ? 'active' : 'completed',
            isMate: nextState.isMate.toString(),
            result: JSON.stringify(nextState.winner),
            
            version: newVersion,
            lastMoveAt: Date.now(),
            // Storing the last move is useful for UI highlighting
            lastMove: JSON.stringify({ from: currentState.selected, to: destinationCell }),
        };

        // 6. Update Redis with the new state
        await commandClient.hSet(`game:${ws.gameId}`, newStateForRedis);

        // 7. --- PREPARE THE CLIENT PAYLOAD (as per your schema) ---
        // This object is clean and contains only what the client needs to render.
        const payloadForBroadcast = {
            grid: nextState.grid,
            turn: nextState.turn,
            selected: nextState.selected,
            king: nextState.king,
            enPassant: nextState.enPassant,
            castling: nextState.castling,
            isMate: nextState.isMate,
            play: nextState.play,
            winner: nextState.winner,
            promotion: nextState.promotion,
            status: newStateForRedis.status, // Use the calculated status
            version: newVersion
        };
        
        // 8. PUBLISH the new state to the game channel
        await commandClient.publish(`game:${ws.gameId}`, JSON.stringify({
            type: "game-update",
            payload: payloadForBroadcast
        }));

    } catch (error) {
        console.error("Error in makeMoveController:", error);
        if (data.ws && data.ws.readyState === 1) {
            data.ws.send(JSON.stringify({ type: 'error', payload: { message: 'An error occurred while making your move.' } }));
        }
    }
};

module.exports = { makeMoveController };

