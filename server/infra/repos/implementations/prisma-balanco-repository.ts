import { prisma } from "@/lib/db";
import type { BalancoRepository } from "../interfaces/balanco-repository";
import type { Balanco, BalancoTipo } from "@/shared/types";
import type { CreateBalancoInput, AtualizarBalancoRequest, BalancoFilters } from "@/shared/validation/balancos";

export class PrismaBalancoRepository implements BalancoRepository {
  async criar(data: CreateBalancoInput): Promise<Balanco> {
    return await prisma.balanco.create({
      data: {
        tipo: data.tipo,
        valor: data.valor.centavos,
        descricao: data.descricao,
        status: data.status,
        data_de_fato: new Date(data.data_de_fato),
        cobranca_id: data.cobranca_id,
        recorrencia_id: data.recorrencia_id,
        conta_pagar_id: data.conta_pagar_id,
        metadata: data.metadata || {},
      },
    });
  }

  async buscarPorId(id: string): Promise<Balanco | null> {
    return await prisma.balanco.findUnique({
      where: { id },
    });
  }

  async listar(
    filters: BalancoFilters,
    page: number,
    limit: number
  ): Promise<{ balancos: Balanco[]; total: number }> {
    const where: any = {};

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters.data_inicio && filters.data_fim) {
      where.data_de_fato = {
        gte: new Date(filters.data_inicio),
        lte: new Date(filters.data_fim),
      };
    }

    const [balancos, total] = await Promise.all([
      prisma.balanco.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { data_de_fato: "desc" },
      }),
      prisma.balanco.count({ where }),
    ]);

    return { balancos, total };
  }

  async atualizar(id: string, data: Omit<AtualizarBalancoRequest, 'id'>): Promise<Balanco> {
    return await prisma.balanco.update({
      where: { id },
      data: {
        ...data,
        data_de_fato: data.data_de_fato ? new Date(data.data_de_fato) : undefined,
      },
    });
  }

  async deletar(id: string): Promise<void> {
    await prisma.balanco.delete({
      where: { id },
    });
  }

  async calcularSaldo(dataInicio?: Date, dataFim?: Date): Promise<number> {
    const where: any = {};

    if (dataInicio && dataFim) {
      where.data_de_fato = {
        gte: dataInicio,
        lte: dataFim,
      };
    }

    const result = await prisma.balanco.aggregate({
      where,
      _sum: {
        valor: true,
      },
    });

    return result._sum.valor || 0;
  }

  async buscarPorPeriodo(dataInicio: Date, dataFim: Date): Promise<Balanco[]> {
    return await prisma.balanco.findMany({
      where: {
        data_de_fato: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: { data_de_fato: "asc" },
    });
  }

  async buscarPorPeriodoETipo(dataInicio: Date, dataFim: Date, tipo: BalancoTipo): Promise<Balanco[]> {
    return await prisma.balanco.findMany({
      where: {
        data_de_fato: {
          gte: dataInicio,
          lte: dataFim,
        },
        tipo: tipo,
      },
      orderBy: { data_de_fato: "asc" },
    });
  }
}