require("dotenv").config();
const mongoose = require("mongoose");

const connectToDatabase = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "whiteboard",
  });

  console.log("Connected to MongoDB");
};

module.exports = { connectToDatabase };