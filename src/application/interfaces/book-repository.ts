import { Book } from 'src/domain/entities/book.entity';
import { IRepository } from 'src/core/repository';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';

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
  findByTitle(title: string, limit?: number): Promise<Result<Book>>;
}
