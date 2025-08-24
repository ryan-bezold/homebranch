import { Book } from 'src/domain/entities/book.entity';
import { UpdateBookRequest } from 'src/application/contracts/update-book-request';
import { UseCase } from 'src/core/usecase';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';

@Injectable()
export class UpdateBookUseCase implements UseCase<UpdateBookRequest, Book> {
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute(request: UpdateBookRequest): Promise<Result<Book>> {
    const findBookResult = await this.bookRepository.findById(request.id);
    if (!findBookResult.isSuccess()) {
      return findBookResult;
    }

    const book = findBookResult.getValue();

    book.title = request.title ?? book.title;
    book.author = request.author ?? book.author;
    book.isFavorite = request.isFavorite ?? book.isFavorite;
    book.publishedYear = request.publishedYear ?? book.publishedYear;

    return await this.bookRepository.update(request.id, book);
  }
}
