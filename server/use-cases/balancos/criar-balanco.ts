import { UseCase } from "../use-case";
import { criarBalancoSchema, type CriarBalancoRequest } from "@/shared/validation/balancos";
import { balancoRepository } from "@/server/infra/repos";
import type { Balanco } from "@/shared/types";
import { Money } from "@/shared/utils/money";

export class CriarBalancoUseCase extends UseCase<
  CriarBalancoRequest,
  Balanco
> {
  protected schema = criarBalancoSchema;

  protected async handle(data: CriarBalancoRequest): Promise<Balanco> {
    // Converter CriarBalancoRequest para CreateBalancoInput
    const createData = {
      tipo: data.tipo,
      valor: Money.fromCentavos(data.valor), // Converter de centavos para Money
      descricao: data.descricao,
      status: data.status,
      data_de_fato: new Date(data.data_de_fato), // Converter string para Date
      cobranca_id: data.cobranca_id,
      recorrencia_id: data.recorrencia_id,
      conta_pagar_id: data.conta_pagar_id,
      metadata: data.metadata || {},
    };

    const balanco = await balancoRepository.criar(createData);
    return balanco;
  }
}