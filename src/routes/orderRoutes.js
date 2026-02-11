const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const {
  validateParamId,
  validateParamUserId,
  validateCreateOrder,
} = require("../validators/orderValidator");
const handleValidation = require("../middleware/handleValidation");

router.get(
  "/user/:userId",
  validateParamUserId,
  handleValidation,
  orderController.getOrdersByUserId,
);
router.get("/market/:marketId/book", orderController.getOrderBook);
router.get(
  "/:id",
  validateParamId,
  handleValidation,
  orderController.getOrderById,
);
router.post(
  "/",
  validateCreateOrder,
  handleValidation,
  orderController.createOrder,
);
router.patch(
  "/:id/cancel",
  validateParamId,
  handleValidation,
  orderController.cancelOrder,
);

module.exports = router;
