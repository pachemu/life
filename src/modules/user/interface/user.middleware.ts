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

const email = z.string().trim().min(3).max(50);
const login = z.string().trim().min(3).max(30);
const password = z.string().trim().min(4).max(30);

const userCreateSchema = z.object({
  body: z.object({
    email: email,
    login: login,
    password: password,
  }),
});

const userLoginSchema = z.object({
  body: z.object({
    login: login,
    password: password,
  }),
});

const userUpdateSchema = z.object({
  body: z.object({
    email: email,
    login: login,
    password: password,
  }),
});

const userIdParamSchema = z.object({
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
  validationCreateUserMiddleware: validateInput(userCreateSchema),
  validationUpdateUserMiddleware: validateInput(userUpdateSchema),
  validationIdUserMiddleware: validateInput(userIdParamSchema),
  validationLoginUserMiddleware: validateInput(userLoginSchema),
};
