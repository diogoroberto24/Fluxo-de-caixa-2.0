import type { ContaPagar, StatusContaPagar, RecorrenciaContaPagar } from "@prisma/client"

export interface ContaPagarRepository {
  create(data: {
    descricao: string
    valor: number
    categoria: string
    data_vencimento: Date
    recorrencia: RecorrenciaContaPagar
  }): Promise<ContaPagar>

  findById(id: string): Promise<ContaPagar | null>

  findMany(filters?: {
    page?: number
    limit?: number
    status?: StatusContaPagar
    categoria?: string
    recorrencia?: RecorrenciaContaPagar
    mes?: number
    ano?: number
    data_inicio?: Date
    data_fim?: Date
    orderBy?: string
    order?: 'asc' | 'desc'
  }): Promise<ContaPagar[]>

  update(id: string, data: Partial<{
    descricao: string
    valor: number
    categoria: string
    data_vencimento: Date
    recorrencia: RecorrenciaContaPagar
    status: StatusContaPagar
    data_pagamento: Date
    metadata: Record<string, any>
  }>): Promise<ContaPagar>

  delete(id: string): Promise<void>

  findVencidas(): Promise<ContaPagar[]>

  atualizarContasVencidas(): Promise<void>

  findByMesAno(mes: number, ano: number): Promise<ContaPagar[]>

  findByDateRange(dataInicio: Date, dataFim: Date): Promise<ContaPagar[]>

  calcularTotalPorPeriodo(dataInicio: Date, dataFim: Date, status?: StatusContaPagar): Promise<number>
}