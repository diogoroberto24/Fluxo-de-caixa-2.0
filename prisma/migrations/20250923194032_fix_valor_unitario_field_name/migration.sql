/*
  Warnings:

  - You are about to drop the column `valor_uinitario` on the `cobranca_itens` table. All the data in the column will be lost.
  - Added the required column `valor_unitario` to the `cobranca_itens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."cobranca_itens" DROP COLUMN "valor_uinitario",
ADD COLUMN     "valor_unitario" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."cobrancas" ALTER COLUMN "motivo_de_cancelamento" DROP NOT NULL;
