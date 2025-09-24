import { NextResponse } from "next/server";
import { getClientById } from "../route"; // Importa a função auxiliar
import { prisma } from "../../../../lib/db";

interface ClientContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: ClientContext) {
  try {
    const { id } = context.params;
    const client = await getClientById(id);

    if (!client) {
      return NextResponse.json({ message: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente por ID:", error);
    return NextResponse.json({ message: "Erro ao buscar cliente" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: ClientContext) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Verificar se o cliente existe
    const existingClient = await prisma.cliente.findUnique({
      where: { id }
    });

    if (!existingClient) {
      return NextResponse.json({ message: "Cliente não encontrado" }, { status: 404 });
    }

    // Atualizar o cliente
    const updatedClient = await prisma.cliente.update({
      where: { id },
      data: {
        nome: body.nome ?? existingClient.nome,
        documento: body.documento ?? existingClient.documento,
        email: body.email ?? existingClient.email,
        telefone: body.telefone ?? existingClient.telefone,
        cliente_rua: body.cliente_rua ?? existingClient.cliente_rua,
        cliente_numero: body.cliente_numero ?? existingClient.cliente_numero,
        cliente_bairro: body.cliente_bairro ?? existingClient.cliente_bairro,
        cliente_cidade: body.cliente_cidade ?? existingClient.cliente_cidade,
        cliente_estado: body.cliente_estado ?? existingClient.cliente_estado,
        cliente_pais: body.cliente_pais ?? existingClient.cliente_pais,
        socio_nome: body.socio_nome ?? existingClient.socio_nome,
        socio_documento: body.socio_documento ?? existingClient.socio_documento,
        socio_rua: body.socio_rua ?? existingClient.socio_rua,
        socio_numero: body.socio_numero ?? existingClient.socio_numero,
        socio_bairro: body.socio_bairro ?? existingClient.socio_bairro,
        socio_cidade: body.socio_cidade ?? existingClient.socio_cidade,
        socio_estado: body.socio_estado ?? existingClient.socio_estado,
        socio_pais: body.socio_pais ?? existingClient.socio_pais,
        tributacao: body.tributacao ?? existingClient.tributacao,
        honorarios: body.honorarios ?? existingClient.honorarios,
        observacao: body.observacao ?? existingClient.observacao,
        status: body.status ?? existingClient.status,
        ativo: body.ativo ?? existingClient.ativo
      },
      include: {
        produtos: {
          include: {
            produto: true,
          },
        },
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar cliente", error: String(error) },
      { status: 500 }
    );
  }
}