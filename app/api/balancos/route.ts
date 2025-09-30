import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todos os lançamentos do balanço
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cobrancaId = searchParams.get('cobranca_id');
    
    const where: any = {};
    if (cobrancaId) {
      where.cobranca_id = cobrancaId;
    }
    
    const balancos = await prisma.balanco.findMany({
      where,
      include: {
        cobranca: true,
        recorrencia: true
      }
    });
    
    return NextResponse.json(balancos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos do balanço:', error);
    return NextResponse.json({ message: 'Erro ao buscar lançamentos do balanço' }, { status: 500 });
  }
}

// Criar um novo lançamento no balanço
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novoBalanco = await prisma.balanco.create({
      data: {
        tipo: body.tipo,
        valor: Math.round(body.valor * 100), // Converter para centavos
        descricao: body.descricao,
        status: body.status,
        data_de_fato: new Date(body.data_de_fato),
        cobranca_id: body.cobranca_id,
        recorrencia_id: body.recorrencia_id,
        metadata: body.metadata
      }
    });
    
    return NextResponse.json(novoBalanco, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao criar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}