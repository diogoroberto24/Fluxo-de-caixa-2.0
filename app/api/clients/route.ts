// Arquivo: app/api/clients/route.ts
// Ajustes: import dos utilitários e normalização de data_pagamento_mensal

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import type { CreateClienteInput } from "@/shared/validation/clientes";
import { normalizeDateOnly, nowUTCDateOnly } from "@/shared/utils/date";

// import { CriarClienteUseCase } from "@/server/use-cases/clientes/criar-cliente";
// import { AppError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body: CreateClienteInput = await request.json();

    // Validação de campos obrigatórios
    if (!body.nome || !body.documento || !body.tributacao) {
      return NextResponse.json(
        { message: "Campos obrigatórios: nome, documento e tributação" },
        { status: 400 }
      );
    }

    // Verificar se o documento já existe
    const existingClient = await prisma.cliente.findUnique({
      where: { documento: body.documento }
    });

    if (existingClient) {
      return NextResponse.json(
        { message: "Já existe um cliente com este documento" },
        { status: 400 }
      );
    }

    const newClient = await prisma.cliente.create({
      data: {
        nome: body.nome,
        documento: body.documento,
        email: body.email || "",
        telefone: body.telefone || "",
        cliente_rua: body.cliente_rua || "",
        cliente_numero: body.cliente_numero || "",
        cliente_bairro: body.cliente_bairro || "",
        cliente_cidade: body.cliente_cidade || "",
        cliente_estado: body.cliente_estado || "",
        cliente_pais: body.cliente_pais || "Brasil",
        socio_nome: body.socio_nome || "",
        socio_documento: body.socio_documento || "",
        socio_rua: body.socio_rua || "",
        socio_numero: body.socio_numero || "",
        socio_bairro: body.socio_bairro || "",
        socio_cidade: body.socio_cidade || "",
        socio_estado: body.socio_estado || "",
        socio_pais: body.socio_pais || "Brasil",
        representante_nome: body.representante_nome || "",
        representante_rg: body.representante_rg || "",
        representante_cpf: body.representante_cpf || "",
        representante_rua: body.representante_rua || "",
        representante_bairro: body.representante_bairro || "",
        representante_municipio: body.representante_municipio || "",
        representante_cep: body.representante_cep || "",
        data_pagamento_mensal: normalizeDateOnly(body.data_pagamento_mensal) ?? nowUTCDateOnly(),
        tributacao: body.tributacao,
        observacao: body.observacao || "",
        honorarios: body.honorarios || 0,
        status: body.status || "Ativo",
        ativo: body.ativo ?? true,
      },
    });

    // Registro automático: primeiro pagamento de cliente fixo
    if (newClient.honorarios && newClient.honorarios > 0) {
      const today = new Date();
      const vencimento = today.toISOString().split('T')[0];

      const cobrancaInicial = await prisma.cobranca.create({
        data: {
          subtotal: newClient.honorarios,
          desconto: 0,
          total: newClient.honorarios,
          status: 'pago',
          data_de_vencimento: vencimento,
          data_de_pagamento: today,
          metodo_de_pagamento: 'PIX',
          observacoes: `Primeiro pagamento automático - ${newClient.nome}`,
          cliente_id: newClient.id,
        },
      });

      await prisma.balanco.create({
        data: {
          tipo: 'ENTRADA',
          valor: newClient.honorarios,
          descricao: `Honorários iniciais - Cliente fixo: ${newClient.nome}`,
          status: 'confirmado',
          data_de_fato: today,
          cobranca_id: cobrancaInicial.id,
          metadata: { categoria: 'Honorários' },
        },
      });
    }

    // Se houver um serviço selecionada, cria as associações
    if (body.produtos && body.produtos.length > 0) {
      for (const produtoData of body.produtos) {
        await prisma.clienteProduto.create({
          data: {
            cliente_id: newClient.id,
            produto_id: produtoData.produto_id,
            quantidade: produtoData.quantidade || 1,
            nome: produtoData.nome,
            descricao: produtoData.descricao,
            valor: produtoData.valor || 0,
            status: produtoData.status || "Ativo",
            ativo: produtoData.ativo ?? true,
          },
        });
      }
    }

    //Busca cliente com serviços associados
    const clienteCompleto = await prisma.cliente.findUnique({
      where: { id: newClient.id },
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
      },
    });

    return NextResponse.json(clienteCompleto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao criar cliente", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, produtos, modulos, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json(
        { message: "ID do cliente é necessário para atualização" },
        { status: 400 }
      );
    }

    // Atualiza os dados do cliente
    const updatedClient = await prisma.cliente.update({
      where: { id },
      data: {
        nome: dataToUpdate.nome,
        documento: dataToUpdate.documento,
        email: dataToUpdate.email,
        telefone: dataToUpdate.telefone,
        cliente_rua: dataToUpdate.cliente_rua,
        cliente_numero: dataToUpdate.cliente_numero,
        cliente_bairro: dataToUpdate.cliente_bairro,
        cliente_cidade: dataToUpdate.cliente_cidade,
        cliente_estado: dataToUpdate.cliente_estado,
        cliente_pais: dataToUpdate.cliente_pais,
        socio_nome: dataToUpdate.socio_nome,
        socio_documento: dataToUpdate.socio_documento,
        socio_rua: dataToUpdate.socio_rua,
        socio_numero: dataToUpdate.socio_numero,
        socio_bairro: dataToUpdate.socio_bairro,
        socio_cidade: dataToUpdate.socio_cidade,
        socio_estado: dataToUpdate.socio_estado,
        socio_pais: dataToUpdate.socio_pais,
        // Padroniza a data de pagamento mensal (se vier no body)
        data_pagamento_mensal: dataToUpdate.data_pagamento_mensal
          ? normalizeDateOnly(dataToUpdate.data_pagamento_mensal) ?? undefined
          : undefined,
        tributacao: dataToUpdate.tributacao,
        honorarios: dataToUpdate.honorarios,
        observacao: dataToUpdate.observacao,
        status: dataToUpdate.status,
        ativo: dataToUpdate.ativo
      },
    });

    if (body.produtos) {
      await prisma.clienteProduto.deleteMany({
        where: { cliente_id: id },
      });

      for (const produtoData of body.produtos) {
        await prisma.clienteProduto.create({
          data: {
            cliente_id: id,
            produto_id: produtoData.produto_id,
            quantidade: produtoData.quantidade,
            nome: produtoData.nome,
            descricao: produtoData.descricao,
            valor: produtoData.valor,
            status: produtoData.status || "Ativo",
            ativo: produtoData.ativo ?? true,
          },
        });
      }
    }

    const clienteCompleto = await prisma.cliente.findUnique({
      where: { id },
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
      },
    });

    return NextResponse.json(clienteCompleto, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar cliente", error: String(error) },
      { status: 500 }
    );
  }
}

// Obter todos os clientes
export async function GET() {
  try {
    const clients = await prisma.cliente.findMany({
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
        cobrancas: {
          where: {
            status: 'pago'
          },
          orderBy: {
            data_de_pagamento: 'desc'
          },
          take: 1
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json(
      { message: "Erro ao buscar clientes" },
      { status: 500 }
    );
  }
}

// Obter um cliente específico
export async function getClientById(id: string) {
  try {
    const client = await prisma.cliente.findUnique({
      where: { id },
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
        cobrancas: {
          include: {
            itens: true,
          },
        },
        recorrencias: true,
      },
    });

    if (!client) {
      return null;
    }

    return client;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}
