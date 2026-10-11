const express = require("express");
const {
  getcanvas,
  createCanvas,
  loadCanvas,
  updateCanvas,
} = require("../controllers/canavascontroller");
const authentciationmiddleware = require("../middleware/authenticationmiddleware");

const router = express.Router();

router.get("/", authentciationmiddleware, getcanvas);
router.post("/", authentciationmiddleware, createCanvas);
router.get("/load/:id", authentciationmiddleware, loadCanvas);
router.put("/:id", authentciationmiddleware, updateCanvas);

module.exports = router;
