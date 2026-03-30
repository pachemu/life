import express, { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { bookRepositoryMongo } from './modules/books/infrastructure/book.mongo.repository.js';
import { AppError } from './shared/errors.js';
import { UserRepositoryMongo } from './modules/user/infrastructure/user.mongo.repository.js';
import { getUserRouter } from './modules/user/interface/http/routes/user.routes.js';
import { emailRepository } from './modules/user/infrastructure/adapters/email.repository.js';
import { jwtTokenService } from './modules/auth/infrastructure/jwt.token.service.js';
import { getBookRouter } from './modules/books/interface/http/routes/book.routes.js';
import { nutritionRepositoryMongo } from './modules/nutrition/infrastructure/nutrition.mongo.repository.js';
import { getNutritionRouter } from './modules/nutrition/interface/http/routes/nutrition.routes.js';
import { workoutRepositoryMongo } from './modules/workouts/infrastructure/workout.mongo.repository.js';
import { getWorkoutRouter } from './modules/workouts/interface/http/routes/workout.routes.js';

export const app = express();

const emailSender =
  process.env.NODE_ENV === 'test'
    ? { sendEmail: async () => {} }
    : emailRepository;
// пока так, мб потом перезакину
const booksRouter = Router();
const userRouter = Router();
const nutritionRouter = Router();
const workoutsRouter = Router();

getBookRouter(booksRouter, bookRepositoryMongo);
getUserRouter(userRouter, UserRepositoryMongo, emailSender, jwtTokenService);
getNutritionRouter(nutritionRouter, nutritionRepositoryMongo);
getWorkoutRouter(workoutsRouter, workoutRepositoryMongo);

// Парсинг :
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Роуты :
app.use('/books', booksRouter);
app.use('/user', userRouter);
app.use('/nutrition', nutritionRouter);
app.use('/workouts', workoutsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.log(err);
  return res.status(500).json({ message: 'Internal error' });
});
