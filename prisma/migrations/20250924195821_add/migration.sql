-- AlterTable
ALTER TABLE "public"."clientes_eventuais" ADD COLUMN     "parcelas_config" JSONB,
ADD COLUMN     "quantidade_parcelas" INTEGER,
ADD COLUMN     "valor_entrada" INTEGER;
