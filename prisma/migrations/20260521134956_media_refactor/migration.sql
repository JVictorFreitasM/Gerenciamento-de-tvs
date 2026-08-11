/*
  Warnings:

  - Added the required column `setorId` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `Media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MediaTipo" AS ENUM ('VIDEO', 'IMAGEM');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "setorId" INTEGER NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "MediaTipo" NOT NULL;

-- AlterTable
ALTER TABLE "PlaylistMedia" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "duracao" INTEGER;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
