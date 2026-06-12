const express = require("express");
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const { store, createId } = require("../data/memoryStore");

const router = express.Router();
const isMongoReady = () => mongoose.connection.readyState === 1;

function derivePriority(payload) {
  const source = `${payload.issueTitle || ""} ${payload.description || ""}`.toLowerCase();
  if (source.includes("dead") || source.includes("not turning on") || source.includes("cracked")) return "High";
  if (source.includes("refund") || source.includes("warranty") || source.includes("payment")) return "Medium";
  return payload.priority || "Medium";
}

router.get("/", (_req, res) => {
  if (!isMongoReady()) {
    return res.json(store.tickets);
  }

  Ticket.find().sort({ createdAt: -1 }).then((tickets) => {
    res.json(tickets.map((ticket) => ticket.toJSON()));
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

router.post("/", (req, res) => {
  const ticketPayload = {
    id: createId("ticket"),
    category: req.body.category || "9. Other / General Issue",
    product: req.body.product || "",
    productImage: req.body.productImage || "",
    productName: req.body.productName || "",
    modelNumber: req.body.modelNumber || "",
    purchaseDate: req.body.purchaseDate || "",
    warrantyStatus: req.body.warrantyStatus || "Active",
    issueTitle: req.body.issueTitle || "",
    description: req.body.description || "",
    location: req.body.location || "",
    status: "Open",
    priority: derivePriority(req.body),
    customerEmail: req.body.customerEmail || "guest@supportdesk.local",
    createdAt: new Date().toISOString(),
  };

  if (!ticketPayload.category || !ticketPayload.product || !ticketPayload.productName || !ticketPayload.modelNumber || !ticketPayload.issueTitle || !ticketPayload.description || !ticketPayload.location) {
    return res.status(400).json({ error: "Missing required ticket fields" });
  }

  if (!isMongoReady()) {
    store.tickets.unshift(ticketPayload);
    return res.status(201).json(ticketPayload);
  }

  return Ticket.create({
    category: ticketPayload.category,
    product: ticketPayload.product,
    productImage: ticketPayload.productImage,
    productName: ticketPayload.productName,
    modelNumber: ticketPayload.modelNumber,
    purchaseDate: ticketPayload.purchaseDate,
    warrantyStatus: ticketPayload.warrantyStatus,
    issueTitle: ticketPayload.issueTitle,
    description: ticketPayload.description,
    location: ticketPayload.location,
    status: ticketPayload.status,
    priority: ticketPayload.priority,
    customerEmail: ticketPayload.customerEmail,
  }).then((ticket) => res.status(201).json(ticket.toJSON()))
    .catch((error) => res.status(400).json({ error: error.message }));
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["Open", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  if (!isMongoReady()) {
    const ticket = store.tickets.find((item) => item.id === req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    ticket.status = status;
    return res.json(ticket);
  }

  return Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
    .then((ticket) => {
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      return res.json(ticket.toJSON());
    })
    .catch((error) => res.status(400).json({ error: error.message }));
});

module.exports = router;
