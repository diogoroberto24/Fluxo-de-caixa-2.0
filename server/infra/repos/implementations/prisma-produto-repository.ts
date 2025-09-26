import { prisma } from '@/lib/db'
import type { Produto } from '@/shared/types'
import type { CreateProdutoInput, UpdateProdutoInput, ListProdutosInput } from '@/shared/validation/produtos'
import type { ProdutoRepository } from '../interfaces/produto-repository'

export class PrismaProdutoRepository implements ProdutoRepository {
  async create(data: CreateProdutoInput): Promise<Produto> {
    return await prisma.produto.create({
      data: {
        ...data,
        ativo: data.ativo ?? true,
        metadata: data.metadata || {}
      },
      include: {
        categoria: true,
        clientes: true,
        cobrancas: true,
        recorrencias: true
      }
    })
  }

  async findById(id: string): Promise<Produto | null> {
    return await prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        clientes: true,
        cobrancas: true,
        recorrencias: true
      }
    })
  }

  async findMany(filters: ListProdutosInput): Promise<{ data: Produto[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      tipo,
      direcao,
      categoria_id,
      ativo,
      orderBy = 'nome',
      order = 'asc'
    } = filters

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tipo) {
      where.tipo = tipo
    }

    if (direcao) {
      where.direcao = direcao
    }

    if (categoria_id) {
      where.categoria_id = categoria_id
    }

    if (ativo !== undefined) {
      where.ativo = ativo
    }

    const [data, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          categoria: true,
          clientes: true,
          cobrancas: true,
          recorrencias: true
        }
      }),
      prisma.produto.count({ where })
    ])

    return { data, total }
  }

  async update(id: string, data: UpdateProdutoInput): Promise<Produto> {
    return await prisma.produto.update({
      where: { id },
      data: {
        ...data,
        data_de_atualizacao: new Date()
      },
      include: {
        categoria: true,
        clientes: true,
        cobrancas: true,
        recorrencias: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.produto.update({
      where: { id },
      data: {
        data_de_delecao: new Date(),
        ativo: false
      }
    })
  }

  async activate(id: string): Promise<Produto> {
    return await prisma.produto.update({
      where: { id },
      data: {
        ativo: true,
        data_de_atualizacao: new Date()
      },
      include: {
        categoria: true,
        clientes: true,
        cobrancas: true,
        recorrencias: true
      }
    })
  }

  async deactivate(id: string): Promise<Produto> {
    return await prisma.produto.update({
      where: { id },
      data: {
        ativo: false,
        data_de_atualizacao: new Date()
      },
      include: {
        categoria: true,
        clientes: true,
        cobrancas: true,
        recorrencias: true
      }
    })
  }
}