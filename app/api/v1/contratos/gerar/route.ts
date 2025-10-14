import { NextRequest, NextResponse } from 'next/server'
import { GerarContratoUseCase } from '@/server/use-cases/contratos/gerar-contrato'
import { z } from 'zod'

// Schema de validação
const gerarContratoSchema = z.object({
  clienteId: z.string().min(1, 'ID do cliente é obrigatório'),
  dataContrato: z.string().datetime().optional().refine((date) => {
    if (!date) return true
    const selectedDate = new Date(date)
    const today = new Date()
    return selectedDate <= today
  }, 'A data do contrato não pode ser futura')
})

// POST /api/v1/contratos/gerar - Gera contrato para um cliente específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validationResult = gerarContratoSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Dados inválidos', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { clienteId, dataContrato } = validationResult.data

    const gerarContratoUseCase = new GerarContratoUseCase()
    const resultado = await gerarContratoUseCase.execute(
      clienteId, 
      dataContrato ? new Date(dataContrato) : undefined
    )

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