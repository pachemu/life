import type { User } from '../domain/user.entity.js';

export type LoginResponse = {
  AccessToken: string;
  RefreshToken: string;
  User: User;
};

export type LoginCredentials = {
  login: string;
  password: string;
};
