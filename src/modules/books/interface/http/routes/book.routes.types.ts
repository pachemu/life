import type { Request } from 'express';

export type BookViewModel = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type BookIdParams = {
  id: string;
};

export type CreateBookBody = {
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type DeleteBookParams = BookIdParams;

export type UpdateBookBody = {
  title: string;
  author: string;
  totalPages: number;
  readPages: number;
};

export type UpdateBookParams = BookIdParams;

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
