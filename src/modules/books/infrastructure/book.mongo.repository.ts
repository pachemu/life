import { ObjectId, type Filter } from 'mongodb';
import { getDb } from '../../../shared/db/mongo.js';
import type { BookDbModel } from './types/book.db.model.js';
import { bookMapper } from './book.mapper.js';
import type { Book } from '../domain/book.entity.js';
import type {
  BookQuery,
  CreateBookInput,
  UpdateBookInput,
} from '../domain/book.repository.js';
import { AppError } from '../../../shared/errors.js';
import { HTTP_STATUSES } from '../../../shared/HTTP_STATUSES.js';

const COLLECTION = 'books';

const getCollection = () => getDb<BookDbModel>(COLLECTION);

const findAll = async (ownerId: string): Promise<Book[]> => {
  const collection = getCollection();
  let docs = await collection.find({ ownerId }).toArray();
  return docs.map(bookMapper.toDomain);
};

const findByQuery = async (
  ownerId: string,
  query: BookQuery,
): Promise<Book[]> => {
  const collection = getCollection();
  const filter: Filter<BookDbModel> = { ownerId };
  if (query.title) filter.title = { $regex: query.title, $options: 'i' };
  if (query.author) filter.author = { $regex: query.author, $options: 'i' };
  if (query.readPages !== undefined) filter.readPages = query.readPages;
  if (query.totalPages !== undefined) filter.totalPages = query.totalPages;

  const docs = await collection.find(filter).toArray();
  return docs.map(bookMapper.toDomain);
};

const findById = async (id: string, ownerId: string): Promise<Book | null> => {
  const collection = getCollection();
  let docs = await collection.findOne({ _id: new ObjectId(id), ownerId });
  return docs ? bookMapper.toDomain(docs) : null;
};

const create = async (
  ownerId: string,
  dataBook: CreateBookInput,
): Promise<Book> => {
  const collection = getCollection();
  const dbModel = bookMapper.toCreateDb(ownerId, dataBook);
  const id = (await collection.insertOne(dbModel as BookDbModel)).insertedId;
  const createdBook = await collection.findOne({ _id: id, ownerId });
  if (!createdBook) {
    throw new AppError(
      HTTP_STATUSES.BAD_REQUEST_400,
      'created book doesnt exist',
    );
  }
  return await bookMapper.toDomain(createdBook);
};

const update = async (
  id: string,
  ownerId: string,
  dataBook: UpdateBookInput,
): Promise<Book> => {
  const collection = getCollection();
  await collection.updateOne(
    { _id: new ObjectId(id), ownerId },
    { $set: dataBook },
  );
  const updatedBook = await collection.findOne({
    _id: new ObjectId(id),
    ownerId,
  });
  if (!updatedBook) {
    throw new AppError(
      HTTP_STATUSES.BAD_REQUEST_400,
      'created book doesnt exist',
    );
  }
  return bookMapper.toDomain(updatedBook);
};

const deleteById = async (id: string, ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteOne({ _id: new ObjectId(id), ownerId });
  if (result.deletedCount !== 1) {
    throw new AppError(HTTP_STATUSES.NOT_FOUND_404, 'not found book');
  }
  return true;
};

const deleteAllBooks = async (ownerId: string): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteMany({ ownerId });
  return result.acknowledged;
};

export const bookRepositoryMongo = {
  findAll,
  findByQuery,
  findById,
  create,
  update,
  delete: deleteById,
  deleteAll: deleteAllBooks,
};
