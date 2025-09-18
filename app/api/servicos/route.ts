import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todos os serviços
export async function GET() {
  try {
    const servicos = await prisma.servico.findMany({
      include: {
        categoria: true
      }
    });
    
    return NextResponse.json(servicos);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ message: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

// Criar um novo serviço
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novoServico = await prisma.servico.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        valor: parseFloat(body.valor),
        categoriaId: body.categoriaId
      }
    });
    
    return NextResponse.json(novoServico, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ message: 'Erro ao criar serviço' }, { status: 500 });
  }
}