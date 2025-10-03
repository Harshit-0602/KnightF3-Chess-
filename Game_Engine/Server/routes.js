const express=require("express");
const { Moves_Highlighter } = require("../Logic/Controller/Moves_Highlighter");
const { MakeMove } = require("../Logic/Controller/MakeMove");
const router=express.Router();


router.post("/givemoves",(req,res)=>{
    const{cell,CurState}=req.body;
    CurState=Moves_Highlighter(cell,CurState);
    res.json({
        cell,
        CurState
    });
});

router.post("/makemove",(req,res)=>{
    const {cell,CurState}=req.body;
    CurState=MakeMove(cell,CurState);
    res.json({
        cell,
        CurState
    });
});

module.exports=router;