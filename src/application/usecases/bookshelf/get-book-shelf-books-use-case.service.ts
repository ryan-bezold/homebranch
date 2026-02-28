import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from 'src/core/usecase';
import { Book } from 'src/domain/entities/book.entity';
import { PaginationResult } from 'src/core/pagination_result';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { Result } from 'src/core/result';
import { GetBookShelfBooksRequest } from '../../contracts/bookshelf/get-book-shelf-books';
import { IBookRepository } from '../../interfaces/book-repository';

@Injectable()
export class GetBookShelfBooksUseCase implements UseCase<GetBookShelfBooksRequest, PaginationResult<Book[]>> {
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,

    @Inject('BookRepository')
    private bookRepository: IBookRepository,
  ) {}

  async execute({ id }: GetBookShelfBooksRequest): Promise<Result<PaginationResult<Book[]>>> {
    const findBookShelfResult = await this.bookShelfRepository.findById(id);

    if (!findBookShelfResult.isSuccess()) {
      return Result.fail(findBookShelfResult.failure!);
    }

    return await this.bookRepository.findByBookShelfId(findBookShelfResult.value);
  }
}
