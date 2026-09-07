-- Add OtpPurpose enum and extend VerificationToken for OTP flows
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'FORGOT_PASSWORD', 'CHANGE_PASSWORD');

-- Extend the existing VerificationToken table
ALTER TABLE "VerificationToken" ADD COLUMN "purpose" "OtpPurpose" NOT NULL DEFAULT 'FORGOT_PASSWORD';
ALTER TABLE "VerificationToken" ADD COLUMN "token" TEXT;

-- Single-use authorization token must be unique
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- Fast lookups for (email, purpose) pairs
CREATE INDEX "VerificationToken_email_purpose_idx" ON "VerificationToken"("email", "purpose");
