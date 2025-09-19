/*
  Warnings:

  - You are about to drop the `Balanco` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoriaServico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClienteServico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cobranca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemCobranca` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Recorrencia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Servico` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."BalancoTipo" AS ENUM ('ENTRADA', 'SAIDA');

-- DropForeignKey
ALTER TABLE "public"."Balanco" DROP CONSTRAINT "Balanco_cobrancaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Balanco" DROP CONSTRAINT "Balanco_recorrenciaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClienteServico" DROP CONSTRAINT "ClienteServico_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClienteServico" DROP CONSTRAINT "ClienteServico_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Cobranca" DROP CONSTRAINT "Cobranca_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemCobranca" DROP CONSTRAINT "ItemCobranca_cobrancaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ItemCobranca" DROP CONSTRAINT "ItemCobranca_servicoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Recorrencia" DROP CONSTRAINT "Recorrencia_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Servico" DROP CONSTRAINT "Servico_categoriaId_fkey";

-- DropTable
DROP TABLE "public"."Balanco";

-- DropTable
DROP TABLE "public"."CategoriaServico";

-- DropTable
DROP TABLE "public"."Client";

-- DropTable
DROP TABLE "public"."ClienteServico";

-- DropTable
DROP TABLE "public"."Cobranca";

-- DropTable
DROP TABLE "public"."ItemCobranca";

-- DropTable
DROP TABLE "public"."Recorrencia";

-- DropTable
DROP TABLE "public"."Servico";

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "permissao" TEXT NOT NULL,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cliente_rua" TEXT NOT NULL,
    "cliente_numero" TEXT NOT NULL,
    "cliente_bairro" TEXT NOT NULL,
    "cliente_cidade" TEXT NOT NULL,
    "cliente_estado" TEXT NOT NULL,
    "cliente_pais" TEXT NOT NULL,
    "socio_documento" TEXT,
    "socio_rua" TEXT,
    "socio_numero" TEXT,
    "socio_bairro" TEXT,
    "socio_cidade" TEXT,
    "socio_estado" TEXT,
    "socio_pais" TEXT,
    "tributacao" TEXT NOT NULL,
    "observacao" TEXT,
    "status" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" BIGINT NOT NULL,
    "tipo" TEXT NOT NULL,
    "direcao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "categoria_id" TEXT NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cliente_produtos" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "cliente_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "cliente_produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."balancos" (
    "id" TEXT NOT NULL,
    "tipo" "public"."BalancoTipo" NOT NULL,
    "valor" BIGINT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL,
    "data_de_fato" TIMESTAMP(3) NOT NULL,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "cobranca_id" TEXT,
    "recorrencia_id" TEXT,

    CONSTRAINT "balancos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."recorrencias" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_de_inicio" TIMESTAMP(3) NOT NULL,
    "data_de_fim" TIMESTAMP(3),
    "frequencia" TEXT NOT NULL,
    "franquencia_valor" INTEGER NOT NULL,
    "ultima_execucao" TIMESTAMP(3),
    "proxima_execucao" TIMESTAMP(3),
    "dia_de_vencimento" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "data_de_delecao" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "cliente_id" TEXT,
    "produto_id" TEXT,

    CONSTRAINT "recorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cobrancas" (
    "id" TEXT NOT NULL,
    "subtotal" BIGINT NOT NULL,
    "desconto" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "data_de_vencimento" TEXT NOT NULL,
    "data_de_pagamento" TIMESTAMP(3),
    "metodo_de_pagamento" TEXT,
    "data_de_cancelamento" TIMESTAMP(3),
    "motivo_de_cancelamento" TEXT NOT NULL,
    "observacoes" TEXT,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "cliente_id" TEXT NOT NULL,

    CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cobranca_itens" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "valor_uinitario" BIGINT NOT NULL,
    "subtotal" BIGINT NOT NULL,
    "desconto" BIGINT NOT NULL,
    "total" BIGINT NOT NULL,
    "descricao" TEXT,
    "data_de_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_de_atualizacao" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "cobranca_id" TEXT,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "cobranca_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "public"."clientes"("documento");

-- AddForeignKey
ALTER TABLE "public"."produtos" ADD CONSTRAINT "produtos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cliente_produtos" ADD CONSTRAINT "cliente_produtos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cliente_produtos" ADD CONSTRAINT "cliente_produtos_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balancos" ADD CONSTRAINT "balancos_cobranca_id_fkey" FOREIGN KEY ("cobranca_id") REFERENCES "public"."cobrancas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balancos" ADD CONSTRAINT "balancos_recorrencia_id_fkey" FOREIGN KEY ("recorrencia_id") REFERENCES "public"."recorrencias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recorrencias" ADD CONSTRAINT "recorrencias_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."recorrencias" ADD CONSTRAINT "recorrencias_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cobrancas" ADD CONSTRAINT "cobrancas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cobranca_itens" ADD CONSTRAINT "cobranca_itens_cobranca_id_fkey" FOREIGN KEY ("cobranca_id") REFERENCES "public"."cobrancas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cobranca_itens" ADD CONSTRAINT "cobranca_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "public"."produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
