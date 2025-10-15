import { z } from "zod";

// Enums
export const TipoRecorrenciaEnum = z.enum(["entrada", "saida"]);

export const FrequenciaRecorrenciaEnum = z.enum([
  "diaria",
  "semanal",
  "quinzenal",
  "mensal",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
]);

// Schema base para recorrência
export const recorrenciaBaseSchema = z.object({
  tipo: TipoRecorrenciaEnum,
  descricao: z
    .string()
    .min(3, "Descrição deve ter no mínimo 3 caracteres")
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
  data_de_inicio: z.date().or(z.string().pipe(z.coerce.date())),
  data_de_fim: z
    .date()
    .or(z.string().pipe(z.coerce.date()))
    .optional()
    .nullable(),
  frequencia: FrequenciaRecorrenciaEnum,
  frequencia_valor: z
    .number()
    .int("Valor da frequência deve ser inteiro")
    .positive("Valor da frequência deve ser positivo")
    .default(1),
  dia_de_vencimento: z
    .number()
    .int()
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31")
    .optional()
    .nullable(),
  ativo: z.boolean().default(true),
});

// Schema base estendido (sem refine)
const createRecorrenciaBaseSchema = recorrenciaBaseSchema.extend({
  cliente_id: z.string().uuid("ID do cliente inválido").optional().nullable(),
  produto_id: z.string().uuid("ID do produto inválido").optional().nullable(),
  metadata: z.record(z.any()).optional().default({}),
});

// Schema para criar recorrência
export const createRecorrenciaSchema = createRecorrenciaBaseSchema
  .refine((data) => data.cliente_id || data.produto_id, {
    message: "Deve ser informado um cliente ou produto",
  });

// Schema para atualizar recorrência
export const updateRecorrenciaSchema = createRecorrenciaBaseSchema.partial();

// Schema para listagem
export const listRecorrenciasSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  tipo: TipoRecorrenciaEnum.optional(),
  frequencia: FrequenciaRecorrenciaEnum.optional(),
  cliente_id: z.string().uuid().optional(),
  produto_id: z.string().uuid().optional(),
  ativo: z.coerce.boolean().optional(),
  proxima_execucao_inicio: z.string().optional(),
  proxima_execucao_fim: z.string().optional(),
  orderBy: z
    .enum([
      "descricao",
      "proxima_execucao",
      "data_de_inicio",
      "data_de_criacao",
    ])
    .default("proxima_execucao"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

// Schema para processar recorrências
export const processarRecorrenciasSchema = z.object({
  data_referencia: z
    .date()
    .optional()
    .default(() => new Date()),
  dry_run: z
    .boolean()
    .default(false)
    .describe("Se true, simula o processamento sem criar registros"),
});

// Schema para executar recorrência manualmente
export const executarRecorrenciaSchema = z.object({
  recorrencia_id: z.string().uuid("ID da recorrência inválido"),
  data_execucao: z
    .date()
    .optional()
    .default(() => new Date()),
  observacoes: z.string().optional().nullable(),
});

// Helpers para cálculo de próxima execução
export const calcularProximaExecucao = (
  ultimaExecucao: Date | null,
  dataInicio: Date,
  frequencia: z.infer<typeof FrequenciaRecorrenciaEnum>,
  frequenciaValor: number
): Date => {
  const baseDate = ultimaExecucao || dataInicio;
  const nextDate = new Date(baseDate);

  const multiplicador = frequenciaValor;

  switch (frequencia) {
    case "diaria":
      nextDate.setDate(nextDate.getDate() + multiplicador);
      break;
    case "semanal":
      nextDate.setDate(nextDate.getDate() + 7 * multiplicador);
      break;
    case "quinzenal":
      nextDate.setDate(nextDate.getDate() + 15 * multiplicador);
      break;
    case "mensal":
      nextDate.setMonth(nextDate.getMonth() + multiplicador);
      break;
    case "bimestral":
      nextDate.setMonth(nextDate.getMonth() + 2 * multiplicador);
      break;
    case "trimestral":
      nextDate.setMonth(nextDate.getMonth() + 3 * multiplicador);
      break;
    case "semestral":
      nextDate.setMonth(nextDate.getMonth() + 6 * multiplicador);
      break;
    case "anual":
      nextDate.setFullYear(nextDate.getFullYear() + multiplicador);
      break;
  }

  return nextDate;
};

// Types inferidos
export type RecorrenciaBase = z.infer<typeof recorrenciaBaseSchema>;
export type CreateRecorrenciaInput = z.infer<typeof createRecorrenciaSchema>;
export type UpdateRecorrenciaInput = z.infer<typeof updateRecorrenciaSchema>;
export type ListRecorrenciasInput = z.infer<typeof listRecorrenciasSchema>;
export type ProcessarRecorrenciasInput = z.infer<
  typeof processarRecorrenciasSchema
>;
export type ExecutarRecorrenciaInput = z.infer<
  typeof executarRecorrenciaSchema
>;
export type TipoRecorrencia = z.infer<typeof TipoRecorrenciaEnum>;
export type FrequenciaRecorrencia = z.infer<typeof FrequenciaRecorrenciaEnum>;
