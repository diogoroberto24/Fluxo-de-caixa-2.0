import { NextRequest, NextResponse } from 'next/server'
import { GerarContratoUseCase } from '@/server/use-cases/contratos/gerar-contrato'

// POST /api/v1/contratos/gerar - Gera contrato para um cliente específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clienteId } = body

    if (!clienteId) {
      return NextResponse.json(
        { message: 'ID do cliente é obrigatório' },
        { status: 400 }
      )
    }

    const gerarContratoUseCase = new GerarContratoUseCase()
    const resultado = await gerarContratoUseCase.execute(clienteId)

    return NextResponse.json({
      message: 'Contrato gerado com sucesso',
      contrato: resultado
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao gerar contrato:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao gerar contrato', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}