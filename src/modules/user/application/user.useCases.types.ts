import type { User } from '../domain/user.entity.js';

export type responseLogin = {
  AccessToken: string;
  RefreshToken: string;
  User: User;
};

export type userData = {
  login: string;
  password: string;
};
