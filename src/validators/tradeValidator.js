// tradeValidator.js — validation rules สำหรับ Trade API (read-only)
const { param } = require("express-validator");

// ────────── :id param ──────────
const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

// ────────── :marketId param ──────────
const validateParamMarketId = [
  param("marketId")
    .isInt({ min: 1 })
    .withMessage("marketId must be a positive integer")
    .toInt(),
];

// ────────── :userId param ──────────
const validateParamUserId = [
  param("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer")
    .toInt(),
];

module.exports = {
  validateParamId,
  validateParamMarketId,
  validateParamUserId,
};
