import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET() {
  try {
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Buscar clientes ativos e seus status
    const clientesAtivos = await prisma.cliente.findMany({
      where: { ativo: true },
      include: {
        cobrancas: {
          where: {
            data_de_vencimento: {
              gte: format(currentMonthStart, 'yyyy-MM-dd'),
              lte: format(currentMonthEnd, 'yyyy-MM-dd')
            }
          }
        }
      }
    })

    // Buscar faturamento previsto (cobranças que vencem no mês atual)
    const cobrancasPrevistoMesAtual = await prisma.cobranca.findMany({
      where: {
        data_de_vencimento: {
          gte: format(currentMonthStart, 'yyyy-MM-dd'),
          lte: format(currentMonthEnd, 'yyyy-MM-dd')
        },
        status: {
          in: ['PENDENTE', 'PAGO'] // Incluir pendentes e pagas do mês
        }
      }
    })

    const faturamentoPrevisto = cobrancasPrevistoMesAtual.reduce((total, cobranca) => {
      return total + cobranca.total
    }, 0)

    // Calcular faturamento previsto do mês anterior para comparação
    const cobrancasPrevistoMesAnterior = await prisma.cobranca.findMany({
      where: {
        data_de_vencimento: {
          gte: format(lastMonthStart, 'yyyy-MM-dd'),
          lte: format(lastMonthEnd, 'yyyy-MM-dd')
        },
        status: {
          in: ['PENDENTE', 'PAGO']
        }
      }
    })

    const faturamentoPrevistoMesAnterior = cobrancasPrevistoMesAnterior.reduce((total, cobranca) => {
      return total + cobranca.total
    }, 0)

    // Debug: Verificar todas as cobranças existentes
    const todasCobrancas = await prisma.cobranca.findMany({
      select: {
        id: true,
        status: true,
        total: true,
        data_de_vencimento: true,
        data_de_pagamento: true,
        data_de_criacao: true
      }
    })
    
    console.log('=== DEBUG COBRANCAS ===')
    console.log('Total de cobranças na base:', todasCobrancas.length)
    console.log('Período atual:', { currentMonthStart, currentMonthEnd })
    
    // Verificar cobranças com status PAGO
    const cobrancasComStatusPago = todasCobrancas.filter(c => c.status === 'PAGO')
    console.log('Cobranças com status PAGO:', cobrancasComStatusPago.length)
    
    // Verificar cobranças com status pago (minúsculo)
    const cobrancasComStatusPagoMinusculo = todasCobrancas.filter(c => c.status === 'pago')
    console.log('Cobranças com status pago (minúsculo):', cobrancasComStatusPagoMinusculo.length)
    
    // Listar todos os status únicos
    const statusUnicos = [...new Set(todasCobrancas.map(c => c.status))]
    console.log('Status únicos encontrados:', statusUnicos)
    
    // Buscar faturamento arrecadado (cobranças pagas no mês atual)
    // Primeiro, vamos tentar com ambos os status possíveis
    const cobrancasPagas = await prisma.cobranca.findMany({
      where: {
        OR: [
          { status: 'PAGO' },
          { status: 'pago' }
        ],
        data_de_pagamento: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        }
      }
    })
    
    console.log('Cobranças pagas no período:', cobrancasPagas.length)
    console.log('Detalhes das cobranças pagas:', cobrancasPagas.map(c => ({
      id: c.id,
      status: c.status,
      total: c.total,
      data_pagamento: c.data_de_pagamento
    })))

    const faturamentoArrecadado = cobrancasPagas.reduce((total, cobranca) => {
      return total + cobranca.total
    }, 0)
    
    console.log('Faturamento arrecadado calculado:', faturamentoArrecadado)

    // Calcular faturamento do mês anterior para comparação
    const cobrancasPagasMesAnterior = await prisma.cobranca.findMany({
      where: {
        status: 'PAGO',
        data_de_pagamento: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      }
    })

    const faturamentoMesAnterior = cobrancasPagasMesAnterior.reduce((total, cobranca) => {
      return total + cobranca.total
    }, 0)

    // Contar clientes por status
    const totalClientes = clientesAtivos.length
    
    // Clientes em dia (sem cobranças vencidas)
    const clientesEmDia = await prisma.cliente.count({
      where: {
        ativo: true,
        cobrancas: {
          none: {
            status: 'PENDENTE',
            data_de_vencimento: {
              lt: format(now, 'yyyy-MM-dd')
            }
          }
        }
      }
    })

    // Clientes inadimplentes (com cobranças vencidas)
    const clientesInadimplentes = await prisma.cliente.count({
      where: {
        ativo: true,
        cobrancas: {
          some: {
            status: 'PENDENTE',
            data_de_vencimento: {
              lt: format(now, 'yyyy-MM-dd')
            }
          }
        }
      }
    })

    // Buscar faturamento mensal dos últimos 12 meses
    const faturamentoMensal = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)

      const cobrancasDoMes = await prisma.cobranca.findMany({
        where: {
          status: 'PAGO',
          data_de_pagamento: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      const valorMes = cobrancasDoMes.reduce((total, cobranca) => total + cobranca.total, 0)

      faturamentoMensal.push({
        month: format(monthDate, 'MMM'),
        year: monthDate.getFullYear(),
        previsto: 0, // Pode ser calculado baseado nos honorários dos clientes
        realizado: valorMes,
        period: format(monthDate, 'MMM/yyyy')
      })
    }

    // Buscar pagamentos recentes (últimos 10)
    const pagamentosRecentes = await prisma.cobranca.findMany({
      where: {
        status: 'PAGO',
        data_de_pagamento: { not: null }
      },
      include: {
        cliente: {
          select: { nome: true }
        },
        cliente_eventual: {
          select: { nome: true }
        }
      },
      orderBy: {
        data_de_pagamento: 'desc'
      },
      take: 10
    })

    // Calcular variações percentuais
    const variacaoFaturamentoNum = faturamentoMesAnterior > 0 
      ? (faturamentoArrecadado - faturamentoMesAnterior) / faturamentoMesAnterior * 100
      : 0
    
    const variacaoFaturamento = variacaoFaturamentoNum.toFixed(1)

    // Calcular variação do faturamento previsto
    const variacaoFaturamentoPrevistoNum = faturamentoPrevistoMesAnterior > 0
      ? (faturamentoPrevisto - faturamentoPrevistoMesAnterior) / faturamentoPrevistoMesAnterior * 100
      : 0
    
    const variacaoFaturamentoPrevisto = variacaoFaturamentoPrevistoNum.toFixed(1)

    // Contar clientes do mês anterior para comparação
    const clientesTotalMesAnterior = await prisma.cliente.count({
      where: {
        ativo: true,
        data_de_criacao: {
          lte: lastMonthEnd
        }
      }
    })

    const variacaoClientes = clientesTotalMesAnterior > 0
      ? totalClientes - clientesTotalMesAnterior
      : 0

    const response = {
      kpis: {
        faturamentoPrevisto: {
          valor: faturamentoPrevisto,
          variacao: `${variacaoFaturamentoPrevistoNum >= 0 ? '+' : ''}${variacaoFaturamentoPrevisto}%`,
          tendencia: variacaoFaturamentoPrevistoNum >= 0 ? 'up' : 'down'
        },
        faturamentoArrecadado: {
          valor: faturamentoArrecadado,
          variacao: `${variacaoFaturamentoNum >= 0 ? '+' : ''}${variacaoFaturamento}%`,
          tendencia: variacaoFaturamentoNum >= 0 ? 'up' : 'down'
        },
        clientesEmDia: {
          valor: clientesEmDia,
          variacao: `${variacaoClientes >= 0 ? '+' : ''}${variacaoClientes}`,
          tendencia: variacaoClientes >= 0 ? 'up' : 'down'
        },
        clientesInadimplentes: {
          valor: clientesInadimplentes,
          variacao: '0', // Pode ser calculado
          tendencia: 'down'
        },
        totalClientes: {
          valor: totalClientes,
          variacao: `${variacaoClientes >= 0 ? '+' : ''}${variacaoClientes}`,
          tendencia: variacaoClientes >= 0 ? 'up' : 'down'
        }
      },
      faturamentoMensal,
      pagamentosRecentes: pagamentosRecentes.map(pagamento => ({
        id: pagamento.id,
        client: pagamento.cliente?.nome || pagamento.cliente_eventual?.nome || 'Cliente não identificado',
        value: `R$ ${(pagamento.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        date: pagamento.data_de_pagamento ? format(pagamento.data_de_pagamento, 'dd/MM/yyyy') : '',
        status: 'Pago',
        method: pagamento.metodo_de_pagamento || 'Não informado'
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}