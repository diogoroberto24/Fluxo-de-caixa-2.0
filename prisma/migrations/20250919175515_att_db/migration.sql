/*
  Warnings:

  - You are about to alter the column `valor` on the `balancos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `valor` on the `cliente_produtos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `valor_uinitario` on the `cobranca_itens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `subtotal` on the `cobranca_itens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `desconto` on the `cobranca_itens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `total` on the `cobranca_itens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `subtotal` on the `cobrancas` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `desconto` on the `cobrancas` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `total` on the `cobrancas` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `valor` on the `produtos` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."balancos" ALTER COLUMN "valor" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."cliente_produtos" ALTER COLUMN "valor" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."cobranca_itens" ALTER COLUMN "valor_uinitario" SET DATA TYPE INTEGER,
ALTER COLUMN "subtotal" SET DATA TYPE INTEGER,
ALTER COLUMN "desconto" SET DATA TYPE INTEGER,
ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."cobrancas" ALTER COLUMN "subtotal" SET DATA TYPE INTEGER,
ALTER COLUMN "desconto" SET DATA TYPE INTEGER,
ALTER COLUMN "total" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."produtos" ALTER COLUMN "valor" SET DATA TYPE INTEGER;
