-- AlterEnum
ALTER TYPE "RegistrationStatus" ADD VALUE 'PENDING';
ALTER TYPE "RegistrationStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "requiresApproval" BOOLEAN NOT NULL DEFAULT false;
