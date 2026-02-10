// currencyValidator.js — validation rules สำหรับ Currency API
const { body, param } = require("express-validator");

// ────────── :id param ──────────
const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id must be a positive integer")
    .toInt(),
];

// ────────── POST /api/currencies — สร้างสกุลเงิน ──────────
const validateCreateCurrency = [
  body("symbol")
    .trim()
    .notEmpty()
    .withMessage("symbol is required")
    .isLength({ min: 2, max: 10 })
    .withMessage("symbol must be 2-10 characters")
    .isAlpha()
    .withMessage("symbol must contain only letters")
    .customSanitizer((val) => val.toUpperCase()), // BTC, ETH, THB

  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("name must be 2-50 characters")
    .escape(),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("type is required")
    .isIn(["CRYPTO", "FLAT"])
    .withMessage("type must be CRYPTO or FLAT"),

  body("precision")
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage("precision must be an integer 0-18"),
];

// ────────── PUT /api/currencies/:id — แก้ไขสกุลเงิน ──────────
const validateUpdateCurrency = [
  ...validateParamId,

  body("symbol")
    .optional()
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage("symbol must be 2-10 characters")
    .isAlpha()
    .withMessage("symbol must contain only letters")
    .customSanitizer((val) => val.toUpperCase()),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("name must be 2-50 characters")
    .escape(),

  body("type")
    .optional()
    .trim()
    .isIn(["CRYPTO", "FLAT"])
    .withMessage("type must be CRYPTO or FLAT"),

  body("precision")
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage("precision must be an integer 0-18"),
];

module.exports = {
  validateParamId,
  validateCreateCurrency,
  validateUpdateCurrency,
};
