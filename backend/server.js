require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const faqRoutes = require("./routes/faqRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const productRoutes = require("./routes/productRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/SupoortDB";

app.use(cors());
app.use(express.json());

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(`MongoDB unavailable, using in-memory data: ${error.message}`));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    mongoState: mongoose.connection.readyState,
    database: mongoose.connection?.name || "SupoortDB",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/servicecenters", serviceRoutes);

app.listen(PORT, () => {
  console.log(`SupportDesk backend running on port ${PORT}`);
});

module.exports = app;
