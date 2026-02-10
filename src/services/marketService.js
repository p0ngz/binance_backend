// marketService.js — จัดการตลาดคู่เทรด (เช่น BTC/THB, ETH/USD)
const prisma = require("../config/db");

// ดึงตลาดทั้งหมด
const findAllMarkets = () => {
  return prisma.market.findMany({
    include: {
      baseCurrency: true,
      quoteCurrency: true,
    },
  });
};

// ดึงตลาดตาม id
const findMarketById = (id) => {
  return prisma.market.findUnique({
    where: { id },
    include: {
      baseCurrency: true,
      quoteCurrency: true,
    },
  });
};

// ดึงเฉพาะตลาดที่ active
const findActiveMarkets = () => {
  return prisma.market.findMany({
    where: { status: "ACTIVE" },
    include: {
      baseCurrency: true,
      quoteCurrency: true,
    },
  });
};

// สร้างตลาดใหม่ — whitelist fields
const createMarket = (data) => {
  const { baseCurrencyId, quoteCurrencyId, status } = data;
  return prisma.market.create({
    data: { baseCurrencyId, quoteCurrencyId, status },
    include: { baseCurrency: true, quoteCurrency: true },
  });
};

// อัพเดทสถานะตลาด (ACTIVE, PAUSED, CLOSED)
const updateMarketStatus = (id, status) => {
  return prisma.market.update({ where: { id }, data: { status } });
};

// ลบตลาด
const removeMarket = (id) => {
  return prisma.market.delete({ where: { id } });
};

module.exports = {
  findAllMarkets,
  findMarketById,
  findActiveMarkets,
  createMarket,
  updateMarketStatus,
  removeMarket,
};
