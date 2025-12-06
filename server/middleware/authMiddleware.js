const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    // Expect token in Authorization header: Bearer <token>
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
  }
}

module.exports = authMiddleware;
