-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionRefType" ADD VALUE 'EXCHANGE';
ALTER TYPE "TransactionRefType" ADD VALUE 'TRANSFER';
ALTER TYPE "TransactionRefType" ADD VALUE 'DEPOSIT';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_agent" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "ref_id" INTEGER;
