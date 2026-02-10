// walletValidator.js — validation rules สำหรับ Wallet API
const { body, param } = require("express-validator");

// ────────── :userId param ──────────
const validateParamUserId = [
  param("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer")
    .toInt(),
];

// ────────── :userId + :currencyId params ──────────
const validateParamUserAndCurrency = [
  param("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer")
    .toInt(),
  param("currencyId")
    .isInt({ min: 1 })
    .withMessage("currencyId must be a positive integer")
    .toInt(),
];

// ────────── POST /api/wallets — สร้าง wallet ──────────
const validateCreateWallet = [
  body("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer"),

  body("currencyId")
    .isInt({ min: 1 })
    .withMessage("currencyId must be a positive integer"),
];

module.exports = {
  validateParamUserId,
  validateParamUserAndCurrency,
  validateCreateWallet,
};
