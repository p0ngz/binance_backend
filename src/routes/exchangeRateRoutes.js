const express = require("express");
const router = express.Router();
const exchangeRateController = require("../controllers/exchangeRateController");

router.get("/", exchangeRateController.getAllExchangeRates); // GET    /api/exchange-rates
router.get("/:id", exchangeRateController.getExchangeRateById); // GET    /api/exchange-rates/:id
router.get(
  "/pair/:fromCurrencyId/:toCurrencyId",
  exchangeRateController.getExchangeRateByPair,
); // GET    /api/exchange-rates/pair/:from/:to
router.post("/", exchangeRateController.upsertExchangeRate); // POST   /api/exchange-rates
router.delete("/:id", exchangeRateController.removeExchangeRate); // DELETE /api/exchange-rates/:id

module.exports = router;
