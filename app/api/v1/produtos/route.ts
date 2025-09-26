import { NextRequest, NextResponse } from 'next/server'
import { CriarProdutoUseCase } from '@/server/use-cases/produtos/criar-produto'
import { ListarProdutosUseCase } from '@/server/use-cases/produtos/listar-produtos'
import { PrismaProdutoRepository } from '@/server/infra/repos/implementations/prisma-produto-repository'
import { PrismaCategoriaRepository } from '@/server/infra/repos/implementations/prisma-categoria-repository'
import { AppError, ValidationError } from '@/shared/errors'

// Instanciar repositórios
const produtoRepository = new PrismaProdutoRepository()
const categoriaRepository = new PrismaCategoriaRepository()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const useCase = new CriarProdutoUseCase(produtoRepository, categoriaRepository)
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
    console.error('Erro ao criar produto:', error)
    
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
    
    // Construir o objeto filters com os tipos corretos
    const filters: any = {}
    
    // Parâmetros numéricos
    if (searchParams.get('page')) {
      filters.page = Number(searchParams.get('page'))
    }
    if (searchParams.get('limit')) {
      filters.limit = Number(searchParams.get('limit'))
    }
    
    // Parâmetros de string
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')
    }
    if (searchParams.get('tipo')) {
      filters.tipo = searchParams.get('tipo')
    }
    if (searchParams.get('direcao')) {
      filters.direcao = searchParams.get('direcao')
    }
    if (searchParams.get('categoria_id')) {
      filters.categoria_id = searchParams.get('categoria_id')
    }
    if (searchParams.get('orderBy')) {
      filters.orderBy = searchParams.get('orderBy')
    }
    if (searchParams.get('order')) {
      filters.order = searchParams.get('order')
    }
    
    // Parâmetro booleano
    if (searchParams.get('ativo')) {
      filters.ativo = searchParams.get('ativo') === 'true'
    }

    const useCase = new ListarProdutosUseCase(produtoRepository)
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
    console.error('Erro ao listar produtos:', error)
    
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