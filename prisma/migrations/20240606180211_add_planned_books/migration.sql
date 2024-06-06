-- CreateEnum
CREATE TYPE "User" AS ENUM ('Marin', 'Marion');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "planned_marin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "planned_marion" BOOLEAN NOT NULL DEFAULT false;
