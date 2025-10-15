import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import type { BalancoRepository } from "@/server/infra/repos/interfaces/balanco-repository"
import { PrismaBalancoRepository } from "@/server/infra/repos/implementations/prisma-balanco-repository"
import { marcarComoPagoSchema, type MarcarComoPagoRequest } from "@/shared/validation/contas-a-pagar"
import { createBalancoSchema } from "@/shared/validation/balancos"
import type { ContaPagar } from "@prisma/client"
import { AppError, NotFoundError } from "@/shared/errors"
import { Money } from "@/shared/utils/money"

type Request = MarcarComoPagoRequest

type Result = {
  conta: ContaPagar
}

type Errors = AppError

export class MarcarComoPagoUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository
  private balancoRepository: BalancoRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
    this.balancoRepository = new PrismaBalancoRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { id, data_pagamento } = request

    // Buscar conta
    const conta = await this.contaPagarRepository.findById(id)
    if (!conta) {
      throw new NotFoundError("Conta a pagar não encontrada")
    }

    if (conta.status === "PAGO") {
      throw new AppError("Conta já foi paga")
    }

    const dataPagamento = data_pagamento ? new Date(data_pagamento) : new Date()

    // Marcar como pago
    const contaAtualizada = await this.contaPagarRepository.update(id, {
      status: "PAGO",
      data_pagamento: dataPagamento,
    })

    // Validar e criar lançamento no balanço
    const balancoData = createBalancoSchema.parse({
      tipo: "SAIDA",
      valor: Money.fromCentavos(conta.valor).reais,
      descricao: `Pagamento: ${conta.descricao}`,
      data_de_fato: dataPagamento,
      status: "confirmado",
      conta_pagar_id: conta.id,
    })

    await this.balancoRepository.criar(balancoData)

    return {
      conta: contaAtualizada,
    }
  }

  protected getValidationSchema() {
    return marcarComoPagoSchema
  }
}