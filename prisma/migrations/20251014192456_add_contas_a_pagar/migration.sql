-- CreateEnum
CREATE TYPE "public"."StatusContaPagar" AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO');

-- CreateEnum
CREATE TYPE "public"."RecorrenciaContaPagar" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'ESPORADICA');

-- AlterTable
ALTER TABLE "public"."balancos" ADD COLUMN     "conta_pagar_id" TEXT;

-- CreateTable
CREATE TABLE "public"."contas_a_pagar" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusContaPagar" NOT NULL DEFAULT 'PENDENTE',
    "recorrencia" "public"."RecorrenciaContaPagar" NOT NULL DEFAULT 'ESPORADICA',
    "data_pagamento" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "contas_a_pagar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."balancos" ADD CONSTRAINT "balancos_conta_pagar_id_fkey" FOREIGN KEY ("conta_pagar_id") REFERENCES "public"."contas_a_pagar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
