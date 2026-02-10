// currencyService.js — จัดการสกุลเงิน (BTC, ETH, THB ฯลฯ)
const prisma = require("../config/db");

// ดึงสกุลเงินทั้งหมด
const findAllCurrencies = () => {
  return prisma.currency.findMany();
};

// ดึงตาม id
const findCurrencyById = (id) => {
  return prisma.currency.findUnique({ where: { id } });
};

// ดึงตาม symbol เช่น "BTC"
const findCurrencyBySymbol = (symbol) => {
  return prisma.currency.findUnique({ where: { symbol } });
};

// สร้างสกุลเงินใหม่
const createCurrency = (data) => {
  return prisma.currency.create({ data });
};

// อัพเดทสกุลเงิน
const updateCurrency = (id, data) => {
  return prisma.currency.update({ where: { id }, data });
};

// ลบสกุลเงิน
const removeCurrency = (id) => {
  return prisma.currency.delete({ where: { id } });
};

module.exports = {
  findAllCurrencies,
  findCurrencyById,
  findCurrencyBySymbol,
  createCurrency,
  updateCurrency,
  removeCurrency,
};
