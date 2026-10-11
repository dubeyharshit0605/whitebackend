
const canvas=require("../models/canavasModel");
const getcanvas=async(req,res)=>{
    const email=req.email;
    try{
        const data=await canvas.find();
        res.status(200).json(data);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}
const createCanvas=async(req,res)=>{
    const {title,ownerId}=req.body;
    try{
        const data=await canvas.create({title,owner:ownerId});
        res.status(200).json(data);
    }catch(err){
        res.status(500).json({message:err.message});
    }
}
module .exports={getcanvas,createCanvas};