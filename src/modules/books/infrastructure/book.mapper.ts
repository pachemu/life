import { ObjectId } from "mongodb"
import { Book } from "../domain/book.entity.js"
import type { CreateBookInput, UpdateBookInput } from "../domain/book.repository.js"
import type { bookDbModel, createBookDbModel, updateBookDbModel } from "./types/book.db.model.js"

const toDomain = (dbModel: bookDbModel): Book => {
  let book = new Book (
    dbModel._id.toString(),
    dbModel.title,
    dbModel.author,
    dbModel.readPages,
    dbModel.totalPages
  )
  return book
}

const toCreateDb = (input: CreateBookInput): createBookDbModel => {
  let book = {
    title: input.title,
    author: input.author,
    readPages: input.readPages,
    totalPages: input.totalPages
  }
  return book
}

const toUpdateDb = (input: UpdateBookInput): updateBookDbModel => {
  let book = {
    title: input.title,
    author: input.author,
    readPages: input.readPages,
    totalPages: input.totalPages
  }
  return book
}

const toDb = (book: Book): bookDbModel => {
  let bookDb = {
    _id: new ObjectId(book.id),
    title: book.title,
    author: book.author,
    readPages: book.readPages,
    totalPages: book.totalPages
  }
  return bookDb
}

export const bookMapper = {
  toDomain,
  toCreateDb,
  toUpdateDb,
  toDb
}