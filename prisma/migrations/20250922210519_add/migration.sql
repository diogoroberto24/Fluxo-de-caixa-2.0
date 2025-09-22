-- CreateTable
CREATE TABLE "public"."historico_honorarios" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_anterior" INTEGER NOT NULL,
    "valor_novo" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "alterado_por" TEXT NOT NULL DEFAULT 'Sistema',
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historico_honorarios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."historico_honorarios" ADD CONSTRAINT "historico_honorarios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
