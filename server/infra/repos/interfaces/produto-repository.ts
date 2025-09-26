import type { Produto } from '@/shared/types'
import type { CreateProdutoInput, UpdateProdutoInput, ListProdutosInput } from '@/shared/validation/produtos'

export interface ProdutoRepository {
  create(data: CreateProdutoInput): Promise<Produto>
  findById(id: string): Promise<Produto | null>
  findMany(filters: ListProdutosInput): Promise<{
    data: Produto[]
    total: number
  }>
  update(id: string, data: UpdateProdutoInput): Promise<Produto>
  delete(id: string): Promise<void>
  activate(id: string): Promise<Produto>
  deactivate(id: string): Promise<Produto>
}