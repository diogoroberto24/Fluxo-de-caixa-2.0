import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true
      }
    });
    
    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ message: 'Erro ao buscar produtos' }, { status: 500 });
  }
}

// Criar um novo produto
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar se já existe uma categoria para módulos
    let categoriaId = body.categoria_id;
    
    if (!categoriaId) {
      // Buscar ou criar categoria "Módulos"
      let categoria = await prisma.categoria.findFirst({
        where: { nome: 'Módulos' }
      });
      
      if (!categoria) {
        categoria = await prisma.categoria.create({
          data: {
            nome: 'Módulos',
            descricao: 'Módulos de serviços contratados'
          }
        });
      }
      
      categoriaId = categoria.id;
    }
    
    const novoProduto = await prisma.produto.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        valor: body.valor || 0,
        tipo: body.tipo || 'servico',
        direcao: body.direcao || 'entrada',
        categoria_id: categoriaId
      }
    });
    
    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ message: 'Erro ao criar produto' }, { status: 500 });
  }
}