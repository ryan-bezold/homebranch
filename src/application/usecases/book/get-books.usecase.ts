import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from '../../interfaces/book-repository';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { UseCase } from 'src/core/usecase';
import { PaginatedQuery } from 'src/core/paginated-query';

@Injectable()
export class GetBooksUseCase
  implements UseCase<PaginatedQuery, PaginationResult<Book[]>>
{
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute({
    limit,
    offset,
    query,
  }: PaginatedQuery): Promise<Result<PaginationResult<Book[]>>> {
    if (query) {
      return await this.bookRepository.searchByTitle(query, limit, offset);
    }
    return await this.bookRepository.findAll(limit, offset);
  }
}
