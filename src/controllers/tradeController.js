// tradeController.js — รับ request เกี่ยวกับการเทรด
const tradeService = require("../services/tradeService");

const getTradesByMarketId = async (req, res) => {
  try {
    const trades = await tradeService.findTradesByMarketId(
      Number(req.params.marketId),
    );
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTradesByUserId = async (req, res) => {
  try {
    const trades = await tradeService.findTradesByUserId(
      Number(req.params.userId),
    );
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTradeById = async (req, res) => {
  try {
    const trade = await tradeService.findTradeById(Number(req.params.id));
    if (!trade) return res.status(404).json({ message: "Trade not found" });
    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTradesByMarketId,
  getTradesByUserId,
  getTradeById,
};
