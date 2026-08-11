-- OS 12-B: login proprio -> idp-client. username/password/role viram legado;
-- email/idpUserId sao o novo vinculo com o IdP; setorId e associado
-- localmente por um "ti" apos o login (Caminho B).

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "idpUserId" TEXT,
ADD COLUMN     "setorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_idpUserId_key" ON "User"("idpUserId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
-- TV.accessToken novo (OS 12-B, secao 3.9) - tabela ainda sem uso em
-- producao (nenhuma rota le/grava TV hoje), por isso NOT NULL direto sem
-- default de backfill.
ALTER TABLE "TV" ADD COLUMN     "accessToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TV_accessToken_key" ON "TV"("accessToken");

-- CreateTable
CREATE TABLE "SetorAssignmentLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "setorId" INTEGER,
    "assignedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetorAssignmentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SetorAssignmentLog" ADD CONSTRAINT "SetorAssignmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetorAssignmentLog" ADD CONSTRAINT "SetorAssignmentLog_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "Setor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetorAssignmentLog" ADD CONSTRAINT "SetorAssignmentLog_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
