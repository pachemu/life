import type { Router, Response } from "express"
import type { GetBookModel, BookViewModel, RequestWithParams, RequestWithQuery, RequestWithBody, PostBookModel, DeleteBookModel, RequestWithParamsAndBody, UpdateBookModelParams, UpdateBookModelBody } from "./book.routes.types.js"
import type { Book } from '../domain/book.entity.js'
import { HTTP_STATUSES } from "../../../shared/HTTP_STATUSES.js"
import { useCases } from "../application/book.useCases.js"
import { bookRepositoryMongo } from "../infrastructure/book.mongo.repository.js"

export const getBookRouter = (router: Router) => {
  // Query запросы
  router.get(
    '/',
    async (
      req: RequestWithQuery<Book>,
      res: Response<{ message: BookViewModel[] }>,
    ) => {
      let books = await useCases.getAllBooks(bookRepositoryMongo)
      return res.status(HTTP_STATUSES.OK_200).json({ message: books })
    },
  )

  router.get(
    '/:id',
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
    // validateJsonBody,
    // validationTitleMiddleware,
    // inputValidationMiddleware,
    async (
      req: RequestWithBody<PostBookModel>,
      res: Response<{ message: BookViewModel | string }>,
    ) => {
      let newBook;
      newBook = await useCases.createBook(bookRepositoryMongo, req.body)
      return res.status(HTTP_STATUSES.CREATED_201).json({ message: newBook })
    },
  )

  router.delete(
    '/:id',
    // validationIdMiddleware,
    // inputValidationMiddleware,
    async (
      req: RequestWithParams<DeleteBookModel>,
      res: Response<{ message: BookViewModel[] | boolean }>,
    ) => {
      let newBook = await useCases.deleteBook(bookRepositoryMongo, req.params.id)

      return res.status(HTTP_STATUSES.OK_200).json({ message: newBook })
     
    },
  )

  router.put(
    '/:id',
    // validationTitleMiddleware,
    // validationIdMiddleware,
    // inputValidationMiddleware,
    async (
      req: RequestWithParamsAndBody<UpdateBookModelParams, UpdateBookModelBody>,
      res: Response<{ message: any }>,
    ) => {
      let newBook = await useCases.updateBook(bookRepositoryMongo, req.params.id, req.body)
      return res.status(HTTP_STATUSES.OK_200).json({ message: newBook })
    },
  )
}
