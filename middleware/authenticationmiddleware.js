const jwt=require("jsonwebtoken");
const user=require("../models/userModel");
const JWT_SECRET=process.env.JWT_SECRET;

const authentciationmiddleware=async(req,res,next)=>{
   const token=req.header("Authorization")?.replace("Bearer ","");
   if(!token){
       return res.status(401).json({message:"No token provided"});
   }
   try{
    const decoded=jwt.verify(token,JWT_SECRET);
    req.email= decoded.email;
    next();
   }catch(err){
       return res.status(401).json({message:"Invalid or expired token"});
   }
};
 module.exports=authentciationmiddleware;
