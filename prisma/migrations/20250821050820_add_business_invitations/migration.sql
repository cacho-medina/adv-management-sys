-- CreateTable
CREATE TABLE "BusinessInvitations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessInvitations_token_key" ON "BusinessInvitations"("token");

-- CreateIndex
CREATE INDEX "BusinessInvitations_businessId_idx" ON "BusinessInvitations"("businessId");

-- CreateIndex
CREATE INDEX "BusinessInvitations_email_idx" ON "BusinessInvitations"("email");

-- CreateIndex
CREATE INDEX "BusinessInvitations_token_idx" ON "BusinessInvitations"("token");

-- CreateIndex
CREATE INDEX "BusinessInvitations_expiresAt_idx" ON "BusinessInvitations"("expiresAt");

-- AddForeignKey
ALTER TABLE "BusinessInvitations" ADD CONSTRAINT "BusinessInvitations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessInvitations" ADD CONSTRAINT "BusinessInvitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessInvitations" ADD CONSTRAINT "BusinessInvitations_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
