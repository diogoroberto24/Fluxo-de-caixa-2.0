import { UseCase } from '../use-case'
import { listProdutosSchema, type ListProdutosInput } from '@/shared/validation/produtos'
import type { Produto, PaginatedResponse } from '@/shared/types'
import type { ProdutoRepository } from '@/server/infra/repos/interfaces'

interface ListarProdutosRequest extends ListProdutosInput {}

interface ListarProdutosResult extends PaginatedResponse<Produto> {}

export class ListarProdutosUseCase extends UseCase<
  ListarProdutosRequest,
  ListarProdutosResult
> {
  protected schema = listProdutosSchema

  constructor(private produtoRepository: ProdutoRepository) {
    super()
  }

  protected async handle(data: ListarProdutosRequest): Promise<ListarProdutosResult> {
    const { data: produtos, total } = await this.produtoRepository.findMany(data)

    const totalPages = Math.ceil(total / (data.limit || 20))

    return {
      data: produtos,
      pagination: {
        page: data.page || 1,
        limit: data.limit || 20,
        total,
        totalPages
      }
    }
  }
}