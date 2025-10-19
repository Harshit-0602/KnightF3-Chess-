const {connect}= require("../Common/RedisClientSetup.js");
const express=require("express");
const router=require("./routes/Game_Intialization.routes.js");
const cors=require("cors");
const app=express();

const port=5000;

const StartServer=async()=>{
    const redisClient=await connect();
    if(!redisClient){
        console.log("Unable to Connect to the Redis Server, Stopping the Backend Server");
        process.exit(1);
    } 
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/",router);
    app.listen(port,()=>{
        console.log("Backend Main Server is running on port : "+port);
    })    
};

StartServer();


