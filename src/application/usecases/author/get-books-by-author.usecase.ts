import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { GetBooksByAuthorRequest } from 'src/application/contracts/author/get-books-by-author-request';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { UseCase } from 'src/core/usecase';
import { PaginatedQuery } from 'src/core/paginated-query';

@Injectable()
export class GetBooksByAuthorUseCase
  implements
    UseCase<GetBooksByAuthorRequest & PaginatedQuery, PaginationResult<Book[]>>
{
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute({
    name,
    query,
    limit,
    offset,
    userId,
  }: GetBooksByAuthorRequest & PaginatedQuery): Promise<
    Result<PaginationResult<Book[]>>
  > {
    if (query) {
      return await this.bookRepository.searchByAuthorAndTitle(
        name,
        query,
        limit,
        offset,
        userId,
      );
    }
    return await this.bookRepository.findByAuthor(name, limit, offset, userId);
  }
}
