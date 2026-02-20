import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { IRepository } from 'src/core/repository';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';

export interface IBookRepository extends IRepository<Book> {
  findByAuthor(
    authorId: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>>;
  findFavorites(
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>>;
  findByTitle(title: string): Promise<Result<Book>>;
  findByBookShelfId(
    bookShelf: BookShelf,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>>;
  searchByTitle(
    title: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>>;
  searchFavoritesByTitle(
    title: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>>;
}
