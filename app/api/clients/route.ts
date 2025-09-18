import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

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
        observacao: body.observacao,
      },
    });

    // Se houver um serviço selecionada, cria as associações
    if(body.servicos && body.servicos.lenght > 0){
      for (const servicoId of body.servicos){
        await prisma.clienteServico.create({
          data:{
            clienteId: newClient.id,
            servicoId: servicoId,
            ativo: true
          }
        });
      }
    }

    //Busca cliente com serviços associados
    const clienteCompleto = await prisma.client.findUnique({
      where:{ id: newClient.id },
      include:{
        clienteServicos:{
          include:{
            servico:true
          }
        }
      }
    });

    return NextResponse.json(clienteCompleto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ message: 'Erro ao criar cliente', error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, servicos, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json({ message: 'ID do cliente é necessário para atualização' }, { status: 400 });
    }

    // Atualiza os dados do cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: dataToUpdate,
    });

    if (servicos) {
      await prisma.clienteServico.deleteMany({
        where: { clienteId: id }
      });

      for (const servicoId of servicos){
        await prisma.clienteServico.create({
          data:{
            clienteId: id,
            servicoId: servicoId,
            ativo: true
          }
        });
      }
    }

    const clienteCompleto = await prisma.client.findUnique({
      where: { id },
      include:{
        clienteServicos:{
          include:{
            servico: true
          }
        }
      }
    });

    return NextResponse.json(clienteCompleto, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ message: 'Erro ao atualizar cliente', error: String(error) }, { status: 500 });
  }
}

// Obter todos os clientes
export async function GET(){
  try{
    const clients = await prisma.client.findMany({
      include:{
        clienteServicos:{
          include:{
            servico: true
          }
        }
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ message: 'Erro ao buscar clientes'}, {status: 500});
  }
}

// Obter um cliente específico
export async function getClientById(id: string){
  try{
    const client = await prisma.client.findUnique({
      where: { id },
      include:{
        clienteServicos:{
          include:{
            servico: true
          }
        },
        cobrancas:{
          include:{
            itensCobranca: true
          }
        },
        recorrencias: true
      }
    });

    if (!client){
      return null;
    }

    return client;
  } catch (error){
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}