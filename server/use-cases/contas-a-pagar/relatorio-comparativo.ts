import { UseCase } from "../use-case"
import type { ContaPagarRepository } from "@/server/infra/repos/interfaces/conta-pagar-repository"
import { PrismaContaPagarRepository } from "@/server/infra/repos/implementations/prisma-conta-pagar-repository"
import type { BalancoRepository } from "@/server/infra/repos/interfaces/balanco-repository"
import { PrismaBalancoRepository } from "@/server/infra/repos/implementations/prisma-balanco-repository"
import { z } from "zod"
import { AppError } from "@/shared/errors"

const relatorioComparativoSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020),
})

type Request = z.infer<typeof relatorioComparativoSchema>

type Result = {
  periodo: {
    mes: number
    ano: number
  }
  despesas: {
    totalPendente: number
    totalPago: number
    totalVencido: number
    total: number
    categorias: Array<{
      categoria: string
      valor: number
      percentual: number
    }>
  }
  receitas: {
    totalConfirmado: number
    totalPrevisto: number
    total: number
  }
  comparativo: {
    saldoLiquido: number
    percentualDespesas: number
    percentualReceitas: number
  }
}

type Errors = AppError

export class RelatorioComparativoUseCase extends UseCase<Request, Result, Errors> {
  private contaPagarRepository: ContaPagarRepository
  private balancoRepository: BalancoRepository

  constructor() {
    super()
    this.contaPagarRepository = new PrismaContaPagarRepository()
    this.balancoRepository = new PrismaBalancoRepository()
  }

  protected async handle(request: Request): Promise<Result> {
    const { mes, ano } = request

    // Definir período
    const inicioMes = new Date(ano, mes - 1, 1)
    const fimMes = new Date(ano, mes, 0)

    // Buscar despesas do mês
    const contasDoMes = await this.contaPagarRepository.findByDateRange(inicioMes, fimMes)

    // Calcular totais de despesas
    const despesas = this.calcularTotaisDespesas(contasDoMes)

    // Buscar receitas do mês
    const receitasDoMes = await this.balancoRepository.buscarPorPeriodoETipo(inicioMes, fimMes, "ENTRADA")

    // Calcular totais de receitas
    const receitas = this.calcularTotaisReceitas(receitasDoMes)

    // Calcular comparativo
    const comparativo = this.calcularComparativo(despesas, receitas)

    return {
      periodo: { mes, ano },
      despesas,
      receitas,
      comparativo,
    }
  }

  private calcularTotaisDespesas(contas: any[]) {
    const totais = {
      totalPendente: 0,
      totalPago: 0,
      totalVencido: 0,
      total: 0,
      categorias: [] as Array<{ categoria: string; valor: number; percentual: number }>,
    }

    const categoriaMap = new Map<string, number>()

    contas.forEach(conta => {
      switch (conta.status) {
        case 'PENDENTE':
          totais.totalPendente += conta.valor
          break
        case 'PAGO':
          totais.totalPago += conta.valor
          break
        case 'VENCIDO':
          totais.totalVencido += conta.valor
          break
      }

      totais.total += conta.valor

      // Agrupar por categoria
      const valorCategoria = categoriaMap.get(conta.categoria) || 0
      categoriaMap.set(conta.categoria, valorCategoria + conta.valor)
    })

    // Converter mapa de categorias para array
    categoriaMap.forEach((valor, categoria) => {
      totais.categorias.push({
        categoria,
        valor,
        percentual: totais.total > 0 ? (valor / totais.total) * 100 : 0,
      })
    })

    // Ordenar categorias por valor
    totais.categorias.sort((a, b) => b.valor - a.valor)

    return totais
  }

  private calcularTotaisReceitas(receitas: any[]) {
    const totais = {
      totalConfirmado: 0,
      totalPrevisto: 0,
      total: 0,
    }

    receitas.forEach(receita => {
      if (receita.status === 'confirmado') {
        totais.totalConfirmado += receita.valor
      } else {
        totais.totalPrevisto += receita.valor
      }
      totais.total += receita.valor
    })

    return totais
  }

  private calcularComparativo(despesas: any, receitas: any) {
    const saldoLiquido = receitas.total - despesas.total
    const totalGeral = receitas.total + despesas.total

    return {
      saldoLiquido,
      percentualDespesas: totalGeral > 0 ? (despesas.total / totalGeral) * 100 : 0,
      percentualReceitas: totalGeral > 0 ? (receitas.total / totalGeral) * 100 : 0,
    }
  }

  protected getValidationSchema() {
    return relatorioComparativoSchema
  }
}