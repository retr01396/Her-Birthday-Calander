-- AlterTable: Club - optional membership review (application -> club approval)
ALTER TABLE "Club" ADD COLUMN "membershipRequiresApproval" BOOLEAN NOT NULL DEFAULT false;
