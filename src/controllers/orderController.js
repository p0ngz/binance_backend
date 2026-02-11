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
    const { marketId, side, type, price, amount, filledType } = req.body;
    const userId = req.body.userId || req.userId;
    const order = await orderService.createOrder({
      userId,
      marketId,
      side,
      type,
      price,
      amount,
      filledType,
    });
    res.status(201).json(order);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.body.userId || req.userId || null;
    const order = await orderService.cancelOrder(Number(req.params.id), userId);
    res.json({ message: "Order cancelled", order });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
  }
};

// GET /api/orders/market/:marketId/book — แสดง order book
const getOrderBook = async (req, res) => {
  try {
    const book = await orderService.findOrderBookByMarket(
      Number(req.params.marketId),
    );
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrdersByUserId,
  getOrderById,
  createOrder,
  cancelOrder,
  getOrderBook,
};
