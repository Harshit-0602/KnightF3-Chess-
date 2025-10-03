const express=require("express");
const router=express.Router();

router.post("/",(req,res)=>{
    const cell={
        row:req.row,
        col:req.col
    }
    const promoteTo=req.promoteTo;
    if(!promoteTo)
});



module.exports=router;