// this is the main file of the folder which actually starts the server
import { WebSocketServer } from "ws";
import { connect, getCommandClient } from "../../Backend/Common/RedisClientSetup.js";
import { MainHandler } from "./Controller/MainHandler.controller.js";

const Game_Initializer = async () => {
    // Await the connection and then check for the client's existence
    await connect();
    if (!getCommandClient()) { // Use the getter to check for a successful connection
        console.log("Unable to Connect to the Redis Server, Stopping the WebSocket Game Engine Server");
        process.exit(1);
    }

    const wss = new WebSocketServer({ port: 8081 });

    wss.on("listening", () => {
        console.log("Web Socket Game Engine Server is Listening on port: 8081");
    });

    // Pass the wss instance to the MainHandler using dependency injection
    MainHandler(wss);
};

Game_Initializer();

