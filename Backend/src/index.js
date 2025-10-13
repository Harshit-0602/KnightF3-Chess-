const {connect}= require("../../Common/RedisClientSetup.js");
const express=require("express");
const router=require("./routes/Game_Intialization.routes.js");
const app=express();
const port=5000;

const StartServer=async()=>{
    const redisClient=await connect();
    if(!redisClient){
        console.log("Unable to Connect to the Redis Server, Stopping the Backend Server");
        process.exit(1);
    } 
    app.use(express.json());
    app.use("/",router);
    app.listen(port,()=>{
        console.log("Backend Main Server is running on port : "+port);
    })    
};

StartServer();


