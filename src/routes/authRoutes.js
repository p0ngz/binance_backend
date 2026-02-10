const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT");

// no verifyJwt required
router.post("/register", authController.handleRegister); // POST /api/auth/register
router.post("/login", authController.handleLogin); // POST /api/auth/login

// verifyJwt required
router.get("/refresh", verifyJWT, authController.handleRefreshToken); // GET  /api/auth/refresh
router.post("/logout", verifyJWT, authController.handleLogout); // POST /api/auth/logout

module.exports = router;
