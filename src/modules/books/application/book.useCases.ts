import { AppError, errors } from '../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';
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
  books = await repo.findByQuery(ownerId, query);
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
  try {
    book.updateDetails(bookData);
  } catch (e) {
    throw new AppError(
      HTTP_STATUSES.BAD_REQUEST_400,
      'couldnt update book, check your query',
    );
  }

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
