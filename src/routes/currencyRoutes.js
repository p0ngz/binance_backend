const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

router.get("/", currencyController.getAllCurrencies); // GET    /api/currencies
router.get("/:id", currencyController.getCurrencyById); // GET    /api/currencies/:id
router.post("/", currencyController.createCurrency); // POST   /api/currencies
router.put("/:id", currencyController.updateCurrency); // PUT    /api/currencies/:id
router.delete("/:id", currencyController.removeCurrency); // DELETE /api/currencies/:id

module.exports = router;
