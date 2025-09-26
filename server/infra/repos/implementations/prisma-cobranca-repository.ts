import { prisma } from '@/lib/db'
import type { Cobranca } from '@/shared/types'
import type { CreateCobrancaInput, UpdateCobrancaInput, ListCobrancasInput } from '@/shared/validation/cobrancas'
import type { CobrancaRepository } from '../interfaces/cobranca-repository'

export class PrismaCobrancaRepository implements CobrancaRepository {
  async create(data: CreateCobrancaInput): Promise<Cobranca> {
    const { itens, ...cobrancaData } = data

    return await prisma.cobranca.create({
      data: {
        ...cobrancaData,
        metadata: cobrancaData.metadata || {},
        itens: {
          create: itens.map(item => ({
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            valor_unitario: item.valor_unitario,
            subtotal: item.valor_unitario * item.quantidade,
            desconto: item.desconto || 0,
            total: (item.valor_unitario * item.quantidade) - (item.desconto || 0),
            descricao: item.descricao,
            metadata: {}
          }))
        }
      },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        },
        balancos: true
      }
    })
  }

  async findById(id: string): Promise<Cobranca | null> {
    return await prisma.cobranca.findUnique({
      where: { id },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        },
        balancos: true
      }
    })
  }

  async findMany(filters: ListCobrancasInput): Promise<{ data: Cobranca[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      cliente_id,
      cliente_eventual_id,
      data_inicio,
      data_fim,
      orderBy = 'data_de_vencimento',
      order = 'desc'
    } = filters

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { observacoes: { contains: search, mode: 'insensitive' } },
        { cliente: { nome: { contains: search, mode: 'insensitive' } } },
        { cliente_eventual: { nome: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (cliente_id) {
      where.cliente_id = cliente_id
    }

    if (cliente_eventual_id) {
      where.cliente_eventual_id = cliente_eventual_id
    }

    if (data_inicio || data_fim) {
      where.data_de_vencimento = {}
      if (data_inicio) {
        where.data_de_vencimento.gte = data_inicio
      }
      if (data_fim) {
        where.data_de_vencimento.lte = data_fim
      }
    }

    const [data, total] = await Promise.all([
      prisma.cobranca.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          cliente: true,
          cliente_eventual: true,
          itens: {
            include: {
              produto: true
            }
          },
          balancos: true
        }
      }),
      prisma.cobranca.count({ where })
    ])

    return { data, total }
  }

  async update(id: string, data: UpdateCobrancaInput): Promise<Cobranca> {
    return await prisma.cobranca.update({
      where: { id },
      data: {
        ...data,
        data_de_atualizacao: new Date()
      },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        },
        balancos: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.cobranca.delete({
      where: { id }
    })
  }

  async markAsPaid(id: string, metodo_de_pagamento: string): Promise<Cobranca> {
    return await prisma.cobranca.update({
      where: { id },
      data: {
        status: 'PAGO',
        data_de_pagamento: new Date(),
        metodo_de_pagamento,
        data_de_atualizacao: new Date()
      },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        },
        balancos: true
      }
    })
  }

  async markAsCanceled(id: string, motivo: string): Promise<Cobranca> {
    return await prisma.cobranca.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        data_de_cancelamento: new Date(),
        motivo_de_cancelamento: motivo,
        data_de_atualizacao: new Date()
      },
      include: {
        cliente: true,
        cliente_eventual: true,
        itens: {
          include: {
            produto: true
          }
        },
        balancos: true
      }
    })
  }
}