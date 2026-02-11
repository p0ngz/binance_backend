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

// ────────── POST /api/wallets/transfer — โอนเงินภายใน ──────────
const validateTransfer = [
  body("senderId")
    .isInt({ min: 1 })
    .withMessage("senderId must be a positive integer"),
  body("receiverId")
    .isInt({ min: 1 })
    .withMessage("receiverId must be a positive integer")
    .custom((value, { req }) => {
      if (value === req.body.senderId) {
        throw new Error("Cannot transfer to yourself");
      }
      return true;
    }),
  body("currencyId")
    .isInt({ min: 1 })
    .withMessage("currencyId must be a positive integer"),
  body("amount")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("amount must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("amount must be greater than 0"),
];

// ────────── POST /api/wallets/deposit — เติมเงิน ──────────
const validateDeposit = [
  body("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer"),
  body("currencyId")
    .isInt({ min: 1 })
    .withMessage("currencyId must be a positive integer"),
  body("amount")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("amount must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("amount must be greater than 0"),
];

module.exports = {
  validateParamUserId,
  validateParamUserAndCurrency,
  validateCreateWallet,
  validateTransfer,
  validateDeposit,
};
