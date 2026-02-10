// tradeService.js — จัดการการจับคู่ซื้อ-ขาย
const prisma = require("../config/db");

// ดึง trades ทั้งหมดของตลาด (ผ่าน order)
const findTradesByMarketId = (marketId) => {
  return prisma.trade.findMany({
    where: {
      buyOrder: { marketId },
    },
    include: {
      buyOrder: true,
      sellOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง trades ของ user (ทั้งฝั่งซื้อและขาย)
const findTradesByUserId = (userId) => {
  return prisma.trade.findMany({
    where: {
      OR: [{ buyOrder: { userId } }, { sellOrder: { userId } }],
    },
    include: {
      buyOrder: {
        include: {
          market: { include: { baseCurrency: true, quoteCurrency: true } },
        },
      },
      sellOrder: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง trade ตาม id
const findTradeById = (id) => {
  return prisma.trade.findUnique({
    where: { id },
    include: {
      buyOrder: true,
      sellOrder: true,
    },
  });
};

// สร้าง trade ใหม่ (เมื่อจับคู่ order ซื้อ-ขายสำเร็จ)
const createTrade = (data) => {
  return prisma.trade.create({ data });
};

module.exports = {
  findTradesByMarketId,
  findTradesByUserId,
  findTradeById,
  createTrade,
};
