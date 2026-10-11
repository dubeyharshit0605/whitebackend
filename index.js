const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const canvasRoutes = require("./routes/canavasRoute");
const postRoutes = require("./routes/postRoutes");
const { connectToDatabase } = require("./db");

const app = express();
const PORT = 3030;

// Middleware must come before routes.
app.use(cors());
app.use(express.json());

// User endpoints: /users/register, /users/login, /users/profile
app.use("/users", userRoutes);
app.use("/canvas", canvasRoutes);
app.use("/posts", postRoutes);

// Start the server only after MongoDB connects.
async function startServer() {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  require("dotenv").config();
  startServer();
}

module.exports = { app, startServer };
