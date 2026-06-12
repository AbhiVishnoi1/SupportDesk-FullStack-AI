const express = require("express");
const mongoose = require("mongoose");
const Faq = require("../models/Faq");
const { store, createId } = require("../data/memoryStore");

const router = express.Router();
const isMongoReady = () => mongoose.connection.readyState === 1;

router.get("/", (_req, res) => {
  if (!isMongoReady()) {
    return res.json(store.faqs);
  }

  Faq.find().sort({ createdAt: -1 }).then((faqs) => {
    res.json(faqs.map((faq) => faq.toJSON()));
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

router.post("/", (req, res) => {
  const faq = {
    id: createId("faq"),
    question: req.body.question || "",
    answer: req.body.answer || "",
    category: req.body.category || "General",
    featured: false,
    createdAt: new Date().toISOString(),
  };

  if (!faq.question || !faq.answer) {
    return res.status(400).json({ error: "Question and answer are required" });
  }

  if (!isMongoReady()) {
    store.faqs.unshift(faq);
    return res.status(201).json(faq);
  }

  return Faq.create({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    featured: faq.featured,
  }).then((created) => res.status(201).json(created.toJSON()))
    .catch((error) => res.status(400).json({ error: error.message }));
});

module.exports = router;
