import { prisma } from '@/lib/db'
import type { Cliente } from '@/shared/types'
import type { CreateClienteInput, UpdateClienteInput, ClienteFilters } from '@/shared/validation/clientes'
import type { ClienteRepository } from '../interfaces/cliente-repository'

export class PrismaClienteRepository implements ClienteRepository {
  async create(data: CreateClienteInput): Promise<Cliente> {
    return await prisma.cliente.create({
      data: {
        ...data,
        honorarios: data.honorarios || 0,
        status: data.status || 'ATIVO',
        ativo: data.ativo ?? true,
        metadata: data.metadata || {}
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async findById(id: string): Promise<Cliente | null> {
    return await prisma.cliente.findUnique({
      where: { id },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    return await prisma.cliente.findUnique({
      where: { documento },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async findMany(filters: ClienteFilters): Promise<{ data: Cliente[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tributacao,
      ativo,
      orderBy = 'nome',
      order = 'asc'
    } = filters

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (tributacao) {
      where.tributacao = tributacao
    }

    if (ativo !== undefined) {
      where.ativo = ativo
    }

    const [data, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          produtos: true,
          cobrancas: true,
          recorrencias: true,
          historico_honorarios: true
        }
      }),
      prisma.cliente.count({ where })
    ])

    return { data, total }
  }

  async update(id: string, data: UpdateClienteInput): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ...data,
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.cliente.update({
      where: { id },
      data: {
        data_de_delecao: new Date(),
        ativo: false
      }
    })
  }

  async activate(id: string): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ativo: true,
        status: 'ATIVO',
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async deactivate(id: string): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ativo: false,
        status: 'INATIVO',
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async exists(documento: string, excludeId?: string): Promise<boolean> {
    const where: any = { documento }
    
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const count = await prisma.cliente.count({ where })
    return count > 0
  }
}