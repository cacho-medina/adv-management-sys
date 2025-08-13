/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmployee` on the `UserBusiness` table. All the data in the column will be lost.
  - You are about to drop the `BusinessClient` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `businessId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BusinessClient" DROP CONSTRAINT "BusinessClient_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessClient" DROP CONSTRAINT "BusinessClient_clientId_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "UserBusiness" DROP COLUMN "isEmployee",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- DropTable
DROP TABLE "BusinessClient";

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
