// This controller handles a player's request to see valid moves for a selected piece.
// This is a READ-ONLY operation. It does NOT change the game state in Redis or publish.

// Assuming Moves_Highlighter is in the same directory now for simplicity
const { Moves_Highlighter } = require("./MovesHighlighter.js");

const giveMoveController = async (data) => {
    try {
        // 1. Destructure the data context object correctly
        const { message, ws, commandClient } = data;
        const { cell } = message.payload; // The cell the user clicked { piece, row, col }

        if (!cell) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Invalid request: 'cell' is missing." } }));
        }

        // 2. Fetch the authoritative game state from Redis
        const rawGameInfo = await commandClient.hGetAll(`game:${ws.gameId}`);
        if (Object.keys(rawGameInfo).length === 0) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Game not found." } }));
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
            play: rawGameInfo.status === 'active' || rawGameInfo.status === 'waiting',
            winner: JSON.parse(rawGameInfo.result),
            promotion: JSON.parse(rawGameInfo.promotionState),
        };

        // 4. Perform Business Logic Validations before calculating
        if (richGameInfo.turn !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "Not your turn." } }));
        }
        if (!cell.piece || cell.piece.charAt(0) !== ws.playerColor) {
            return ws.send(JSON.stringify({ type: 'error', payload: { message: "You can't select an empty square or your opponent's piece." } }));
        }
        
        // 5. Compute the new state with highlights using your highlighter function
        const stateWithHighlights = Moves_Highlighter(cell, richGameInfo);
        
        // 6. Send the result DIRECTLY back to the requesting player ONLY.
        // We do NOT publish this, as the opponent doesn't need to see the highlights.
        ws.send(JSON.stringify({
            type: "highlight-update", // A specific type for this action
            payload: stateWithHighlights
        }));

    } catch (error) {
        console.error("Error in giveMoveController:", error);
        // Safely try to send an error message back to the client
        if (data.ws && data.ws.readyState === 1) {
            data.ws.send(JSON.stringify({ type: 'error', payload: { message: 'An error occurred while calculating moves.' } }));
        }
    }
};

module.exports = { giveMoveController };