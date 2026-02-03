import { getCommandClient } from "../../../Backend/Common/RedisClientSetup.js";
import { closeGame } from "./closeGame.controller.js";
import { giveMoveController } from "./giveMove.controller.js";
import { makeMoveController } from "./makeMove.controller.js";
import { promotePawnController } from "./promotePawn.controller.js";

export const activeConnections = new Map();

export const ConnectionHandler = async (ws, req) => {
    // 1. Initial Setup
    const urlParams = new URLSearchParams(req.url.slice(1));
    const gameId = urlParams.get('gameId');
    const token = urlParams.get('token');

    if (!gameId || !token) {
        return ws.close(1008, "Missing Connection Parameters");
    }

    let commandClient;
    try {
        commandClient = getCommandClient();
    } catch (error) {
        return ws.close(1011, "A critical redis client-server error occurred.");
    }
    
    const gameKey = `game:${gameId}`;

    try {
        await commandClient.watch(gameKey);
        const rawGameInfo = await commandClient.hGetAll(gameKey);

        if (Object.keys(rawGameInfo).length === 0) {
            await commandClient.unwatch();
            return ws.close(1008, "Game not Found.");
        }

        const redisPlayerRole = rawGameInfo.player1_token === token ? 'player1' :
                              rawGameInfo.player2_token === token ? 'player2' : null;

        if (!redisPlayerRole) {
            await commandClient.unwatch();
            return ws.close(1008, "Invalid User Token");
        }
        
        const playerColor = redisPlayerRole === 'player1' ? 'w' : 'b';
        const statusKey = redisPlayerRole === 'player1' ? 'status_p1' : 'status_p2';
        const otherStatusKey = redisPlayerRole === 'player1' ? 'status_p2' : 'status_p1';
        
        const shouldNotify = rawGameInfo[otherStatusKey] === 'active';

        const payloadForClient = {
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
            status_p1: statusKey === 'status_p1' ? 'active' : rawGameInfo.status_p1,
            status_p2: statusKey === 'status_p2' ? 'active' : rawGameInfo.status_p2,
        };

        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
        // THE FIX: This block is now MOVED to BEFORE the transaction.
        // ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
        ws.gameId = gameId;
        ws.playerColor = playerColor;
        ws.redisStatusKey = statusKey;

        if (!activeConnections.has(gameId)) {
            activeConnections.set(gameId, {});
        }
        activeConnections.get(gameId)[playerColor] = ws;
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        const transaction = commandClient.multi()
            .hSet(gameKey, statusKey, "active");

        if (shouldNotify) {
            const notification = { type: "Game_Ready", payload: { message: "Both players are connected!" } };
            transaction.publish(`game:${gameId}`, JSON.stringify(notification));
        }

        const result = await transaction.exec();

        if (result === null) {
            console.warn(`Race condition for game ${gameId}. Closing connection to client for retry.`);
            return ws.close(4009, "RACE_CONDITION_RETRY"); 
        }

        // --- Transaction Succeeded ---

        console.log(`Player ${playerColor} (${rawGameInfo[redisPlayerRole + '_email']}) authenticated for game ${gameId}`);

        ws.send(JSON.stringify({
            type: "Player_Connected",
            payload: payloadForClient,
            color: playerColor
        }));

        ws.on('message', async (rawMessage) => {
            let message;
            try {
                message = JSON.parse(rawMessage);
            } catch (error) {
                console.error("Received invalid JSON from client:", rawMessage);
                return;
            }

            const dataContext = {
                message: message,
                ws: ws,
                commandClient: commandClient,
            };

            switch (message.type) {
                case 'giveMove':
                    await giveMoveController(dataContext);
                    console.log("Handler for 'giveMove' would be called here.");
                    break;

                case 'makeMove':
                    await makeMoveController(dataContext);
                    console.log("Handler for 'makeMove' would be called here.");
                    break;

                case 'promotePawn':
                    await promotePawnController(dataContext);
                    console.log("Handler for 'promotePawn' would be called here.");
                    break;

                case 'Game_Over':
                    await closeGame(dataContext);
                    console.log("Handler for 'Game Over' would be called here");
                    break;
                    

                default:
                    console.log(`Received unknown message type: ${message.type}`);
            }
        });

        ws.on('close', async () => {
            console.log(`Player ${ws.playerColor} disconnected from game ${ws.gameId}.`);

            // FIX 1: Use ws.redisStatusKey
            await commandClient.hSet(`game:${ws.gameId}`, ws.redisStatusKey, "waiting");

            const disconnectNotification = { type: 'Player_Disconnected', payload: { playerColor: ws.playerColor } };
            commandClient.publish(`game:${ws.gameId}`, JSON.stringify(disconnectNotification));

            const connections = activeConnections.get(ws.gameId);
            if (connections) {
                delete connections[ws.playerColor];
                if (Object.keys(connections).length === 0) {
                    activeConnections.delete(ws.gameId);
                }
            }
        });

    } catch (err) {
        console.error("Connection handler failed:", err); // Fixed: 'err' instead of 'error'
        ws.close(1011, "A server error occurred during connection setup.");
        await commandClient.unwatch();
    } 
};