import type { Cliente } from '@/shared/types'
import type { CreateClienteInput, UpdateClienteInput, ClienteFilters } from '@/shared/validation/clientes'

export interface ClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>
  findById(id: string): Promise<Cliente | null>
  findByDocumento(documento: string): Promise<Cliente | null>
  findMany(filters: ClienteFilters): Promise<{
    data: Cliente[]
    total: number
  }>
  update(id: string, data: UpdateClienteInput): Promise<Cliente>
  delete(id: string): Promise<void>
  activate(id: string): Promise<Cliente>
  deactivate(id: string): Promise<Cliente>
  exists(documento: string, excludeId?: string): Promise<boolean>
}