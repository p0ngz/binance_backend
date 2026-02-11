# Binance Backend — Crypto Exchange API

ระบบ Backend สำหรับแพลตฟอร์มซื้อ-ขายสกุลเงินดิจิทัล (Cryptocurrency Exchange) คล้าย Binance  
พัฒนาด้วย **Node.js + Express + Prisma + PostgreSQL**

---

## สารบัญ

1.  [Tech Stack](#tech-stack)
2.  [ขั้นตอนการ Run Project](#ขั้นตอนการ-run-project)
3.  [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
4.  [Database Schema (ตารางทั้งหมด)](#database-schema)
5.  [Services & Features](#services--features)
6.  [API Endpoints ทั้งหมด](#api-endpoints-ทั้งหมด)
7.  [Flow การทำงานหลัก](#flow-การทำงานหลัก)
8.  [ข้อมูล Seed (Mock Data)](#ข้อมูล-seed-mock-data)

---

## Tech Stack

| เทคโนโลยี           | เวอร์ชัน / รายละเอียด                          |
| ------------------- | ---------------------------------------------- |
| **Runtime**         | Node.js                                        |
| **Framework**       | Express 5.2.1                                  |
| **ORM**             | Prisma 5.22.0                                  |
| **Database**        | PostgreSQL                                     |
| **Authentication**  | JWT (jsonwebtoken) — Access Token + Refresh Token |
| **Password Hash**   | bcrypt                                         |
| **Validation**      | express-validator                              |
| **Logging**         | morgan                                         |
| **Module System**   | CommonJS                                       |

---

## ขั้นตอนการ Run Project

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd binance_backend
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. สร้างไฟล์ `.env`

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/binance"
ACCESS_TOKEN_SECRET="your_access_token_secret_key"
REFRESH_TOKEN_SECRET="your_refresh_token_secret_key"
PORT=3000
NODE_ENV=development
```

### 4. สร้าง Database และ Migrate

```bash
# สร้าง database + ตาราง (migrate)
npx prisma migrate dev --name init

# สร้าง Prisma Client  
npx prisma generate
```

### 5. Seed ข้อมูลจำลอง

```bash
npx prisma db seed
```

จะสร้างข้อมูล:
- 6 สกุลเงิน (BTC, ETH, XRP, DOGE, USD, THB)
- 9 คู่ตลาดเทรด (BTC/THB, ETH/THB, BTC/USD ฯลฯ)
- 18 อัตราแลกเปลี่ยน (ทั้งสองทิศทาง)

### 6. รันเซิร์ฟเวอร์

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:3000`

---

## โครงสร้างโปรเจค

```
binance_backend/
├── prisma/
│   ├── schema.prisma          # Database schema ทั้งหมด
│   ├── seed.js                # ข้อมูลจำลอง (currencies, markets, exchange_rates)
│   └── migrations/            # Migration files
├── src/
│   ├── server.js              # Entry point — เริ่มต้น server
│   ├── app.js                 # Express app configuration (middleware, routes)
│   ├── config/
│   │   ├── db.js              # Prisma Client instance
│   │   └── index.js           # Environment config (PORT, etc.)
│   ├── middleware/
│   │   ├── verifyJWT.js       # JWT authentication middleware
│   │   └── handleValidation.js# จัดการ validation errors
│   ├── validators/            # express-validator rules สำหรับแต่ละ resource
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   ├── walletValidator.js
│   │   ├── currencyValidator.js
│   │   ├── marketValidator.js
│   │   ├── orderValidator.js
│   │   ├── tradeValidator.js
│   │   ├── transactionValidator.js
│   │   ├── exchangeRateValidator.js
│   │   └── swapValidator.js
│   ├── routes/                # Route definitions
│   │   ├── index.js           # Central route registry (public/protected)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── walletRoutes.js
│   │   ├── currencyRoutes.js
│   │   ├── marketRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── tradeRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── exchangeRateRoutes.js
│   │   └── swapRoutes.js
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── walletController.js
│   │   ├── currencyController.js
│   │   ├── marketController.js
│   │   ├── orderController.js
│   │   ├── tradeController.js
│   │   ├── transactionController.js
│   │   ├── exchangeRateController.js
│   │   └── swapController.js
│   └── services/              # Business logic
│       ├── authService.js
│       ├── userService.js
│       ├── walletService.js
│       ├── currencyService.js
│       ├── marketService.js
│       ├── orderService.js
│       ├── matchingService.js
│       ├── tradeService.js
│       ├── transactionService.js
│       ├── exchangeRateService.js
│       └── swapService.js
├── package.json
└── .env
```

### Architecture Flow

```
Request → Route → verifyJWT (global) → Validator → handleValidation → Controller → Service → Prisma → Database
```

---

## Database Schema

ระบบมีทั้งหมด **10 ตาราง (Models)** ดังนี้:

---

### 1. `users` — ผู้ใช้งาน

เก็บข้อมูลผู้ใช้ทั้งหมดในระบบ ใช้สำหรับ register/login และเชื่อมโยงกับทุก resource

| Field       | Type     | คำอธิบาย                    |
| ----------- | -------- | -------------------------- |
| `id`        | Int (PK) | รหัสผู้ใช้ (auto increment) |
| `name`      | String   | ชื่อผู้ใช้                  |
| `email`     | String   | อีเมล (unique)             |
| `password`  | String?  | รหัสผ่าน (hashed by bcrypt) |
| `avatarUrl` | String?  | URL รูปโปรไฟล์              |
| `createdAt` | DateTime | วันที่สร้าง                 |
| `updatedAt` | DateTime | วันที่อัปเดตล่าสุด          |

**Relations:** มี wallets, orders, transactions, refreshTokens, socialAccounts

---

### 2. `user_social_accounts` — บัญชี Social Login

เก็บข้อมูลการเชื่อมต่อ Social Login (เช่น Google)

| Field            | Type     | คำอธิบาย                    |
| ---------------- | -------- | -------------------------- |
| `id`             | Int (PK) | รหัส                       |
| `userId`         | Int (FK) | อ้างอิงไปที่ users           |
| `provider`       | String   | ผู้ให้บริการ (google, etc.)  |
| `providerUserId` | String   | ID จากผู้ให้บริการ           |
| `email`          | String   | อีเมลจาก provider          |
| `createdAt`      | DateTime | วันที่เชื่อมต่อ              |

**Unique:** `(provider, providerUserId)`

---

### 3. `currencies` — สกุลเงิน

เก็บข้อมูลสกุลเงินทั้ง Crypto และ Fiat ที่รองรับในระบบ

| Field       | Type         | คำอธิบาย                          |
| ----------- | ------------ | -------------------------------- |
| `id`        | Int (PK)     | รหัสสกุลเงิน                     |
| `symbol`    | String       | สัญลักษณ์ (BTC, ETH, THB) unique |
| `name`      | String       | ชื่อเต็ม (Bitcoin, Ethereum)      |
| `type`      | CurrencyType | ประเภท: `CRYPTO` หรือ `FIAT`     |
| `precision` | Int          | ทศนิยม (default: 8)              |

**Enum CurrencyType:** `CRYPTO`, `FIAT`

**ข้อมูล Seed:**
| ID | Symbol | Name     | Type   |
|----|--------|----------|--------|
| 1  | BTC    | Bitcoin  | CRYPTO |
| 2  | ETH    | Ethereum | CRYPTO |
| 3  | XRP    | Ripple   | CRYPTO |
| 4  | DOGE   | Dogecoin | CRYPTO |
| 5  | USD    | US Dollar| FIAT   |
| 6  | THB    | Thai Baht| FIAT   |

---

### 4. `wallets` — กระเป๋าเงิน

เก็บยอดเงินของ user แต่ละสกุลเงิน — user 1 คน มีได้หลาย wallet (1 wallet ต่อ 1 สกุลเงิน)

| Field         | Type          | คำอธิบาย                                |
| ------------- | ------------- | -------------------------------------- |
| `id`          | Int (PK)      | รหัส wallet                            |
| `userId`      | Int (FK)      | เจ้าของ wallet                          |
| `currencyId`  | Int (FK)      | สกุลเงินของ wallet                      |
| `balance`     | Decimal(30,10)| ยอดเงินคงเหลือ (ใช้ได้)                 |
| `lockBalance` | Decimal(30,10)| ยอดเงินที่ถูก lock (รอ order จับคู่)      |
| `updatedAt`   | DateTime      | วันที่อัปเดตล่าสุด                       |

**Unique:** `(userId, currencyId)` — user 1 คนมี wallet ของสกุลเงินเดียวกันได้แค่ 1 ใบ

**หลักการ balance / lockBalance:**
- เมื่อสร้าง order → ย้ายเงินจาก `balance` → `lockBalance` (lock ไว้)
- เมื่อ order จับคู่สำเร็จ → หัก `lockBalance` + เพิ่ม `balance` ฝั่งตรงข้าม
- เมื่อยกเลิก order → คืน `lockBalance` → `balance`

---

### 5. `markets` — คู่ตลาดเทรด

กำหนดว่าสกุลเงินไหนสามารถซื้อ-ขายกันได้ เช่น BTC/THB = ซื้อ-ขาย Bitcoin ด้วยเงินบาท

| Field            | Type         | คำอธิบาย                                         |
| ---------------- | ------------ | ----------------------------------------------- |
| `id`             | Int (PK)     | รหัสตลาด                                        |
| `baseCurrencyId` | Int (FK)     | **สกุลเงินที่ซื้อ-ขาย** (เช่น BTC)                |
| `quoteCurrencyId`| Int (FK)     | **สกุลเงินที่ใช้จ่าย** (เช่น THB)                 |
| `status`         | MarketStatus | สถานะตลาด: `ACTIVE`, `PAUSED`, `CLOSED`         |

**Unique:** `(baseCurrencyId, quoteCurrencyId)`

**Enum MarketStatus:** `ACTIVE` (เปิดเทรด), `PAUSED` (หยุดชั่วคราว), `CLOSED` (ปิด)

**ข้อมูล Seed (9 คู่):**
| ID | คู่ตลาด   | ความหมาย                        |
|----|-----------|--------------------------------|
| 1  | BTC/THB   | ซื้อ-ขาย Bitcoin ด้วยเงินบาท     |
| 2  | ETH/THB   | ซื้อ-ขาย Ethereum ด้วยเงินบาท    |
| 3  | XRP/THB   | ซื้อ-ขาย Ripple ด้วยเงินบาท      |
| 4  | DOGE/THB  | ซื้อ-ขาย Dogecoin ด้วยเงินบาท    |
| 5  | BTC/USD   | ซื้อ-ขาย Bitcoin ด้วยดอลลาร์      |
| 6  | ETH/USD   | ซื้อ-ขาย Ethereum ด้วยดอลลาร์     |
| 7  | XRP/USD   | ซื้อ-ขาย Ripple ด้วยดอลลาร์       |
| 8  | DOGE/USD  | ซื้อ-ขาย Dogecoin ด้วยดอลลาร์     |
| 9  | USD/THB   | แลกเงินดอลลาร์ ↔ บาท             |

---

### 6. `orders` — คำสั่งซื้อ/ขาย

เก็บคำสั่ง BUY/SELL ของ user — เป็นหัวใจของระบบเทรด

| Field          | Type              | คำอธิบาย                                            |
| -------------- | ----------------- | -------------------------------------------------- |
| `id`           | Int (PK)          | รหัส order                                          |
| `userId`       | Int (FK)          | user ที่สร้าง order                                  |
| `marketId`     | Int (FK)          | คู่ตลาดที่ต้องการเทรด                                |
| `side`         | OrderSide         | ฝั่ง: `BUY` (ซื้อ) หรือ `SELL` (ขาย)                 |
| `type`         | OrderType         | ประเภท: `LIMIT` หรือ `MARKET`                       |
| `filledType`   | OrderFilledType   | วิธีจับคู่: `SINGLE` หรือ `MULTIPLE`                  |
| `price`        | Decimal(30,10)    | ราคาต่อหน่วย                                        |
| `amount`       | Decimal(30,10)    | จำนวนที่ต้องการซื้อ/ขาย                               |
| `filledAmount` | Decimal(30,10)    | จำนวนที่จับคู่แล้ว (default: 0)                       |
| `status`       | OrderStatus       | สถานะ: `OPEN`, `FILLED`, `CANCELLED`                |
| `createdAt`    | DateTime          | วันที่สร้าง                                          |

**Enums:**
- **OrderSide:** `BUY` (ซื้อ), `SELL` (ขาย)
- **OrderType:** `LIMIT` (กำหนดราคาเอง), `MARKET` (ใช้ราคาตลาดจาก exchange_rates)
- **OrderFilledType:** `SINGLE` (จับคู่ได้ครั้งเดียว), `MULTIPLE` (จับคู่ได้หลายรอบ — partial fill)
- **OrderStatus:** `OPEN` (รอจับคู่), `FILLED` (จับคู่ครบแล้ว), `CANCELLED` (ยกเลิก)

---

### 7. `trades` — ผลลัพธ์การจับคู่

เก็บผลลัพธ์เมื่อ matching engine จับคู่ BUY order กับ SELL order สำเร็จ — **ระบบสร้างอัตโนมัติ ไม่มี API ให้ user สร้างเอง**

| Field         | Type          | คำอธิบาย                     |
| ------------- | ------------- | --------------------------- |
| `id`          | Int (PK)      | รหัส trade                   |
| `buyOrderId`  | Int (FK)      | order ฝั่งซื้อ                |
| `sellOrderId` | Int (FK)      | order ฝั่งขาย                |
| `price`       | Decimal(30,10)| ราคาที่ trade (ราคาของ maker) |
| `amount`      | Decimal(30,10)| จำนวนที่ trade                |
| `fee`         | Decimal(30,10)| ค่าธรรมเนียม (default: 0)    |
| `createdAt`   | DateTime      | วันที่ trade เกิดขึ้น          |

---

### 8. `transactions` — ประวัติรายการเงิน

เก็บทุกรายการเงินเข้า-ออกของ user — ทำหน้าที่เหมือน statement บัญชีธนาคาร

| Field          | Type                 | คำอธิบาย                                           |
| -------------- | -------------------- | ------------------------------------------------- |
| `id`           | Int (PK)             | รหัส transaction                                   |
| `userId`       | Int (FK)             | เจ้าของรายการ                                      |
| `currencyId`   | Int (FK)             | สกุลเงินของรายการ                                   |
| `amount`       | Decimal(30,10)       | จำนวนเงิน                                         |
| `balanceAfter` | Decimal(30,10)       | ยอดคงเหลือหลังรายการ                                |
| `type`         | TransactionType      | ประเภท: TRADE, EXCHANGE, DEPOSIT, BONUS, TRANSFER |
| `direction`    | TransactionDirection | ทิศทาง: `IN` (เข้า) หรือ `OUT` (ออก)               |
| `refType`      | TransactionRefType   | อ้างอิงจาก: ORDER, TRADE, EXCHANGE, TRANSFER, DEPOSIT |
| `refId`        | Int?                 | ID ของ record ต้นทาง (order/trade/etc.)             |
| `createdAt`    | DateTime             | วันที่เกิดรายการ                                     |

**Enums:**
- **TransactionType:** `TRADE` (เทรด), `EXCHANGE` (แลกเปลี่ยน), `DEPOSIT` (ฝากเงิน), `BONUS` (โบนัส), `TRANSFER` (โอนภายใน)
- **TransactionDirection:** `IN` (เงินเข้า), `OUT` (เงินออก)
- **TransactionRefType:** `ORDER` (ตอน lock เงินสร้าง order), `TRADE` (ตอนจับคู่สำเร็จ), `EXCHANGE` (ตอน swap), `TRANSFER` (ตอนโอน), `DEPOSIT` (ตอนฝาก)

---

### 9. `exchange_rates` — อัตราแลกเปลี่ยน

เก็บอัตราแลกเปลี่ยนระหว่างสกุลเงิน — ใช้สำหรับ Market Order (ดึงราคาอัตโนมัติ) และ Swap

| Field            | Type          | คำอธิบาย                       |
| ---------------- | ------------- | ----------------------------- |
| `id`             | Int (PK)      | รหัส                          |
| `fromCurrencyId` | Int (FK)      | สกุลเงินต้นทาง                 |
| `toCurrencyId`   | Int (FK)      | สกุลเงินปลายทาง                |
| `rate`           | Decimal(30,10)| อัตราแลกเปลี่ยน                |
| `updatedAt`      | DateTime      | วันที่อัปเดตล่าสุด              |

**Unique:** `(fromCurrencyId, toCurrencyId)`

**ตัวอย่าง:** BTC→THB rate = 3,370,000 หมายถึง 1 BTC = 3,370,000 THB

> เมื่ออัปเดต rate ผ่าน API จะอัปเดตทั้ง 2 ทิศทางอัตโนมัติ (เช่น BTC→THB และ THB→BTC)

---

### 10. `refresh_tokens` — Refresh Token

เก็บ Refresh Token สำหรับ JWT Authentication — ใช้ต่ออายุ Access Token

| Field        | Type     | คำอธิบาย                           |
| ------------ | -------- | --------------------------------- |
| `id`         | Int (PK) | รหัส (ใช้เป็น sessionId ใน JWT)     |
| `userId`     | Int (FK) | เจ้าของ token                      |
| `token`      | String   | Refresh Token (unique)             |
| `ip`         | String?  | IP ที่ login                       |
| `userAgent`  | String?  | Browser/Device ที่ login            |
| `lastUsedAt` | DateTime | ใช้งานล่าสุด                        |
| `expiredAt`  | DateTime | วันหมดอายุ                          |

**Session-based JWT:** Access Token จะฝัง `sessionId` (= refreshToken.id) ซึ่งใช้ตรวจสอบว่า session ยังมีอยู่ในระบบหรือไม่ — ถ้า logout แล้ว access token เดิมจะใช้ไม่ได้ทันที

---

## Services & Features

### 1. Auth Service — ระบบยืนยันตัวตน

| ฟังก์ชัน                      | คำอธิบาย                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `registerUser`                | สมัครสมาชิก — สร้าง user + wallet ทุกสกุลเงินอัตโนมัติ (atomic) |
| `loginUser`                   | เข้าสู่ระบบ — สร้าง Access Token (15 นาที) + Refresh Token (7 วัน) พร้อมบันทึก IP/User-Agent |
| `refreshAccessToken`          | ต่ออายุ Access Token ใหม่โดยใช้ Refresh Token                   |
| `logoutUser`                  | ออกจากระบบ (อุปกรณ์เดียว) — ลบ Refresh Token ตัวที่ใช้           |
| `logoutAllDevices`            | ออกจากระบบทุกอุปกรณ์ — ลบ Refresh Token ทั้งหมดของ user         |
| `deleteExpiredRefreshTokens`  | ลบ token ที่หมดอายุ                                             |

**JWT Security:**
- Access Token มี `sessionId` ฝังอยู่ — middleware `verifyJWT` จะตรวจสอบว่า session ยังมีอยู่ใน DB
- เมื่อ logout → ลบ refreshToken row → access token เดิมจะถูกปฏิเสธทันที

---

### 2. Wallet Service — ระบบกระเป๋าเงิน

| ฟังก์ชัน                    | คำอธิบาย                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `findWalletsByUserId`       | ดึง wallet ทั้งหมดของ user                                   |
| `findWalletByUserAndCurrency`| ดึง wallet เฉพาะสกุลเงินของ user                            |
| `createWallet`              | สร้าง wallet ใหม่ 1 ใบ                                       |
| `createAllWalletsForUser`   | สร้าง wallet ทุกสกุลเงิน **เฉพาะที่ยังไม่มี** (ไม่สร้างซ้ำ)    |
| `depositToWallet`           | ฝากเงินเข้า wallet (atomic — อัปเดต balance + สร้าง transaction) |
| `internalTransfer`          | โอนเงินภายในระหว่าง user (atomic — หัก sender + เพิ่ม receiver + สร้าง 2 transactions) |

---

### 3. Order Service — ระบบคำสั่งซื้อ/ขาย

| ฟังก์ชัน                | คำอธิบาย                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `createOrder`           | สร้างคำสั่งซื้อ/ขาย — ตรวจ market → คำนวณ lock → lock balance → สร้าง order → เรียก matching |
| `cancelOrder`           | ยกเลิก order — ตรวจสิทธิ์ + สถานะ → คืนเงินที่ lock → เปลี่ยนเป็น CANCELLED    |
| `findOrdersByUserId`    | ดึง order ทั้งหมดของ user                                                     |
| `findOrderById`         | ดึง order ตาม id พร้อม trades                                                 |
| `findOrderBookByMarket` | ดึง order book ของตลาด (bids = ฝั่งซื้อ, asks = ฝั่งขาย)                        |

**LIMIT vs MARKET:**
- **LIMIT** — user กำหนดราคาเอง, ต้องส่ง `price` มา
- **MARKET** — ระบบดึงราคาจาก `exchange_rates` อัตโนมัติ, ไม่ต้องส่ง `price`

**การ Lock Balance:**
- **BUY** → lock สกุลเงิน quote (เช่น THB) จำนวน = price × amount
- **SELL** → lock สกุลเงิน base (เช่น BTC) จำนวน = amount

---

### 4. Matching Service — Matching Engine (ระบบจับคู่)

| ฟังก์ชัน   | คำอธิบาย                                                              |
| ---------- | -------------------------------------------------------------------- |
| `tryMatch` | เมื่อมี order ใหม่เข้ามา → หา order ฝั่งตรงข้ามที่ราคาเข้ากัน → เรียก executeTrade |

**หลักการจับคู่ (Price-Time Priority):**
1. BUY order → หา SELL order ที่ราคา ≤ ราคา BUY (ถูกสุดก่อน)
2. SELL order → หา BUY order ที่ราคา ≥ ราคา SELL (แพงสุดก่อน)
3. ราคาเท่ากัน → order ที่มาก่อนได้สิทธิ์ก่อน (FIFO)

**Self-Trade Prevention:** ไม่จับคู่ order ของ user คนเดียวกัน

**FilledType:**
- `SINGLE` — จับคู่ได้ 1 ครั้งเท่านั้น
- `MULTIPLE` — จับคู่ได้หลายรอบจนเต็มจำนวน (partial fill)

---

### 5. Trade Service — ระบบ Trade (ผลลัพธ์การจับคู่)

| ฟังก์ชัน              | คำอธิบาย                                               |
| --------------------- | ----------------------------------------------------- |
| `executeTrade`        | ดำเนินการ trade (atomic) — สร้าง trade + อัปเดต orders + settle wallets + transactions |
| `findTradesByMarketId`| ดึง trades ทั้งหมดของตลาด                               |
| `findTradesByUserId`  | ดึง trades ของ user (ทั้งฝั่งซื้อและขาย)                 |
| `findTradeById`       | ดึง trade ตาม id                                        |

**executeTrade ทำอะไรบ้าง (ใน 1 DB transaction):**
1. สร้าง trade record
2. อัปเดต `filledAmount` ของทั้ง 2 orders (ถ้าเต็ม → status = FILLED)
3. Buyer: หัก `lockBalance` (quote) + refund ส่วนต่าง + เพิ่ม `balance` (base)
4. Seller: หัก `lockBalance` (base) + เพิ่ม `balance` (quote)
5. สร้าง 4 transaction records (Buyer IN/OUT, Seller IN/OUT)

---

### 6. Swap Service — ระบบแลกเปลี่ยนสกุลเงิน

| ฟังก์ชัน       | คำอธิบาย                                                            |
| -------------- | ------------------------------------------------------------------ |
| `swapCurrency` | แลกเปลี่ยนสกุลเงินทันที (ไม่ผ่าน order book) ตาม rate จาก exchange_rates |

**Flow:** ดึง rate → ตรวจ balance → atomic: หัก from wallet + เพิ่ม to wallet + สร้าง 2 transactions

---

### 7. Exchange Rate Service — ระบบอัตราแลกเปลี่ยน

| ฟังก์ชัน                | คำอธิบาย                                            |
| ----------------------- | -------------------------------------------------- |
| `findAllExchangeRates`  | ดึงอัตราแลกเปลี่ยนทั้งหมด                            |
| `findExchangeRateByPair`| ดึง rate ตามคู่สกุลเงิน                              |
| `upsertExchangeRate`    | สร้าง/อัปเดต rate — **อัปเดตทั้ง 2 ทิศทางอัตโนมัติ**  |
| `removeExchangeRate`    | ลบ exchange rate                                     |

---

### 8. Transaction Service — ระบบประวัติรายการ

| ฟังก์ชัน                              | คำอธิบาย                                                |
| ------------------------------------- | ------------------------------------------------------ |
| `findTransactionsByUserId`            | ดึง transactions ของ user — **พร้อมข้อมูลอ้างอิงต้นทาง** |
| `findTransactionsByUserAndCurrency`   | ดึง transactions ตามสกุลเงิน                             |
| `findTransactionById`                 | ดึง transaction ตาม id — พร้อม ref detail                |

**ข้อมูลอ้างอิง (ref):** ระบบจะ populate ข้อมูลต้นทางอัตโนมัติ:
- `refType: ORDER` → แสดง Order detail + market
- `refType: TRADE` → แสดง Trade detail + buyOrder + sellOrder
- `refType: EXCHANGE` → แสดง Transaction ฝั่งตรงข้าม

---

## API Endpoints ทั้งหมด

Base URL: `http://localhost:3000/api`

### Authentication (Public — ไม่ต้อง login)

| # | Method | Endpoint              | คำอธิบาย                  | Body                                      |
|---|--------|-----------------------|--------------------------|-------------------------------------------|
| 1 | POST   | `/auth/register`      | สมัครสมาชิก               | `{ name, email, password }`               |
| 2 | POST   | `/auth/login`         | เข้าสู่ระบบ               | `{ email, password }`                     |
| 3 | GET    | `/auth/refresh`       | ต่ออายุ token             | — (ใช้ cookie)                             |

### Authentication (Protected — ต้อง login)

| # | Method | Endpoint              | คำอธิบาย                  |
|---|--------|-----------------------|--------------------------|
| 4 | POST   | `/auth/logout`        | ออกจากระบบ (อุปกรณ์เดียว)  |
| 5 | POST   | `/auth/logout-all`    | ออกจากระบบทุกอุปกรณ์       |

### Users

| # | Method | Endpoint         | คำอธิบาย          |
|---|--------|------------------|-------------------|
| 6 | GET    | `/users`         | ดึง user ทั้งหมด   |
| 7 | GET    | `/users/:id`     | ดึง user ตาม id    |
| 8 | PUT    | `/users/:id`     | อัปเดต user        |
| 9 | DELETE | `/users/:id`     | ลบ user            |

### Wallets

| #  | Method | Endpoint                              | คำอธิบาย                         | Body                                             |
|----|--------|---------------------------------------|----------------------------------|--------------------------------------------------|
| 10 | GET    | `/wallets/user/:userId`               | ดึง wallet ทั้งหมดของ user         | —                                                |
| 11 | GET    | `/wallets/user/:userId/currency/:currencyId` | ดึง wallet เฉพาะสกุลเงิน   | —                                                |
| 12 | POST   | `/wallets`                            | สร้าง wallet 1 ใบ                | `{ userId, currencyId }`                         |
| 13 | POST   | `/wallets/create-all/:userId`         | สร้าง wallet ทุกสกุลเงิน          | —                                                |
| 14 | POST   | `/wallets/transfer`                   | โอนเงินภายใน                     | `{ senderId, receiverId, currencyId, amount }`   |
| 15 | POST   | `/wallets/deposit`                    | ฝากเงิน                          | `{ userId, currencyId, amount }`                 |

### Currencies

| #  | Method | Endpoint           | คำอธิบาย             | Body                                     |
|----|--------|--------------------|----------------------|------------------------------------------|
| 16 | GET    | `/currencies`      | ดึงสกุลเงินทั้งหมด    | —                                        |
| 17 | GET    | `/currencies/:id`  | ดึงสกุลเงินตาม id     | —                                        |
| 18 | POST   | `/currencies`      | สร้างสกุลเงินใหม่     | `{ symbol, name, type, precision }`      |
| 19 | PUT    | `/currencies/:id`  | อัปเดตสกุลเงิน        | `{ symbol?, name?, type?, precision? }`  |
| 20 | DELETE | `/currencies/:id`  | ลบสกุลเงิน            | —                                        |

### Markets

| #  | Method | Endpoint                 | คำอธิบาย               | Body                                      |
|----|--------|--------------------------|------------------------|-------------------------------------------|
| 21 | GET    | `/markets`               | ดึงตลาดทั้งหมด          | —                                         |
| 22 | GET    | `/markets/active`        | ดึงตลาดที่ ACTIVE       | —                                         |
| 23 | GET    | `/markets/:id`           | ดึงตลาดตาม id           | —                                         |
| 24 | POST   | `/markets`               | สร้างตลาดใหม่           | `{ baseCurrencyId, quoteCurrencyId }`     |
| 25 | PATCH  | `/markets/:id/status`    | เปลี่ยนสถานะตลาด        | `{ status: "ACTIVE"/"PAUSED"/"CLOSED" }` |
| 26 | DELETE | `/markets/:id`           | ลบตลาด                 | —                                         |

### Orders

| #  | Method | Endpoint                        | คำอธิบาย                 | Body                                                              |
|----|--------|---------------------------------|--------------------------|--------------------------------------------------------------------|
| 27 | GET    | `/orders/user/:userId`          | ดึง order ของ user        | —                                                                  |
| 28 | GET    | `/orders/market/:marketId/book` | ดึง order book (bids/asks)| —                                                                  |
| 29 | GET    | `/orders/:id`                   | ดึง order ตาม id          | —                                                                  |
| 30 | POST   | `/orders`                       | สร้าง order ซื้อ/ขาย      | `{ userId, marketId, side, type, price?, amount, filledType? }`    |
| 31 | PATCH  | `/orders/:id/cancel`            | ยกเลิก order              | —                                                                  |

### Trades (Read-only)

| #  | Method | Endpoint                    | คำอธิบาย                 |
|----|--------|-----------------------------|--------------------------|
| 32 | GET    | `/trades/market/:marketId`  | ดึง trades ของตลาด        |
| 33 | GET    | `/trades/user/:userId`      | ดึง trades ของ user        |
| 34 | GET    | `/trades/:id`               | ดึง trade ตาม id           |

### Transactions (Read-only)

| #  | Method | Endpoint                      | คำอธิบาย                       |
|----|--------|-------------------------------|-------------------------------|
| 35 | GET    | `/transactions/user/:userId`  | ดึง transactions ของ user       |
| 36 | GET    | `/transactions/:id`           | ดึง transaction ตาม id          |

### Exchange Rates

| #  | Method | Endpoint                                            | คำอธิบาย                             | Body                                         |
|----|--------|-----------------------------------------------------|--------------------------------------|----------------------------------------------|
| 37 | GET    | `/exchange-rates`                                   | ดึง rate ทั้งหมด                      | —                                            |
| 38 | GET    | `/exchange-rates/:id`                               | ดึง rate ตาม id                       | —                                            |
| 39 | GET    | `/exchange-rates/pair/:fromCurrencyId/:toCurrencyId`| ดึง rate ตามคู่สกุลเงิน                | —                                            |
| 40 | POST   | `/exchange-rates`                                   | สร้าง/อัปเดต rate (ทั้ง 2 ทิศทาง)     | `{ fromCurrencyId, toCurrencyId, rate }`     |
| 41 | DELETE | `/exchange-rates/:id`                               | ลบ rate                               | —                                            |

### Swap (แลกเปลี่ยนสกุลเงิน)

| #  | Method | Endpoint      | คำอธิบาย                  | Body                                             |
|----|--------|---------------|---------------------------|--------------------------------------------------|
| 42 | POST   | `/exchange`   | แลกเปลี่ยนสกุลเงินทันที    | `{ userId, fromCurrencyId, toCurrencyId, amount }`|

> **หมายเหตุ:** ทุก endpoint ที่ไม่ใช่ auth (register/login/refresh) ต้องส่ง `Authorization: Bearer <accessToken>` ใน header

---

## Flow การทำงานหลัก

### Flow 1: สมัคร → Login → ได้ Token

```
1. POST /auth/register  { name, email, password }
   → สร้าง user + wallet ทุกสกุลเงินอัตโนมัติ

2. POST /auth/login  { email, password }
   → ได้ accessToken (15 นาที) + refreshToken (cookie 7 วัน)

3. ใช้ accessToken ใน header: Authorization: Bearer <token>
```

### Flow 2: ฝากเงิน → ดูยอด

```
1. POST /wallets/deposit  { userId: 1, currencyId: 6, amount: 1000000 }
   → ฝาก 1,000,000 THB

2. GET /wallets/user/1
   → ดูยอดทุก wallet
```

### Flow 3: วาง Order ซื้อ-ขาย + จับคู่อัตโนมัติ

```
1. User A: POST /orders
   { userId: 1, marketId: 1, side: "BUY", type: "LIMIT", price: 3370000, amount: 0.001, filledType: "MULTIPLE" }
   → lock 3,370 THB → order รอใน book

2. User B: POST /orders
   { userId: 2, marketId: 1, side: "SELL", type: "LIMIT", price: 3360000, amount: 0.001, filledType: "MULTIPLE" }
   → lock 0.001 BTC → Matching Engine จับคู่อัตโนมัติ!

3. ผลลัพธ์ (Trade เกิดที่ราคา maker = 3,370,000):
   - User A: ได้ 0.001 BTC, จ่าย 3,370 THB
   - User B: ได้ 3,370 THB, จ่าย 0.001 BTC
   - ทั้ง 2 orders → status: FILLED
```

### Flow 4: Swap แลกเปลี่ยนทันที

```
POST /exchange  { userId: 1, fromCurrencyId: 6, toCurrencyId: 1, amount: 3370000 }
→ แลก 3,370,000 THB เป็น 1 BTC (ตาม rate จาก exchange_rates)
→ ไม่ต้องรอจับคู่ — ทำทันที
```

### Flow 5: โอนเงินภายใน

```
POST /wallets/transfer  { senderId: 1, receiverId: 2, currencyId: 6, amount: 5000 }
→ User 1 โอน 5,000 THB ให้ User 2
→ สร้าง 2 transactions (OUT สำหรับ sender, IN สำหรับ receiver)
```

### Flow 6: ยกเลิก Order

```
PATCH /orders/3/cancel
→ ตรวจว่า order ยังเป็น OPEN → คืนเงินที่ lock → status: CANCELLED
```

---

## ข้อมูล Seed (Mock Data)

รันคำสั่ง `npx prisma db seed` จะสร้างข้อมูลดังนี้:

### ผู้ใช้ (3 คน)

| Name    | Email               | Password      |
|---------|---------------------|---------------|
| Alice   | alice@example.com   | password123   |
| Bob     | bob@example.com     | password123   |
| Charlie | charlie@example.com | password123   |

> password ถูก hash ด้วย bcrypt — login ผ่าน API ด้วย password ข้างบนได้เลย

### สกุลเงิน (6 รายการ)

| Symbol | Name      | Type   |
|--------|-----------|--------|
| BTC    | Bitcoin   | CRYPTO |
| ETH    | Ethereum  | CRYPTO |
| XRP    | Ripple    | CRYPTO |
| DOGE   | Dogecoin  | CRYPTO |
| USD    | US Dollar | FIAT   |
| THB    | Thai Baht | FIAT   |

### คู่ตลาด (9 รายการ) — สถานะ ACTIVE ทั้งหมด

BTC/THB, ETH/THB, XRP/THB, DOGE/THB, BTC/USD, ETH/USD, XRP/USD, DOGE/USD, USD/THB

### Wallet & ยอดเงินเริ่มต้น

แต่ละ user มี wallet ครบ 6 สกุลเงิน โดยได้รับเงินฝากเริ่มต้นดังนี้:

| User    | THB         | USD     | BTC | ETH | XRP   | DOGE    |
|---------|-------------|---------|-----|-----|-------|---------|
| Alice   | 5,000,000   | 50,000  | 2   | 10  | 0     | 0       |
| Bob     | 3,000,000   | 30,000  | 1   | 5   | 1,000 | 0       |
| Charlie | 1,000,000   | 10,000  | 0   | 0   | 500   | 50,000  |

### อัตราแลกเปลี่ยน (18 รายการ)

| From | To   | Rate          |
|------|------|---------------|
| BTC  | USD  | 97,140        |
| ETH  | USD  | 2,650         |
| XRP  | USD  | 2.48          |
| DOGE | USD  | 0.258         |
| BTC  | THB  | 3,370,000     |
| ETH  | THB  | 92,000        |
| XRP  | THB  | 86            |
| DOGE | THB  | 8.96          |
| USD  | THB  | 34.70         |
| THB  | USD  | 0.02882       |
| USD  | BTC  | 0.0000103     |
| USD  | ETH  | 0.000377      |
| USD  | XRP  | 0.4032        |
| USD  | DOGE | 3.876         |
| THB  | BTC  | 0.000000297   |
| THB  | ETH  | 0.00001087    |
| THB  | XRP  | 0.01163       |
| THB  | DOGE | 0.1116        |

---

## คู่มือทดสอบระบบ Step by Step

> ⚠️ **Order, Trade, Transaction** จะเกิดขึ้นผ่านการเรียก API จริง — ไม่ได้ seed ไว้  
> เพราะ Matching Engine ต้องทำงานจริงๆ ถึงจะได้ข้อมูลที่สมจริง  
> ทำตามขั้นตอนด้านล่างเพื่อสร้างข้อมูลครบทุกตาราง

### เตรียมพร้อม

ใช้ **Bruno**, **Postman** หรือ **curl** ทดสอบ API  
Base URL: `http://localhost:3000/api`

---

### Step 1: Login เพื่อรับ Access Token

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response** จะได้ `accessToken` — เก็บไว้ใช้ใน header ทุก request:

```
Authorization: Bearer <accessToken>
```

> ทำเช่นเดียวกันสำหรับ Bob (`bob@example.com`) และ Charlie (`charlie@example.com`)

---

### Step 2: ดูยอด Wallet (ตรวจสอบเงินเริ่มต้น)

```
GET /api/wallets/user/1
Authorization: Bearer <alice_token>
```

ควรเห็น: THB = 5,000,000 / USD = 50,000 / BTC = 2 / ETH = 10

---

### Step 3: สร้าง Order — ทดสอบ Matching Engine

> **สำคัญ:** ต้อง login คนละ user เพื่อให้ order match กัน (ระบบป้องกัน self-trade)

#### 3.1 Alice วาง BUY order (ซื้อ BTC ด้วย THB)

```
POST /api/orders
Authorization: Bearer <alice_token>
Content-Type: application/json

{
  "userId": 1,
  "marketId": 1,
  "side": "BUY",
  "type": "LIMIT",
  "price": 3370000,
  "amount": 0.01,
  "filledType": "MULTIPLE"
}
```

→ lock 33,700 THB → order status: OPEN → รอใน order book

#### 3.2 Bob วาง SELL order (ขาย BTC รับ THB)

```
POST /api/orders
Authorization: Bearer <bob_token>
Content-Type: application/json

{
  "userId": 2,
  "marketId": 1,
  "side": "SELL",
  "type": "LIMIT",
  "price": 3360000,
  "amount": 0.01,
  "filledType": "MULTIPLE"
}
```

→ lock 0.01 BTC → **Matching Engine จับคู่อัตโนมัติ!**

**ผลลัพธ์:**
- Trade เกิดที่ราคา maker (3,370,000) — Bob เป็น taker, Alice เป็น maker
- Alice: ได้ 0.01 BTC, จ่าย 33,700 THB
- Bob: ได้ 33,700 THB, จ่าย 0.01 BTC
- ทั้ง 2 orders → status: `FILLED`
- สร้าง 1 Trade record + 4 Transaction records อัตโนมัติ

---

### Step 4: ตรวจสอบ Trade ที่เกิดขึ้น

```
GET /api/trades/market/1
Authorization: Bearer <token>
```

จะเห็น trade record พร้อม buyOrder, sellOrder, price, amount

```
GET /api/trades/user/1
Authorization: Bearer <alice_token>
```

ดู trades เฉพาะของ Alice

---

### Step 5: ตรวจสอบ Transaction (ประวัติรายการ)

```
GET /api/transactions/user/1
Authorization: Bearer <alice_token>
```

จะเห็น transactions ทั้งหมดของ Alice:
- DEPOSIT (IN) — จาก seed
- TRADE (OUT) — จ่าย THB ตอนสร้าง order (lock)
- TRADE (IN) — ได้ BTC จากการ match
- TRADE (OUT) — จ่าย THB จริง (settled)

---

### Step 6: ทดสอบ MARKET Order (ไม่ต้องกำหนดราคา)

```
POST /api/orders
Authorization: Bearer <alice_token>
Content-Type: application/json

{
  "userId": 1,
  "marketId": 2,
  "side": "BUY",
  "type": "MARKET",
  "amount": 0.1,
  "filledType": "MULTIPLE"
}
```

→ ระบบดึงราคาจาก exchange_rates (ETH/THB = 92,000) อัตโนมัติ  
→ lock 9,200 THB → ถ้ามี SELL order ของคนอื่นอยู่จะ match ทันที

---

### Step 7: ทดสอบยกเลิก Order

#### 7.1 Alice วาง order ที่ยัง match ไม่ได้ (ราคาต่ำกว่าตลาด)

```
POST /api/orders
Authorization: Bearer <alice_token>
Content-Type: application/json

{
  "userId": 1,
  "marketId": 1,
  "side": "BUY",
  "type": "LIMIT",
  "price": 3000000,
  "amount": 0.01,
  "filledType": "SINGLE"
}
```

#### 7.2 ยกเลิก order

```
PATCH /api/orders/<orderId>/cancel
Authorization: Bearer <alice_token>
```

→ คืนเงิน 30,000 THB ที่ lock ไว้ → order status: `CANCELLED`

---

### Step 8: ทดสอบ Swap (แลกเปลี่ยนสกุลเงินทันที)

```
POST /api/exchange
Authorization: Bearer <charlie_token>
Content-Type: application/json

{
  "userId": 3,
  "fromCurrencyId": 6,
  "toCurrencyId": 1,
  "amount": 337000
}
```

→ Charlie แลก 337,000 THB → ได้ ~0.1 BTC (ตาม rate THB→BTC)  
→ ไม่ต้องรอ matching — ทำทันที

---

### Step 9: ทดสอบโอนเงินภายใน (Transfer)

```
POST /api/wallets/transfer
Authorization: Bearer <alice_token>
Content-Type: application/json

{
  "senderId": 1,
  "receiverId": 3,
  "currencyId": 6,
  "amount": 100000
}
```

→ Alice โอน 100,000 THB ให้ Charlie  
→ สร้าง 2 transactions (OUT สำหรับ Alice, IN สำหรับ Charlie)

---

### Step 10: ทดสอบฝากเงินเพิ่ม (Deposit)

```
POST /api/wallets/deposit
Authorization: Bearer <bob_token>
Content-Type: application/json

{
  "userId": 2,
  "currencyId": 6,
  "amount": 500000
}
```

→ Bob ฝากเพิ่ม 500,000 THB  

---

### Step 11: ดู Order Book

```
GET /api/orders/market/1/book
Authorization: Bearer <token>
```

จะเห็น:
- `bids` — order ฝั่ง BUY (เรียงราคาสูง→ต่ำ)
- `asks` — order ฝั่ง SELL (เรียงราคาต่ำ→สูง)

---

### สรุปข้อมูลที่ได้หลังทดสอบครบ

| ตาราง          | ข้อมูลจาก seed          | ข้อมูลจาก API testing                    |
|----------------|------------------------|------------------------------------------|
| `users`        | 3 คน ✅                | —                                        |
| `currencies`   | 6 สกุลเงิน ✅           | —                                        |
| `wallets`      | 18 wallets ✅           | ยอดเปลี่ยนตามการเทรด/โอน/ฝาก             |
| `markets`      | 9 คู่ตลาด ✅            | —                                        |
| `exchange_rates`| 18 rates ✅            | อัปเดตได้ผ่าน API                         |
| `orders`       | —                      | เกิดจาก Step 3, 6, 7 ✅                  |
| `trades`       | —                      | เกิดอัตโนมัติจาก Matching Engine ✅        |
| `transactions` | 13 deposits ✅          | เกิดจากทุก Step (order/trade/swap/transfer) ✅ |
