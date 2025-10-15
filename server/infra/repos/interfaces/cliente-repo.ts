import type {
  ClienteFilters,
  CreateClienteInput,
  UpdateClienteInput,
} from "@/shared/validation/clientes";

import type { Cliente } from "@/shared/types";

export interface IClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>;
  update(id: string, data: UpdateClienteInput): Promise<Cliente>;
  findById(id: string): Promise<Cliente | null>;
  findByDocumento(documento: string): Promise<Cliente | null>;
  findMany(filters: ClienteFilters): Promise<{
    items: Cliente[];
    total: number;
  }>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export type {
  ClienteFilters,
  CreateClienteInput,
  UpdateClienteInput,
  Cliente,
};
