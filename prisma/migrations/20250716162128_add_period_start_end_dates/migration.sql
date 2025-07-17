/*
  Warnings:

  - You are about to drop the column `internshipPeriod` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "internshipPeriod",
ADD COLUMN     "periodEndDate" TIMESTAMP(3),
ADD COLUMN     "periodStartDate" TIMESTAMP(3);
