import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todos os lançamentos do balanço
export async function GET() {
  try {
    const balancos = await prisma.balanco.findMany({
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
        valor: Math.round(body.valor), // Converter para centavos
        descricao: body.descricao,
        status: body.status,
        data_de_fato: new Date(body.data_de_fato),
        cobranca_id: body.cobranca_id,
        recorrencia_id: body.recorrencia_id,
      }
    });
    
    return NextResponse.json(novoBalanco, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao criar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}