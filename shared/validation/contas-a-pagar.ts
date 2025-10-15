import { z } from "zod"

export const createContaPagarSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().positive("Valor deve ser positivo"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  data_vencimento: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida"),
  recorrencia: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "ESPORADICA"]).default("ESPORADICA"),
})

export const updateContaPagarSchema = z.object({
  id: z.string().cuid(),
  descricao: z.string().min(1, "Descrição é obrigatória").optional(),
  valor: z.number().positive("Valor deve ser positivo").optional(),
  categoria: z.string().min(1, "Categoria é obrigatória").optional(),
  data_vencimento: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida").optional(),
  recorrencia: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "ESPORADICA"]).optional(),
  status: z.enum(["PENDENTE", "PAGO", "VENCIDO"]).optional(),
  metadata: z.record(z.any()).optional(),
})

export const marcarComoPagoSchema = z.object({
  id: z.string().cuid(),
  data_pagamento: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida").optional(),
})

export const listContasPagarSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  status: z.enum(["PENDENTE", "PAGO", "VENCIDO"]).optional(),
  categoria: z.string().optional(),
  recorrencia: z.enum(["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL", "ESPORADICA"]).optional(),
  mes: z.number().min(1).max(12).optional(),
  ano: z.number().min(2020).optional(),
  data_inicio: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida").optional(),
  data_fim: z.string().refine((date) => !isNaN(Date.parse(date)), "Data inválida").optional(),
  orderBy: z.enum(["data_vencimento", "valor", "categoria", "status", "data_de_criacao"]).default("data_vencimento").optional(),
  order: z.enum(["asc", "desc"]).default("asc").optional(),
})

export const relatorioMensalSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020),
  categoria: z.string().optional(),
})

export const deleteContaPagarSchema = z.object({
  id: z.string().cuid(),
})

export type CreateContaPagarRequest = z.infer<typeof createContaPagarSchema>
export type UpdateContaPagarRequest = z.infer<typeof updateContaPagarSchema>
export type MarcarComoPagoRequest = z.infer<typeof marcarComoPagoSchema>
export type ListContasPagarRequest = z.infer<typeof listContasPagarSchema>
export type RelatorioMensalInput = z.infer<typeof relatorioMensalSchema>
export type DeleteContaPagarRequest = z.infer<typeof deleteContaPagarSchema>