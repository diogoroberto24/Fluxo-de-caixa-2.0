import type { Balanco, BalancoTipo } from "@/shared/types";
import type { CreateBalancoInput, AtualizarBalancoRequest, BalancoFilters } from "@/shared/validation/balancos";

export interface BalancoRepository {
  criar(data: CreateBalancoInput): Promise<Balanco>;
  buscarPorId(id: string): Promise<Balanco | null>;
  listar(filters: BalancoFilters, page: number, limit: number): Promise<{
    balancos: Balanco[];
    total: number;
  }>;
  atualizar(id: string, data: Omit<AtualizarBalancoRequest, 'id'>): Promise<Balanco>;
  deletar(id: string): Promise<void>;
  calcularSaldo(dataInicio?: Date, dataFim?: Date): Promise<number>;
  buscarPorPeriodo(dataInicio: Date, dataFim: Date): Promise<Balanco[]>;
  buscarPorPeriodoETipo(dataInicio: Date, dataFim: Date, tipo: BalancoTipo): Promise<Balanco[]>;
}