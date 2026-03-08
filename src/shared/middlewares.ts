import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as z from 'zod';
import { ENV } from './env.js';
import { HTTP_STATUSES } from './HTTP_STATUSES.js';
import { errors } from './errors.js';
import type { TokenService } from '../modules/user/domain/token.service.js'; // incorrect import, cause DDD dont provide this sh*t

const SECRET = ENV.ACCESS_TOKEN_SECRET;

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
  (TokenService: TokenService): MiddlewareFunction =>
  (req: Request, res: Response, next) => {
    const auth = req.headers.authorization;
    const parsed = authSchema.safeParse({ authorization: auth });
    if (!parsed.success || !auth) {
      return res
        .status(HTTP_STATUSES.UNATHORIZED_401)
        .json({ message: 'Invalid auth header' });
    }
    const jwtToken = auth.slice(7); // bearer
    try {
      const payload = TokenService.verifyAccess(jwtToken);
      (req as any).user = payload;
      next();
    } catch (e) {
      res
        .status(HTTP_STATUSES.UNATHORIZED_401)
        .json({ message: 'Invalid token' });
    }
  };

export const sharedMiddlewares = {
  validationTokenMiddleware: validationTokenMiddleware,
};
