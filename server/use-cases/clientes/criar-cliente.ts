import { Cliente } from "@/shared/types";
import {
  ClienteRepository,
  type IClienteRepository,
  type CreateClienteInput,
} from "@/server/infra/repos";
import { createClienteSchema } from "@/shared/validation/clientes";
import { ConflictError } from "@/shared/errors";
import { UseCase } from "../use-case";

export type CriarClienteRequest = CreateClienteInput;
export type CriarClienteResult = Cliente;

export class CriarClienteUseCase extends UseCase<
  CriarClienteRequest,
  CriarClienteResult
> {
  protected schema = createClienteSchema;

  constructor(
    private readonly clienteRepository: IClienteRepository = new ClienteRepository()
  ) {
    super();
  }

  protected async handle(
    input: CriarClienteRequest
  ): Promise<CriarClienteResult> {
    const existingCliente = await this.clienteRepository.findByDocumento(
      input.documento
    );

    if (existingCliente) {
      throw new ConflictError(
        `Cliente com documento ${input.documento} já existe`
      );
    }

    const cliente = await this.clienteRepository.create(input);

    return cliente;
  }
}
