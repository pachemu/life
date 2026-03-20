import type { Request } from 'express';

export type BookViewModel = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type GetBookModel = {
  id: string;
};
export type PostBookModel = {
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type DeleteBookModel = {
  id: string;
};

export type UpdateBookModelBody = {
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type UpdateBookModelParams = {
  id: string;
};

export type BookQuery = {
  title?: string;
  author?: string;
  readPages?: number;
  totalPages?: number;
};

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;
