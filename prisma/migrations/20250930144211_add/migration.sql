-- AlterTable
ALTER TABLE "public"."historico_honorarios" ADD COLUMN     "metadata" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE "public"."contratos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "pdf_url" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
