import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

// import { CriarClienteUseCase } from "@/server/use-cases/clientes/criar-cliente";
// import { AppError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();

//     const useCase = new CriarClienteUseCase();

//    const result = await useCase.execute(body);

//     if (result instanceof AppError) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: result.message,
//           code: result.code,
//         },
//         { status: result.statusCode }
//       );
//     } else {
//     return NextResponse.json(result, { status: 201 });
//     }

    const newClient = await prisma.cliente.create({
      data: {
        nome: body.nome,
        documento: body.documento,
        email: body.email,
        telefone: body.telefone,
        cliente_rua: body.cliente_rua,
        cliente_numero: body.cliente_numero,
        cliente_bairro: body.cliente_bairro,
        cliente_cidade: body.cliente_cidade,
        cliente_estado: body.cliente_estado,
        cliente_pais: body.cliente_pais,
        socio_nome: body.socio_nome,
        socio_documento: body.socio_documento,
        socio_rua: body.socio_rua,
        socio_numero: body.socio_numero,
        socio_bairro: body.socio_bairro,
        socio_cidade: body.socio_cidade,
        socio_estado: body.socio_estado,
        socio_pais: body.socio_pais,
        tributacao: body.tributacao,
        observacao: body.observacao,
        honorarios: body.honorarios || 0,
        status: body.status || "Ativo", //Assumindo um valor padrão se não for fornecido
        ativo: body.ativo ?? true, //Assumindo um valor padrão se não for fornecido
      },
    });

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
