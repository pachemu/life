import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as z from 'zod';
import { ENV } from './env.js';
import { HTTP_STATUSES } from './HTTP_STATUSES.js';
import { errors } from './errors.js';

const SECRET = ENV.secretToken;

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
    authorization?: z.ZodTypeAny;
  }>,
) => MiddlewareFunction;

const authSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});

// const validateInput: ValidateInput = // В теории можно вообще переделать под специальный authMiddleware, но хочется чтобы была мультиил

//     (schema: z.ZodSchema): MiddlewareFunction =>
//     (req: Request, res: Response, next) => {
//       const result = schema.safeParse({
//         authorization: req.headers.authorization,
//         body: req.body,
//         query: req.query,
//         params: req.params,
//       });

//       if (!result.success) {
//         return res.status(400).json({
//           message: 'Validation is failed',
//           errors: result.error.issues.map((err) => ({
//             path: err.path.join('.'),
//             message: err.message,
//             code: err.code,
//           })),
//         });
//       }

//       next();
//     };

const validationTokenMiddleware =
  (): MiddlewareFunction => (req: Request, res: Response, next) => {
    const token = req.headers.authorization;
    const parsed = authSchema.safeParse({ authorization: token });
    if (!parsed.success || !token) {
      return res
        .status(HTTP_STATUSES.UNATHORIZED_401)
        .json({ messsage: 'Invalid auth header' });
    }
    const jwtToken = token.slice(7);
    try {
      const payload = jwt.verify(jwtToken, SECRET); // дубликация кода, мб можно перемести в jwtTokenService или как-то в общую папку, но не охота, не щас
      (req as any).user = payload;
      next();
    } catch (e) {
      throw new errors.AppError(
        HTTP_STATUSES.UNATHORIZED_401,
        'bad token, try to change to Bearer',
      ); // поменять месседж на норм
    }
  };

export const sharedMiddlewares = {
  validationTokenMiddleware: validationTokenMiddleware(),
};
