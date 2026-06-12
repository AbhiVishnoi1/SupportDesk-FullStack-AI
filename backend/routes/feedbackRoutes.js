const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const { store, createId } = require("../data/memoryStore");

const router = express.Router();
const isMongoReady = () => mongoose.connection.readyState === 1;

router.get("/", (_req, res) => {
  if (!isMongoReady()) {
    return res.json(store.feedback);
  }

  Feedback.find().sort({ createdAt: -1 }).then((feedback) => {
    res.json(feedback.map((item) => item.toJSON()));
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

router.post("/", (req, res) => {
  const feedback = {
    id: createId("feedback"),
    name: req.body.name || "Anonymous",
    email: req.body.email || "",
    rating: Number(req.body.rating || 5),
    ticketId: req.body.ticketId || "",
    message: req.body.message || "",
    createdAt: new Date().toISOString(),
  };

  if (!feedback.email || !feedback.message) {
    return res.status(400).json({ error: "Email and message are required" });
  }

  if (!isMongoReady()) {
    store.feedback.unshift(feedback);
    return res.status(201).json(feedback);
  }

  return Feedback.create({
    name: feedback.name,
    email: feedback.email,
    rating: feedback.rating,
    ticketId: feedback.ticketId,
    message: feedback.message,
  }).then((created) => res.status(201).json(created.toJSON()))
    .catch((error) => res.status(400).json({ error: error.message }));
});

module.exports = router;
