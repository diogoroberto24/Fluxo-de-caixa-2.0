import { NextRequest, NextResponse } from "next/server"
import { AtualizarContaPagarUseCase } from "@/server/use-cases/contas-a-pagar/atualizar-conta-pagar"
import { DeletarContaPagarUseCase } from "@/server/use-cases/contas-a-pagar/deletar-conta-pagar"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const useCase = new AtualizarContaPagarUseCase()
    const result = await useCase.execute({ id: params.id, ...body })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Erro ao atualizar conta a pagar:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const useCase = new DeletarContaPagarUseCase()
    const result = await useCase.execute({ id: params.id })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Erro ao deletar conta a pagar:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}