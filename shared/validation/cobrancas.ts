import { z } from "zod";
import { IMoney, Money } from "../utils/money";

// Enums
export const StatusCobrancaEnum = z.enum([
  "pendente",
  "pago",
  "parcialmente_pago",
  "vencido",
  "cancelado",
]);

export const MetodoPagamentoEnum = z.enum([
  "PIX",
  "BOLETO",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
  "TRANSFERENCIA",
  "DINHEIRO",
  "CHEQUE",
]);

// Schema para item de cobrança
export const itemCobrancaSchema = z.object({
  produto_id: z.string().uuid("ID do produto inválido"),
  quantidade: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .positive("Quantidade deve ser positiva")
    .default(1),
  valor_unitario: z
    .number()
    .positive("Valor unitário deve ser positivo")
    .multipleOf(0.01)
    .transform((value) => new Money({ value })),
  descricao: z.string().optional().nullable(),
  desconto: z
    .number()
    .min(0, "Desconto não pode ser negativo")
    .multipleOf(0.01)
    .default(0)
    .transform((value) => new Money({ value })),
});

// Schema base para cobrança
export const cobrancaBaseSchema = z.object({
  cliente_id: z.string().uuid("ID do cliente inválido"),

  data_de_vencimento: z
    .string()
    .or(z.date())
    .transform((val) => {
      if (typeof val === "string") return val;
      return val.toISOString().split("T")[0];
    }),

  status: StatusCobrancaEnum.default("pendente"),
  metodo_de_pagamento: MetodoPagamentoEnum.optional().nullable(),
  observacoes: z.string().optional().nullable(),

  desconto: z
    .number()
    .min(0, "Desconto não pode ser negativo")
    .multipleOf(0.01)
    .default(0)
    .transform((value) => new Money({ value })),
});

// Schema para criar cobrança
export const createCobrancaSchema = cobrancaBaseSchema.extend({
  itens: z
    .array(itemCobrancaSchema)
    .min(1, "Cobrança deve ter pelo menos um item"),
  metadata: z.record(z.any()).optional().default({}),
});

// Schema para atualizar cobrança
export const updateCobrancaSchema = z.object({
  status: StatusCobrancaEnum.optional(),
  data_de_vencimento: z.string().optional(),
  metodo_de_pagamento: MetodoPagamentoEnum.optional().nullable(),
  observacoes: z.string().optional().nullable(),
  desconto: z
    .number()
    .min(0)
    .multipleOf(0.01)
    .optional()
    .transform((value) => (value ? new Money({ value }) : undefined)),
});

// Schema para processar pagamento
export const processarPagamentoSchema = z.object({
  cobranca_id: z.string().uuid("ID da cobrança inválido"),
  valor_pago: z
    .number()
    .positive("Valor pago deve ser positivo")
    .multipleOf(0.01)
    .transform((value) => new Money({ value })),
  metodo_de_pagamento: MetodoPagamentoEnum,
  data_de_pagamento: z
    .date()
    .optional()
    .default(() => new Date()),
  observacoes: z.string().optional().nullable(),
});

// Schema para cancelar cobrança
export const cancelarCobrancaSchema = z.object({
  cobranca_id: z.string().uuid("ID da cobrança inválido"),
  motivo_de_cancelamento: z
    .string()
    .min(5, "Motivo deve ter no mínimo 5 caracteres")
    .max(500, "Motivo deve ter no máximo 500 caracteres"),
  data_de_cancelamento: z
    .date()
    .optional()
    .default(() => new Date()),
});

// Schema para listagem
export const listCobrancasSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  cliente_id: z.string().uuid().optional(),
  status: StatusCobrancaEnum.optional(),
  vencimento_inicio: z.string().optional(),
  vencimento_fim: z.string().optional(),
  orderBy: z
    .enum(["data_de_vencimento", "total", "status", "data_de_criacao"])
    .default("data_de_vencimento"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

// Helpers para cálculos
export const calcularTotalItem = (item: z.infer<typeof itemCobrancaSchema>) => {
  const subtotal = new Money(item.valor_unitario).mul(item.quantidade);
  const desconto = new Money(item.desconto);

  return subtotal.sub(desconto);
};

export const calcularTotalCobranca = (
  itens: z.infer<typeof itemCobrancaSchema>[],
  descontoGeral: IMoney = { value: 0 }
) => {
  const subtotal = itens.reduce(
    (acc, item) => acc.add(calcularTotalItem(item)),
    new Money()
  );
  return subtotal.sub(descontoGeral);
};

// Types inferidos
export type CobrancaBase = z.infer<typeof cobrancaBaseSchema>;
export type CreateCobrancaInput = z.infer<typeof createCobrancaSchema>;
export type UpdateCobrancaInput = z.infer<typeof updateCobrancaSchema>;
export type ProcessarPagamentoInput = z.infer<typeof processarPagamentoSchema>;
export type CancelarCobrancaInput = z.infer<typeof cancelarCobrancaSchema>;
export type ListCobrancasInput = z.infer<typeof listCobrancasSchema>;
export type ItemCobrancaInput = z.infer<typeof itemCobrancaSchema>;
export type StatusCobranca = z.infer<typeof StatusCobrancaEnum>;
export type MetodoPagamento = z.infer<typeof MetodoPagamentoEnum>;
