/*
  Warnings:

  - The primary key for the `Episode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Season` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Show` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Author` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AuthorToBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenreToMovie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GenreToShow` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tmdbId]` on the table `Episode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `Season` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tmdbId]` on the table `Show` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdbId` to the `Episode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdbId` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdbId` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdbId` to the `Show` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "Season" DROP CONSTRAINT "Season_showId_fkey";

-- DropForeignKey
ALTER TABLE "_AuthorToBook" DROP CONSTRAINT "_AuthorToBook_A_fkey";

-- DropForeignKey
ALTER TABLE "_AuthorToBook" DROP CONSTRAINT "_AuthorToBook_B_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToMovie" DROP CONSTRAINT "_GenreToMovie_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToMovie" DROP CONSTRAINT "_GenreToMovie_B_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToShow" DROP CONSTRAINT "_GenreToShow_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenreToShow" DROP CONSTRAINT "_GenreToShow_B_fkey";

-- AlterTable
ALTER TABLE "Episode" DROP CONSTRAINT "Episode_pkey",
ADD COLUMN     "tmdbId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "seasonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Episode_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_pkey",
ADD COLUMN     "tmdbId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Season" DROP CONSTRAINT "Season_pkey",
ADD COLUMN     "tmdbId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "showId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Season_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Show" DROP CONSTRAINT "Show_pkey",
ADD COLUMN     "tmdbId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Show_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Author";

-- DropTable
DROP TABLE "Genre";

-- DropTable
DROP TABLE "_AuthorToBook";

-- DropTable
DROP TABLE "_GenreToMovie";

-- DropTable
DROP TABLE "_GenreToShow";

-- CreateTable
CREATE TABLE "MediaGenre" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "MediaGenre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAuthor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "BookAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaGenreToShow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MediaGenreToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookToBookAuthor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaGenre_tmdbId_key" ON "MediaGenre"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAuthor_name_key" ON "BookAuthor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaGenreToShow_AB_unique" ON "_MediaGenreToShow"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaGenreToShow_B_index" ON "_MediaGenreToShow"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaGenreToMovie_AB_unique" ON "_MediaGenreToMovie"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaGenreToMovie_B_index" ON "_MediaGenreToMovie"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookToBookAuthor_AB_unique" ON "_BookToBookAuthor"("A", "B");

-- CreateIndex
CREATE INDEX "_BookToBookAuthor_B_index" ON "_BookToBookAuthor"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_tmdbId_key" ON "Episode"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_tmdbId_key" ON "Season"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Show_tmdbId_key" ON "Show"("tmdbId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaGenreToShow" ADD CONSTRAINT "_MediaGenreToShow_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaGenre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaGenreToShow" ADD CONSTRAINT "_MediaGenreToShow_B_fkey" FOREIGN KEY ("B") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaGenreToMovie" ADD CONSTRAINT "_MediaGenreToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaGenre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaGenreToMovie" ADD CONSTRAINT "_MediaGenreToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookAuthor" ADD CONSTRAINT "_BookToBookAuthor_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToBookAuthor" ADD CONSTRAINT "_BookToBookAuthor_B_fkey" FOREIGN KEY ("B") REFERENCES "BookAuthor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
