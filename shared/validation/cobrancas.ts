import { z } from 'zod'

// Enums para cobrança
export const StatusCobrancaEnum = z.enum([
  'PENDENTE',
  'PAGO',
  'CANCELADO',
  'VENCIDO'
])

export const MetodoPagamentoEnum = z.enum([
  'DINHEIRO',
  'PIX',
  'CARTAO_CREDITO',
  'CARTAO_DEBITO',
  'TRANSFERENCIA',
  'BOLETO',
  'CHEQUE'
])

// Schema para item de cobrança
export const itemCobrancaSchema = z.object({
  produto_id: z.string().uuid('ID do produto deve ser um UUID válido'),
  quantidade: z.number().int().min(1, 'Quantidade deve ser no mínimo 1').default(1),
  valor_unitario: z.number().int().min(0, 'Valor unitário deve ser positivo'),
  desconto: z.number().int().min(0, 'Desconto deve ser positivo').default(0),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional().nullable()
})

// Schema base para cobrança (sem refine para permitir extend)
const cobrancaBaseObject = z.object({
  subtotal: z.number().int().min(0, 'Subtotal deve ser positivo'),
  desconto: z.number().int().min(0, 'Desconto deve ser positivo').default(0),
  total: z.number().int().min(0, 'Total deve ser positivo'),
  status: StatusCobrancaEnum.default('PENDENTE'),
  data_de_vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  observacoes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional().nullable(),
  cliente_id: z.string().uuid().optional().nullable(),
  cliente_eventual_id: z.string().uuid().optional().nullable(),
  metadata: z.record(z.any()).optional().default({})
})

// Schema base com validação
export const cobrancaBaseSchema = cobrancaBaseObject
.refine(data => data.cliente_id || data.cliente_eventual_id, {
  message: 'Deve ser informado cliente_id ou cliente_eventual_id'
})

// Schema para criação de cobrança
export const createCobrancaSchema = cobrancaBaseObject.extend({
  itens: z.array(itemCobrancaSchema).min(1, 'Deve ter pelo menos um item')
})
.refine(data => data.cliente_id || data.cliente_eventual_id, {
  message: 'Deve ser informado cliente_id ou cliente_eventual_id'
})

// Schema para atualização de cobrança
export const updateCobrancaSchema = cobrancaBaseObject.partial().extend({
  data_de_pagamento: z.date().optional(),
  metodo_de_pagamento: MetodoPagamentoEnum.optional(),
  data_de_cancelamento: z.date().optional(),
  motivo_de_cancelamento: z.string().max(500).optional()
})

// Schema para marcar como pago
export const marcarComoPagoSchema = z.object({
  metodo_de_pagamento: MetodoPagamentoEnum,
  data_de_pagamento: z.date().optional().default(() => new Date())
})

// Schema para cancelar
export const cancelarCobrancaSchema = z.object({
  motivo_de_cancelamento: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres').max(500)
})

// Schema para filtros de listagem
export const listCobrancasSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: StatusCobrancaEnum.optional(),
  cliente_id: z.string().uuid().optional(),
  cliente_eventual_id: z.string().uuid().optional(),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  orderBy: z.enum(['data_de_vencimento', 'total', 'data_de_criacao']).default('data_de_vencimento'),
  order: z.enum(['asc', 'desc']).default('desc')
})

// Types inferidos dos schemas
export type CobrancaBase = z.infer<typeof cobrancaBaseSchema>
export type CreateCobrancaInput = z.infer<typeof createCobrancaSchema>
export type UpdateCobrancaInput = z.infer<typeof updateCobrancaSchema>
export type ListCobrancasInput = z.infer<typeof listCobrancasSchema>
export type ItemCobrancaInput = z.infer<typeof itemCobrancaSchema>
export type StatusCobranca = z.infer<typeof StatusCobrancaEnum>
export type MetodoPagamento = z.infer<typeof MetodoPagamentoEnum>
export type MarcarComoPagoInput = z.infer<typeof marcarComoPagoSchema>
export type CancelarCobrancaInput = z.infer<typeof cancelarCobrancaSchema>

// Alias para compatibilidade com a interface do repositório
export type CobrancaFilters = ListCobrancasInput
