import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import { createContaPagarSchema, type CreateContaPagarRequest } from "@/shared/validation/contas-a-pagar"
import type { ContaPagar, RecorrenciaContaPagar } from "@prisma/client"
import { AppError } from "@/shared/errors"

type Request = CreateContaPagarRequest

type Result = {
  conta: ContaPagar
  contasRecorrentes?: ContaPagar[]
}

type Errors = AppError

export class CriarContaPagarUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { descricao, valor, categoria, data_vencimento, recorrencia } = request

    // Converter valor para centavos se necessário
    const valorEmCentavos = Math.round(valor * 100)

    // Criar a conta principal
    const conta = await this.contaPagarRepository.create({
      descricao,
      valor: valorEmCentavos,
      categoria,
      data_vencimento: new Date(data_vencimento),
      recorrencia: recorrencia as RecorrenciaContaPagar,
    })

    let contasRecorrentes: ContaPagar[] = []

    // Se for recorrente, gerar as próximas ocorrências
    if (recorrencia !== "ESPORADICA") {
      contasRecorrentes = await this.gerarContasRecorrentes(conta)
    }

    return {
      conta,
      contasRecorrentes: contasRecorrentes.length > 0 ? contasRecorrentes : undefined,
    }
  }

  private async gerarContasRecorrentes(contaOriginal: ContaPagar): Promise<ContaPagar[]> {
    const contasRecorrentes: ContaPagar[] = []
    const quantidadeOcorrencias = 12 // Gerar 12 ocorrências futuras

    for (let i = 1; i <= quantidadeOcorrencias; i++) {
      const proximaData = this.calcularProximaData(
        contaOriginal.data_vencimento,
        contaOriginal.recorrencia,
        i
      )

      const novaConta = await this.contaPagarRepository.create({
        descricao: contaOriginal.descricao,
        valor: contaOriginal.valor,
        categoria: contaOriginal.categoria,
        data_vencimento: proximaData,
        recorrencia: contaOriginal.recorrencia,
      })

      contasRecorrentes.push(novaConta)
    }

    return contasRecorrentes
  }

  private calcularProximaData(dataBase: Date, recorrencia: RecorrenciaContaPagar, multiplicador: number): Date {
    const novaData = new Date(dataBase)

    switch (recorrencia) {
      case "MENSAL":
        novaData.setMonth(novaData.getMonth() + multiplicador)
        break
      case "TRIMESTRAL":
        novaData.setMonth(novaData.getMonth() + (3 * multiplicador))
        break
      case "SEMESTRAL":
        novaData.setMonth(novaData.getMonth() + (6 * multiplicador))
        break
      case "ANUAL":
        novaData.setFullYear(novaData.getFullYear() + multiplicador)
        break
    }

    return novaData
  }

  protected getValidationSchema() {
    return createContaPagarSchema
  }
}