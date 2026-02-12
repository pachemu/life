import express, { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { getBookRouter } from './modules/books/interface/book.routes.js'
import { bookRepositoryMongo } from './modules/books/infrastructure/book.mongo.repository.js'
import { AppError } from './shared/errors.js'

export const app = express()

const lifeRouter = Router()
getBookRouter(lifeRouter, bookRepositoryMongo)

app.use(cors())
app.use(express.json())
app.use('/books', lifeRouter)

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message })
  }
  return res.status(500).json({ message: 'Internal error' })
})
