import { ObjectId } from 'mongodb';

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
