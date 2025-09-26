// Exportar tipos do Prisma
export type {
  Cliente,
  ClienteEventual,
  Produto,
  Categoria,
  Cobranca,
  ItemCobranca,
  Balanco,
  Recorrencia,
  ClienteProduto,
  HistoricoHonorario,
  Usuario,
  BalancoTipo
} from '@/lib/generated/prisma'

// Tipos auxiliares da API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

// Tipos para valores monetários
export interface MoneyValue {
  centavos: number
  reais: number
  formatted: string
}

// Tipos para filtros
export interface ClienteFilters extends ListParams {
  status?: string
  tributacao?: string
  ativo?: boolean
}

export interface CobrancaFilters extends ListParams {
  status?: string
  cliente_id?: string
  data_inicio?: string
  data_fim?: string
}

export interface ProdutoFilters extends ListParams {
  tipo?: string
  direcao?: string
  categoria_id?: string
  ativo?: boolean
}

// Tipos para relatórios
export interface RelatorioFinanceiro {
  periodo: {
    inicio: string
    fim: string
  }
  entradas: {
    total: number
    itens: Array<{
      descricao: string
      valor: number
      data: string
    }>
  }
  saidas: {
    total: number
    itens: Array<{
      descricao: string
      valor: number
      data: string
    }>
  }
  saldo: number
}

// Tipos para dashboard
export interface DashboardData {
  resumo: {
    total_clientes: number
    total_cobrancas_pendentes: number
    total_recebido_mes: number
    total_a_receber: number
  }
  graficos: {
    receitas_mensais: Array<{
      mes: string
      valor: number
    }>
    cobrancas_por_status: Array<{
      status: string
      quantidade: number
    }>
  }
}
