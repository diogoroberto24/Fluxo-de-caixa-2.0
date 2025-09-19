import { z } from 'zod'

// Regex patterns
const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
const PHONE_REGEX = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/

// Enum para tributação
export const TributacaoEnum = z.enum([
  'SIMPLES_NACIONAL',
  'LUCRO_PRESUMIDO',
  'LUCRO_REAL',
  'MEI'
])

// Enum para status
export const StatusClienteEnum = z.enum([
  'ATIVO',
  'INATIVO',
  'SUSPENSO',
  'CANCELADO'
])

// Schema para endereço (reutilizável)
export const enderecoSchema = z.object({
  rua: z.string().min(3, 'Rua deve ter no mínimo 3 caracteres'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro deve ter no mínimo 2 caracteres'),
  cidade: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  pais: z.string().default('Brasil')
})

// Schema base para cliente
export const clienteBaseSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),

  documento: z.string()
    .refine((val) => {
      const cleanDoc = val.replace(/[^\d]/g, '')
      return cleanDoc.length === 11 || cleanDoc.length === 14
    }, 'Documento deve ser CPF ou CNPJ válido')
    .transform((val) => {
      const cleanDoc = val.replace(/[^\d]/g, '')
      if (cleanDoc.length === 11) {
        return cleanDoc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      }
      return cleanDoc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }),

  email: z.string()
    .email('Email inválido')
    .toLowerCase(),

  telefone: z.string()
    .refine((val) => {
      const cleanPhone = val.replace(/[^\d]/g, '')
      return cleanPhone.length === 10 || cleanPhone.length === 11
    }, 'Telefone inválido')
    .transform((val) => {
      const cleanPhone = val.replace(/[^\d]/g, '')
      if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      }
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }),

  tributacao: TributacaoEnum,
  observacao: z.string().optional().nullable(),
  status: StatusClienteEnum.default('ATIVO'),
  ativo: z.boolean().default(true)
})

// Schema para criação de cliente
export const createClienteSchema = clienteBaseSchema.extend({
  // Endereço do cliente
  cliente_rua: z.string().min(3, 'Rua é obrigatória'),
  cliente_numero: z.string().min(1, 'Número é obrigatório'),
  cliente_bairro: z.string().min(2, 'Bairro é obrigatório'),
  cliente_cidade: z.string().min(2, 'Cidade é obrigatória'),
  cliente_estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cliente_pais: z.string().default('Brasil'),

  // Endereço do sócio (opcional)
  socio_documento: z.string().optional().nullable(),
  socio_rua: z.string().optional().nullable(),
  socio_numero: z.string().optional().nullable(),
  socio_bairro: z.string().optional().nullable(),
  socio_cidade: z.string().optional().nullable(),
  socio_estado: z.string().optional().nullable(),
  socio_pais: z.string().optional().nullable(),

  // Metadata
  metadata: z.record(z.any()).optional().default({})
})

// Schema para atualização de cliente
export const updateClienteSchema = createClienteSchema.partial()

// Schema para filtros de listagem
export const listClientesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: StatusClienteEnum.optional(),
  tributacao: TributacaoEnum.optional(),
  ativo: z.coerce.boolean().optional(),
  orderBy: z.enum(['nome', 'documento', 'data_de_criacao']).default('nome'),
  order: z.enum(['asc', 'desc']).default('asc')
})

// Types inferidos dos schemas
export type ClienteBase = z.infer<typeof clienteBaseSchema>
export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
export type ListClientesInput = z.infer<typeof listClientesSchema>
export type Tributacao = z.infer<typeof TributacaoEnum>
export type StatusCliente = z.infer<typeof StatusClienteEnum>