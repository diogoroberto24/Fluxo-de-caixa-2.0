import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import { listContasPagarSchema, type ListContasPagarRequest } from "@/shared/validation/contas-a-pagar"
import type { ContaPagar, StatusContaPagar, RecorrenciaContaPagar } from "@prisma/client"
import { AppError } from "@/shared/errors"

type Request = ListContasPagarRequest

type Result = {
  contas: ContaPagar[]
  resumo: {
    totalPendente: number
    totalPago: number
    totalVencido: number
    quantidadePendente: number
    quantidadePago: number
    quantidadeVencido: number
  }
}

type Errors = AppError

export class ListarContasPagarUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { page = 1, limit = 20, status, categoria, recorrencia, data_inicio, data_fim, orderBy = 'data_vencimento', order = 'asc' } = request

    // Primeiro, atualizar status de contas vencidas
    await this.contaPagarRepository.atualizarContasVencidas()

    // Buscar contas com filtros
    const contas = await this.contaPagarRepository.findMany({
      page,
      limit,
      status: status as StatusContaPagar,
      categoria,
      recorrencia: recorrencia as RecorrenciaContaPagar,
      data_inicio: data_inicio ? new Date(data_inicio) : undefined,
      data_fim: data_fim ? new Date(data_fim) : undefined,
      orderBy,
      order,
    })

    // Calcular resumo
    const resumo = await this.calcularResumo()

    return {
      contas,
      resumo,
    }
  }

  private async calcularResumo() {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const contasDoMes = await this.contaPagarRepository.findByDateRange(inicioMes, fimMes)

    const resumo = {
      totalPendente: 0,
      totalPago: 0,
      totalVencido: 0,
      quantidadePendente: 0,
      quantidadePago: 0,
      quantidadeVencido: 0,
    }

    contasDoMes.forEach(conta => {
      switch (conta.status) {
        case 'PENDENTE':
          resumo.totalPendente += conta.valor
          resumo.quantidadePendente++
          break
        case 'PAGO':
          resumo.totalPago += conta.valor
          resumo.quantidadePago++
          break
        case 'VENCIDO':
          resumo.totalVencido += conta.valor
          resumo.quantidadeVencido++
          break
      }
    })

    return resumo
  }

  protected getValidationSchema() {
    return listContasPagarSchema
  }
}