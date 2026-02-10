// exchangeRateValidator.js — validation rules สำหรับ ExchangeRate API
const { body, param } = require("express-validator");

// ────────── :id param ──────────
const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

// ────────── :fromCurrencyId/:toCurrencyId params ──────────
const validateParamPair = [
  param("fromCurrencyId")
    .isInt({ min: 1 })
    .withMessage("fromCurrencyId must be a positive integer")
    .toInt(),
  param("toCurrencyId")
    .isInt({ min: 1 })
    .withMessage("toCurrencyId must be a positive integer")
    .toInt(),
];

// ────────── POST /api/exchange-rates — upsert อัตราแลกเปลี่ยน ──────────
const validateUpsertExchangeRate = [
  body("fromCurrencyId")
    .isInt({ min: 1 })
    .withMessage("fromCurrencyId must be a positive integer"),

  body("toCurrencyId")
    .isInt({ min: 1 })
    .withMessage("toCurrencyId must be a positive integer"),

  body("rate")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("rate must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("rate must be greater than 0"),
];

module.exports = {
  validateParamId,
  validateParamPair,
  validateUpsertExchangeRate,
};
