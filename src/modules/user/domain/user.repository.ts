import type { User } from '../user.types.js';

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
  email: string;
};

export interface UserRepository {
  createUser(data: CreateUserInput): Promise<null | User>;
  loginUser(data: LoginUserInput): Promise<null | User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(userId: string): Promise<boolean>;
  findByVerificationCode(code: string): Promise<User | null>;
  confirmUser(code: string): Promise<boolean | null>;
}
