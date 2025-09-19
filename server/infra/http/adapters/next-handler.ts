import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/shared/types";
import { AppError } from "@/shared/errors";
import { ZodError } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HandlerContext {
  params?: Record<string, string | string[]>;
  searchParams?: URLSearchParams;
}

export type RouteHandler<T = any> = (
  request: NextRequest,
  context?: HandlerContext
) => Promise<T>;

/**
 * Adapter para converter use cases em handlers do Next.js
 * Fornece tratamento de erros padronizado e resposta consistente
 */
export function createHandler<T = any>(
  handler: RouteHandler<T>
): RouteHandler<NextResponse> {
  return async (request: NextRequest, context?: HandlerContext) => {
    try {
      const result = await handler(request, context);

      return NextResponse.json(
        {
          success: true,
          data: result,
        } as ApiResponse<T>,
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Cria um handler para múltiplos métodos HTTP
 */
export function createMethodHandler(
  handlers: Partial<Record<HttpMethod, RouteHandler<any>>>
) {
  return createHandler(
    async (request: NextRequest, context?: HandlerContext) => {
      const method = request.method as HttpMethod;

      const handler = handlers[method];
      if (!handler) {
        throw new AppError(`Método ${method} não permitido`, 405);
      }

      return handler(request, context);
    }
  );
}

/**
 * Extrai e valida o body da requisição
 */
export async function parseBody<T>(
  request: NextRequest,
  schema?: any
): Promise<T> {
  try {
    const body = await request.json();

    if (schema) {
      return schema.parse(body);
    }

    return body;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("Dados inválidos", 400, "VALIDATION_ERROR");
    }

    if (error instanceof SyntaxError) {
      throw new AppError(
        "JSON inválido no body da requisição",
        400,
        "INVALID_JSON"
      );
    }

    throw error;
  }
}

/**
 * Extrai query parameters da URL
 */
export function parseQuery<T = Record<string, any>>(
  request: NextRequest,
  schema?: any
): T {
  const searchParams = request.nextUrl.searchParams;
  const query: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Trata arrays (múltiplos valores com a mesma chave)
    if (query[key]) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  });

  if (schema) {
    try {
      return schema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          "Parâmetros de query inválidos",
          400,
          "INVALID_QUERY_PARAMS"
        );
      }
      throw error;
    }
  }

  return query as T;
}

/**
 * Extrai parâmetros da rota
 */
export function parseParams<T = Record<string, string>>(
  context?: HandlerContext,
  schema?: any
): T {
  const params = context?.params || {};

  if (schema) {
    try {
      return schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          "Parâmetros de rota inválidos",
          400,
          "INVALID_ROUTE_PARAMS"
        );
      }
      throw error;
    }
  }

  return params as T;
}

/**
 * Tratamento centralizado de erros
 */
function handleError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Erros conhecidos da aplicação
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      } as ApiResponse,
      { status: error.statusCode }
    );
  }

  // Erros de validação Zod
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro de validação",
        code: "VALIDATION_ERROR",
        details: error.errors,
      } as ApiResponse,
      { status: 400 }
    );
  }

  // Erro genérico
  const message =
    error instanceof Error ? error.message : "Erro interno do servidor";

  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "INTERNAL_SERVER_ERROR",
    } as ApiResponse,
    { status: 500 }
  );
}

/**
 * Helpers para respostas comuns
 */
export const responses = {
  ok: <T>(data: T, message?: string) =>
    NextResponse.json(
      {
        success: true,
        data,
        message,
      } as ApiResponse<T>,
      { status: 200 }
    ),

  created: <T>(data: T, message?: string) =>
    NextResponse.json(
      {
        success: true,
        data,
        message,
      } as ApiResponse<T>,
      { status: 201 }
    ),

  noContent: () => new NextResponse(null, { status: 204 }),

  badRequest: (message: string, code?: string) =>
    NextResponse.json(
      {
        success: false,
        error: message,
        code,
      } as ApiResponse,
      { status: 400 }
    ),

  unauthorized: (message: string = "Não autorizado") =>
    NextResponse.json(
      {
        success: false,
        error: message,
        code: "UNAUTHORIZED",
      } as ApiResponse,
      { status: 401 }
    ),

  forbidden: (message: string = "Acesso negado") =>
    NextResponse.json(
      {
        success: false,
        error: message,
        code: "FORBIDDEN",
      } as ApiResponse,
      { status: 403 }
    ),

  notFound: (resource: string = "Recurso") =>
    NextResponse.json(
      {
        success: false,
        error: `${resource} não encontrado`,
        code: "NOT_FOUND",
      } as ApiResponse,
      { status: 404 }
    ),

  conflict: (message: string) =>
    NextResponse.json(
      {
        success: false,
        error: message,
        code: "CONFLICT",
      } as ApiResponse,
      { status: 409 }
    ),

  serverError: (message: string = "Erro interno do servidor") =>
    NextResponse.json(
      {
        success: false,
        error: message,
        code: "INTERNAL_SERVER_ERROR",
      } as ApiResponse,
      { status: 500 }
    ),
};

/**
 * Middleware para logging
 */
export function withLogging<T>(
  handler: RouteHandler<T>,
  name?: string
): RouteHandler<T> {
  return async (request: NextRequest, context?: HandlerContext) => {
    const start = Date.now();
    const method = request.method;
    const url = request.url;

    try {
      const result = await handler(request, context);
      const duration = Date.now() - start;

      console.log(`[${name || "API"}] ${method} ${url} - ${duration}ms - OK`);

      return result;
    } catch (error) {
      const duration = Date.now() - start;

      console.error(
        `[${name || "API"}] ${method} ${url} - ${duration}ms - ERROR:`,
        error
      );

      throw error;
    }
  };
}
