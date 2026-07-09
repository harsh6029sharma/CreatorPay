import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
    data: null,
  });
}