import type { ObjectId } from 'mongodb';

export type BookDb = {
  id: string;
  title: string;
  author: string;
  readPages: number;
  totalPages: number;
};

export type GetBookData = {
  title: string;
};

export type PostBookData = {
  title: string;
  author: string;
  readPages: number;
  totalPages: number;
};
