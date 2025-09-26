import { prisma } from '@/lib/db'
import type { Categoria } from '@/shared/types'
import type { CreateCategoriaInput, UpdateCategoriaInput, ListCategoriasInput } from '@/shared/validation/categorias'
import type { CategoriaRepository } from '../interfaces/categoria-repository'

export class PrismaCategoriaRepository implements CategoriaRepository {
  async create(data: CreateCategoriaInput): Promise<Categoria> {
    return await prisma.categoria.create({
      data: {
        ...data,
        ativo: data.ativo ?? true,
        metadata: data.metadata || {}
      },
      include: {
        produtos: true
      }
    })
  }

  async findById(id: string): Promise<Categoria | null> {
    return await prisma.categoria.findUnique({
      where: { id },
      include: {
        produtos: true
      }
    })
  }

  async findMany(filters: ListCategoriasInput): Promise<{ data: Categoria[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
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

    if (ativo !== undefined) {
      where.ativo = ativo
    }

    const [data, total] = await Promise.all([
      prisma.categoria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          produtos: true
        }
      }),
      prisma.categoria.count({ where })
    ])

    return { data, total }
  }

  async update(id: string, data: UpdateCategoriaInput): Promise<Categoria> {
    return await prisma.categoria.update({
      where: { id },
      data: {
        ...data,
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.categoria.update({
      where: { id },
      data: {
        data_de_delecao: new Date(),
        ativo: false
      }
    })
  }

  async activate(id: string): Promise<Categoria> {
    return await prisma.categoria.update({
      where: { id },
      data: {
        ativo: true,
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true
      }
    })
  }

  async deactivate(id: string): Promise<Categoria> {
    return await prisma.categoria.update({
      where: { id },
      data: {
        ativo: false,
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true
      }
    })
  }

  async exists(nome: string, excludeId?: string): Promise<boolean> {
    const where: any = { nome }
    
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const count = await prisma.categoria.count({ where })
    return count > 0
  }
}