import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from '../../interfaces/book-repository';
import { Book } from 'src/domain/entities/book.entity';
import { GetBookByIdRequest } from '../../contracts/book/get-book-by-id-request';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { PaginatedQuery } from 'src/core/paginated-query';

@Injectable()
export class GetBookByIdUseCase implements UseCase<GetBookByIdRequest & PaginatedQuery, Book> {
  constructor(@Inject('BookRepository') private bookRepository: IBookRepository) {}

  async execute({ id }: GetBookByIdRequest & PaginatedQuery): Promise<Result<Book>> {
    return await this.bookRepository.findById(id);
  }
}
