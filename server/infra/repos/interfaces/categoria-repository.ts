import type { Categoria } from '@/shared/types'
import type { CreateCategoriaInput, UpdateCategoriaInput, ListCategoriasInput } from '@/shared/validation/categorias'

export interface CategoriaRepository {
  create(data: CreateCategoriaInput): Promise<Categoria>
  findById(id: string): Promise<Categoria | null>
  findMany(filters: ListCategoriasInput): Promise<{
    data: Categoria[]
    total: number
  }>
  update(id: string, data: UpdateCategoriaInput): Promise<Categoria>
  delete(id: string): Promise<void>
  activate(id: string): Promise<Categoria>
  deactivate(id: string): Promise<Categoria>
  exists(nome: string, excludeId?: string): Promise<boolean>
}