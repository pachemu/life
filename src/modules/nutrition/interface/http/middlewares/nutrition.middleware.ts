import type { NextFunction, Request, Response } from 'express';
import * as z from 'zod';

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }>,
) => MiddlewareFunction;

const date = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'invalid date format');
const nutritionValue = z.number().min(0);

const nutritionCreateSchema = z.object({
  body: z.object({
    date: date,
    calories: nutritionValue,
    fats: nutritionValue,
    carbs: nutritionValue,
    protein: nutritionValue,
  }),
});

const nutritionUpdateSchema = z.object({
  body: z.object({
    date: date.optional(),
    calories: nutritionValue.optional(),
    fats: nutritionValue.optional(),
    carbs: nutritionValue.optional(),
    protein: nutritionValue.optional(),
  }),
});

const nutritionDateParamSchema = z.object({
  params: z.object({
    date: date,
  }),
});

const validateInput: ValidateInput =
  (schema: z.ZodSchema): MiddlewareFunction =>
  (req: Request, res: Response, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      });
    }

    next();
  };

export const middlewares = {
  validationCreateNutritionMiddleware: validateInput(nutritionCreateSchema),
  validationUpdateNutritionMiddleware: validateInput(nutritionUpdateSchema),
  validationDateNutritionMiddleware: validateInput(nutritionDateParamSchema),
};
