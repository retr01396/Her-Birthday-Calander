-- Add Club Accounts: username/passwordHash, remove CLUB_LEADER role & leaderId

-- 1. Demote legacy CLUB_LEADER users to STUDENT (enum value is being removed)
UPDATE "User" SET "role" = 'STUDENT' WHERE "role" = 'CLUB_LEADER';

-- 2. AlterEnum: remove CLUB_LEADER from SystemRole
BEGIN;
CREATE TYPE "SystemRole_new" AS ENUM ('STUDENT', 'SUPER_ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "SystemRole_new" USING ("role"::text::"SystemRole_new");
ALTER TYPE "SystemRole" RENAME TO "SystemRole_old";
ALTER TYPE "SystemRole_new" RENAME TO "SystemRole";
DROP TYPE "public"."SystemRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- 3. DropForeignKey (leaderId removed; already dropped in 20260725150000 on fresh DBs)
ALTER TABLE "Club" DROP CONSTRAINT IF EXISTS "Club_leaderId_fkey";

-- 4. AlterTable: drop leaderId (already dropped on fresh DBs), add club credentials
ALTER TABLE "Club" DROP COLUMN IF EXISTS "leaderId",
ADD COLUMN     "username" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL DEFAULT 'CHANGE_ME';

-- 5. Backfill usernames from name (the slug column did not exist in the
-- migration history, so derive legacy usernames from the club name).
-- NOTE: LOWER() must run BEFORE REGEXP_REPLACE so uppercase letters are
-- preserved as lowercase instead of being replaced with '_'.
UPDATE "Club"
SET "username" = REGEXP_REPLACE(LOWER("name"), '[^a-z0-9]+', '_', 'g')
WHERE "username" IS NULL OR "username" = '';

-- 6. Enforce NOT NULL + uniqueness
ALTER TABLE "Club" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "Club_username_key" ON "Club"("username");

-- 7. Remove placeholder default (real hashes are set by the backfill script)
ALTER TABLE "Club" ALTER COLUMN "passwordHash" DROP DEFAULT;
