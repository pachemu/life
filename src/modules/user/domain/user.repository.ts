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
  createUser(data: CreateUserInput): Promise<string>;
  loginUser(data: LoginUserInput): Promise<string>;
}
