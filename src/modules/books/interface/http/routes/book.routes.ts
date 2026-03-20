import type { Router, Response } from 'express';
import { errors } from '../../../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../../../shared/HTTP_STATUSES.js';
import { authMiddleware } from '../../../../auth/interface/auth.middleware.js';
import { useCases } from '../../../application/book.useCases.js';
import type { BookRepository } from '../../../domain/book.repository.js';
import { middlewares } from '../middlewares/book.middleware.js';
import type {
  RequestWithQuery,
  BookQuery,
  BookViewModel,
  RequestWithParams,
  BookIdParams,
  RequestWithBody,
  CreateBookBody,
  DeleteBookParams,
  RequestWithParamsAndBody,
  UpdateBookParams,
  UpdateBookBody,
} from './book.routes.types.js';
import bookToView from '../mappers/book.mapper.js';

const getOwnerId = (userId: string | undefined): string => {
  if (!userId) {
    throw new errors.AppError(HTTP_STATUSES.UNATHORIZED_401, 'Invalid token');
  }
  return userId;
};

export const getBookRouter = (
  router: Router,
  bookRepositoryMongo: BookRepository,
) => {
  // Query запросы
  router.get(
    '/',
    authMiddleware,
    async (
      req: RequestWithQuery<BookQuery>,
      res: Response<{ message: BookViewModel[] }>,
    ) => {
      let result = await useCases.getBooks(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.query,
      );
      let books = result.map((el) => bookToView(el));
      return res.status(HTTP_STATUSES.OK_200).json({ message: books });
    },
  );
  router.get(
    '/:id',
    authMiddleware,
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParams<BookIdParams>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let result = await useCases.getBookById(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
      );
      let book = bookToView(result);
      return res.status(HTTP_STATUSES.OK_200).json({ message: book });
    },
  );
  // Commands запросы

  router.post(
    '/',
    authMiddleware,
    middlewares.validationCreateBookMiddleware,
    async (
      req: RequestWithBody<CreateBookBody>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let newBook = await useCases.createBook(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.body,
      );
      let book = bookToView(newBook);
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: book });
    },
  );

  router.delete(
    '/:id',
    authMiddleware,
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParams<DeleteBookParams>,
      res: Response<{ message: boolean }>,
    ) => {
      const result = await useCases.deleteBook(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );

  router.delete(
    '/',
    authMiddleware,
    async (req, res: Response<{ message: boolean }>) => {
      const result = await useCases.deleteAllBooks(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  );

  router.put(
    '/:id',
    authMiddleware,
    middlewares.validationUpdateBookMiddleware,
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateBookParams, UpdateBookBody>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let newBook = await useCases.updateBook(
        bookRepositoryMongo,
        getOwnerId(req.user?.userId),
        req.params.id,
        req.body,
      );
      let book = bookToView(newBook);
      return res.status(HTTP_STATUSES.OK_200).json({ message: book });
    },
  );
  //USER
};
