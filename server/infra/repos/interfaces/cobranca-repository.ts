import type { Cobranca } from '@/shared/types'
import type { 
  CreateCobrancaInput, 
  UpdateCobrancaInput, 
  CobrancaFilters 
} from '@/shared/validation/cobrancas'

export interface CobrancaRepository {
  create(data: CreateCobrancaInput): Promise<Cobranca>
  findById(id: string): Promise<Cobranca | null>
  findMany(filters: CobrancaFilters): Promise<{
    data: Cobranca[]
    total: number
  }>
  update(id: string, data: UpdateCobrancaInput): Promise<Cobranca>
  delete(id: string): Promise<void>
  markAsPaid(id: string, metodo_de_pagamento: string): Promise<Cobranca>
  markAsCanceled(id: string, motivo: string): Promise<Cobranca>
}