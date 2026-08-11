/*
  Warnings:

  - You are about to drop the column `ativa` on the `Playlist` table. All the data in the column will be lost.
  - The primary key for the `PlaylistMedia` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ativo` on the `PlaylistMedia` table. All the data in the column will be lost.
  - You are about to drop the column `duracao` on the `PlaylistMedia` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[setorId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "ativa";

-- AlterTable
ALTER TABLE "PlaylistMedia" DROP CONSTRAINT "PlaylistMedia_pkey",
DROP COLUMN "ativo",
DROP COLUMN "duracao",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PlaylistMedia_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_setorId_key" ON "Playlist"("setorId");
