import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GerarContratoUseCase } from '@/server/use-cases/contratos/gerar-contrato'

// GET /api/v1/contratos/pendentes - Lista clientes que precisam de contrato
// Método: export async function GET
// Ajuste: Proteção contra caso raro de contratos vazio, evitando acesso a índice inexistente.

export async function GET(request: Request) {
  try {
    const { reconnectDatabase } = await import('@/lib/db')
    try {
      const reconnected = await reconnectDatabase(3, 1000)
      if (!reconnected) {
        console.error('Falha ao reconectar com o banco de dados após várias tentativas')
        return NextResponse.json(
          { message: 'Falha ao buscar clientes pendentes: Erro de conexão com o banco de dados' },
          { status: 503 }
        )
      }
    } catch (dbError) {
      console.error('Erro de conexão com o banco de dados:', dbError)
      return NextResponse.json(
        { message: 'Falha ao buscar clientes pendentes: Erro de conexão com o banco de dados' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') // 'pendentes' ou 'todos'

    if (tipo === 'pendentes') {
      // Buscar clientes sem contrato OU com dados atualizados após o último contrato
      const clientesSemContrato = await prisma.cliente.findMany({
        where: {
          ativo: true,
          contratos: {
            none: {}
          }
        },
        include: {
          produtos: {
            include: {
              produto: true
            }
          }
        }
      })

      const clientesComContratoDesatualizado = await prisma.cliente.findMany({
        where: { ativo: true, contratos: { some: {} } },
        include: {
          produtos: { include: { produto: true } },
          contratos: { orderBy: { data_de_atualizacao: 'desc' }, take: 1 }
        }
      })

      const clientesDesatualizados = clientesComContratoDesatualizado.filter((cliente: any) => {
        const ultimoContrato = cliente.contratos?.[0]
        if (!ultimoContrato) return false
        return cliente.data_de_atualizacao > ultimoContrato.data_de_atualizacao
      })

      const clientesPendentes = [
        ...clientesSemContrato.map((c: any) => ({ ...c, motivoPendencia: 'sem_contrato' })),
        ...clientesDesatualizados.map((c: any) => ({ ...c, motivoPendencia: 'dados_atualizados' }))
      ]
      return NextResponse.json(clientesPendentes)
    }

    // Buscar todos os contratos
    const contratos = await prisma.contrato.findMany({
      include: {
        cliente: {
          include: {
            produtos: {
              include: {
                produto: true
              }
            }
          }
        }
      },
      orderBy: {
        data_de_atualizacao: 'desc'
      }
    })

    return NextResponse.json(contratos)

  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return NextResponse.json({ message: 'Erro ao buscar contratos', error: String(error) }, { status: 500 })
  }
}