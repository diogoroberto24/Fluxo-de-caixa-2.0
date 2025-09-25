-- AlterTable
ALTER TABLE "public"."cobrancas" ADD COLUMN     "cliente_eventual_id" TEXT;

-- CreateTable
CREATE TABLE "public"."clientes_eventuais" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "valor_servico" INTEGER NOT NULL,
    "parcelamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "clientes_eventuais_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."cobrancas" ADD CONSTRAINT "cobrancas_cliente_eventual_id_fkey" FOREIGN KEY ("cliente_eventual_id") REFERENCES "public"."clientes_eventuais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
