-- CreateEnum
CREATE TYPE "public"."Tributacao" AS ENUM ('MEI', 'SIMPES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL');

-- CreateEnum
CREATE TYPE "public"."Modulos" AS ENUM ('CONTABIL', 'FISCAL', 'FOLHA_DE_PAGAMENTO', 'SOCIETARIO');

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "cpf_socio" TEXT,
    "endereco_socio" TEXT,
    "tributacao" "public"."Tributacao" NOT NULL,
    "modulos" "public"."Modulos"[],
    "honorarios" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_documento_key" ON "public"."Client"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");
