import { NextRequest, NextResponse } from 'next/server'
import { BuscarClienteUseCase } from '@/server/use-cases/clientes/buscar-cliente'
import { AtualizarClienteUseCase } from '@/server/use-cases/clientes/atualizar-cliente'
import { RepositoryFactory } from '@/server/infra/repos/factory'
import { AppError, ValidationError } from '@/shared/errors'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const useCase = new BuscarClienteUseCase(RepositoryFactory.clienteRepository)
    const result = await useCase.execute({ id: params.id })

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
      data: result
    })
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    const useCase = new AtualizarClienteUseCase(RepositoryFactory.clienteRepository)
    const result = await useCase.execute({ id: params.id, ...body })

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
      data: result
    })
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    
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