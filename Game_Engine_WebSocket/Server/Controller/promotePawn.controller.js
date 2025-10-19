import { Promote_Pawn } from "../../Logic/Controller/Promote_Pawn.js"; // Assuming this is your pure logic function

export const promotePawnController = async (data) => {
    const { message, ws, commandClient } = data;
    const { promoteTo } = message.payload; // e.g., 'q', 'n', 'r', 'b'
    const gameKey = `game:${ws.gameId}`;

    // A quick initial validation on the payload
    if (!['q', 'n', 'r', 'b'].includes(promoteTo)) {
        return ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid promotion piece.' } }));
    }

    try {
        // 1. WATCH the game key to ensure the operation is atomic.
        await commandClient.watch(gameKey);

        // 2. READ the authoritative state from Redis.
        const rawGameInfo = await commandClient.hGetAll(gameKey);
        
        // 3. VALIDATE the request against the server's state.
        const promotionState = JSON.parse(rawGameInfo.promotionState);
        if (!promotionState || !promotionState.isPromoting) {
            await commandClient.unwatch();
            return ws.send(JSON.stringify({ type: 'error', payload: { message: 'No pawn is awaiting promotion.' } }));
        }
        if (rawGameInfo.turn !== ws.playerColor) {
            await commandClient.unwatch();
            return ws.send(JSON.stringify({ type: 'error', payload: { message: 'Not your turn to promote.' } }));
        }

        // 4. "Rehydrate" the current state to pass to your pure logic function.
        const currentState = {
            grid: JSON.parse(rawGameInfo.grid),
            turn: rawGameInfo.turn,
            selected: JSON.parse(rawGameInfo.selectedState),
            king: JSON.parse(rawGameInfo.kingState),
            enPassant: JSON.parse(rawGameInfo.enPassantState),
            castling: JSON.parse(rawGameInfo.castlingState),
            isMate: rawGameInfo.isMate === 'true',
            result: JSON.parse(rawGameInfo.result),
            winner: JSON.parse(rawGameInfo.winner),
            promotion: JSON.parse(rawGameInfo.promotionState),
            status_p1:rawGameInfo.status_p1,
            status_p2:rawGameInfo.status_p2
        };


        // 5. DELEGATE to the pure game logic function to get the new state.
        const nextState = Promote_Pawn(promoteTo, currentState);

        // 6. PREPARE the new state for Redis and for broadcasting.
        const newStateForRedis = {
            ...rawGameInfo,
            grid: JSON.stringify(nextState.grid),
            turn: nextState.turn,
            kingState: JSON.stringify(nextState.king),
            enPassantState: JSON.stringify(nextState.enPassant),
            castlingState: JSON.stringify(nextState.castling),
            promotionState: JSON.stringify(nextState.promotion), // Should be cleared by your logic
            selectedState: JSON.stringify(nextState.selected),
            isMate: nextState.isMate.toString(),
            result: JSON.stringify(nextState.result),
            winner: JSON.stringify(nextState.winner),
        };

        const payloadForBroadcast = { ...nextState };

        // 7. BUILD and EXECUTE the atomic transaction.
        const transaction = commandClient.multi()
            .hSet(gameKey, newStateForRedis) // Update the game state in one go
            .publish(`game:${ws.gameId}`, JSON.stringify({
                type: 'Move_Made', // A promotion is a type of move
                payload: payloadForBroadcast
            }));

        const result = await transaction.exec();

        // 8. HANDLE potential race conditions.
        if (result === null) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: 'Game state changed. Please try again.' } }));
        }

    } catch (err) {
        console.error("Error in promotePawnController:", err);
        await commandClient.unwatch(); // Clean up on error
        ws.send(JSON.stringify({ type: 'error', payload: { message: 'An error occurred during pawn promotion.' } }));
    }
};