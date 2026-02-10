const express = require("express");
const router = express.Router();
const marketController = require("../controllers/marketController");

router.get("/", marketController.getAllMarkets); // GET    /api/markets
router.get("/active", marketController.getActiveMarkets); // GET    /api/markets/active
router.get("/:id", marketController.getMarketById); // GET    /api/markets/:id
router.post("/", marketController.createMarket); // POST   /api/markets
router.patch("/:id/status", marketController.updateMarketStatus); // PATCH  /api/markets/:id/status
router.delete("/:id", marketController.removeMarket); // DELETE /api/markets/:id

module.exports = router;
