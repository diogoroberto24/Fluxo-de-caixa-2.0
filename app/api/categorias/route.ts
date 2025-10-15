import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todas as categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany();
    
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ message: 'Erro ao buscar categorias' }, { status: 500 });
  }
}

// Criar uma nova categoria
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novaCategoria = await prisma.categoria.create({
      data: {
        nome: body.nome,
        descricao: body.descricao
      }
    });
    
    return NextResponse.json(novaCategoria, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ message: 'Erro ao criar categoria' }, { status: 500 });
  }
}