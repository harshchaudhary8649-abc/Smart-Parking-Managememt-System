const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, publicUser } = require("../models/user");

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "smart_parking_local_secret",
    { expiresIn: "7d" }
  );
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const user = createUser({
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "user",
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = email ? findUserByEmail(email) : null;

  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ user: publicUser(user), token: signToken(user) });
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me,
};
