import type { Book } from "./book.entity.js";

export type CreateBookInput = {
    title: string,
    author: string,
    readPages: number,
    totalPages: number
}

export type UpdateBookInput = CreateBookInput

export type BookQuery = Omit<Book, 'id'>

export interface BookRepository {
  findAll(): Promise<Book[]>
  findByQuery(query: BookQuery): Promise<Book[]>
  findById(id: string): Promise<Book | null>
  create(data: CreateBookInput): Promise<Book>
  update(id: string, data: UpdateBookInput): Promise<Book>
  delete(id: string): Promise<boolean>,
  deleteAll(): Promise<boolean>
}
