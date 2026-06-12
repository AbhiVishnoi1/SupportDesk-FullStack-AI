require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
const ChatMessage = require("../models/ChatMessage");
const { store, createId } = require("../data/memoryStore");

const router = express.Router();
const isMongoReady = () => mongoose.connection.readyState === 1;

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const systemInstruction = "You are a concise, professional customer support assistant for this website.";

router.get("/history", (_req, res) => {
  if (!isMongoReady()) {
    return res.json(store.chats);
  }

  ChatMessage.find().sort({ createdAt: 1 }).then((messages) => {
    res.json(messages.map((message) => message.toJSON()));
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

router.post("/", async (req, res) => {
  const userMessage = req.body.message?.trim();
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!ai) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction,
      },
    });

    const botReply = response.text || "";
    const chatRecord = {
      id: createId("chat"),
      userMessage,
      botReply,
      createdAt: new Date().toISOString(),
    };

    if (!isMongoReady()) {
      store.chats.push(chatRecord);
      return res.json({ reply: botReply });
    }

    await ChatMessage.create({
      userMessage: chatRecord.userMessage,
      botReply: chatRecord.botReply,
    });

    return res.json({ reply: botReply });
  } catch (error) {
    console.error("Gemini chat endpoint failed:", error);
    return res.status(500).json({ error: "Unable to generate a response right now." });
  }
});

module.exports = router;
