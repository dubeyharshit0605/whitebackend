const express=require('express');
const{createpost,getpost}=require('../controllers/postcontroller');
const router=express.Router();

router.get('/',getpost);
router.post('/',createpost);

module.exports=router;