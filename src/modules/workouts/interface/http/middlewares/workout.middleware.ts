import type { NextFunction, Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
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
  .regex(/^\d{2}-\d{2}-\d{4}$/, 'invalid date format');

const workoutSetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().min(0),
  rpe: z.number().min(1).max(10).optional(),
});

const workoutExerciseSchema = z.object({
  name: z.string().trim().min(1).max(100),
  muscleGroup: z.string().trim().min(1).max(50).optional(),
  sets: z.array(workoutSetSchema).min(1),
});

const workoutCreateSchema = z.object({
  body: z.object({
    date,
    notes: z.string().trim().max(1000).optional(),
    exercises: z.array(workoutExerciseSchema).min(1),
  }),
});

const workoutUpdateSchema = z.object({
  body: z.object({
    date: date.optional(),
    notes: z.string().trim().max(1000).optional(),
    exercises: z.array(workoutExerciseSchema).min(1).optional(),
  }),
});

const workoutIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => isValidObjectId(val), {
      message: 'invalid id format',
    }),
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
  validationCreateWorkoutMiddleware: validateInput(workoutCreateSchema),
  validationUpdateWorkoutMiddleware: validateInput(workoutUpdateSchema),
  validationIdWorkoutMiddleware: validateInput(workoutIdParamSchema),
};
