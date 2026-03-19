import type { NextFunction, Request, Response } from 'express';
import * as z from 'zod';
import { HTTP_STATUSES } from './HTTP_STATUSES.js';
import type { TokenPayload } from '../modules/auth/domain/token.service.js';

type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void;

type AccessVerifier = {
  verifyAccess(token: string): TokenPayload;
};

const authSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});

const validationTokenMiddleware =
  (tokenService: AccessVerifier): MiddlewareFunction =>
  (req, res, next) => {
    const auth = req.headers.authorization;
    const parsed = authSchema.safeParse({ authorization: auth });

    if (!parsed.success || !auth) {
      return res
        .status(HTTP_STATUSES.UNATHORIZED_401)
        .json({ message: 'Invalid auth header' });
    }

    const jwtToken = auth.slice(7);

    try {
      const payload = tokenService.verifyAccess(jwtToken);
      (req as any).user = payload;
      next();
    } catch {
      return res
        .status(HTTP_STATUSES.UNATHORIZED_401)
        .json({ message: 'Invalid token' });
    }
  };

export const sharedMiddlewares = {
  validationTokenMiddleware,
};
