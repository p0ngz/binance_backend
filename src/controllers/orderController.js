// orderControllers
const orderService = require("../services/orderService");

const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await orderService.findOrdersByUserId(
      Number(req.params.userId),
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.findOrderById(Number(req.params.id));
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(Number(req.params.id));
    res.json(order);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrdersByUserId,
  getOrderById,
  createOrder,
  cancelOrder,
};
