/*
  Warnings:

  - Added the required column `data_pagamento_mensal` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_bairro` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_cep` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_cpf` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_municipio` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_nome` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_rg` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representante_rua` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."clientes" ADD COLUMN     "data_pagamento_mensal" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "representante_bairro" TEXT NOT NULL,
ADD COLUMN     "representante_cep" TEXT NOT NULL,
ADD COLUMN     "representante_cpf" TEXT NOT NULL,
ADD COLUMN     "representante_municipio" TEXT NOT NULL,
ADD COLUMN     "representante_nome" TEXT NOT NULL,
ADD COLUMN     "representante_rg" TEXT NOT NULL,
ADD COLUMN     "representante_rua" TEXT NOT NULL;
