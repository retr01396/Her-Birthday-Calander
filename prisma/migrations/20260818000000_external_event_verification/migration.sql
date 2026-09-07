-- External Event Verification & Revert Architecture
-- Adds VerificationStatus/PointStatus enums, the ExternalAttendee upload table,
-- event-level verification fields, and a status flag on the points ledger.

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_REQUIRED', 'PENDING_ADMIN_VERIFICATION', 'APPROVED', 'REVERTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PointStatus" AS ENUM ('ACTIVE', 'REVERTED');

-- CreateTable
CREATE TABLE "ExternalAttendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "position" TEXT NOT NULL DEFAULT 'PARTICIPANT',
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalAttendee_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "externalRegUrl" TEXT,
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'NOT_REQUIRED';

-- AlterTable
ALTER TABLE "PointTransaction" ADD COLUMN     "status" "PointStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "ExternalAttendee_eventId_idx" ON "ExternalAttendee"("eventId");

-- AddForeignKey
ALTER TABLE "ExternalAttendee" ADD CONSTRAINT "ExternalAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
