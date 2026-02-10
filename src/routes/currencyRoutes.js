const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");
const {
  validateParamId,
  validateCreateCurrency,
  validateUpdateCurrency,
} = require("../validators/currencyValidator");
const handleValidation = require("../middleware/handleValidation");

router.get("/", currencyController.getAllCurrencies);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  currencyController.getCurrencyById,
);
router.post(
  "/",
  validateCreateCurrency,
  handleValidation,
  currencyController.createCurrency,
);
router.put(
  "/:id",
  validateUpdateCurrency,
  handleValidation,
  currencyController.updateCurrency,
);
router.delete(
  "/:id",
  validateParamId,
  handleValidation,
  currencyController.removeCurrency,
);

module.exports = router;
