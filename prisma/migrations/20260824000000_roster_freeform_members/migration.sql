-- AlterTable: ClubMember - allow free-form roster entries without a student account
ALTER TABLE "ClubMember" ALTER COLUMN "userId" DROP NOT NULL;
