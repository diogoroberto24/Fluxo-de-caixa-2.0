import { NextRequest, NextResponse } from 'next/server'
import { GerarContratoUseCase } from '@/server/use-cases/contratos/gerar-contrato'
import fs from 'fs'
import path from 'path'

// POST /api/v1/contratos/preview - Gera preview do contrato em PDF
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

    // Ler o arquivo PDF gerado
    const pdfPath = path.join(process.cwd(), 'public', 'contratos', path.basename(resultado.pdfUrl))
    
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { message: 'Arquivo PDF não encontrado' },
        { status: 404 }
      )
    }

    const pdfBuffer = fs.readFileSync(pdfPath)

    // Retornar o PDF como resposta
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview-contrato.pdf"',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Erro ao gerar preview do contrato:', error)
    return NextResponse.json(
      { 
        message: 'Erro ao gerar preview do contrato', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}