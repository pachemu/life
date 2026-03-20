import type { ObjectId } from 'mongodb';

export type BookDbModel = {
  _id: ObjectId;
  ownerId: string;
  title: string;
  author: string;
  readPages: number;
  totalPages: number;
};

export type CreateBookDbModel = {
  ownerId: string;
  title: string;
  author: string;
  readPages: number;
  totalPages: number;
};

export type UpdateBookDbModel = {
  title: string | undefined;
  author: string | undefined;
  readPages: number | undefined;
  totalPages: number | undefined;
};
