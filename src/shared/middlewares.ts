import type { NextFunction, Request, Response } from 'express';
import * as z from 'zod';
import { HTTP_STATUSES } from './HTTP_STATUSES.js';
import type { TokenService } from '../modules/user/domain/token.service.js'; // incorrect import, cause DDD dont provide this sh*t

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

const authSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});

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
