import { NextRequest, NextResponse } from "next/server"
import { CriarContaPagarUseCase } from "@/server/use-cases/contas-a-pagar/criar-conta-pagar"
import { ListarContasPagarUseCase } from "@/server/use-cases/contas-a-pagar/listar-contas-pagar"
import { listContasPagarSchema } from "@/shared/validation/contas-a-pagar"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const useCase = new CriarContaPagarUseCase()
    const result = await useCase.execute(body)

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar conta a pagar:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Criar objeto com os parâmetros da query string
    const queryParams = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
      status: searchParams.get("status") || undefined,
      categoria: searchParams.get("categoria") || undefined,
      recorrencia: searchParams.get("recorrencia") || undefined,
      mes: searchParams.get("mes") ? parseInt(searchParams.get("mes")!) : undefined,
      ano: searchParams.get("ano") ? parseInt(searchParams.get("ano")!) : undefined,
      data_inicio: searchParams.get("data_inicio") || undefined,
      data_fim: searchParams.get("data_fim") || undefined,
      orderBy: searchParams.get("orderBy") || undefined,
      order: searchParams.get("order") || undefined,
    }

    // Validar e aplicar defaults usando o schema Zod
    const filters = listContasPagarSchema.parse(queryParams)

    const useCase = new ListarContasPagarUseCase()
    const result = await useCase.execute(filters)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Erro ao listar contas a pagar:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}