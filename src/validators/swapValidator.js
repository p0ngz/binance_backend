const { body } = require("express-validator");

const validateSwap = [
  body("userId")
    .isInt({ min: 1 })
    .withMessage("userId must be a positive integer"),

  body("fromCurrencyId")
    .isInt({ min: 1 })
    .withMessage("fromCurrencyId must be a positive integer"),

  body("toCurrencyId")
    .isInt({ min: 1 })
    .withMessage("toCurrencyId must be a positive integer")
    .custom((value, { req }) => {
      if (value === req.body.fromCurrencyId) {
        throw new Error("Cannot swap same currency");
      }
      return true;
    }),

  body("amount")
    .isDecimal({ decimal_digits: "0,10" })
    .withMessage("amount must be a valid decimal number")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("amount must be greater than 0"),
];

module.exports = { validateSwap };
