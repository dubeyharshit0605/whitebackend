const express=require('express');
const{createpost,getpost}=require('../controllers/postcontroller');
const router=express.Router();

router.get('/:id',getpost);
router.post('/',createpost);

module.exports=router;
