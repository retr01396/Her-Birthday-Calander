-- AlterTable
ALTER TABLE "ClubMember" ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "badgeColor" TEXT,
ADD COLUMN "className" TEXT,
ADD COLUMN "displayName" TEXT,
ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Club" ADD COLUMN "rosterSettings" JSONB;
