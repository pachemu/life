import jwt from 'jsonwebtoken';
import { ENV } from '../../../shared/env.js';
import type { TokenPayload, TokenService } from '../domain/token.service.js';

const SECRET = ENV.secretToken || 'gus';

export const jwtTokenService: TokenService = {
  sign(payload) {
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
  },
  verify(token) {
    return jwt.verify(token, SECRET) as TokenPayload;
  },
};
