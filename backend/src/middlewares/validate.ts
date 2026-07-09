import type { Request, Response, NextFunction } from "express";
import * as z from 'zod'
import { ApiError } from "../utils/ApiError";

export const validate = (schema: z.ZodType) => (req: Request, _: Response, next: NextFunction) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        }) as { body?: unknown; query?: unknown; params?: unknown };

        req.body = parsed.body ?? req.body
        req.validatedQuery = parsed.query as Record<string, unknown> | undefined  // 👈 query yahan store, req.query untouched
        req.params = (parsed.params ?? req.params) as any

        next()

    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(
                (e) => `${e.path.join(".")}: ${e.message}`
            );
            return next(new ApiError(400, "Validation failed", errorMessages));
        }
        next(error);
    }
}