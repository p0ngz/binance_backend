// seed.js — สร้างข้อมูลจำลอง (mock data) สำหรับทดสอบระบบ
// รันคำสั่ง: npx prisma db seed
//
// จะสร้างข้อมูลใน 6 ตาราง:
//   1. users           — ผู้ใช้ 3 คน (password hash ด้วย bcrypt)
//   2. currencies      — สกุลเงินทั้ง crypto (BTC, ETH, XRP, DOGE) และ fiat (USD, THB)
//   3. wallets         — wallet ทุกสกุลเงินให้แต่ละ user พร้อมยอดเงินเริ่มต้น
//   4. markets         — คู่เทรดที่ user สามารถซื้อ-ขายแลกเปลี่ยนได้
//   5. exchange_rates  — อัตราแลกเปลี่ยนระหว่างสกุลเงิน
//   6. transactions    — บันทึกรายการฝากเงินเริ่มต้น

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1) USERS — ผู้ใช้งาน 3 คน
  //    password ทั้งหมดคือ "password123" (bcrypt hash)
  const passwordHash = await bcrypt.hash("password123", 10);

  const userData = [
    { name: "Alice", email: "alice@example.com", password: passwordHash },
    { name: "Bob", email: "bob@example.com", password: passwordHash },
    { name: "Charlie", email: "charlie@example.com", password: passwordHash },
  ];

  const users = {};
  for (const data of userData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name, password: data.password },
      create: data,
    });
    users[user.name] = user;
    console.log(`  ✅ User: ${user.name} (${user.email}) — id: ${user.id}`);
  }

  console.log("");

  // 2) CURRENCIES — สกุลเงิน
  const currencyData = [
    // Crypto
    { symbol: "BTC", name: "Bitcoin", type: "CRYPTO", precision: 8 },
    { symbol: "ETH", name: "Ethereum", type: "CRYPTO", precision: 8 },
    { symbol: "XRP", name: "Ripple", type: "CRYPTO", precision: 6 },
    { symbol: "DOGE", name: "Dogecoin", type: "CRYPTO", precision: 8 },
    // Fiat
    { symbol: "USD", name: "US Dollar", type: "FIAT", precision: 2 },
    { symbol: "THB", name: "Thai Baht", type: "FIAT", precision: 2 },
  ];

  const currencies = {};
  for (const data of currencyData) {
    const currency = await prisma.currency.upsert({
      where: { symbol: data.symbol },
      update: data,
      create: data,
    });
    currencies[currency.symbol] = currency;
    console.log(
      `  ✅ Currency: ${currency.symbol} — ${currency.name} (${currency.type})`,
    );
  }

  console.log("");

  // 3) MARKETS — คู่เทรด (base/quote)
  //    base = สิ่งที่ซื้อ-ขาย, quote = สกุลเงินที่ใช้จ่าย
  //    เช่น BTC/THB = ซื้อ-ขาย BTC ด้วยเงิน THB
  const marketPairs = [
    // Crypto ↔ THB (ตลาดเงินบาท)
    { base: "BTC", quote: "THB" },
    { base: "ETH", quote: "THB" },
    { base: "XRP", quote: "THB" },
    { base: "DOGE", quote: "THB" },

    // Crypto ↔ USD (ตลาดดอลลาร์)
    { base: "BTC", quote: "USD" },
    { base: "ETH", quote: "USD" },
    { base: "XRP", quote: "USD" },
    { base: "DOGE", quote: "USD" },

    // Fiat ↔ Fiat (แลกเงิน)
    { base: "USD", quote: "THB" },
  ];

  for (const pair of marketPairs) {
    const baseCurrencyId = currencies[pair.base].id;
    const quoteCurrencyId = currencies[pair.quote].id;

    await prisma.market.upsert({
      where: {
        baseCurrencyId_quoteCurrencyId: { baseCurrencyId, quoteCurrencyId },
      },
      update: { status: "ACTIVE" },
      create: { baseCurrencyId, quoteCurrencyId, status: "ACTIVE" },
    });
    console.log(`  ✅ Market: ${pair.base}/${pair.quote} — ACTIVE`);
  }

  console.log("");

  // 4) EXCHANGE RATES — อัตราแลกเปลี่ยน 
  //    BTC  = $97,140   / ฿3,370,000
  //    ETH  = $2,650    / ฿92,000
  //    XRP  = $2.48     / ฿86
  //    DOGE = $0.258    / ฿8.96
  //    USD/THB = 34.70
  const exchangeRates = [
    // Crypto → USD
    { from: "BTC", to: "USD", rate: 97140.0 },
    { from: "ETH", to: "USD", rate: 2650.0 },
    { from: "XRP", to: "USD", rate: 2.48 },
    { from: "DOGE", to: "USD", rate: 0.258 },

    // Crypto → THB
    { from: "BTC", to: "THB", rate: 3370000.0 },
    { from: "ETH", to: "THB", rate: 92000.0 },
    { from: "XRP", to: "THB", rate: 86.0 },
    { from: "DOGE", to: "THB", rate: 8.96 },

    // USD ↔ THB
    { from: "USD", to: "THB", rate: 34.7 },
    { from: "THB", to: "USD", rate: 0.02882 },

    // Reverse: USD → Crypto (1 USD ซื้อ crypto ได้เท่าไร)
    { from: "USD", to: "BTC", rate: 0.0000103 },
    { from: "USD", to: "ETH", rate: 0.000377 },
    { from: "USD", to: "XRP", rate: 0.4032 },
    { from: "USD", to: "DOGE", rate: 3.876 },

    // Reverse: THB → Crypto
    { from: "THB", to: "BTC", rate: 0.000000297 },
    { from: "THB", to: "ETH", rate: 0.00001087 },
    { from: "THB", to: "XRP", rate: 0.01163 },
    { from: "THB", to: "DOGE", rate: 0.1116 },
  ];

  for (const er of exchangeRates) {
    const fromCurrencyId = currencies[er.from].id;
    const toCurrencyId = currencies[er.to].id;

    await prisma.exchangeRate.upsert({
      where: {
        fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId },
      },
      update: { rate: er.rate },
      create: { fromCurrencyId, toCurrencyId, rate: er.rate },
    });
    console.log(`  ✅ Rate: 1 ${er.from} = ${er.rate} ${er.to}`);
  }

  console.log("");

  // 5) WALLETS — สร้าง wallet ทุกสกุลเงินให้แต่ละ user
  const allCurrencies = Object.values(currencies);
  const allUsers = Object.values(users);

  for (const user of allUsers) {
    for (const currency of allCurrencies) {
      await prisma.wallet.upsert({
        where: {
          userId_currencyId: { userId: user.id, currencyId: currency.id },
        },
        update: {},
        create: { userId: user.id, currencyId: currency.id },
      });
    }
    console.log(
      `  ✅ Wallets: ${user.name} — ${allCurrencies.map((c) => c.symbol).join(", ")}`,
    );
  }

  console.log("");

  // 6) DEPOSIT — ฝากเงินเริ่มต้นให้ user ทดสอบระบบ
  //    Alice:   5,000,000 THB + 50,000 USD + 2 BTC + 10 ETH
  //    Bob:     3,000,000 THB + 30,000 USD + 1 BTC + 5 ETH + 1,000 XRP
  //    Charlie: 1,000,000 THB + 10,000 USD + 500 XRP + 50,000 DOGE
  const deposits = [
    { user: "Alice", currency: "THB", amount: 5000000 },
    { user: "Alice", currency: "USD", amount: 50000 },
    { user: "Alice", currency: "BTC", amount: 2 },
    { user: "Alice", currency: "ETH", amount: 10 },

    { user: "Bob", currency: "THB", amount: 3000000 },
    { user: "Bob", currency: "USD", amount: 30000 },
    { user: "Bob", currency: "BTC", amount: 1 },
    { user: "Bob", currency: "ETH", amount: 5 },
    { user: "Bob", currency: "XRP", amount: 1000 },

    { user: "Charlie", currency: "THB", amount: 1000000 },
    { user: "Charlie", currency: "USD", amount: 10000 },
    { user: "Charlie", currency: "XRP", amount: 500 },
    { user: "Charlie", currency: "DOGE", amount: 50000 },
  ];

  for (const dep of deposits) {
    const userId = users[dep.user].id;
    const currencyId = currencies[dep.currency].id;

    // อัปเดตยอด wallet
    await prisma.wallet.update({
      where: { userId_currencyId: { userId, currencyId } },
      data: { balance: dep.amount },
    });

    // สร้าง transaction record (DEPOSIT)
    await prisma.transaction.create({
      data: {
        userId,
        currencyId,
        amount: dep.amount,
        balanceAfter: dep.amount,
        type: "DEPOSIT",
        direction: "IN",
        refType: "DEPOSIT",
      },
    });

    console.log(
      `  ✅ Deposit: ${dep.user} +${dep.amount.toLocaleString()} ${dep.currency}`,
    );
  }

  console.log("\n🎉 Seed completed!");
  console.log("");
  console.log("📋 บัญชีทดสอบ (password ทุกคน: password123)");
  console.log("   • alice@example.com   — THB 5M, USD 50K, BTC 2, ETH 10");
  console.log(
    "   • bob@example.com     — THB 3M, USD 30K, BTC 1, ETH 5, XRP 1K",
  );
  console.log("   • charlie@example.com — THB 1M, USD 10K, XRP 500, DOGE 50K");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
