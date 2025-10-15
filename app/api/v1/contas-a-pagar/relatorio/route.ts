import { NextRequest, NextResponse } from "next/server"
import { RelatorioComparativoUseCase } from "@/server/use-cases/contas-a-pagar/relatorio-comparativo"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mes = parseInt(searchParams.get("mes") || new Date().getMonth() + 1 + "")
    const ano = parseInt(searchParams.get("ano") || new Date().getFullYear() + "")

    // Validar se a data não é muito futura
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    
    if (ano > currentYear + 1 || (ano === currentYear + 1 && mes > currentMonth)) {
      return NextResponse.json({ error: 'Data muito futura' }, { status: 400 })
    }

    const useCase = new RelatorioComparativoUseCase()
    const result = await useCase.execute({ mes, ano })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Erro ao gerar relatório comparativo:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}