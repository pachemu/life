import express, { Router } from 'express'
import cors from 'cors'
import { getBookRouter } from './modules/books/interface/book.routes.js'

export const app = express()

const lifeRouter = Router()
getBookRouter(lifeRouter)

app.use(cors())
app.use(express.json())
app.use('/books', lifeRouter)