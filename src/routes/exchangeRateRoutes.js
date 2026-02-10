const express = require("express");
const router = express.Router();
const exchangeRateController = require("../controllers/exchangeRateController");
const {
  validateParamId,
  validateParamPair,
  validateUpsertExchangeRate,
} = require("../validators/exchangeRateValidator");
const handleValidation = require("../middleware/handleValidation");

router.get("/", exchangeRateController.getAllExchangeRates);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  exchangeRateController.getExchangeRateById,
);
router.get(
  "/pair/:fromCurrencyId/:toCurrencyId",
  validateParamPair,
  handleValidation,
  exchangeRateController.getExchangeRateByPair,
);
router.post(
  "/",
  validateUpsertExchangeRate,
  handleValidation,
  exchangeRateController.upsertExchangeRate,
);
router.delete(
  "/:id",
  validateParamId,
  handleValidation,
  exchangeRateController.removeExchangeRate,
);

module.exports = router;
