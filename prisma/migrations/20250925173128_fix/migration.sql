-- DropForeignKey
ALTER TABLE "public"."cobrancas" DROP CONSTRAINT "cobrancas_cliente_id_fkey";

-- AlterTable
ALTER TABLE "public"."cobrancas" ALTER COLUMN "cliente_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."cobrancas" ADD CONSTRAINT "cobrancas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
