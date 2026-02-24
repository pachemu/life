export type TokenPayload = {
  login: string;
  email: string;
  userId: string;
};
export interface TokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
