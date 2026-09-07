-- AlterTable: ClubMember - add custom role titles & executive flag
ALTER TABLE "ClubMember" ADD COLUMN IF NOT EXISTS "roleTitle" TEXT DEFAULT 'Member';
ALTER TABLE "ClubMember" ADD COLUMN IF NOT EXISTS "isExecutive" BOOLEAN NOT NULL DEFAULT false;
