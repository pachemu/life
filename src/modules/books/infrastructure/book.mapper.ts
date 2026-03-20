import { ObjectId } from 'mongodb';
import { Book } from '../domain/book.entity.js';
import type {
  CreateBookInput,
  UpdateBookInput,
} from '../domain/book.repository.js';
import type {
  BookDbModel,
  CreateBookDbModel,
  UpdateBookDbModel,
} from './types/book.db.model.js';

const toDomain = (dbModel: BookDbModel): Book => {
  let book = new Book(
    dbModel._id.toString(),
    dbModel.ownerId,
    dbModel.title,
    dbModel.author,
    dbModel.readPages,
    dbModel.totalPages,
  );
  return book;
};

const toCreateDb = (
  ownerId: string,
  input: CreateBookInput,
): CreateBookDbModel => {
  let book = {
    ownerId,
    title: input.title,
    author: input.author,
    readPages: input.readPages,
    totalPages: input.totalPages,
  };
  return book;
};

const toUpdateDb = (input: UpdateBookInput): UpdateBookDbModel => {
  let book = {
    title: input.title,
    author: input.author,
    readPages: input.readPages,
    totalPages: input.totalPages,
  };
  return book;
};

const toDb = (book: Book): BookDbModel => {
  let bookDb = {
    _id: new ObjectId(book.id),
    ownerId: book.ownerId,
    title: book.title,
    author: book.author,
    readPages: book.readPages,
    totalPages: book.totalPages,
  };
  return bookDb;
};

export const bookMapper = {
  toDomain,
  toCreateDb,
  toUpdateDb,
  toDb,
};
