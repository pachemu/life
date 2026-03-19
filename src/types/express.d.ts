import type { TokenPayload } from '../modules/auth/domain/token.service.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}
