// marketController.js — รับ request เกี่ยวกับตลาดคู่เทรด
const marketService = require("../services/marketService");

const getAllMarkets = async (req, res) => {
  try {
    const markets = await marketService.findAllMarkets();
    res.json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMarketById = async (req, res) => {
  try {
    const market = await marketService.findMarketById(Number(req.params.id));
    if (!market) return res.status(404).json({ message: "Market not found" });
    res.json(market);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveMarkets = async (req, res) => {
  try {
    const markets = await marketService.findActiveMarkets();
    res.json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMarket = async (req, res) => {
  try {
    const market = await marketService.createMarket(req.body);
    res.status(201).json(market);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Market pair already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateMarketStatus = async (req, res) => {
  try {
    const market = await marketService.updateMarketStatus(
      Number(req.params.id),
      req.body.status,
    );
    res.json(market);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Market not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

const removeMarket = async (req, res) => {
  try {
    await marketService.removeMarket(Number(req.params.id));
    res.json({ message: "Market deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Market not found" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMarkets,
  getMarketById,
  getActiveMarkets,
  createMarket,
  updateMarketStatus,
  removeMarket,
};
