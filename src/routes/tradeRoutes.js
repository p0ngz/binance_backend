const express = require("express");
const router = express.Router();
const tradeController = require("../controllers/tradeController");
const {
  validateParamId,
  validateParamMarketId,
  validateParamUserId,
} = require("../validators/tradeValidator");
const handleValidation = require("../middleware/handleValidation");

router.get(
  "/market/:marketId",
  validateParamMarketId,
  handleValidation,
  tradeController.getTradesByMarketId,
);
router.get(
  "/user/:userId",
  validateParamUserId,
  handleValidation,
  tradeController.getTradesByUserId,
);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  tradeController.getTradeById,
);

module.exports = router;
