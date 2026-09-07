-- Event Finalization & Points Engine
-- Adds event close/finalize state, competition winners (1st/2nd/3rd), winner
-- bonus point configuration, a club points ledger, and the PointTransaction
-- immutable points log.

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "finalizedAt" TIMESTAMP(3),
ADD COLUMN     "firstPlacePoints" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "secondPlacePoints" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "thirdPlacePoints" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "firstPlaceWinnerId" TEXT,
ADD COLUMN     "secondPlaceWinnerId" TEXT,
ADD COLUMN     "thirdPlaceWinnerId" TEXT;

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "clubId" TEXT,
    "eventId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointTransaction_userId_idx" ON "PointTransaction"("userId");

-- CreateIndex
CREATE INDEX "PointTransaction_clubId_idx" ON "PointTransaction"("clubId");

-- CreateIndex
CREATE INDEX "PointTransaction_eventId_idx" ON "PointTransaction"("eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_firstPlaceWinnerId_fkey" FOREIGN KEY ("firstPlaceWinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_secondPlaceWinnerId_fkey" FOREIGN KEY ("secondPlaceWinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_thirdPlaceWinnerId_fkey" FOREIGN KEY ("thirdPlaceWinnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
