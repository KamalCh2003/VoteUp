/*
  Warnings:

  - The values [PENDING] on the enum `ElectionStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[electionId,candidateNumber]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ElectionStatus_new" AS ENUM ('UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED');
ALTER TABLE "Election" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Election" ALTER COLUMN "status" TYPE "ElectionStatus_new" USING ("status"::text::"ElectionStatus_new");
ALTER TYPE "ElectionStatus" RENAME TO "ElectionStatus_old";
ALTER TYPE "ElectionStatus_new" RENAME TO "ElectionStatus";
DROP TYPE "ElectionStatus_old";
ALTER TABLE "Election" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_electionId_candidateNumber_key" ON "Candidate"("electionId", "candidateNumber");
