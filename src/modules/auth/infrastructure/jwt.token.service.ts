import jwt from 'jsonwebtoken';
import { ENV } from '../../../shared/env.js';
import type { TokenPayload, TokenService } from '../domain/token.service.js';

const ACCESS_SECRET = ENV.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = ENV.REFRESH_TOKEN_SECRET;

export const jwtTokenService: TokenService = {
  signAccess(payload) {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  },
  verifyAccess(token) {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  },
  signRefresh(payload) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '1d' });
  },
  verifyRefresh(token) {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  },
};
