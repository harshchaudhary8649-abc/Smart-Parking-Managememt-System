const jwt = require("jsonwebtoken");
const { findUserById, publicUser } = require("../models/user");

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "smart_parking_local_secret");
    const user = findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = publicUser(user);
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = auth;
