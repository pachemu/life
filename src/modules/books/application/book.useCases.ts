import type { BookRepository, CreateBookInput, UpdateBookInput, BookQuery } from "../domain/book.repository.js"
import { NotFoundError } from "./error.js";

const getBooks = async (repo: BookRepository, query: BookQuery) => {
    let books;
    if(!query.title) {
        books = await repo.findAll()
    } else {
        books = await repo.findByQuery(query)
    }
    return books
}

const getBookById = async (repo: BookRepository, bookId: string) => {
    const book = await repo.findById(bookId);
    if (!book) throw new Error("Book not found");
    return book; 
};

const readPages = async (repo: BookRepository, bookId: string, pages: number) => {
    let book = await repo.findById(bookId)
    if (!book) throw new Error('Book not found')
    book.updatePages(pages)
    return book
}

const createBook = async (repo: BookRepository, bookData: CreateBookInput) => {
    const result = await repo.create(bookData)
    return result
  
}

const deleteBook = async (repo: BookRepository, bookId: string) => {
    let book = await repo.delete(bookId)
    return book
}

const deleteAllBooks = async (repo: BookRepository) => {
    let result = await repo.deleteAll()
    return result
}

const updateBook = async (repo: BookRepository, bookId: string, bookData: UpdateBookInput) => {
    let book = await repo.update(bookId, bookData)
    return book
}

export const useCases = {
    getBooks: getBooks,
    getBookById,
    readPages,
    deleteBook,
    deleteAllBooks,
    createBook,
    updateBook,
}
