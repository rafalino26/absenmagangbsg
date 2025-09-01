/*
  Warnings:

  - You are about to drop the column `division` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "division",
ADD COLUMN     "divisionId" INTEGER;

-- CreateTable
CREATE TABLE "Division" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Division_name_key" ON "Division"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
