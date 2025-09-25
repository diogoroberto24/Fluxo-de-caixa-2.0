import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { id } = params

    const client = await prisma.clienteEventual.update({
      where: { id },
      data: {
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        email: data.email,
        valor_servico: data.valor_servico,
        parcelamento: data.parcelamento,
        observacoes: data.observacoes || null
      }
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Erro ao atualizar cliente eventual:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { reason } = await request.json()
    const { id } = params

    // Soft delete - marcar como deletado
    await prisma.clienteEventual.update({
      where: { id },
      data: {
        ativo: false,
        data_de_delecao: new Date(),
        metadata: {
          motivo_delecao: reason
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir cliente eventual:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}