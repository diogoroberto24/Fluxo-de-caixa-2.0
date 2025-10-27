import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se o cliente existe
    const client = await prisma.clienteEventual.findUnique({
      where: { id }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Buscar todas as cobranças (parcelas) do cliente eventual
    const parcelas = await prisma.cobranca.findMany({
      where: {
        cliente_eventual_id: id
      },
      orderBy: {
        data_de_vencimento: 'asc'
      }
    })

    return NextResponse.json(parcelas)
  } catch (error) {
    console.error('Erro ao buscar parcelas do cliente eventual:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}