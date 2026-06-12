-- DropIndex
DROP INDEX "Vote_userId_electionId_key";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
