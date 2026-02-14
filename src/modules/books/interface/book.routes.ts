import type { Router, Response } from 'express';
import type {
  GetBookModel,
  BookViewModel,
  RequestWithParams,
  RequestWithQuery,
  RequestWithBody,
  PostBookModel,
  DeleteBookModel,
  RequestWithParamsAndBody,
  UpdateBookModelParams,
  UpdateBookModelBody,
  BookQuery,
} from './book.routes.types.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
import { useCases } from '../application/book.useCases.js';
import { middlewares } from './book.middlewares.js';
import type { BookRepository } from '../domain/book.repository.js';
import bookToView from './book.mapper.js';

export const getBookRouter = (
  router: Router,
  bookRepositoryMongo: BookRepository,
) => {
  // Query запросы
  router.get(
    '/',
    async (
      req: RequestWithQuery<BookQuery>,
      res: Response<{ message: BookViewModel[] }>,
    ) => {
      let result = await useCases.getBooks(bookRepositoryMongo, req.query);
      let books = result.map((el) => bookToView(el));
      return res.status(HTTP_STATUSES.OK_200).json({ message: books });
    },
  );
  router.get(
    '/:id',
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParams<GetBookModel>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let result = await useCases.getBookById(
        bookRepositoryMongo,
        req.params.id,
      );
      let book = bookToView(result);
      return res.status(HTTP_STATUSES.OK_200).json({ message: book });
    },
  );
  // Commands запросы

  router.post(
    '/',
    middlewares.validationCreateBookMiddleware,
    async (
      req: RequestWithBody<PostBookModel>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let newBook = await useCases.createBook(bookRepositoryMongo, req.body);
      let book = bookToView(newBook);
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: book });
    },
  );

  (router.delete(
    '/:id',
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParams<DeleteBookModel>,
      res: Response<{ message: boolean }>,
    ) => {
      let result = await useCases.deleteBook(
        bookRepositoryMongo,
        req.params.id,
      );
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    },
  ),
    router.delete('/', async (_req, res: Response<{ message: boolean }>) => {
      let result = await useCases.deleteAllBooks(bookRepositoryMongo);
      return res.status(HTTP_STATUSES.OK_200).json({ message: result });
    }));

  router.put(
    '/:id',
    middlewares.validationUpdateBookMiddleware,
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateBookModelParams, UpdateBookModelBody>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let newBook = await useCases.updateBook(
        bookRepositoryMongo,
        req.params.id,
        req.body,
      );
      let book = bookToView(newBook);
      return res.status(HTTP_STATUSES.OK_200).json({ message: book });
    },
  );
};
