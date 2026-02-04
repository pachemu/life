import type { Book } from "./book.entity.js";

export type CreateBookInput = {
    title: string,
    author: string,
    readPages: number,
    totalPages: number
}

export type UpdateBookInput = CreateBookInput

export interface BookRepository {
  findAll(): Promise<Book[]>
  findById(id: string): Promise<Book | null>
  create(data: CreateBookInput): Promise<string>
  update(id: string, data: UpdateBookInput): Promise<boolean>
  delete(id: string): Promise<boolean>
}
