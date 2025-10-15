import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import { deleteContaPagarSchema, type DeleteContaPagarRequest } from "@/shared/validation/contas-a-pagar"
import { AppError, NotFoundError } from "@/shared/errors"

type Request = DeleteContaPagarRequest

type Result = {
  success: boolean
}

type Errors = AppError | NotFoundError

export class DeletarContaPagarUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { id } = request

    // Verificar se a conta existe
    const conta = await this.contaPagarRepository.findById(id)
    if (!conta) {
      throw new NotFoundError("Conta a pagar não encontrada")
    }

    if (conta.status === "PAGO") {
      throw new AppError("Não é possível excluir uma conta que já foi paga")
    }

    // Deletar (soft delete)
    await this.contaPagarRepository.delete(id)

    return {
      success: true,
    }
  }

  protected getValidationSchema() {
    return deleteContaPagarSchema
  }
}