import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clients = await prisma.clienteEventual.findMany({
      where: {
        data_de_delecao: null
      },
      orderBy: {
        data_de_criacao: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes eventuais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const client = await prisma.clienteEventual.create({
      data: {
        nome: data.nome,
        documento: data.documento,
        telefone: data.telefone,
        email: data.email,
        valor_servico: data.valor_servico,
        parcelamento: data.parcelamento,
        observacoes: data.observacoes || null,
        valor_entrada: data.valor_entrada || null,
        quantidade_parcelas: data.quantidade_parcelas || null,
        valor_parcelas: data.valor_parcelas || null,
        parcelas_config: data.parcelas && data.parcelas.length > 0 ? data.parcelas : null
      }
    })

    // Criar registros de contas a receber baseado no parcelamento
    await createReceivables(client, data.parcelas || [])

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente eventual:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function createReceivables(client: any, parcelas: any[] = []) {
  try {
    const today = new Date()
    
    switch (client.parcelamento) {
      case 'AVISTA':
        // Criar uma única cobrança para pagamento à vista
        // Adicionar ao faturamento arrecadado do mês atual
        await prisma.cobranca.create({
          data: {
            subtotal: client.valor_servico,
            desconto: 0,
            total: client.valor_servico,
            status: 'pago', // À vista é considerado como pago
            data_de_vencimento: today.toISOString().split('T')[0],
            data_de_pagamento: today,
            observacoes: `Pagamento à vista - ${client.nome}`,
            cliente_eventual_id: client.id,
            metodo_de_pagamento: 'dinheiro'
          }
        })

        // Adicionar ao balanço como receita arrecadada
        await prisma.balanco.create({
          data: {
            valor: client.valor_servico,
            tipo: 'ENTRADA',
            descricao: `Receita à vista - Cliente eventual: ${client.nome}`,
            status: 'confirmado',
            data_de_fato: today,
            metadata: { categoria: 'Serviços' }
          }
        })
        break
        
      case 'PARCELADO':
        // Criar múltiplas cobranças baseadas nas parcelas configuradas
        for (let i = 0; i < parcelas.length; i++) {
          const parcela = parcelas[i]
          const isPrimeiraParcela = i === 0
          
          await prisma.cobranca.create({
            data: {
              subtotal: parcela.valor,
              desconto: 0,
              total: parcela.valor,
              status: isPrimeiraParcela ? 'pago' : 'pendente', // Primeira parcela paga, demais pendentes
              data_de_vencimento: parcela.data_vencimento,
              data_de_pagamento: isPrimeiraParcela ? today : null,
              observacoes: `Parcela ${i + 1}/${parcelas.length} - ${client.nome}`,
              cliente_eventual_id: client.id,
              metodo_de_pagamento: isPrimeiraParcela ? 'dinheiro' : null
            }
          })

          // Se for a primeira parcela, adicionar ao faturamento arrecadado
          if (isPrimeiraParcela) {
            await prisma.balanco.create({
              data: {
                valor: parcela.valor,
                tipo: 'ENTRADA',
                descricao: `Receita parcelada (1ª parcela) - Cliente eventual: ${client.nome}`,
                status: 'confirmado',
                data_de_fato: today,
                metadata: { categoria: 'Serviços' }
              }
            })
          } else {
            // Demais parcelas vão para o faturamento previsto
            const dataVencimento = new Date(parcela.data_vencimento)
            await prisma.balanco.create({
              data: {
                valor: parcela.valor,
                tipo: 'ENTRADA',
                descricao: `Receita prevista (parcela ${i + 1}/${parcelas.length}) - Cliente eventual: ${client.nome}`,
                status: 'previsto',
                data_de_fato: dataVencimento,
                metadata: { categoria: 'Serviços', tipo_faturamento: 'previsto' }
              }
            })
          }
        }
        break
        
      case 'ENTRADA_PARCELAS':
        // Criar cobrança para a entrada (paga imediatamente)
        if (client.valor_entrada && client.valor_entrada > 0) {
          await prisma.cobranca.create({
            data: {
              subtotal: client.valor_entrada,
              desconto: 0,
              total: client.valor_entrada,
              status: 'pago',
              data_de_vencimento: today.toISOString().split('T')[0],
              data_de_pagamento: today,
              observacoes: `Entrada - ${client.nome}`,
              cliente_eventual_id: client.id,
              metodo_de_pagamento: 'dinheiro'
            }
          })

          // Adicionar entrada ao faturamento arrecadado
          await prisma.balanco.create({
            data: {
              valor: client.valor_entrada,
              tipo: 'ENTRADA',
              descricao: `Receita entrada - Cliente eventual: ${client.nome}`,
              status: 'confirmado',
              data_de_fato: today,
              metadata: { categoria: 'Serviços' }
            }
          })
        }
        
        // Criar cobranças para as parcelas (pendentes)
        for (let i = 0; i < parcelas.length; i++) {
          const parcela = parcelas[i]
          
          await prisma.cobranca.create({
            data: {
              subtotal: parcela.valor,
              desconto: 0,
              total: parcela.valor,
              status: 'pendente',
              data_de_vencimento: parcela.data_vencimento,
              observacoes: `Parcela ${i + 1}/${parcelas.length} - ${client.nome}`,
              cliente_eventual_id: client.id
            }
          })

          // Adicionar ao faturamento previsto
          const dataVencimento = new Date(parcela.data_vencimento)
          await prisma.balanco.create({
            data: {
              valor: parcela.valor,
              tipo: 'ENTRADA',
              descricao: `Receita prevista (parcela ${i + 1}/${parcelas.length}) - Cliente eventual: ${client.nome}`,
              status: 'previsto',
              data_de_fato: dataVencimento,
              metadata: { categoria: 'Serviços', tipo_faturamento: 'previsto' }
            }
          })
        }
        break
    }
  } catch (error) {
    console.error('Erro ao criar contas a receber:', error)
    throw error
  }
}