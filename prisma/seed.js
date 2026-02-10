// seed.js — สร้างข้อมูลจำลอง (mock data) สำหรับทดสอบระบบ
// รันคำสั่ง: npx prisma db seed
//
// จะสร้างข้อมูลใน 3 ตาราง:
//   1. currencies  — สกุลเงินทั้ง crypto (BTC, ETH, XRP, DOGE) และ fiat (USD, THB)
//   2. markets     — คู่เทรดที่ user สามารถซื้อ-ขายแลกเปลี่ยนได้
//   3. exchange_rates — อัตราแลกเปลี่ยนจริงระหว่างสกุลเงิน

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ══════════════════════════════════════════════════
  // 1) CURRENCIES — สกุลเงิน
  // ══════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════
  // 2) MARKETS — คู่เทรด (base/quote)
  //    base = สิ่งที่ซื้อ-ขาย, quote = สกุลเงินที่ใช้จ่าย
  //    เช่น BTC/THB = ซื้อ-ขาย BTC ด้วยเงิน THB
  // ══════════════════════════════════════════════════
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

  // ══════════════════════════════════════════════════
  // 3) EXCHANGE RATES — อัตราแลกเปลี่ยน (ราคาจริง ณ วันที่ seed)
  //    ข้อมูลจาก CoinGecko API — ราคาโดยประมาณ
  //
  //    BTC  = $97,140   / ฿3,370,000
  //    ETH  = $2,650    / ฿92,000
  //    XRP  = $2.48     / ฿86
  //    DOGE = $0.258    / ฿8.96
  //    USD/THB = 34.70
  // ══════════════════════════════════════════════════
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

  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
