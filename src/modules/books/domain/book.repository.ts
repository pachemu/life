import type { Book } from './book.entity.js';

export type CreateBookInput = {
  title: string;
  author: string;
  readPages: number;
  totalPages: number;
};

export type UpdateBookInput = Partial<CreateBookInput>;

export type BookQuery = {
  title?: string;
  author?: string;
  readPages?: number;
  totalPages?: number;
};

export interface BookRepository {
  findAll(ownerId: string): Promise<Book[]>;
  findByQuery(ownerId: string, query: BookQuery): Promise<Book[]>;
  findById(id: string, ownerId: string): Promise<Book | null>;
  create(ownerId: string, data: CreateBookInput): Promise<Book>;
  update(id: string, ownerId: string, data: UpdateBookInput): Promise<Book>;
  delete(id: string, ownerId: string): Promise<boolean>;
  deleteAll(ownerId: string): Promise<boolean>;
  // createUser(data: CreateUserInput): Promise<string>;
  // loginUser(data: LoginUserInput): Promise<string>;
}
