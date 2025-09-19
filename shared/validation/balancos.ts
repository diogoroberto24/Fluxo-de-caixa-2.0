import { z } from "zod";
import { Money } from "../utils/money";

// Enums
export const TipoBalancoEnum = z.enum(["ENTRADA", "SAIDA"]);

export const StatusBalancoEnum = z.enum([
  "pendente",
  "confirmado",
  "cancelado",
  "reconciliado",
]);

// Schema base para balanço
export const balancoBaseSchema = z.object({
  tipo: TipoBalancoEnum,

  valor: z
    .number()
    .positive("Valor deve ser positivo")
    .multipleOf(0.01, "Valor deve ter no máximo 2 casas decimais")
    .transform((value) => new Money({ value })),

  descricao: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),

  status: StatusBalancoEnum.default("pendente"),

  data_de_fato: z.date().or(z.string().pipe(z.coerce.date())),

  cobranca_id: z.string().uuid().optional().nullable(),
  recorrencia_id: z.string().uuid().optional().nullable(),
});

// Schema para criar lançamento
export const createBalancoSchema = balancoBaseSchema.extend({
  metadata: z.record(z.any()).optional().default({}),
});

// Schema para atualizar lançamento
export const updateBalancoSchema = createBalancoSchema.partial();

// Schema para listagem
export const listBalancosSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  tipo: TipoBalancoEnum.optional(),
  status: StatusBalancoEnum.optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  cobranca_id: z.string().uuid().optional(),
  recorrencia_id: z.string().uuid().optional(),
  orderBy: z
    .enum(["data_de_fato", "valor", "tipo", "status", "data_de_criacao"])
    .default("data_de_fato"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Schema para relatório de fluxo de caixa
export const fluxoCaixaSchema = z.object({
  data_inicio: z.string().or(z.date()),
  data_fim: z.string().or(z.date()),
  agrupar_por: z
    .enum(["dia", "semana", "mes", "trimestre", "ano"])
    .default("mes"),
  incluir_pendentes: z.boolean().default(false),
  tipo: TipoBalancoEnum.optional(),
});

// Schema para reconciliação
export const reconciliarBalancoSchema = z.object({
  balanco_id: z.string().uuid("ID do balanço inválido"),
  valor_reconciliado: z
    .number()
    .positive("Valor deve ser positivo")
    .multipleOf(0.01)
    .transform((value) => new Money({ value })),
  observacoes: z.string().optional().nullable(),
});

// Helpers para cálculos
export const calcularSaldo = (entradas: Money[], saidas: Money[]): Money => {
  const totalEntradas = entradas.reduce(
    (acc, val) => acc.add(val),
    new Money()
  );
  const totalSaidas = saidas.reduce((acc, val) => acc.add(val), new Money());
  return totalEntradas.sub(totalSaidas);
};

// Types inferidos
export type BalancoBase = z.infer<typeof balancoBaseSchema>;
export type CreateBalancoInput = z.infer<typeof createBalancoSchema>;
export type UpdateBalancoInput = z.infer<typeof updateBalancoSchema>;
export type ListBalancosInput = z.infer<typeof listBalancosSchema>;
export type FluxoCaixaInput = z.infer<typeof fluxoCaixaSchema>;
export type ReconciliarBalancoInput = z.infer<typeof reconciliarBalancoSchema>;
export type TipoBalanco = z.infer<typeof TipoBalancoEnum>;
export type StatusBalanco = z.infer<typeof StatusBalancoEnum>;
