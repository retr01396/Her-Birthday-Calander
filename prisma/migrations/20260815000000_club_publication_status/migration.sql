-- Club publication workflow: add ClubStatus enum + status/updatedAt on Club,
-- and sync the database schema to match prisma/schema.prisma (the migration
-- history had drifted — many columns/tables declared in the schema were never
-- added by a migration).

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('EVENT_RECAP', 'CONGRATULATIONS', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ClubCategory" AS ENUM ('PROFESSIONAL_BODY', 'GENERAL');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('UNPUBLISHED', 'PUBLISHED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Pass" DROP CONSTRAINT "Pass_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Pass" DROP CONSTRAINT "Pass_userId_fkey";

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "about" TEXT,
ADD COLUMN     "category" "ClubCategory" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "coverUrl" TEXT,
ADD COLUMN     "customFormFields" JSONB,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "recruitmentStatus" TEXT NOT NULL DEFAULT 'CLOSED',
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "status" "ClubStatus" NOT NULL DEFAULT 'UNPUBLISHED',
ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsappGroupUrl" TEXT,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "passwordHash" DROP DEFAULT;

-- Backfill: existing clubs are live profiles — keep them publicly visible.
-- (Only clubs created AFTER this migration start as UNPUBLISHED drafts.)
UPDATE "Club" SET "status" = 'PUBLISHED';

-- updatedAt is @updatedAt in Prisma: drop the temporary default now that rows are backfilled.
ALTER TABLE "Club" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ClubMember" ADD COLUMN     "applicationAnswers" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "formSchema" JSONB,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "passType" TEXT NOT NULL DEFAULT 'PASS',
ADD COLUMN     "pointsPerAttender" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "registrationFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "division" TEXT,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalPoints" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "yearOfStudy" SET DATA TYPE TEXT;

-- DropTable (legacy table replaced by "Registration" — not referenced anywhere in the app)
DROP TABLE "Pass";

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "formResponses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qrToken" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "attendedAt" TIMESTAMP(3),
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruitmentGig" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "openPositions" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentGig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubPost" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "postType" "PostType" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostWinnerTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "awardTitle" TEXT,

    CONSTRAINT "PostWinnerTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_qrToken_key" ON "Registration"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_userId_eventId_key" ON "Registration"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PostWinnerTag_postId_userId_key" ON "PostWinnerTag"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruitmentGig" ADD CONSTRAINT "RecruitmentGig_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPost" ADD CONSTRAINT "ClubPost_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubPost" ADD CONSTRAINT "ClubPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostWinnerTag" ADD CONSTRAINT "PostWinnerTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ClubPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostWinnerTag" ADD CONSTRAINT "PostWinnerTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ClubPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
