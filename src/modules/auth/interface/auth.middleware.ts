import { sharedMiddlewares } from '../../../shared/middlewares.js';
import { jwtTokenService } from '../infrastructure/jwt.token.service.js';

export const authMiddleware =
  sharedMiddlewares.validationTokenMiddleware(jwtTokenService);
