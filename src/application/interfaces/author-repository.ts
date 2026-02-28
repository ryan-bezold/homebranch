import { Author } from 'src/domain/entities/author.entity';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';

export interface IAuthorRepository {
  findAll(
    query?: string,
    limit?: number,
    offset?: number,
    userId?: string,
  ): Promise<Result<PaginationResult<Author[]>>>;
  findByName(name: string): Promise<Result<Author>>;
  create(author: Author): Promise<Result<Author>>;
  updateByName(name: string, author: Author): Promise<Result<Author>>;
}
