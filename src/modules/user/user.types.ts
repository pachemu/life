import { ObjectId } from 'mongodb';

export type User = {
  userId: string;
  email: string;
  login: string;
};

export type UserDbModel = {
  _id: ObjectId;
  email: string;
  login: string;
  password: string;
  date: string;
};
