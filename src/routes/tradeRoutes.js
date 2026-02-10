const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");

router.get("/market/:marketId", tradeController.getTradesByMarketId); // GET /api/trades/market/:marketId
router.get("/user/:userId", tradeController.getTradesByUserId); // GET /api/trades/user/:userId
router.get("/:id", tradeController.getTradeById); // GET /api/trades/:id

module.exports = router;
