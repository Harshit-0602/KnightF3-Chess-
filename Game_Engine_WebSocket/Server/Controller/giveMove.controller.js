// This controller handles a player's request to see valid moves for a selected piece.
// This is a READ-ONLY operation. It does NOT change the game state in Redis or publish.

// Assuming Moves_Highlighter is in the same directory now for simplicity
import { Moves_Highlighter } from "../../Logic/Controller/Moves_Highlighter.js";

export const giveMoveController = async (data) => {
    try {

        console.log("Entering the Give Move Controller");
        
        // 1. Destructure the data context object correctly
        const { message, ws, commandClient } = data;
        const { cell } = message.payload; // The cell the user clicked { piece, row, col }

        if (!cell) {
            return ws.send(JSON.stringify({ type: 'Cell_Missing_Error', payload: { message: "Invalid request: 'cell' is missing." } }));
        }

        // 2. Fetch the authoritative game state from Redis
        const rawGameInfo = await commandClient.hGetAll(`game:${ws.gameId}`);
        if (Object.keys(rawGameInfo).length === 0) {
            return ws.send(JSON.stringify({ type: 'Game_Unavailable_Error', payload: { message: "Game not found." } }));
        }

        // 3. "Rehydrate" the game state from Redis strings into usable objects
        const richGameInfo = {
            grid: JSON.parse(rawGameInfo.grid),
            turn: rawGameInfo.turn,
            selected: JSON.parse(rawGameInfo.selectedState),
            king: JSON.parse(rawGameInfo.kingState),
            enPassant: JSON.parse(rawGameInfo.enPassantState),
            castling: JSON.parse(rawGameInfo.castlingState),
            isMate: rawGameInfo.isMate === 'true',
            winner:JSON.parse(rawGameInfo.winner),
            result: JSON.parse(rawGameInfo.result),
            promotion: JSON.parse(rawGameInfo.promotionState),
            status_p1:rawGameInfo.status_p1,
            status_p2:rawGameInfo.status_p2
        };

        // 4. Perform Business Logic Validations before calculating
        if (richGameInfo.turn !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'Not_Your_Turn_Error', payload: { message: "Not your turn." } }));
        }
        if (!cell.piece || cell.piece.charAt(0) !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'Invalid_Cell_Error', payload: { message: "You can't select an empty square or your opponent's piece." } }));
        }
        
        // 5. Compute the new state with highlights using your highlighter function
        const stateWithHighlights = Moves_Highlighter(cell, richGameInfo);
        
        
        const newStateForRedis = {
            ...rawGameInfo, // 1. Carry over all old fields (version, players, etc.)
            
            // 2. Overwrite only the fields that changed
            grid: JSON.stringify(stateWithHighlights.grid),
            turn: stateWithHighlights.turn,
            selectedState: JSON.stringify(stateWithHighlights.selected),
            kingState: JSON.stringify(stateWithHighlights.king),
            enPassantState: JSON.stringify(stateWithHighlights.enPassant),
            castlingState: JSON.stringify(stateWithHighlights.castling),
            isMate: String(stateWithHighlights.isMate),
            result: JSON.stringify(stateWithHighlights.result),
            winner: JSON.stringify(stateWithHighlights.winner),
            promotionState: JSON.stringify(stateWithHighlights.promotion),
        };

        // >>> NEW: Save the updated state to Redis
        await commandClient.hSet(`game:${ws.gameId}`, newStateForRedis);
        
        
        // 6. Send the result DIRECTLY back to the requesting player ONLY.
        // We do NOT publish this, as the opponent doesn't need to see the highlights.
        ws.send(JSON.stringify({
            type: "Move_Given", // A specific type for this action
            payload: stateWithHighlights
        }));

    } catch (error) {
        console.error("Error in giveMoveController:", error);
        // Safely try to send an error message back to the client
        if (data.ws && data.ws.readyState === 1) {
            data.ws.send(JSON.stringify({ type: 'Give_Move_Error', payload: { message: 'An error occurred while calculating moves.' } }));
        }
    }
};
