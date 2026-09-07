-- Add EMAIL_VERIFICATION purpose for club onboarding / email change flows
ALTER TYPE "OtpPurpose" ADD VALUE 'EMAIL_VERIFICATION';

-- Club email (used for OTP delivery / contact) + verification timestamp
ALTER TABLE "Club" ADD COLUMN "email" TEXT;
ALTER TABLE "Club" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- Backfill existing clubs with a deterministic address derived from their
-- unique username (usernames are unique, so these are unique too).
UPDATE "Club" SET "email" = "username" || '@cce.edu.in' WHERE "email" IS NULL;

CREATE UNIQUE INDEX "Club_email_key" ON "Club"("email");
