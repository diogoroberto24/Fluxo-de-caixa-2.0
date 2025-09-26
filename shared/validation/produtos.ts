import { z } from 'zod'

// Enums para produto
export const TipoProdutoEnum = z.enum([
  'SERVICO',
  'PRODUTO'
])

export const DirecaoProdutoEnum = z.enum([
  'ENTRADA',
  'SAIDA'
])

export const StatusProdutoEnum = z.enum([
  'ATIVO',
  'INATIVO'
])

// Schema base para produto
export const produtoBaseSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),

  valor: z.number()
    .int('Valor deve ser um número inteiro em centavos')
    .min(0, 'Valor deve ser positivo'),

  tipo: TipoProdutoEnum,
  direcao: DirecaoProdutoEnum,
  categoria_id: z.string().uuid('ID da categoria deve ser um UUID válido'),
  ativo: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({})
})

// Schema para criação de produto
export const createProdutoSchema = produtoBaseSchema

// Schema para atualização de produto
export const updateProdutoSchema = produtoBaseSchema.partial()

// Schema para filtros de listagem
export const listProdutosSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  tipo: TipoProdutoEnum.optional(),
  direcao: DirecaoProdutoEnum.optional(),
  categoria_id: z.string().uuid().optional(),
  ativo: z.coerce.boolean().optional(),
  orderBy: z.enum(['nome', 'valor', 'data_de_criacao']).default('nome'),
  order: z.enum(['asc', 'desc']).default('asc')
})

// Types inferidos dos schemas
export type ProdutoBase = z.infer<typeof produtoBaseSchema>
export type CreateProdutoInput = z.infer<typeof createProdutoSchema>
export type UpdateProdutoInput = z.infer<typeof updateProdutoSchema>
export type ListProdutosInput = z.infer<typeof listProdutosSchema>
export type TipoProduto = z.infer<typeof TipoProdutoEnum>
export type DirecaoProduto = z.infer<typeof DirecaoProdutoEnum>
export type StatusProduto = z.infer<typeof StatusProdutoEnum>