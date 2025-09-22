import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

// Obter histórico de honorários de um cliente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { message: "ID do cliente é necessário" },
        { status: 400 }
      );
    }

    const historicoHonorarios = await prisma.historicoHonorario.findMany({
      where: { cliente_id: clientId },
      orderBy: { data: "desc" },
    });

    return NextResponse.json(historicoHonorarios);
  } catch (error) {
    console.error("Erro ao buscar histórico de honorários:", error);
    return NextResponse.json(
      { message: "Erro ao buscar histórico de honorários" },
      { status: 500 }
    );
  }
}

// Adicionar novo registro ao histórico de honorários
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cliente_id, valor_anterior, valor_novo, motivo, alterado_por } = body;

    if (!cliente_id || valor_novo === undefined) {
      return NextResponse.json(
        { message: "Dados incompletos para registro de histórico" },
        { status: 400 }
      );
    }

    const novoHistorico = await prisma.historicoHonorario.create({
      data: {
        cliente_id,
        valor_anterior: valor_anterior || 0,
        valor_novo,
        motivo: motivo || "Alteração de honorários",
        alterado_por: alterado_por || "Sistema",
      },
    });

    return NextResponse.json(novoHistorico, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar histórico de honorários:", error);
    return NextResponse.json(
      { message: "Erro ao registrar histórico de honorários" },
      { status: 500 }
    );
  }
}