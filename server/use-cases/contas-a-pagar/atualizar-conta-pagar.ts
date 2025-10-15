import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import { updateContaPagarSchema, type UpdateContaPagarRequest } from "@/shared/validation/contas-a-pagar"
import type { ContaPagar, StatusContaPagar, RecorrenciaContaPagar } from "@prisma/client"
import { AppError, NotFoundError } from "@/shared/errors"

type Request = UpdateContaPagarRequest

type Result = {
  conta: ContaPagar
}

type Errors = AppError | NotFoundError

export class AtualizarContaPagarUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { id, ...updateData } = request

    // Verificar se a conta existe
    const contaExistente = await this.contaPagarRepository.findById(id)
    if (!contaExistente) {
      throw new NotFoundError("Conta a pagar não encontrada")
    }

    // Não permitir atualizar contas já pagas
    if (contaExistente.status === "PAGO") {
      throw new AppError("Não é possível atualizar uma conta que já foi paga")
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {}

    if (updateData.descricao) {
      dadosAtualizacao.descricao = updateData.descricao
    }

    if (updateData.valor) {
      dadosAtualizacao.valor = Math.round(updateData.valor * 100)
    }

    if (updateData.categoria) {
      dadosAtualizacao.categoria = updateData.categoria
    }

    if (updateData.data_vencimento) {
      dadosAtualizacao.data_vencimento = new Date(updateData.data_vencimento)
    }

    if (updateData.recorrencia) {
      dadosAtualizacao.recorrencia = updateData.recorrencia as RecorrenciaContaPagar
    }

    if (updateData.metadata) {
      dadosAtualizacao.metadata = updateData.metadata
    }

    // Atualizar a conta
    const conta = await this.contaPagarRepository.update(id, dadosAtualizacao)

    return {
      conta,
    }
  }

  protected getValidationSchema() {
    return updateContaPagarSchema
  }
}