import { prisma } from "@/lib/db"
import type { ContaPagar, StatusContaPagar, RecorrenciaContaPagar } from "@prisma/client"
import type { ContaPagarRepository } from "../interfaces/conta-pagar-repository"

export class PrismaContaPagarRepository implements ContaPagarRepository {
  async create(data: {
    descricao: string
    valor: number
    categoria: string
    data_vencimento: Date
    recorrencia: RecorrenciaContaPagar
  }): Promise<ContaPagar> {
    return await prisma.contaPagar.create({
      data: {
        ...data,
        status: "PENDENTE",
      },
    })
  }

  async findById(id: string): Promise<ContaPagar | null> {
    return await prisma.contaPagar.findUnique({
      where: { id },
    })
  }

  async findMany(filters?: {
    page?: number
    limit?: number
    status?: StatusContaPagar
    categoria?: string
    recorrencia?: RecorrenciaContaPagar
    mes?: number
    ano?: number
    data_inicio?: Date
    data_fim?: Date
    orderBy?: string
    order?: 'asc' | 'desc'
  }): Promise<ContaPagar[]> {
    const where: any = {
      ativo: true,
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.categoria) {
      where.categoria = filters.categoria
    }

    if (filters?.recorrencia) {
      where.recorrencia = filters.recorrencia
    }

    if (filters?.mes && filters?.ano) {
      const dataInicio = new Date(filters.ano, filters.mes - 1, 1)
      const dataFim = new Date(filters.ano, filters.mes, 0, 23, 59, 59)
      
      where.data_vencimento = {
        gte: dataInicio,
        lte: dataFim,
      }
    } else if (filters?.data_inicio || filters?.data_fim) {
      where.data_vencimento = {}
      
      if (filters.data_inicio) {
        where.data_vencimento.gte = filters.data_inicio
      }
      
      if (filters.data_fim) {
        where.data_vencimento.lte = filters.data_fim
      }
    }

    const orderBy: any = {}
    const orderByField = filters?.orderBy || 'data_vencimento'
    const orderDirection = filters?.order || 'asc'
    orderBy[orderByField] = orderDirection

    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const skip = (page - 1) * limit

    return await prisma.contaPagar.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })
  }

  async update(id: string, data: Partial<{
    descricao: string
    valor: number
    categoria: string
    data_vencimento: Date
    recorrencia: RecorrenciaContaPagar
    status: StatusContaPagar
    data_pagamento: Date
    metadata: Record<string, any>
  }>): Promise<ContaPagar> {
    return await prisma.contaPagar.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.contaPagar.update({
      where: { id },
      data: {
        ativo: false,
        data_de_delecao: new Date(),
      },
    })
  }

  async findVencidas(): Promise<ContaPagar[]> {
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    return await prisma.contaPagar.findMany({
      where: {
        ativo: true,
        status: "PENDENTE",
        data_vencimento: {
          lt: hoje,
        },
      },
      orderBy: { data_vencimento: "asc" },
    })
  }

  async atualizarContasVencidas(): Promise<void> {
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    await prisma.contaPagar.updateMany({
      where: {
        ativo: true,
        status: "PENDENTE",
        data_vencimento: {
          lt: hoje,
        },
      },
      data: {
        status: "VENCIDO",
      },
    })
  }

  async findByMesAno(mes: number, ano: number): Promise<ContaPagar[]> {
    const dataInicio = new Date(ano, mes - 1, 1)
    const dataFim = new Date(ano, mes, 0, 23, 59, 59)

    return await prisma.contaPagar.findMany({
      where: {
        ativo: true,
        data_vencimento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: { data_vencimento: "asc" },
    })
  }

  async findByDateRange(dataInicio: Date, dataFim: Date): Promise<ContaPagar[]> {
    return await prisma.contaPagar.findMany({
      where: {
        ativo: true,
        data_vencimento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      orderBy: { data_vencimento: "asc" },
    })
  }

  async calcularTotalPorPeriodo(
    dataInicio: Date, 
    dataFim: Date, 
    status?: StatusContaPagar
  ): Promise<number> {
    const where: any = {
      ativo: true,
      data_vencimento: {
        gte: dataInicio,
        lte: dataFim,
      },
    }

    if (status) {
      where.status = status
    }

    const result = await prisma.contaPagar.aggregate({
      where,
      _sum: {
        valor: true,
      },
    })

    return result._sum.valor || 0
  }
}