import express, { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getBookRouter } from './modules/books/interface/book.routes.js';
import { bookRepositoryMongo } from './modules/books/infrastructure/book.mongo.repository.js';
import { AppError } from './shared/errors.js';
import { UserRepositoryMongo } from './modules/user/infrastructure/user.mongo.repository.js';
import { getUserRouter } from './modules/user/interface/user.routes.js';
import { emailRepository } from './modules/user/infrastructure/adapters/Email.repository.js';

export const app = express();

const emailSender =
  process.env.NODE_ENV === 'test'
    ? { sendEmail: async () => {} }
    : emailRepository;
// пока так, мб потом перезакину
const booksRouter = Router();
const userRouter = Router();

getBookRouter(booksRouter, bookRepositoryMongo);
getUserRouter(userRouter, UserRepositoryMongo, emailSender);

// Парсинг :
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Роуты :
app.use('/books', booksRouter);
app.use('/user', userRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.log(err);
  return res.status(500).json({ message: 'Internal error' });
});
