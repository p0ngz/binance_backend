// userValidator.js — validation rules สำหรับ User API
// ใช้ express-validator เพื่อตรวจ input ก่อนเข้า controller
const { body, param } = require("express-validator");

const validateParamId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("id ต้องเป็นตัวเลขจำนวนเต็มบวก")
    .toInt(),
];

const validateCreateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("name must be 2-100 characters")
    .escape(), // prevent xss 

  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email format is invalid")
    .normalizeEmail(), // lowercase + ลบ dots ใน gmail เป็นต้น

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

  body("avatarUrl")
    .optional({ values: "null" })
    .trim()
    .isURL()
    .withMessage("avatarUrl must be a valid URL"),
];

// ────────── PUT /api/users/:id — แก้ไข user ──────────
const validateUpdateUser = [
  ...validateParamId,

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("name must be 2-100 characters")
    .escape(),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("email format is invalid")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 8, max: 128 })
    .withMessage("password must be 8-128 characters")
    .matches(/[A-Z]/)
    .withMessage("password must contain at least 1 uppercase letter")
    .matches(/[a-z]/)
    .withMessage("password must contain at least 1 lowercase letter")
    .matches(/[0-9]/)
    .withMessage("password must contain at least 1 number"),

  body("avatarUrl")
    .optional({ values: "null" })
    .trim()
    .isURL()
    .withMessage("avatarUrl must be a valid URL"),
];

module.exports = {
  validateParamId,
  validateCreateUser,
  validateUpdateUser,
};
