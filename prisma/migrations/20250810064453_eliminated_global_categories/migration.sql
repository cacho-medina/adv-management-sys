/*
  Warnings:

  - You are about to drop the column `isActive` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `UserBusiness` table. All the data in the column will be lost.
  - Made the column `businessId` on table `Category` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_businessId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserBusiness" DROP COLUMN "isActive",
ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE';

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
