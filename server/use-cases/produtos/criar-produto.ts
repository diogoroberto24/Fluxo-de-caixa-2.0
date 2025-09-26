import { UseCase } from '../use-case'
import { createProdutoSchema, type CreateProdutoInput } from '@/shared/validation/produtos'
import type { Produto } from '@/shared/types'
import { NotFoundError } from '@/shared/errors'
import type { ProdutoRepository, CategoriaRepository } from '@/server/infra/repos/interfaces'

interface CriarProdutoRequest extends CreateProdutoInput {}

interface CriarProdutoResult {
  produto: Produto
}

type CriarProdutoErrors = NotFoundError

export class CriarProdutoUseCase extends UseCase<
  CriarProdutoRequest,
  CriarProdutoResult,
  CriarProdutoErrors
> {
  protected schema = createProdutoSchema

  constructor(
    private produtoRepository: ProdutoRepository,
    private categoriaRepository: CategoriaRepository
  ) {
    super()
  }

  protected async handle(data: CriarProdutoRequest): Promise<CriarProdutoResult> {
    // Verificar se a categoria existe
    const categoria = await this.categoriaRepository.findById(data.categoria_id)
    
    if (!categoria) {
      throw new NotFoundError('Categoria')
    }

    // Criar o produto
    const produto = await this.produtoRepository.create(data)

    return {
      produto
    }
  }
}