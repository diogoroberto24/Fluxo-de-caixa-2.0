import { UseCase } from "../use-case";
import { criarBalancoSchema, type CriarBalancoRequest } from "@/shared/validation/balancos";
import { balancoRepository } from "@/server/infra/repos";
import type { Balanco } from "@/shared/types";

export class CriarBalancoUseCase extends UseCase<
  CriarBalancoRequest,
  Balanco
> {
  protected schema = criarBalancoSchema;

  protected async handle(data: CriarBalancoRequest): Promise<Balanco> {
    const balanco = await balancoRepository.criar(data);
    return balanco;
  }
}