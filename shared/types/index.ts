// Re-export Prisma types for shared use
export type {
  Cliente,
  Categoria,
  Produto as Servico,
  ClienteProduto as ClienteServico,
  Cobranca,
  ItemCobranca,
  Balanco,
  Recorrencia,
  Usuario,
  BalancoTipo,
} from "@/lib/generated/prisma";

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common query params
export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "asc" | "desc";
}
