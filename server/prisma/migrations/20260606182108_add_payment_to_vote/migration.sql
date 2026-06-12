-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "paymentId" TEXT;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
