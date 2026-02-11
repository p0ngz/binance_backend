// Match Buy and Sell orders (auto match)
const prisma = require("../config/db");
const { executeTrade } = require("./tradeService");

const toNum = (v) => parseFloat(v.toString());

// ────── Try matching an incoming order against the order book ──────
const tryMatch = async (incomingOrder) => {
  let order = await prisma.order.findUnique({
    where: { id: incomingOrder.id },
    include: { market: true },
  });
  if (!order || order.status !== "OPEN") return;

  // Find opposing side
  const opposingSide = order.side === "BUY" ? "SELL" : "BUY";

  const whereClause = {
    marketId: order.marketId,
    side: opposingSide,
    status: "OPEN",
    userId: { not: order.userId }, // ป้องกัน self-trade
  };

  // BUY taker → find SELL with price <= buy price (cheapest first)
  // SELL taker → find BUY with price >= sell price (highest first)
  if (order.side === "BUY") {
    whereClause.price = { lte: order.price };
  } else {
    whereClause.price = { gte: order.price };
  }

  const opposingOrders = await prisma.order.findMany({
    where: whereClause,
    orderBy: [
      { price: order.side === "BUY" ? "asc" : "desc" },
      { createdAt: "asc" },
    ],
  });

  if (opposingOrders.length === 0) return;

  // SINGLE → match กับ order เดียว, MULTIPLE → match ได้หลาย order
  const maxMatches = order.filledType === "SINGLE" ? 1 : opposingOrders.length;

  for (let i = 0; i < Math.min(maxMatches, opposingOrders.length); i++) {
    // Re-fetch incoming order เพื่อดู filledAmount ล่าสุด
    order = await prisma.order.findUnique({
      where: { id: incomingOrder.id },
      include: { market: true },
    });
    if (!order || order.status !== "OPEN") break;

    const remainingAmount = toNum(order.amount) - toNum(order.filledAmount);
    if (remainingAmount <= 0) break;

    // Re-fetch opposing order
    const opposing = await prisma.order.findUnique({
      where: { id: opposingOrders[i].id },
    });
    if (!opposing || opposing.status !== "OPEN") continue;

    const opposingRemaining =
      toNum(opposing.amount) - toNum(opposing.filledAmount);
    if (opposingRemaining <= 0) continue;

    const tradeAmount = Math.min(remainingAmount, opposingRemaining);
    // Trade ที่ราคาของ maker (order ที่อยู่ใน book ก่อน)
    const tradePrice = toNum(opposing.price);
    const tradeCost = tradePrice * tradeAmount;

    const buyOrder = order.side === "BUY" ? order : opposing;
    const sellOrder = order.side === "SELL" ? order : opposing;

    await executeTrade({
      buyOrder,
      sellOrder,
      tradeAmount,
      tradePrice,
      tradeCost,
      market: order.market,
    });
  }
};

module.exports = { tryMatch };
