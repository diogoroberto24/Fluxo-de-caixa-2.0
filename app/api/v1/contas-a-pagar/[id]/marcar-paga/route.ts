import { NextResponse } from 'next/server';
import { MarcarComoPagaUseCase } from '@/server/use-cases/contas-a-pagar/marcar-como-paga';

// Marcar conta como paga
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const useCase = new MarcarComoPagaUseCase();
    const conta = await useCase.execute({ 
      id, 
      data_pagamento: body.data_pagamento 
    });
    
    return NextResponse.json(conta);
  } catch (error: any) {
    console.error('Erro ao marcar conta como paga:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: error.errors },
        { status: 400 }
      );
    }
    
    if (error.name === 'NotFoundError') {
      return NextResponse.json(
        { message: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}