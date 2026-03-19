import type { User } from './user.entity.js';

export type CreateUserInput = {
  email: string;
  login: string;
  password: string;
  confirmationCode: string;
  expirationCodeTime: Date;
};

export type LoginUserInput = {
  login: string;
  password: string;
};

export type VerifyUserInput = {
  code: string;
};

export type RegisterUserInput = {
  email: string;
  login: string;
  password: string;
};

export interface UserRepository {
  createUser(data: CreateUserInput): Promise<null | User>;
  loginUser(data: LoginUserInput): Promise<null | User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: string): Promise<boolean>;
  findByVerificationCode(code: string): Promise<User | null>;
  confirmUser(userId: string): Promise<boolean | null>;
  findById(userId: string): Promise<User | null>;
  updateRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<boolean>;
}
