-- CreateEnum: ClubRole (new)
CREATE TYPE "ClubRole" AS ENUM ('MEMBER', 'OFFICER', 'TREASURER', 'LEADER');

-- CreateEnum: SystemRole (replaces Role with same values)
CREATE TYPE "SystemRole" AS ENUM ('STUDENT', 'CLUB_LEADER', 'SUPER_ADMIN');

-- AlterTable: User - change role type from Role to SystemRole, add new columns
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "SystemRole" USING "role"::text::"SystemRole",
  ALTER COLUMN "role" SET DEFAULT 'STUDENT';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yearOfStudy" INTEGER;

-- DropEnum: Role (replaced by SystemRole)
DROP TYPE IF EXISTS "Role";

-- AlterTable: Club - drop leaderId column and its foreign key
ALTER TABLE "Club" DROP CONSTRAINT IF EXISTS "Club_leaderId_fkey";
ALTER TABLE "Club" DROP COLUMN IF EXISTS "leaderId";

-- CreateTable: ClubMember
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "clubRole" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_userId_clubId_key" ON "ClubMember"("userId", "clubId");

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
