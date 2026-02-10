// transactionService.js — บันทึกรายการเงินเข้า-ออก
const prisma = require("../config/db");

// ดึง transactions ของ user
const findTransactionsByUserId = (userId) => {
  return prisma.transaction.findMany({
    where: { userId },
    include: { currency: true },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง transactions ตาม currency
const findTransactionsByUserAndCurrency = (userId, currencyId) => {
  return prisma.transaction.findMany({
    where: { userId, currencyId },
    include: { currency: true },
    orderBy: { createdAt: "desc" },
  });
};

// ดึง transaction ตาม id
const findTransactionById = (id) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: { currency: true },
  });
};

// สร้าง transaction ใหม่
const createTransaction = (data) => {
  return prisma.transaction.create({ data });
};

module.exports = {
  findTransactionsByUserId,
  findTransactionsByUserAndCurrency,
  findTransactionById,
  createTransaction,
};
