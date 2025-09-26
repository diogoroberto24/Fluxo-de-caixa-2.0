import { z } from 'zod'

// Schema base para categoria
export const categoriaBaseSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),

  ativo: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({})
})

// Schema para criação de categoria
export const createCategoriaSchema = categoriaBaseSchema

// Schema para atualização de categoria
export const updateCategoriaSchema = categoriaBaseSchema.partial()

// Schema para filtros de listagem
export const listCategoriasSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
  orderBy: z.enum(['nome', 'data_de_criacao']).default('nome'),
  order: z.enum(['asc', 'desc']).default('asc')
})

// Types inferidos dos schemas
export type CategoriaBase = z.infer<typeof categoriaBaseSchema>
export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>
export type ListCategoriasInput = z.infer<typeof listCategoriasSchema>