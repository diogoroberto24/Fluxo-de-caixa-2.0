import { UseCase } from '../use-case'
import { criarClienteSchema, type CreateClienteInput } from '@/shared/validation/clientes'
import type { Cliente } from '@/shared/types'
import { ConflictError, NotFoundError } from '@/shared/errors'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

interface CriarClienteRequest extends CreateClienteInput {}

interface CriarClienteResult {
  cliente: Cliente
}

type CriarClienteErrors = ConflictError | NotFoundError

export class CriarClienteUseCase extends UseCase<
  CriarClienteRequest,
  CriarClienteResult,
  CriarClienteErrors
> {
  protected schema = criarClienteSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: CriarClienteRequest): Promise<CriarClienteResult> {
    // Verificar se já existe cliente com o mesmo documento
    const clienteExistente = await this.clienteRepository.exists(data.documento)
    
    if (clienteExistente) {
      throw new ConflictError('Já existe um cliente com este documento')
    }

    // Criar o cliente
    const cliente = await this.clienteRepository.create(data)

    return {
      cliente
    }
  }
}
