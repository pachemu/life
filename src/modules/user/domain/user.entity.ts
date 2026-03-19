export type User = {
  userId: string;
  email: string;
  login: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
  refreshTokenHash?: string | null;
};
