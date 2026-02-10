const express = require("express");
const router = express.Router();
const marketController = require("../controllers/marketController");
const {
  validateParamId,
  validateCreateMarket,
  validateUpdateMarketStatus,
} = require("../validators/marketValidator");
const handleValidation = require("../middleware/handleValidation");

router.get("/", marketController.getAllMarkets);
router.get("/active", marketController.getActiveMarkets);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  marketController.getMarketById,
);
router.post(
  "/",
  validateCreateMarket,
  handleValidation,
  marketController.createMarket,
);
router.patch(
  "/:id/status",
  validateUpdateMarketStatus,
  handleValidation,
  marketController.updateMarketStatus,
);
router.delete(
  "/:id",
  validateParamId,
  handleValidation,
  marketController.removeMarket,
);

module.exports = router;
