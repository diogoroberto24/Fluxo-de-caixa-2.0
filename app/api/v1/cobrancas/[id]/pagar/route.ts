import { NextResponse } from "next/server";
import { PagarCobrancaUseCase } from "@/server/use-cases/cobrancas/pagar-cobranca";
import { AppError } from "@/shared/errors";

interface RouteParams {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const useCase = new PagarCobrancaUseCase();
    const result = await useCase.execute({
      id: params.id,
      ...body,
    });

    if (result instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          code: result.code,
        },
        { status: result.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao pagar cobrança:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}