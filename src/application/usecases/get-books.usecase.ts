import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { UseCase } from 'src/core/usecase';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { PaginatedQuery } from 'src/core/paginated-query';
import { PaginationResult } from 'src/core/pagination_result';

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
  }: PaginatedQuery): Promise<Result<PaginationResult<Book[]>>> {
    return await this.bookRepository.findAll(limit, offset);
  }
}
