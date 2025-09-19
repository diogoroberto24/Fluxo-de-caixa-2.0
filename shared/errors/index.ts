export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any, options?: ErrorOptions) {
    super(message, 400, "VALIDATION_ERROR", options);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, options?: ErrorOptions) {
    super(`${resource} não encontrado`, 404, "NOT_FOUND", options);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Não autorizado", options?: ErrorOptions) {
    super(message, 401, "UNAUTHORIZED", options);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 409, "CONFLICT", options);
    this.name = "ConflictError";
  }
}
