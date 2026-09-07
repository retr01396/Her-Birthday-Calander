-- Complete the Event columns declared by the team-events schema.
CREATE TYPE "TeamPassStrategy" AS ENUM ('CAPTAIN_ONLY', 'INDIVIDUAL');

ALTER TABLE "Event"
ADD COLUMN "minTeamSize" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN "passStrategy" "TeamPassStrategy" DEFAULT 'CAPTAIN_ONLY';