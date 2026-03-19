import type { Request } from 'express';

export type RequestWithBody<T> = Request<{}, {}, T>;
export type RequestWithQuery<T> = Request<{}, {}, {}, T>;
export type RequestWithParams<T> = Request<T>;
export type RequestWithParamsAndBody<T, B> = Request<T, {}, B>;

export type RequestWithCookie<T> = Request & {
  cookies: T;
};

export type RequestWithUser<T> = Request & {
  user: T;
};

export type DeleteModel = {
  id: string;
};
