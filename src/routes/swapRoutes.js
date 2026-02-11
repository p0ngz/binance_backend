const express = require("express");
const router = express.Router();
const swapController = require("../controllers/swapController");
const { validateSwap } = require("../validators/swapValidator");
const handleValidation = require("../middleware/handleValidation");

// POST /api/exchange — แลกเปลี่ยนสกุลเงินกับระบบ (swap)
router.post("/", validateSwap, handleValidation, swapController.handleSwap);

module.exports = router;
