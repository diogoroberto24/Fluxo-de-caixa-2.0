import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

// Atualizar um lançamento do balanço por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Construir objeto de dados apenas com campos que foram fornecidos
    const updateData: any = {};
    
    if (body.tipo !== undefined) updateData.tipo = body.tipo;
    if (body.valor !== undefined) updateData.valor = Math.round(body.valor);
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.data_de_fato !== undefined) updateData.data_de_fato = new Date(body.data_de_fato);
    if (body.cobranca_id !== undefined) updateData.cobranca_id = body.cobranca_id;
    if (body.recorrencia_id !== undefined) updateData.recorrencia_id = body.recorrencia_id;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    
    const balancoAtualizado = await prisma.balanco.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(balancoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao atualizar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}

// Buscar um lançamento do balanço por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const balanco = await prisma.balanco.findUnique({
      where: { id },
      include: {
        cobranca: true,
        recorrencia: true
      }
    });
    
    if (!balanco) {
      return NextResponse.json({ message: 'Lançamento não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(balanco);
  } catch (error) {
    console.error('Erro ao buscar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao buscar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}

// Deletar um lançamento do balanço por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    await prisma.balanco.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Lançamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao deletar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}