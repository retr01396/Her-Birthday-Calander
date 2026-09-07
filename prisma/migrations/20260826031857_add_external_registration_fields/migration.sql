-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "ExternalProvider" AS ENUM ('MAKEMYPASS', 'RSVP', 'OTHERS');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "externalProvider" "ExternalProvider",
ADD COLUMN     "regType" "RegistrationType" NOT NULL DEFAULT 'INTERNAL';
