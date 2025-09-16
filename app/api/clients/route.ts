import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newClient = await prisma.client.create({
      data: {
        nome: body.nome,
        documento: body.documento,
        email: body.email,
        telefone: body.telefone,
        endereco: body.endereco,
        cpf_socio: body.cpf_socio,
        endereco_socio: body.endereco_socio,
        tributacao: body.tributacao,
        modulos: body.modulos,
        honorarios: parseFloat(body.honorarios),
        observacao: body.observacao,
      },
    });
    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ message: 'Erro ao criar cliente' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json({ message: 'ID do cliente é necessário para atualização' }, { status: 400 });
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...dataToUpdate,
        honorarios: parseFloat(dataToUpdate.honorarios),
      },
    });
    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ message: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}