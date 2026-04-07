import { ZodError } from "zod";

export class AppError extends Error {
  constructor(message: string, public readonly code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(
  error: unknown,
  fallback = "Nao foi possivel concluir a operacao.",
) {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
