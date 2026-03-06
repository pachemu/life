import { ObjectId } from 'mongodb';

export type User = {
  userId: string;
  email: string;
  login: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
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
};

export type UserData = {
  date: string;
  password: string;
  login: string;
  email: string;
  isConfirmed: boolean;
  confirmationCode: string;
  expirationCodeTime: Date;
};
