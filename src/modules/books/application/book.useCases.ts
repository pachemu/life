import { errors } from '../../../shared/errors.js';
import { Book } from '../domain/book.entity.js';
import type {
  BookRepository,
  CreateBookInput,
  UpdateBookInput,
  BookQuery,
} from '../domain/book.repository.js';

const getBooks = async (
  repo: BookRepository,
  ownerId: string,
  query: BookQuery,
) => {
  let books;
  if (!query.title) {
    books = await repo.findAll(ownerId);
  } else {
    books = await repo.findByQuery(ownerId, query);
  }
  return books;
};

const getBookById = async (
  repo: BookRepository,
  ownerId: string,
  bookId: string,
) => {
  const book = await repo.findById(bookId, ownerId);
  if (!book) throw new errors.NotFoundError('Book not found');
  return book;
};

// const readPages = async (repo: BookRepository, bookId: string, pages: number) => {
//     let book = await repo.findById(bookId)
//     let bookData = {
//         readPages: pages
//     }
//     if (!book) throw new errors.NotFoundError('Book not found')
//     book.updateReadPages(pages)
//     await repo.update(bookId, bookData)
//     return book
// } // for better times
const createBook = async (
  repo: BookRepository,
  ownerId: string,
  bookData: CreateBookInput,
) => {
  new Book(
    'temp',
    ownerId,
    bookData.title,
    bookData.author,
    bookData.readPages,
    bookData.totalPages,
  );
  return repo.create(ownerId, bookData);
}; // I think this method can be created better

const deleteBook = async (
  repo: BookRepository,
  ownerId: string,
  bookId: string,
) => {
  let book = await repo.findById(bookId, ownerId);
  if (!book) throw new errors.NotFoundError('Book not found');
  let result = await repo.delete(book.id, ownerId);
  return result;
};

const deleteAllBooks = async (repo: BookRepository, ownerId: string) => {
  let result = await repo.deleteAll(ownerId);
  return result;
};

const updateBook = async (
  repo: BookRepository,
  ownerId: string,
  bookId: string,
  bookData: UpdateBookInput,
) => {
  let book = await repo.findById(bookId, ownerId);
  if (!book) throw new errors.NotFoundError('Book not found');
  book.updateDetails(bookData);
  let result = await repo.update(book.id, ownerId, bookData);
  return result;
};

export const useCases = {
  getBooks,
  getBookById,
  // readPages,
  deleteBook,
  deleteAllBooks,
  createBook,
  updateBook,
};
