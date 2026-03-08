export type TokenPayload = {
  login: string;
  email: string;
  userId: string;
};
export interface TokenService {
  signAccess(payload: TokenPayload): string;
  verifyAccess(token: string): TokenPayload;
  signRefresh(payload: TokenPayload): string;
  verifyRefresh(token: string): TokenPayload;
}
export type AccessToken = string;
export type RefreshToken = string;
