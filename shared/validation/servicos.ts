import { z } from "zod";
import { Money } from "../utils/money";

// Enums
export const TipoServicoEnum = z.enum(["servico", "produto"]);
export const DirecaoEnum = z.enum(["entrada", "saida"]);

// Schema para categoria
export const categoriaSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

// Schema base para serviço/produto
export const servicoBaseSchema = z.object({
  nome: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres"),

  descricao: z.string().optional().nullable(),

  valor: z
    .number()
    .positive("Valor deve ser positivo")
    .multipleOf(0.01, "Valor deve ter no máximo 2 casas decimais")
    .transform((value) => new Money({ value })),

  tipo: TipoServicoEnum,
  direcao: DirecaoEnum,
  ativo: z.boolean().default(true),
});

// Schema para criação de serviço
export const createServicoSchema = servicoBaseSchema.extend({
  categoria_id: z.string().uuid("ID da categoria inválido"),
  metadata: z.record(z.any()).optional().default({}),
});

// Schema para atualização de serviço
export const updateServicoSchema = createServicoSchema.partial();

// Schema para criar categoria
export const createCategoriaSchema = categoriaSchema.extend({
  metadata: z.record(z.any()).optional().default({}),
});

// Schema para atualizar categoria
export const updateCategoriaSchema = createCategoriaSchema.partial();

// Schema para listagem de serviços
export const listServicosSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoria_id: z.string().uuid().optional(),
  tipo: TipoServicoEnum.optional(),
  direcao: DirecaoEnum.optional(),
  ativo: z.coerce.boolean().optional(),
  orderBy: z.enum(["nome", "valor", "tipo", "data_de_criacao"]).default("nome"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

// Schema para associar serviço a cliente
export const clienteServicoSchema = z.object({
  cliente_id: z.string().uuid("ID do cliente inválido"),
  produto_id: z.string().uuid("ID do produto inválido"),
  quantidade: z.number().int().positive("Quantidade deve ser positiva"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional().nullable(),
  valor: z
    .number()
    .positive("Valor deve ser positivo")
    .multipleOf(0.01)
    .transform((value) => new Money({ value })),
  status: z.string().default("ATIVO"),
  ativo: z.boolean().default(true),
});

// Types inferidos
export type ServicoBase = z.infer<typeof servicoBaseSchema>;
export type CreateServicoInput = z.infer<typeof createServicoSchema>;
export type UpdateServicoInput = z.infer<typeof updateServicoSchema>;
export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;
export type ListServicosInput = z.infer<typeof listServicosSchema>;
export type ClienteServicoInput = z.infer<typeof clienteServicoSchema>;
export type TipoServico = z.infer<typeof TipoServicoEnum>;
export type Direcao = z.infer<typeof DirecaoEnum>;
