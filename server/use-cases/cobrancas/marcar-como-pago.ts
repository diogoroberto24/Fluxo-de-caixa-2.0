import { UseCase } from '../use-case'
import { marcarComoPagoSchema, type MarcarComoPagoInput } from '@/shared/validation/cobrancas'
import type { Cobranca } from '@/shared/types'
import { NotFoundError, ConflictError } from '@/shared/errors'
import type { CobrancaRepository } from '@/server/infra/repos/interfaces'
import { z } from 'zod'

const marcarComoPagoRequestSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido')
}).merge(marcarComoPagoSchema)

interface MarcarComoPagoRequest {
  id: string
  metodo_de_pagamento: string
  data_de_pagamento?: Date
}

interface MarcarComoPagoResult {
  cobranca: Cobranca
}

type MarcarComoPagoErrors = NotFoundError | ConflictError

export class MarcarComoPagoUseCase extends UseCase<
  MarcarComoPagoRequest,
  MarcarComoPagoResult,
  MarcarComoPagoErrors
> {
  protected schema = marcarComoPagoRequestSchema

  constructor(private cobrancaRepository: CobrancaRepository) {
    super()
  }

  protected async handle(data: MarcarComoPagoRequest): Promise<MarcarComoPagoResult> {
    // Verificar se a cobrança existe
    const cobranca = await this.cobrancaRepository.findById(data.id)
    
    if (!cobranca) {
      throw new NotFoundError('Cobrança')
    }

    // Verificar se a cobrança pode ser marcada como paga
    if (cobranca.status === 'PAGO') {
      throw new ConflictError('Cobrança já está paga')
    }

    if (cobranca.status === 'CANCELADO') {
      throw new ConflictError('Cobrança cancelada não pode ser marcada como paga')
    }

    // Marcar como pago
    const cobrancaPaga = await this.cobrancaRepository.markAsPaid(
      data.id,
      data.metodo_de_pagamento
    )

    return {
      cobranca: cobrancaPaga
    }
  }
}