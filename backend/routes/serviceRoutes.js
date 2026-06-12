const express = require("express");

const router = express.Router();

const serviceCenters = [
  { name: "Delhi Service Hub", address: "Connaught Place, New Delhi", slo: "4 hours on-site commitment" },
  { name: "Mumbai Service Hub", address: "Bandra East, Mumbai", slo: "4 hours on-site commitment" },
  { name: "Bengaluru Service Hub", address: "MG Road, Bengaluru", slo: "4 hours on-site commitment" },
  { name: "Chennai Service Hub", address: "T. Nagar, Chennai", slo: "5 hours on-site commitment" },
];

router.get("/", (_req, res) => {
  res.json(serviceCenters);
});

module.exports = router;
