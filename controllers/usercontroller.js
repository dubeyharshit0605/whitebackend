const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const registrationErrors = new Set([
    "Name, email, and password are required",
    "Please enter a valid email address",
    "Password must have at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a symbol",
    "Password must not exceed 72 bytes",
]);

const safeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
});

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        const user = await userModel.register(name, email, password);

        return res.status(201).json({
            message: "User registered successfully",
            user: safeUser(user),
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: "Email already registered. Please log in.",
            });
        }

        if (registrationErrors.has(error.message)) {
            return res.status(400).json({
                error: error.message,
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                error: Object.values(error.errors)
                    .map((issue) => issue.message)
                    .join(", "),
            });
        }

        console.error("Error registering user:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        const user = await userModel.login(email, password);

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const token = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            {
                algorithm: "HS256",
                subject: user._id.toString(),
                expiresIn: "1h",
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser(user),
        });
    } catch (error) {
        if (error.message === "Email and password are required") {
            return res.status(400).json({
                error: error.message,
            });
        }

        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                error: error.message,
            });
        }

        console.error("Error logging in user:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
};
const getUserProfile = async (req, res) => {
    try {
        const authHeader = req.get("Authorization");
        const match = authHeader?.match(/^Bearer\s+(\S+)$/i);

        if (!match) {
            return res.status(401).json({
                error: "Authorization header must contain Bearer <token>",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
            algorithms: ["HS256"],
        });

        if (
            typeof payload !== "object" ||
            typeof payload.sub !== "string" ||
            typeof payload.email !== "string"
        ) {
            return res.status(401).json({
                error: "Invalid token payload",
            });
        }

        const user = await userModel.getUser(payload.sub);

        if (user.email !== payload.email) {
            return res.status(401).json({
                error: "Invalid credentials. Please log in again.",
            });
        }

        return res.status(200).json({
            message: "User profile retrieved successfully",
            user: safeUser(user),
        });
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Token expired. Please log in again.",
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError" ||
            error.message === "Invalid user ID" ||
            error.message === "User not found"
        ) {
            return res.status(401).json({
                error: "Invalid credentials. Please log in again.",
            });
        }

        console.error("Error retrieving user profile:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }//
};
const shareCanvas = async (req, res) => {
  try {
    // Canvas sharing logic yahan likho

    return res.status(200).json({
      message: "Share endpoint reached",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { shareCanvas };
module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
};