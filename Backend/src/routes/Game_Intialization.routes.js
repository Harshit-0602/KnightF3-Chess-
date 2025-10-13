const express=require("express");
const CreateGame = require("../controller/CreateGame.js");
const JoinGame =require("../controller/JoinGame.js");
const { validateRequestAndConnectRedis }=require("../middleware/validation.js");
const router=express.Router();

router.post("/create_game",validateRequestAndConnectRedis,CreateGame);
router.post("/join_game",validateRequestAndConnectRedis,JoinGame);

module.exports=router;