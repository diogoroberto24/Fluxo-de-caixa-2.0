import { UseCase } from "../use-case";
import { buscarClienteSchema, type BuscarClienteRequest } from "@/shared/validation/clientes";
import { clienteRepository } from "@/server/infra/repos";
import { NotFoundError } from "@/shared/errors";
import type { Cliente } from "@/shared/types";

export class InativarClienteUseCase extends UseCase<
  BuscarClienteRequest,
  Cliente,
  NotFoundError
> {
  protected schema = buscarClienteSchema;

  protected async handle(data: BuscarClienteRequest): Promise<Cliente> {
    const cliente = await clienteRepository.findById(data.id);
    
    if (!cliente) {
      throw new NotFoundError("Cliente");
    }

    const clienteInativado = await clienteRepository.deactivate(data.id);

    return clienteInativado;
  }
}