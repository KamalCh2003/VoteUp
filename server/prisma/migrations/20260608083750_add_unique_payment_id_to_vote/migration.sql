/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vote_paymentId_key" ON "Vote"("paymentId");
