import { errors } from "../../../shared/errors.js";
import type { BookRepository, CreateBookInput, UpdateBookInput, BookQuery } from "../domain/book.repository.js"

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
    if (!book) throw new errors.NotFoundError("Book not found");
    return book; 
};

const readPages = async (repo: BookRepository, bookId: string, pages: number) => {
    let book = await repo.findById(bookId)
    let bookData = {
        readPages: pages
    }
    if (!book) throw new errors.NotFoundError('Book not found')
    book.updateReadPages(pages)
    await repo.update(bookId, bookData) 
    return book
} // ВООБЩЕ НУЖЕН ЛИ ЭТОТ **** МЕТОД если есть UPDATE? или я SUCKEN COCKEN
// CHECK THIS SHIT

const createBook = async (repo: BookRepository, bookData: CreateBookInput) => {
    const result = await repo.create(bookData)
    result.updateDetails(bookData)
    return result
} // maybe i need to delete 'updateDetails', cause it useless

const deleteBook = async (repo: BookRepository, bookId: string) => {
    let book = await repo.findById(bookId)
    if(!book) throw new errors.NotFoundError('Book not found')
    let result = await repo.delete(book?.id)
    return result
}

const deleteAllBooks = async (repo: BookRepository) => {
    let result = await repo.deleteAll()
    return result
}

const updateBook = async (repo: BookRepository, bookId: string, bookData: UpdateBookInput) => {
    let book = await repo.findById(bookId)
    if(!book) throw new errors.NotFoundError('Book not found')
    book.updateDetails(bookData)
    let result = await repo.update(book?.id, bookData)
    return result
}

export const useCases = {
    getBooks,
    getBookById,
    readPages,
    deleteBook,
    deleteAllBooks,
    createBook,
    updateBook,
}
