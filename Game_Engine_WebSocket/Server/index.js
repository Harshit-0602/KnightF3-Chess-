// this is the main file of the folder which actually start the server 
const {WebSocketServer}=require("ws");
const {connect}=require("../../Common/RedisClientSetup.js")
const MainHandler=require("./Controller/MainHandler.controller.js");

const Game_Intializer=async()=>{
    const redisClient=await connect();
    if(!redisClient){
        console.log("Unable to Connect to the Redis Server, Stopping the WebSocket Game Engine Server");
        process.exit(1);
    }
    const wss=new WebSocketServer({port :8081});
    wss.on("listening",()=>{
        console.log("Web Socket Game Engine Server is Listening on port : 8081");
    })
    // now i want to export this wss to the other file so that the connection logic and other
    // things can be seperated out from the file but how to do it i m unable to figure out 
    // it feels like i m stuck in the async await fn cycle to handle one i have to use again.
    MainHandler(wss);
}
Game_Intializer();




