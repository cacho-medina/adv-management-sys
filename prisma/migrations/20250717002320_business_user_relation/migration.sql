/*
  Warnings:

  - You are about to drop the column `isActive` on the `UserBusiness` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBusiness" DROP COLUMN "isActive",
ADD COLUMN     "isEmployee" BOOLEAN NOT NULL DEFAULT true;
