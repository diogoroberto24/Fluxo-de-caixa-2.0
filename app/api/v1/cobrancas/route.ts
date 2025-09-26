import { NextResponse } from "next/server";
import { CriarCobrancaUseCase } from "@/server/use-cases/cobrancas/criar-cobranca";
import { PrismaCobrancaRepository } from "@/server/infra/repos/implementations/prisma-cobranca-repository";
import { PrismaClienteRepository } from "@/server/infra/repos/implementations/prisma-cliente-repository";
import { PrismaProdutoRepository } from "@/server/infra/repos/implementations/prisma-produto-repository";
import { AppError } from "@/shared/errors";

// Instanciar repositórios
const cobrancaRepository = new PrismaCobrancaRepository();
const clienteRepository = new PrismaClienteRepository();
const produtoRepository = new PrismaProdutoRepository();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const useCase = new CriarCobrancaUseCase(cobrancaRepository, clienteRepository, produtoRepository);
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
    console.error("Erro ao criar cobrança:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}