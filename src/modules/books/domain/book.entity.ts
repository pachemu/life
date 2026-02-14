import { AppError } from '../../../shared/errors.js';

type BookUpdate = {
  title?: string;
  author?: string;
  readPages?: number;
  totalPages?: number;
};

export class Book {
  constructor(
    public readonly id: string,
    public title: string,
    public author: string,
    public readPages: number,
    public totalPages: number,
  ) {
    if (readPages > totalPages) {
      throw new AppError(400, 'Invalid book state');
    }
  }

  updateReadPages(pages: number) {
    if (pages < 0 || pages > this.totalPages) {
      throw new AppError(400, 'Invalid page number');
    }
    this.readPages = pages;
  }
  updateDetails(data: BookUpdate) {
    const nextTotal = data.totalPages ?? this.totalPages;
    const nextRead = data.readPages ?? this.readPages;
    if (nextTotal < nextRead) {
      throw new AppError(400, 'Invalid book data');
    }
    if (data.title !== undefined) this.title = data.title;
    if (data.author !== undefined) this.author = data.author;
    if (data.readPages !== undefined) this.readPages = data.readPages;
    if (data.totalPages !== undefined) this.totalPages = data.totalPages;
  }
}
