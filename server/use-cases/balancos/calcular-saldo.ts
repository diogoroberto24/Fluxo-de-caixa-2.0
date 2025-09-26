import { UseCase } from "../use-case";
import { z } from "zod";
import { balancoRepository } from "@/server/infra/repos";

const calcularSaldoSchema = z.object({
  data_inicio: z.string().datetime().optional(),
  data_fim: z.string().datetime().optional(),
});

type CalcularSaldoRequest = z.infer<typeof calcularSaldoSchema>;

interface SaldoResult {
  saldo: number;
  saldo_formatado: string;
}

export class CalcularSaldoUseCase extends UseCase<
  CalcularSaldoRequest,
  SaldoResult
> {
  protected schema = calcularSaldoSchema;

  protected async handle(data: CalcularSaldoRequest): Promise<SaldoResult> {
    const dataInicio = data.data_inicio ? new Date(data.data_inicio) : undefined;
    const dataFim = data.data_fim ? new Date(data.data_fim) : undefined;

    const saldo = await balancoRepository.calcularSaldo(dataInicio, dataFim);

    return {
      saldo,
      saldo_formatado: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(saldo / 100), // Converter de centavos para reais
    };
  }
}