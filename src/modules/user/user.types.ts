import { ObjectId } from 'mongodb';
import type { AccessToken, RefreshToken } from './domain/token.service.js';

export type User = {
  userId: string;
  email: string;
  login: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
  refreshTokenHash?: string | null;
};

export type UserDbModel = {
  _id: ObjectId;
  email: string;
  login: string;
  password: string;
  date: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
  refreshTokenHash?: string | null;
};

export type UserData = {
  date: string;
  password: string;
  login: string;
  email: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
  refreshTokenHash?: string | null;
};

export type UserViewModel = {
  userId: string;
  email: string;
  login: string;
};

export type responseLogin = {
  AccessToken: AccessToken;
  RefreshToken: RefreshToken;
  User: User;
};
export type userData = {
  login: string;
  password: string;
};
