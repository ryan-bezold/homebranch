import { Result } from 'src/core/result';
import { IRepository } from 'src/core/repository';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { PaginationResult } from 'src/core/pagination_result';

export interface IBookShelfRepository extends IRepository<BookShelf> {
  findAll(limit?: number, offset?: number, userId?: string): Promise<Result<PaginationResult<BookShelf[]>>>;
  findByTitle(title: string): Promise<Result<BookShelf>>;
  addBook(bookShelfId: string, bookId: string): Promise<Result>;
  removeBook(bookShelfId: string, bookId: string): Promise<Result>;
  findByBookId(bookId: string): Promise<Result<BookShelf[]>>;
}
