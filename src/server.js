require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");
const { port } = require("./config/index");

const PORT = port;

prisma
  .$connect()
  .then(() => {
    console.log("PostgreSQL connected via Prisma");
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
