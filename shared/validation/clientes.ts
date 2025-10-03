import { z } from "zod";

// Schema para produtos associados ao cliente
export const produtoClienteSchema = z.object({
  produto_id: z.string().cuid("ID do produto deve ser válido"),
  quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1").default(1),
  nome: z.string().min(1, "Nome do produto é obrigatório"),
  descricao: z.string().optional(),
  valor: z.number().min(0, "Valor deve ser positivo").default(0),
  status: z.string().default("Ativo"),
  ativo: z.boolean().default(true),
});

export const criarClienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  documento: z.string().min(11, "Documento deve ter pelo menos 11 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  cliente_rua: z.string().min(1, "Rua é obrigatória"),
  cliente_numero: z.string().min(1, "Número é obrigatório"),
  cliente_bairro: z.string().min(1, "Bairro é obrigatório"),
  cliente_cidade: z.string().min(1, "Cidade é obrigatória"),
  cliente_estado: z.string().min(2, "Estado deve ter 2 caracteres"),
  cliente_pais: z.string().min(1, "País é obrigatório"),
  socio_nome: z.string().optional(),
  socio_documento: z.string().optional(),
  socio_rua: z.string().optional(),
  socio_numero: z.string().optional(),
  socio_bairro: z.string().optional(),
  socio_cidade: z.string().optional(),
  socio_estado: z.string().optional(),
  socio_pais: z.string().optional(),
  representante_nome: z.string().optional(),
  representante_rg: z.string().optional(),
  representante_cpf: z.string().optional(),
  representante_rua: z.string().optional(),
  representante_bairro: z.string().optional(),
  representante_municipio: z.string().optional(),
  representante_cep: z.string().optional(),
  data_pagamento_mensal: z.date().or(z.string().transform((str) => new Date(str))),
  tributacao: z.string().min(1, "Tributação é obrigatória"),
  honorarios: z.number().int().min(0, "Honorários devem ser positivos").default(0),
  observacao: z.string().optional(),
  status: z.string().default("ativo"),
  ativo: z.boolean().default(true),
  metadata: z.record(z.any()).optional().default({}),
  produtos: z.array(produtoClienteSchema).optional().default([]),
});

export const atualizarClienteSchema = criarClienteSchema.partial().extend({
  id: z.string().cuid(),
});

export const buscarClienteSchema = z.object({
  id: z.string().cuid(),
});

export const listarClientesSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  tributacao: z.string().optional(),
  ativo: z.boolean().optional(),
  orderBy: z.string().default('nome'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Tipos originais
export type CriarClienteRequest = z.infer<typeof criarClienteSchema>;
export type AtualizarClienteRequest = z.infer<typeof atualizarClienteSchema>;
export type BuscarClienteRequest = z.infer<typeof buscarClienteSchema>;
export type ListarClientesRequest = z.infer<typeof listarClientesSchema>;

// Aliases para compatibilidade com a interface do repositório
export type CreateClienteInput = CriarClienteRequest;
export type UpdateClienteInput = Omit<AtualizarClienteRequest, 'id'>;
export type ClienteFilters = ListarClientesRequest;