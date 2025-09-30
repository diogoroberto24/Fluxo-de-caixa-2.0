import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const clients = await prisma.clienteEventual.findMany({
      where: {
        ativo: true
      },
      include: {
        cobrancas: true
      },
      orderBy: {
        data_de_criacao: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Erro ao buscar clientes eventuais:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação de campos obrigatórios
    if (!body.nome || !body.documento || !body.valor_servico || !body.parcelamento) {
      return NextResponse.json(
        { message: "Campos obrigatórios: nome, documento, valor_servico e parcelamento" },
        { status: 400 }
      );
    }

    // Verificar se o documento já existe
    const existingClient = await prisma.clienteEventual.findFirst({
      where: { 
        documento: body.documento,
        ativo: true
      }
    });

    if (existingClient) {
      return NextResponse.json(
        { message: "Já existe um cliente eventual ativo com este documento" },
        { status: 400 }
      );
    }

    // Converter valores para centavos
    const clientData: any = {
      nome: body.nome,
      documento: body.documento,
      telefone: body.telefone || "",
      email: body.email || "",
      valor_servico: body.valor_servico,
      parcelamento: body.parcelamento,
      observacoes: body.observacoes || undefined,
    }

    // Adicionar campos opcionais apenas se existirem
    if (body.valor_entrada) {
      clientData.valor_entrada = body.valor_entrada;
    }

    if (body.quantidade_parcelas) {
      clientData.quantidade_parcelas = body.quantidade_parcelas;
    }

    if (body.valor_parcelas) {
      clientData.valor_parcelas = body.valor_parcelas;
    }

    if (body.parcelas && body.parcelas.length > 0) {
      clientData.parcelas_config = JSON.stringify(body.parcelas.map((p: any) => ({
        ...p,
        valor: p.valor
      })));
    }

    // Criar o cliente
    const client = await prisma.clienteEventual.create({
      data: clientData
    })

    // Criar cobranças e lançamentos no balanço
    if (body.parcelas && body.parcelas.length > 0) {
      const parcelas = body.parcelas.map((p: any) => ({
        ...p,
        valor: p.valor
      }))
      
      await createReceivables(client, parcelas)
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente eventual:', error)
    return NextResponse.json(
      { 
        message: "Erro ao criar cliente eventual", 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}

async function createReceivables(client: any, parcelas: any[] = []) {
  const today = new Date()
  
  switch (client.parcelamento) {
    case 'AVISTA':
      // Criar uma única cobrança (paga imediatamente)
      const cobrancaAvista = await prisma.cobranca.create({
        data: {
          subtotal: client.valor_servico,
          desconto: 0,
          total: client.valor_servico,
          status: 'pago',
          data_de_vencimento: today.toISOString().split('T')[0],
          data_de_pagamento: today,
          observacoes: `Pagamento à vista - ${client.nome}`,
          cliente_eventual_id: client.id,
          metodo_de_pagamento: 'dinheiro'
        }
      })

      // Adicionar ao faturamento arrecadado
      await prisma.balanco.create({
        data: {
          valor: client.valor_servico,
          tipo: 'ENTRADA',
          descricao: `Receita à vista - Cliente eventual: ${client.nome}`,
          status: 'confirmado',
          data_de_fato: today,
          cobranca_id: cobrancaAvista.id, // Associar à cobrança
          metadata: { categoria: 'Serviços' }
        }
      })
      break
      
    case 'PARCELADO':
      // Criar múltiplas cobranças baseadas nas parcelas configuradas
      for (let i = 0; i < parcelas.length; i++) {
        const parcela = parcelas[i]
        const isPrimeiraParcela = i === 0
        
        const cobrancaParcela = await prisma.cobranca.create({
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
              cobranca_id: cobrancaParcela.id, // Associar à cobrança
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
              cobranca_id: cobrancaParcela.id, // Associar à cobrança
              metadata: { categoria: 'Serviços', tipo_faturamento: 'previsto' }
            }
          })
        }
      }
      break
      
    case 'ENTRADA_PARCELAS':
      // Criar cobrança para a entrada (paga imediatamente)
      if (client.valor_entrada && client.valor_entrada > 0) {
        const cobrancaEntrada = await prisma.cobranca.create({
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
            cobranca_id: cobrancaEntrada.id, // Associar à cobrança
            metadata: { categoria: 'Serviços' }
          }
        })
      }
      
      // Criar cobranças para as parcelas (pendentes)
      for (let i = 0; i < parcelas.length; i++) {
        const parcela = parcelas[i]
        
        const cobrancaParcela = await prisma.cobranca.create({
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
            cobranca_id: cobrancaParcela.id, // Associar à cobrança
            metadata: { categoria: 'Serviços', tipo_faturamento: 'previsto' }
          }
        })
      }
      break
  }
}