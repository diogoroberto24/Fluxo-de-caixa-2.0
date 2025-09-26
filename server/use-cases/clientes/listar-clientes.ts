import { UseCase } from '../use-case'
import { listarClientesSchema, type ListarClientesRequest } from '@/shared/validation/clientes'
import type { Cliente, PaginatedResponse } from '@/shared/types'
import type { ClienteRepository } from '@/server/infra/repos/interfaces'

interface ListarClientesInput extends ListarClientesRequest {}

interface ListarClientesResult extends PaginatedResponse<Cliente> {}

export class ListarClientesUseCase extends UseCase<
  ListarClientesInput,
  ListarClientesResult
> {
  protected schema = listarClientesSchema

  constructor(private clienteRepository: ClienteRepository) {
    super()
  }

  protected async handle(data: ListarClientesRequest): Promise<ListarClientesResult> {
    const { data: clientes, total } = await this.clienteRepository.findMany(data)

    const totalPages = Math.ceil(total / (data.limit || 20))

    return {
      data: clientes,
      pagination: {
        page: data.page || 1,
        limit: data.limit || 20,
        total,
        totalPages
      }
    }
  }
}