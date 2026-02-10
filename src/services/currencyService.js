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

// สร้างสกุลเงินใหม่ — whitelist fields
const createCurrency = (data) => {
  const { symbol, name, type, precision } = data;
  return prisma.currency.create({ data: { symbol, name, type, precision } });
};

// อัพเดทสกุลเงิน — whitelist fields
const updateCurrency = (id, data) => {
  const allowed = {};
  if (data.symbol !== undefined) allowed.symbol = data.symbol;
  if (data.name !== undefined) allowed.name = data.name;
  if (data.type !== undefined) allowed.type = data.type;
  if (data.precision !== undefined) allowed.precision = data.precision;

  return prisma.currency.update({ where: { id }, data: allowed });
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
