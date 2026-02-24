import type { User } from '../user.types.js';

export type CreateUserInput = {
  email: string;
  login: string;
  password: string;
};

export type LoginUserInput = {
  login: string;
  password: string;
};

export interface UserRepository {
  createUser(data: CreateUserInput): Promise<null | User>;
  loginUser(data: LoginUserInput): Promise<null | User>;
}
