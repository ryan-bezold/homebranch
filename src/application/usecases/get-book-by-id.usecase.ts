import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { Book } from 'src/domain/entities/book.entity';
import { UseCase } from 'src/core/usecase';
import { GetBookByIdRequest } from 'src/application/contracts/get-book-by-id-request';
import { PaginatedQuery } from 'src/core/paginated-query';
import { Result } from 'src/core/result';

@Injectable()
export class GetBookByIdUseCase
  implements UseCase<GetBookByIdRequest & PaginatedQuery, Book>
{
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute({
    id,
  }: GetBookByIdRequest & PaginatedQuery): Promise<Result<Book>> {
    return await this.bookRepository.findById(id);
  }
}
