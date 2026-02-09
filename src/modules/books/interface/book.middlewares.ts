import type { NextFunction, Request, Response } from 'express';
import * as z from 'zod'

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

type ValidateInput = (
  schema: z.ZodObject<{
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
  }>
) => MiddlewareFunction;

const title = z.string().trim().min(3)
const author = z.string().trim().min(3)
const readPages = z.number().int().nonnegative()
const totalPages = z.number().int().min(2)


const bookCreateSchema = z.object({ 
    body: z.object({
        title: title,
        author: author,
        readPages: readPages,
        totalPages: totalPages
    })

})

const bookUpdateSchema = 
z.object({ 
    body: z.object({
        title: title.optional(),
        author: author.optional(),
        readPages: readPages.optional(),
        totalPages: totalPages.optional()
    })
})

const idParamSchema = z.strictObject({
    id: z.string().min(1)
})

const validateInput: ValidateInput =
  (schema: z.ZodSchema): MiddlewareFunction =>
  (req: Request, res: Response, next) => {

    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      });
    }

    next();
  };

export const middlewares = {
    validationCreateBookMiddleware: validateInput(bookCreateSchema),
    validationUpdateBookMiddleware: validateInput(bookUpdateSchema)
}