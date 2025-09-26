import { UseCase } from '../use-case'
import type { Cliente } from '@/shared/types'
import { NotFoundError } from '@/shared/errors'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'
import { z } from 'zod'

const buscarClienteSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
})

interface BuscarClienteRequest {
  id: string
}

interface BuscarClienteResult {
  cliente: Cliente
}

type BuscarClienteErrors = NotFoundError

export class BuscarClienteUseCase extends UseCase<
  BuscarClienteRequest,
  BuscarClienteResult,
  BuscarClienteErrors
> {
  protected schema = buscarClienteSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: BuscarClienteRequest): Promise<BuscarClienteResult> {
    const cliente = await this.clienteRepository.findById(data.id)
    
    if (!cliente) {
      throw new NotFoundError('Cliente')
    }

    return {
      cliente
    }
  }
}