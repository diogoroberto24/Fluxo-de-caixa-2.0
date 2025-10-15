import { UseCase } from "../use-case";
import { marcarComoPagoSchema, type MarcarComoPagoInput } from "@/shared/validation/cobrancas";
import { cobrancaRepository, balancoRepository } from "@/server/infra/repos";
import { NotFoundError, ValidationError } from "@/shared/errors";
import type { Cobranca } from "@/shared/types";
import { z } from "zod";
import { Money } from "@/shared/utils/money";

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
      valor: Money.fromCentavos(cobranca.total), // Converter de centavos para Money
      descricao: `Pagamento da cobrança ${cobranca.id}`,
      status: "confirmado", // Campo obrigatório
      data_de_fato: new Date(data_de_pagamento || new Date()), // Converter string para Date
      cobranca_id: cobranca.id,
      recorrencia_id: null, // Campo obrigatório (pode ser null)
      conta_pagar_id: null, // Campo obrigatório (pode ser null)
      metadata: {}, // Campo obrigatório
    });

    return cobrancaPaga;
  }
}