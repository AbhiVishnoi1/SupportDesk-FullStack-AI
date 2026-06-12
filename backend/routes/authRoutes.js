const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { store, createId } = require("../data/memoryStore");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supportdesk-dev-secret";
const isMongoReady = () => mongoose.connection.readyState === 1;

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase();
  if (isMongoReady()) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name || "Support User",
      email: normalizedEmail,
      password: hashed,
      role: "customer",
    });

    return res.status(201).json({
      message: "Registered successfully",
      user: user.toJSON(),
    });
  }

  const existingUser = store.users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: createId("user"),
    name: name || "Support User",
    email: normalizedEmail,
    password: hashed,
    role: "customer",
  };
  store.users.push(user);

  return res.status(201).json({
    message: "Registered successfully",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase();
  if (isMongoReady()) {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: user.toJSON(),
    });
  }

  const user = store.users.find((item) => item.email === normalizedEmail);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
