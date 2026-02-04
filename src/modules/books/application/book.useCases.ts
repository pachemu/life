import type { BookRepository, CreateBookInput, UpdateBookInput } from "../domain/book.repository.js"

const getAllBooks = async (repo: BookRepository) => {
    const books = await repo.findAll()
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

const updateBook = async (repo: BookRepository, bookId: string, bookData: UpdateBookInput) => {
    let book = await repo.update(bookId, bookData)
    return book
}

export const useCases = {
    getAllBooks,
    getBookById,
    readPages,
    deleteBook,
    createBook,
    updateBook,

}
