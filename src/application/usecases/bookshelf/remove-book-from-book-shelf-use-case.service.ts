import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { RemoveBookFromBookShelfRequest } from '../../contracts/bookshelf/remove-book-from-book-shelf-request';

@Injectable()
export class RemoveBookFromBookShelfUseCase
  implements UseCase<RemoveBookFromBookShelfRequest, BookShelf>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute(
    request: RemoveBookFromBookShelfRequest,
  ): Promise<Result<BookShelf>> {
    const findBookShelfResult = await this.bookShelfRepository.findById(
      request.bookShelfId,
    );

    if (!findBookShelfResult.isSuccess()) {
      return findBookShelfResult;
    }

    const bookShelf = findBookShelfResult.getValue();

    if (!bookShelf.books.find((book) => book.id === request.bookId)) {
      return Result.success(bookShelf);
    }

    bookShelf.books = bookShelf.books.filter(
      (book) => book.id !== request.bookId,
    );

    return await this.bookShelfRepository.update(
      request.bookShelfId,
      bookShelf,
    );
  }
}
