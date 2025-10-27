import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

// Obter todos os lançamentos do balanço
// Método: export async function GET
// Ajuste: Para data futura, retornar [] com 200, evitando erro no front (receivables-management).

export async function GET(request: Request) {
  try {
    // Verificar conexão com o banco de dados e tentar reconectar
    const { reconnectDatabase } = await import('@/lib/db');
    
    try {
      const reconnected = await reconnectDatabase(3, 1000);
      if (!reconnected) {
        console.error('Falha ao reconectar com o banco de dados após várias tentativas');
        return NextResponse.json(
          { message: 'Falha ao carregar recebimentos: Erro de conexão com o banco de dados' },
          { status: 503 }
        );
      }
    } catch (dbError) {
      console.error("Erro de conexão com o banco de dados:", dbError);
      return NextResponse.json(
        { message: "Falha ao carregar recebimentos: Erro de conexão com o banco de dados" },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const cobrancaId = searchParams.get('cobranca_id');
    const mes = searchParams.get('mes'); // 1-12
    const ano = searchParams.get('ano'); // YYYY
    const status = searchParams.get('status'); // 'confirmado' | 'previsto' | etc.
    const tipoCliente = searchParams.get('tipo_cliente'); // 'fixo' | 'eventual'

    const where: any = {
      tipo: 'ENTRADA',
    };

    if (cobrancaId) {
      where.cobranca_id = cobrancaId;
    }

    if (status) {
      where.status = status;
    }

    // Filtra por mês/ano com base em data_de_fato
    if (mes && ano) {
      const m = Number(mes);
      const y = Number(ano);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      if (y > currentYear + 1 || (y === currentYear + 1 && m > currentMonth)) {
        // Em datas muito futuras, retorna lista vazia em vez de 400
        return NextResponse.json([], { status: 200 });
      }
      
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, 0, 23, 59, 59)); // último dia do mês
      where.data_de_fato = {
        gte: start,
        lte: end,
      };
    }

    // Verificar se o banco de dados está acessível
    const balancos = await prisma.balanco.findMany({
      where,
      include: {
      cobranca: {
        include: {
          cliente: true,
          cliente_eventual: true,
        },
      },
      recorrencia: true,
    },
    orderBy: {
      data_de_fato: 'desc',
    },
  });

  // Filtra tipo de cliente no pós-processamento para simplicidade
  const filtered = tipoCliente
    ? balancos.filter((b) => {
        const isFixo = !!b.cobranca?.cliente_id;
        return tipoCliente === 'fixo' ? isFixo : !isFixo;
      })
    : balancos;

  return NextResponse.json(filtered);
} catch (error) {
  console.error('Erro ao buscar lançamentos do balanço:', error);
  return NextResponse.json({ message: 'Erro ao buscar lançamentos do balanço' }, { status: 500 });
}
}



// Criar um novo lançamento no balanço
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const novoBalanco = await prisma.balanco.create({
      data: {
        tipo: body.tipo,
        valor: Math.round(body.valor * 100), // Converter para centavos
        descricao: body.descricao,
        status: body.status,
        data_de_fato: new Date(body.data_de_fato),
        cobranca_id: body.cobranca_id,
        recorrencia_id: body.recorrencia_id,
        metadata: body.metadata
      }
    });
    
    return NextResponse.json(novoBalanco, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar lançamento no balanço:', error);
    return NextResponse.json({ message: 'Erro ao criar lançamento no balanço', error: String(error) }, { status: 500 });
  }
}