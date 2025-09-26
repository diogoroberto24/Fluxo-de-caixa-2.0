import { UseCase } from '../use-case'
import { createCobrancaSchema, type CreateCobrancaInput } from '@/shared/validation/cobrancas'
import type { Cobranca } from '@/shared/types'
import { NotFoundError } from '@/shared/errors'
import type { CobrancaRepository, ClienteRepository, ProdutoRepository } from '@/server/infra/repos/interfaces'

interface CriarCobrancaRequest extends CreateCobrancaInput {}

interface CriarCobrancaResult {
  cobranca: Cobranca
}

type CriarCobrancaErrors = NotFoundError

export class CriarCobrancaUseCase extends UseCase<
  CriarCobrancaRequest,
  CriarCobrancaResult,
  CriarCobrancaErrors
> {
  protected schema = createCobrancaSchema

  constructor(
    private cobrancaRepository: CobrancaRepository,
    private clienteRepository: ClienteRepository,
    private produtoRepository: ProdutoRepository
  ) {
    super()
  }

  protected async handle(data: CriarCobrancaRequest): Promise<CriarCobrancaResult> {
    // Verificar se o cliente existe (se informado)
    if (data.cliente_id) {
      const cliente = await this.clienteRepository.findById(data.cliente_id)
      if (!cliente) {
        throw new NotFoundError('Cliente')
      }
    }

    // Verificar se todos os produtos dos itens existem
    for (const item of data.itens) {
      const produto = await this.produtoRepository.findById(item.produto_id)
      if (!produto) {
        throw new NotFoundError(`Produto com ID ${item.produto_id}`)
      }
    }

    // Calcular totais
    let subtotal = 0
    for (const item of data.itens) {
      subtotal += item.valor_unitario * item.quantidade
    }

    const total = subtotal - data.desconto

    const cobrancaData = {
      ...data,
      subtotal,
      total
    }

    // Criar a cobrança
    const cobranca = await this.cobrancaRepository.create(cobrancaData)

    return {
      cobranca
    }
  }
}