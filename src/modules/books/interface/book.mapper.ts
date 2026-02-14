import type { Book } from '../domain/book.entity.js';
import type { BookViewModel } from '../interface/book.routes.types.js';

const bookToView = (book: Book): BookViewModel => {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    readPages: book.readPages,
    totalPages: book.totalPages,
  };
};

export default bookToView;
