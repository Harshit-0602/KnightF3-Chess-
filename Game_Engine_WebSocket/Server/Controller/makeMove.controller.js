import { MakeMove } from "../../Logic/Controller/MakeMove.js"; // Using your game logic

export const makeMoveController = async (data) => {
    try {
        const { message, ws, commandClient } = data;
        const { cell} = message.payload;

        // 1. Fetch and validate the authoritative game state from Redis
        const rawGameInfo = await commandClient.hGetAll(`game:${ws.gameId}`);
        if (Object.keys(rawGameInfo).length === 0) {
            return ws.send(JSON.stringify({ type: 'Game_Unavailable_Error', payload: { message: "Game not found." } }));
        }
        // const authoritativeVersion = parseInt(rawGameInfo.version, 10);
        // console.log(authoritativeVersion);
        

        // // 2. Perform critical validations (version and turn)
        // if (clientVersion !== authoritativeVersion) {
        //     return ws.send(JSON.stringify({ type: 'error', payload: { message: "Your game state is out of date. Move rejected." } }));
        // }
        if (rawGameInfo.turn !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'Not_Your_Turn_Error', payload: { message: "Not your turn." } }));
        }

        // 3. "Rehydrate" the state to pass to your game logic
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

        // 4. Execute your core game logic to get the new state
        const nextState = MakeMove(cell, currentState);

        // 5. --- PREPARE THE REDIS PAYLOAD (as per your schema) ---
        const newStateForRedis = {
            ...rawGameInfo, // 1. Carry over all old fields (version, players, createdAt, etc.)

            // 2. Overwrite the gameplay fields with their new values from nextState
            grid: JSON.stringify(nextState.grid),
            turn: nextState.turn,
            kingState: JSON.stringify(nextState.king),
            enPassantState: JSON.stringify(nextState.enPassant),
            castlingState: JSON.stringify(nextState.castling),
            promotionState: JSON.stringify(nextState.promotion),
            selectedState: JSON.stringify(nextState.selected),
            isMate: nextState.isMate.toString(),
            result: JSON.stringify(nextState.result),
            winner: JSON.stringify(nextState.winner),
            
            // 3. Update metadata fields for this specific move
            // version: newVersion.toString(), // It's safer to store numbers as strings
            // lastMoveAt: Date.now().toString(),
            // lastMove: JSON.stringify({ from: currentState.selected, to: cell }),
        };

        // 6. Update Redis with the new state
        await commandClient.hSet(`game:${ws.gameId}`, newStateForRedis);

        // 7. --- PREPARE THE CLIENT PAYLOAD (as per your schema) ---
        const payloadForBroadcast = {
            grid: nextState.grid,
            turn: nextState.turn,
            selected: nextState.selected,
            king: nextState.king,
            enPassant: nextState.enPassant,
            castling: nextState.castling,
            isMate: nextState.isMate,
            result: nextState.result,
            winner:nextState.winner,
            promotion: nextState.promotion,
            status_p1:nextState.status_p1,
            status_p2:nextState.status_p2
        };
        
        // 8. PUBLISH the new state to the game channel
        await commandClient.publish(`game:${ws.gameId}`, JSON.stringify({
            type: "Move_Made",
            payload: payloadForBroadcast
        }));

    } catch (error) {
        console.error("Error in makeMoveController:", error);
        if (data.ws && data.ws.readyState === 1) {
            data.ws.send(JSON.stringify({ type: 'Make_Move_Error', payload: { message: 'An error occurred while making your move.' } }));
        }
    }
};
