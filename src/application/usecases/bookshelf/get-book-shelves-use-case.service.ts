import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { UseCase } from 'src/core/usecase';
import { PaginatedQuery } from 'src/core/paginated-query';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';

@Injectable()
export class GetBookShelvesUseCase
  implements UseCase<PaginatedQuery & { userId?: string }, PaginationResult<BookShelf[]>>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute({
    limit,
    offset,
    userId,
  }: PaginatedQuery & { userId?: string }): Promise<Result<PaginationResult<BookShelf[]>>> {
    return await this.bookShelfRepository.findAll(limit, offset, userId);
  }
}
