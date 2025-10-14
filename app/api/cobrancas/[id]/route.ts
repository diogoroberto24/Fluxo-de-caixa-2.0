import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// Atualizar uma cobrança específica
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const cobrancaAtualizada = await prisma.cobranca.update({
      where: { id },
      data: {
        status: body.status,
        data_de_pagamento: body.data_de_pagamento ? new Date(body.data_de_pagamento) : null,
        metodo_de_pagamento: body.metodo_de_pagamento,
        observacoes: body.observacoes,
      },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    // Se marcada como paga, atualizar/registrar no balanço sem duplicar
    if (cobrancaAtualizada.status === 'pago') {
      const dataFato = body.data_de_pagamento ? new Date(body.data_de_pagamento) : new Date();
      const descricaoBase = cobrancaAtualizada.cliente
        ? `Pagamento - Cliente: ${cobrancaAtualizada.cliente.nome}`
        : cobrancaAtualizada.cliente_eventual
          ? `Pagamento - Cliente eventual: ${cobrancaAtualizada.cliente_eventual.nome}`
          : `Pagamento - Cobrança ${cobrancaAtualizada.id}`;

      const balancoExistente = await prisma.balanco.findFirst({
        where: { cobranca_id: id, tipo: 'ENTRADA' },
      });

      if (balancoExistente) {
        await prisma.balanco.update({
          where: { id: balancoExistente.id },
          data: {
            status: 'confirmado',
            data_de_fato: dataFato,
            descricao: descricaoBase,
          },
        });
      } else {
        await prisma.balanco.create({
          data: {
            tipo: 'ENTRADA',
            valor: cobrancaAtualizada.total,
            descricao: descricaoBase,
            status: 'confirmado',
            data_de_fato: dataFato,
            cobranca_id: id,
            metadata: { categoria: 'Serviços' },
          },
        });
      }
    }

    return NextResponse.json(cobrancaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar cobrança:', error);
    return NextResponse.json({ message: 'Erro ao atualizar cobrança', error: String(error) }, { status: 500 });
  }
}

// Obter uma cobrança específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const cobranca = await prisma.cobranca.findUnique({
      where: { id },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!cobranca) {
      return NextResponse.json({ message: 'Cobrança não encontrada' }, { status: 404 });
    }

    return NextResponse.json(cobranca);
  } catch (error) {
    console.error('Erro ao buscar cobrança:', error);
    return NextResponse.json({ message: 'Erro ao buscar cobrança', error: String(error) }, { status: 500 });
  }
}