import { UseCase } from '../use-case'
import { atualizarClienteSchema, type AtualizarClienteRequest } from '@/shared/validation/clientes'
import type { Cliente } from '@/shared/types'
import { ConflictError, NotFoundError } from '@/shared/errors'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

interface AtualizarClienteInput extends AtualizarClienteRequest {}

interface AtualizarClienteResult {
  cliente: Cliente
}

type AtualizarClienteErrors = ConflictError | NotFoundError

export class AtualizarClienteUseCase extends UseCase<
  AtualizarClienteInput,
  AtualizarClienteResult,
  AtualizarClienteErrors
> {
  protected schema = atualizarClienteSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: AtualizarClienteRequest): Promise<AtualizarClienteResult> {
    const { id, ...updateData } = data

    // Verificar se o cliente existe
    const clienteExistente = await this.clienteRepository.findById(id)
    
    if (!clienteExistente) {
      throw new NotFoundError('Cliente')
    }

    // Verificar se o documento não está sendo usado por outro cliente
    if (updateData.documento) {
      const documentoEmUso = await this.clienteRepository.exists(updateData.documento, id)
      
      if (documentoEmUso) {
        throw new ConflictError('Já existe um cliente com este documento')
      }
    }

    // Atualizar o cliente
    const cliente = await this.clienteRepository.update(id, updateData)

    return {
      cliente
    }
  }
}