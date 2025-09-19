import { NextRequest } from "next/server";
import {
  createMethodHandler,
  parseBody,
  withLogging,
} from "@/server/infra/http/adapters/next-handler";
import {
  CriarClienteUseCase,
  CriarClienteRequest,
} from "@/server/use-cases/clientes/criar-cliente";
import { createClienteSchema } from "@/shared/validation/clientes";
import { AppError } from "@/shared/errors";

/**
 * POST /api/v1/clientes
 * Cria um novo cliente
 */
async function handlePost(request: NextRequest) {
  const body = await parseBody<CriarClienteRequest>(
    request,
    createClienteSchema
  );

  const useCase = new CriarClienteUseCase();

  const result = await useCase.execute(body);

  if (result instanceof AppError) throw result;

  // Converte para formato de resposta
  return result;
}

export const POST = withLogging(
  createMethodHandler({
    POST: handlePost,
  }),
  "POST /api/v1/clientes"
);
