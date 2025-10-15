import { UseCase } from "../use-case";
import { relatorioMensalSchema, type RelatorioMensalInput } from "@/shared/validation/contas-a-pagar";
import { contaPagarRepository, balancoRepository } from "@/server/infra/repos";

interface RelatorioMensalResult {
  mes: number;
  ano: number;
  totalPagar: number;
  totalPago: number;
  totalPendente: number;
  totalVencido: number;
  totalRecebimentos: number;
  saldoMensal: number;
  contas: any[];
}

export class RelatorioMensalUseCase extends UseCase<
  RelatorioMensalInput,
  RelatorioMensalResult
> {
  protected schema = relatorioMensalSchema;

  protected async handle(data: RelatorioMensalInput): Promise<RelatorioMensalResult> {
    const { mes, ano } = data;

    // Definir período do mês
    const inicioMes = new Date(ano, mes - 1, 1);
    const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

    // Buscar contas do mês
    const contas = await contaPagarRepository.findByMesAno(mes, ano);

    // Calcular totais por status usando calcularTotalPorPeriodo
    const totalPago = await contaPagarRepository.calcularTotalPorPeriodo(inicioMes, fimMes, "PAGO");
    const totalPendente = await contaPagarRepository.calcularTotalPorPeriodo(inicioMes, fimMes, "PENDENTE");
    const totalVencido = await contaPagarRepository.calcularTotalPorPeriodo(inicioMes, fimMes, "VENCIDO");
    const totalPagar = totalPago + totalPendente + totalVencido;

    // Buscar recebimentos do mês (entradas no balanço)
    const recebimentos = await balancoRepository.buscarPorPeriodoETipo(inicioMes, fimMes, "ENTRADA");
    const totalRecebimentos = recebimentos
      .reduce((sum, b) => sum + b.valor, 0);

    // Calcular saldo mensal (recebimentos - gastos)
    const saldoMensal = totalRecebimentos - totalPago;

    return {
      mes,
      ano,
      totalPagar,
      totalPago,
      totalPendente,
      totalVencido,
      totalRecebimentos,
      saldoMensal,
      contas: contas.map(conta => ({
        id: conta.id,
        descricao: conta.descricao,
        valor: conta.valor,
        categoria: conta.categoria,
        data_vencimento: conta.data_vencimento,
        status: conta.status,
        recorrencia: conta.recorrencia,
        data_pagamento: conta.data_pagamento,
      })),
    };
  }
}