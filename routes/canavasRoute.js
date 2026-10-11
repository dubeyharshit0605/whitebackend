const express = require("express");
const { getcanvas,createCanvas } = require("../controllers/canavascontroller");
const { registerUser } = require("../controllers/usercontroller");
const authentciationmiddleware = require("../middleware/authenticationmiddleware");

const router = express.Router();

router.get("/", authentciationmiddleware, getcanvas);
router.post('/register',registerUser);  
router.post('/canvases', authentciationmiddleware, createCanvas);

module.exports = router;