const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { store } = require("../data/memoryStore");

const router = express.Router();
const isMongoReady = () => mongoose.connection.readyState === 1;

router.get("/", (_req, res) => {
  if (!isMongoReady()) {
    return res.json(store.products);
  }

  Product.find().sort({ name: 1 }).then(async (products) => {
    if (!products.length) {
      const seeded = await Product.insertMany(store.products.map((product) => ({
        name: product.name,
        category: product.category,
        available: product.available,
        testing: product.testing,
      })));
      return res.json(seeded.map((product) => product.toJSON()));
    }
    return res.json(products.map((product) => product.toJSON()));
  }).catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

module.exports = router;
