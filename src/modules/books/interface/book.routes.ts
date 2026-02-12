import type { Router, Response } from "express"
import type { GetBookModel, BookViewModel, RequestWithParams, RequestWithQuery, RequestWithBody, PostBookModel, DeleteBookModel, RequestWithParamsAndBody, UpdateBookModelParams, UpdateBookModelBody } from "./book.routes.types.js"
import { HTTP_STATUSES } from "../../../shared/HTTP_STATUSES.js"
import { useCases } from "../application/book.useCases.js"
import { middlewares } from "./book.middlewares.js"
import type { BookRepository } from "../domain/book.repository.js"

export const getBookRouter = (router: Router, bookRepositoryMongo : BookRepository) => {
  // Query запросы
  router.get(
    '/',
    async (
      req: RequestWithQuery<BookViewModel>,
      res: Response<{ message: BookViewModel[] }>,
    ) => {
      let books = await useCases.getBooks(bookRepositoryMongo, req.query)
      return res.status(HTTP_STATUSES.OK_200).json({ message: books })
    },
  )

  router.get(
    '/:id',
    middlewares.validationIdBookMiddleware
    ,
    async (
      req: RequestWithParams<GetBookModel>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      return res
        .status(HTTP_STATUSES.OK_200)
        .json({ message: await useCases.getBookById(bookRepositoryMongo, req.params.id) })
    },
  )
  // Commands запросы

  router.post(
    '/',
    middlewares.validationCreateBookMiddleware,
    // validateJsonBody,
    // validationTitleMiddleware,
    // inputValidationMiddleware,
    async (
      req: RequestWithBody<PostBookModel>,
      res: Response<{ message: BookViewModel }>,
    ) => {
      let newBook: BookViewModel;
      newBook = await useCases.createBook(bookRepositoryMongo, req.body)
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: newBook })
    },
  )

  router.delete(
    '/:id',
    middlewares.validationIdBookMiddleware,
    async (
      req: RequestWithParams<DeleteBookModel>,
      res: Response<{ message: String | boolean }>,
    ) => {
      let result = await useCases.deleteBook(bookRepositoryMongo, req.params.id)
      return res.status(HTTP_STATUSES.OK_200).json({ message: result })
    },
  ),

  router.delete(
    '/',
    async (
      _req,
      res: Response<{ message: boolean }>
    ) => {
      let result = await useCases.deleteAllBooks(bookRepositoryMongo)

      return res.status(HTTP_STATUSES.OK_200).json({ message: result})
    },
  )

  router.put(
    '/:id',
    middlewares.validationUpdateBookMiddleware,
    middlewares.validationIdBookMiddleware,
    // validationIdMiddleware,
    // inputValidationMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateBookModelParams, UpdateBookModelBody>,
      res: Response<{ message: BookViewModel | string }>,
    ) => {
      let newBook = await useCases.updateBook(bookRepositoryMongo, req.params.id, req.body)
      return res.status(HTTP_STATUSES.OK_200).json({ message: newBook })
    },
  )
}

// P.S. СДЕЛАТЬ МАППИНГ, ЧТОБЫ ВОЗВРАЩАЛСЯ ПОЛЬЗОВАТЕЛЮ НЕ BOOK А КОНКРЕТНЫЙ BOOKVIEWMODEL(ТАМ ОШИБКА TS)