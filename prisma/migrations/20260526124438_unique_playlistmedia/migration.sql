/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,ordem]` on the table `PlaylistMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PlaylistMedia_playlistId_ordem_key" ON "PlaylistMedia"("playlistId", "ordem");
