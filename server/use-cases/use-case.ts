import { AppError, ValidationError } from "@/shared/errors";
import { z, ZodSchema, ZodError as ZodErrorBase } from "zod";

export abstract class UseCase<
  Data,
  SuccessResult,
  ErrorResult extends AppError = AppError
> {
  protected schema?: ZodSchema;

  protected abstract handle(parsed: Data): Promise<SuccessResult>;

  public async execute(data?: Data): Promise<SuccessResult | ErrorResult> {
    const parsed = this.validate(data);

    try {
      const response = await this.handle(parsed);

      return response;
    } catch (error) {
      return this.handleError(error) as ErrorResult;
    }
  }

  protected objectToFormData(
    obj: Record<string, any>,
    formData = new FormData(),
    parentKey = ""
  ): FormData {
    Object.entries(obj).forEach(([key, value]) => {
      const fieldName = parentKey ? `${parentKey}[${key}]` : key;

      if (value === null || value === undefined) {
        return;
      }

      if (value instanceof File || value instanceof Blob) {
        formData.append(
          fieldName,
          value,
          value instanceof File ? value.name : "blob"
        );
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${fieldName}[${index}]`, item);
        });
      } else if (typeof value === "object") {
        this.objectToFormData(value, formData, fieldName);
      } else {
        formData.append(fieldName, value.toString());
      }
    });

    return formData;
  }

  public validate(data?: Data) {
    if (!this.schema) return null as Data;

    try {
      const parsed = this.schema.parse(data);

      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          "Dados inválidos por favor revise",
          error.errors
        );
      }
      throw error;
    }
  }

  private handleError(error: unknown): AppError {
    try {
      if (error instanceof AppError) {
        return error;
      }

      if (error instanceof ZodErrorBase) {
        throw new ValidationError(
          "Dados inválidos por favor revise",
          error.errors
        );
      }

      return new AppError("Um erro inesperado ocorreu", 500, "UnknownError", {
        cause: error,
      });
    } catch (innerError) {
      console.error("Error while handling error", error);
      console.error("Error while handling inerError", innerError);

      return new AppError(
        "Um erro inesperado ocorreu",
        500,
        "UnexpectedError",
        { cause: innerError }
      );
    }
  }
}
