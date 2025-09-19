import type {
  ListClientesInput,
  CreateClienteInput,
  UpdateClienteInput,
} from "@/shared/validation/clientes";

import type { Cliente } from "@/shared/types";

export interface IClienteRepository {
  create(data: CreateClienteInput): Promise<Cliente>;
  update(id: string, data: UpdateClienteInput): Promise<Cliente>;
  findById(id: string): Promise<Cliente | null>;
  findByDocumento(documento: string): Promise<Cliente | null>;
  findMany(filters: ListClientesInput): Promise<{
    items: Cliente[];
    total: number;
  }>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export type {
  ListClientesInput,
  CreateClienteInput,
  UpdateClienteInput,
  Cliente,
};
