import {
  Collection,
  ObjectId,
  type DeleteResult,
  type InsertOneResult,
  type OptionalId,
  type UpdateResult,
} from 'mongodb';
import { getDb } from '../../../shared/db/mongo.js';
import type { bookDbModel } from './types/book.db.model.js';
import { bookMapper } from './book.mapper.js';
import type { Book } from '../domain/book.entity.js';
import type {
  BookQuery,
  CreateBookInput,
  CreateUserInput,
  LoginUserInput,
  UpdateBookInput,
} from '../domain/book.repository.js';
import bcrypt from 'bcrypt';

const COLLECTION = 'books';
const USER_COLLECTION = 'user';

const getCollection = () => getDb<bookDbModel>(COLLECTION);
const getUserCollection = () => getDb<any>(USER_COLLECTION);

const findAll = async (): Promise<Book[]> => {
  const collection = getCollection();
  let docs = await collection.find().toArray();
  return docs.map(bookMapper.toDomain);
};

const findByQuery = async (query: BookQuery): Promise<Book[]> => {
  const collection = getCollection();
  const filter: any = {};
  if (query.title) filter.title = { $regex: query.title, $options: 'i' };
  if (query.author) filter.author = { $regex: query.author, $options: 'i' };
  if (query.readPages !== undefined) filter.readPages = query.readPages;
  if (query.totalPages !== undefined) filter.totalPages = query.totalPages;

  const docs = await collection.find(filter).toArray();
  return docs.map(bookMapper.toDomain);
};

const findById = async (id: string): Promise<Book | null> => {
  const collection = getCollection();
  let docs = await collection.findOne({ _id: new ObjectId(id) });
  return docs ? bookMapper.toDomain(docs) : null;
};

const create = async (dataBook: CreateBookInput): Promise<Book> => {
  const collection = getCollection();
  const dbModel = bookMapper.toCreateDb(dataBook);
  const id = (await collection.insertOne(dbModel as bookDbModel)).insertedId;
  const createdBook = await collection.findOne({ _id: id });
  if (!createdBook) {
    throw new Error('created book doesnt exist');
  }
  return await bookMapper.toDomain(createdBook);
};

const update = async (id: string, dataBook: UpdateBookInput): Promise<Book> => {
  const collection = getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: dataBook },
  );
  const updatedBook = await collection.findOne({ _id: new ObjectId(id) });
  if (!updatedBook) {
    throw new Error('created book doesnt exist');
  }
  return bookMapper.toDomain(updatedBook);
};

const deleteById = async (id: string): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount !== 1) {
    throw new Error('book not found');
  }
  return true;
};

const deleteAllBooks = async (): Promise<boolean> => {
  const collection = getCollection();
  let result = await collection.deleteMany({});
  return result.acknowledged;
};
// user

const createUser = async (userData: CreateUserInput): Promise<string> => {
  const collection = getUserCollection();
  type UserData = {
    date: string;
    password: string;
    login: string;
    email: string;
  };

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(userData.password, salt);

  const user: UserData = {
    date: new Date().toString(),
    password: password,
    login: userData.login,
    email: userData.email,
  };
  let result = await collection.insertOne(user);

  return `${result.acknowledged}`;
};

const loginUser = async (userData: LoginUserInput): Promise<string> => {
  const collection = getUserCollection();
  let user = await collection.findOne({
    login: { $regex: userData.login, $options: 'i' },
  });
  if (!user) return 'user not found';
  console.log(userData.password, user.password);
  const match = await bcrypt.compare(userData.password, user.password);
  console.log('match', match);
  return match ? 'successfull' : 'not a correct password';
};

export const bookRepositoryMongo = {
  findAll,
  findByQuery,
  findById,
  create,
  update,
  delete: deleteById,
  deleteAll: deleteAllBooks,
  createUser,
  loginUser,
};
