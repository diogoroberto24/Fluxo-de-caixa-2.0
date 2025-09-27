import { NextRequest, NextResponse } from 'next/server'
import { CriarClienteUseCase } from '@/server/use-cases/clientes/criar-cliente'
import { ListarClientesUseCase } from '@/server/use-cases/clientes/listar-clientes'
import { RepositoryFactory } from '@/server/infra/repos/factory'
import { AppError, ValidationError } from '@/shared/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const useCase = new CriarClienteUseCase(RepositoryFactory.clienteRepository)
    const result = await useCase.execute(body)

    if (result instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          code: result.code,
        },
        { status: result.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: result
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Construir filters apenas com propriedades que têm valores
    const filters: any = {}
    
    // Adicionar apenas os parâmetros que estão presentes
    const pageParam = searchParams.get('page')
    if (pageParam) filters.page = Number(pageParam)
    
    const limitParam = searchParams.get('limit')
    if (limitParam) filters.limit = Number(limitParam)
    
    const searchParam = searchParams.get('search')
    if (searchParam) filters.search = searchParam
    
    const statusParam = searchParams.get('status')
    if (statusParam) filters.status = statusParam
    
    const tributacaoParam = searchParams.get('tributacao')
    if (tributacaoParam) filters.tributacao = tributacaoParam
    
    const ativoParam = searchParams.get('ativo')
    if (ativoParam) filters.ativo = ativoParam === 'true'
    
    const orderByParam = searchParams.get('orderBy')
    if (orderByParam) filters.orderBy = orderByParam
    
    const orderParam = searchParams.get('order')
    if (orderParam && (orderParam === 'asc' || orderParam === 'desc')) {
      filters.order = orderParam
    }

    const useCase = new ListarClientesUseCase(RepositoryFactory.clienteRepository)
    const result = await useCase.execute(filters)

    if (result instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          code: result.code,
        },
        { status: result.statusCode }
      )
    }

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}
