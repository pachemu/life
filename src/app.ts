import express, { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { getBookRouter } from './modules/books/interface/book.routes.js';
import { bookRepositoryMongo } from './modules/books/infrastructure/book.mongo.repository.js';
import { AppError } from './shared/errors.js';
import { getUserRouter } from './modules/user/interface/book.routes.js';
import { UserRepositoryMongo } from './modules/user/infrastructure/user.mongo.repository.js';

export const app = express();

const booksRouter = Router();
const userRouter = Router();

getBookRouter(booksRouter, bookRepositoryMongo);
getUserRouter(userRouter, UserRepositoryMongo);

app.use(cors());
app.use(express.json());

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal error' });
});
