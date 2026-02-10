const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateRegister,
  validateLogin,
} = require("../validators/authValidator");
const handleValidation = require("../middleware/handleValidation");

// public routes
router.post(
  "/register",
  validateRegister,
  handleValidation,
  authController.handleRegister,
);
router.post(
  "/login",
  validateLogin,
  handleValidation,
  authController.handleLogin,
);

// protected routes
router.get("/refresh", verifyJWT, authController.handleRefreshToken);
router.post("/logout", verifyJWT, authController.handleLogout);

module.exports = router;
