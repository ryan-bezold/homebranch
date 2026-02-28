import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';

export interface IRepository<T> {
  findAll(limit?: number, offset?: number): Promise<Result<PaginationResult<T[]>>>;
  findById(id: string): Promise<Result<T>>;
  create(entity: T): Promise<Result<T>>;
  update(id: string, entity: T): Promise<Result<T>>;
  delete(id: string): Promise<Result<T>>;
}
