const { validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    console.error(
      `[Validation Error] ${req.method} ${req.originalUrl} →`,
      JSON.stringify(errorDetails),
    );

    return res.status(400).json({
      message: "Validation failed",
      errors: errorDetails,
    });
  }

  next();
};

module.exports = handleValidation;
