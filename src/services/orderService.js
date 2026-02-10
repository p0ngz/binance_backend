// orderService.js — จัดการคำสั่งซื้อ/ขาย
const prisma = require("../config/db");

// ดึง orders ทั้งหมดของ user
const findOrdersByUserId = (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      market: {
        include: { baseCurrency: true, quoteCurrency: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง order ตาม id
const findOrderById = (id) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      market: {
        include: { baseCurrency: true, quoteCurrency: true },
      },
      buyTrades: true,
      sellTrades: true,
    },
  });
};

// ดึง orders ที่ยังเปิดอยู่ของตลาดนั้น
const findOpenOrdersByMarket = (marketId, side) => {
  return prisma.order.findMany({
    where: {
      marketId,
      side,
      status: "OPEN",
    },
    orderBy: [{ price: side === "BUY" ? "desc" : "asc" }, { createdAt: "asc" }],
  });
};

// สร้าง order ใหม่
const createOrder = (data) => {
  return prisma.order.create({ data });
};

// อัพเดท order (เช่น filled_amount, status)
const updateOrder = (id, data) => {
  return prisma.order.update({ where: { id }, data });
};

// ยกเลิก order
const cancelOrder = (id) => {
  return prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

module.exports = {
  findOrdersByUserId,
  findOrderById,
  findOpenOrdersByMarket,
  createOrder,
  updateOrder,
  cancelOrder,
};
