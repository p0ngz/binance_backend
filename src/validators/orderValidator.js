// orderValidator.js — validation rules สำหรับ Order API
const { body, param } = require("express-validator");

// ────────── :id param ──────────
const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

// ────────── :userId param ──────────
const validateParamUserId = [
  param("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer")
    .toInt(),
];

// ────────── POST /api/orders — สร้างคำสั่งซื้อ/ขาย ──────────
const validateCreateOrder = [
  body("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer"),

  body("marketId")
    .isInt({ min: 1 })
    .withMessage("marketId must be a positive integer"),

  body("side")
    .trim()
    .notEmpty()
    .withMessage("side is required")
    .isIn(["BUY", "SELL"])
    .withMessage("side must be BUY or SELL"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("type is required")
    .isIn(["LIMIT", "MARKET"])
    .withMessage("type must be LIMIT or MARKET"),

  body("price")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("price must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("price must be greater than 0"),

  body("amount")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("amount must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("amount must be greater than 0"),

  body("filledType")
    .optional()
    .isIn(["SINGLE", "MULTIPLE"])
    .withMessage("filledType must be SINGLE or MULTIPLE"),
];

module.exports = {
  validateParamId,
  validateParamUserId,
  validateCreateOrder,
};
