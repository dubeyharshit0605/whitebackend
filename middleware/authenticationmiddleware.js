const jwt = require("jsonwebtoken");

const authentciationmiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No Bearer token provided",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "JWT_SECRET is not configured",
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "object" || !decoded.sub) {
      return res.status(401).json({
        message: "Token is missing user ID",
      });
    }

    req.email = decoded.email;
    req.userId = decoded.sub;
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  next();
};

module.exports = authentciationmiddleware;