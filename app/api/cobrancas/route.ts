import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todas as cobranças
export async function GET() {
  try {
    const cobrancas = await prisma.cobranca.findMany({
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true
          }
        }
      }
    });
    
    return NextResponse.json(cobrancas);
  } catch (error) {
    console.error('Erro ao buscar cobranças:', error);
    return NextResponse.json({ message: 'Erro ao buscar cobranças' }, { status: 500 });
  }
}

// Criar uma nova cobrança
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar se os valores de subtotal e total foram fornecidos diretamente
    let subtotal, total;
    
    if (body.subtotal !== undefined && body.total !== undefined) {
      // Usar os valores fornecidos diretamente
      subtotal = body.subtotal;
      total = body.total;
    } else {
      // Calcular com base nos itens (comportamento anterior)
      subtotal = body.itens.reduce((sum: number, item: any) => 
        sum + (item.valor_unitario * item.quantidade), 0);
      
      const desconto = body.desconto || 0;
      total = subtotal - desconto;
    }
    
    // Criar a cobrança
    const novaCobranca = await prisma.cobranca.create({
      data: {
        cliente_id: body.cliente_id,
        subtotal: Math.round(subtotal), // Converter para centavos
        desconto: Math.round((body.desconto || 0)), // Converter para centavos
        total: Math.round(total), // Converter para centavos
        status: body.status || 'pendente',
        data_de_vencimento: body.data_de_vencimento,
        data_de_pagamento: body.status === 'pago' ? new Date() : null,
        metodo_de_pagamento: body.metodo_de_pagamento,
        observacoes: body.observacoes
      }
    });
    
    // Criar os itens da cobrança
    if (body.itens && body.itens.length > 0) {
      for (const item of body.itens) {
        const itemSubtotal = item.valor_unitario * item.quantidade;
        const itemDesconto = item.desconto || 0;
        const itemTotal = itemSubtotal - itemDesconto;
        
        await prisma.itemCobranca.create({
          data: {
            cobranca_id: novaCobranca.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            valor_unitario: Math.round(item.valor_unitario),
            subtotal: Math.round(itemSubtotal),
            desconto: Math.round(itemDesconto),
            total: Math.round(itemTotal),
            descricao: item.descricao
          }
        });
      }
    }
    
    // Buscar a cobrança completa com itens
    const cobrancaCompleta = await prisma.cobranca.findUnique({
      where: { id: novaCobranca.id },
      include: {
        cliente: true,
        itens: {
          include: {
            produto: true
          }
        }
      }
    });
    
    return NextResponse.json(cobrancaCompleta, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json({ message: 'Erro ao criar cobrança', error: String(error) }, { status: 500 });
  }
}