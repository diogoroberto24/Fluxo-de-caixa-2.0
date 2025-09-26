import { UseCase } from "../use-case";
import { marcarComoPagoSchema, type MarcarComoPagoInput } from "@/shared/validation/cobrancas";
import { cobrancaRepository, balancoRepository } from "@/server/infra/repos";
import { NotFoundError, ValidationError } from "@/shared/errors";
import type { Cobranca } from "@/shared/types";
import { z } from "zod";

interface PagarCobrancaInput extends MarcarComoPagoInput {
  id: string;
}

export class PagarCobrancaUseCase extends UseCase<
  PagarCobrancaInput,
  Cobranca,
  NotFoundError | ValidationError
> {
  protected schema = marcarComoPagoSchema.extend({
    id: z.string().uuid('ID deve ser um UUID válido')
  });

  protected async handle(data: PagarCobrancaInput): Promise<Cobranca> {
    const { id, data_de_pagamento, metodo_de_pagamento } = data;

    // Verificar se a cobrança existe
    const cobranca = await cobrancaRepository.findById(id);
    if (!cobranca) {
      throw new NotFoundError("Cobrança");
    }

    // Verificar se a cobrança não está já paga ou cancelada
    if (cobranca.status === "pago") {
      throw new ValidationError("Cobrança já está paga");
    }

    if (cobranca.status === "cancelado") {
      throw new ValidationError("Não é possível pagar uma cobrança cancelada");
    }

    if (!metodo_de_pagamento) {
      throw new ValidationError("Método de pagamento é obrigatório");
    }

    // Marcar como pago
    const cobrancaPaga = await cobrancaRepository.markAsPaid(
      id,
      metodo_de_pagamento
    );

    // Criar entrada no balanço
    await balancoRepository.criar({
      tipo: "ENTRADA",
      valor: cobranca.total,
      descricao: `Pagamento da cobrança ${cobranca.id}`,
      data_de_fato: (data_de_pagamento || new Date()).toISOString(),
      cobranca_id: cobranca.id,
    });

    return cobrancaPaga;
  }
}