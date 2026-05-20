/*
  Warnings:

  - A unique constraint covering the columns `[contestantId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contestantId` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "contestantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_contestantId_key" ON "Candidate"("contestantId");
