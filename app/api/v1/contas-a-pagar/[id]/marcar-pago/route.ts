import { NextRequest, NextResponse } from "next/server"
import { MarcarComoPagoUseCase } from "@/server/use-cases/contas-a-pagar/marcar-como-pago"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const useCase = new MarcarComoPagoUseCase()
    const result = await useCase.execute({ id: params.id, ...body })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Erro ao marcar conta como paga:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: error.statusCode || 500 }
    )
  }
}