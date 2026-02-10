const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/user/:userId", orderController.getOrdersByUserId); // GET    /api/orders/user/:userId
router.get("/:id", orderController.getOrderById); // GET    /api/orders/:id
router.post("/", orderController.createOrder); // POST   /api/orders
router.patch("/:id/cancel", orderController.cancelOrder); // PATCH  /api/orders/:id/cancel

module.exports = router;
