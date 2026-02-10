// authValidator.js — validation rules สำหรับ Auth API
const { body } = require("express-validator");

// ────────── POST /api/auth/register ──────────
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("name must be 2-100 characters")
    .escape(),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email format is invalid")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("password must be 8-128 characters")
    .matches(/[A-Z]/)
    .withMessage("password must contain at least 1 uppercase letter")
    .matches(/[a-z]/)
    .withMessage("password must contain at least 1 lowercase letter")
    .matches(/[0-9]/)
    .withMessage("password must contain at least 1 number"),
];

// ────────── POST /api/auth/login ──────────
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email format is invalid")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("password is required"),
];

module.exports = {
  validateRegister,
  validateLogin,
};
