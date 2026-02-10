// marketValidator.js — validation rules สำหรับ Market API
const { body, param } = require("express-validator");

// ────────── :id param ──────────
const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

// ────────── POST /api/markets — สร้างตลาด ──────────
const validateCreateMarket = [
  body("baseCurrencyId")
    .isInt({ min: 1 })
    .withMessage("baseCurrencyId must be a positive integer"),

  body("quoteCurrencyId")
    .isInt({ min: 1 })
    .withMessage("quoteCurrencyId must be a positive integer"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "PAUSED", "CLOSED"])
    .withMessage("status must be ACTIVE, PAUSED, or CLOSED"),
];

// ────────── PATCH /api/markets/:id/status — อัพเดทสถานะ ──────────
const validateUpdateMarketStatus = [
  ...validateParamId,

  body("status")
    .trim()
    .notEmpty()
    .withMessage("status is required")
    .isIn(["ACTIVE", "PAUSED", "CLOSED"])
    .withMessage("status must be ACTIVE, PAUSED, or CLOSED"),
];

module.exports = {
  validateParamId,
  validateCreateMarket,
  validateUpdateMarketStatus,
};
