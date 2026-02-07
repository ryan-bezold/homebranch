import { IBookRepository } from '../../interfaces/book-repository';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { AddBookToBookShelfRequest } from '../../contracts/bookshelf/add-book-to-book-shelf-request';
import { BookNotFoundFailure } from 'src/domain/failures/book.failures';

@Injectable()
export class AddBookToBookShelfUseCase
  implements UseCase<AddBookToBookShelfRequest, BookShelf>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,

    @Inject('BookRepository')
    private bookRepository: IBookRepository,
  ) {}

  async execute(
    request: AddBookToBookShelfRequest,
  ): Promise<Result<BookShelf>> {
    const findBookShelfResult = await this.bookShelfRepository.findById(
      request.bookShelfId,
    );

    if (!findBookShelfResult.isSuccess()) {
      return findBookShelfResult;
    }

    const bookShelf = findBookShelfResult.getValue();

    if (bookShelf.books.find((book) => book.id === request.bookId)) {
      return Result.success(bookShelf);
    }

    const findBookResult = await this.bookRepository.findById(request.bookId);

    if (!findBookResult.isSuccess()) {
      return Result.failure(new BookNotFoundFailure());
    }

    const book = findBookResult.getValue();

    bookShelf.books.push(book);

    return await this.bookShelfRepository.update(
      request.bookShelfId,
      bookShelf,
    );
  }
}
