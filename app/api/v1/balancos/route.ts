import { NextResponse } from "next/server";
import { CriarBalancoUseCase } from "@/server/use-cases/balancos/criar-balanco";
import { AppError } from "@/shared/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new CriarBalancoUseCase();
    const result = await useCase.execute(body);

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

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar balanço:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
