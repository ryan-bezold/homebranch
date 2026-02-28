import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from '../../interfaces/book-repository';
import { DeleteBookRequest } from '../../contracts/book/delete-book-request';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { DeleteBookForbiddenFailure } from 'src/domain/failures/book.failures';

@Injectable()
export class DeleteBookUseCase implements UseCase<DeleteBookRequest, Book> {
  constructor(@Inject('BookRepository') private bookRepository: IBookRepository) {}

  async execute({ id, requestingUserId, requestingUserRole }: DeleteBookRequest): Promise<Result<Book>> {
    const bookResult = await this.bookRepository.findById(id);
    if (!bookResult.isSuccess()) return bookResult;

    const book = bookResult.value;
    if (
      requestingUserRole !== 'ADMIN' &&
      book.uploadedByUserId !== undefined &&
      book.uploadedByUserId !== requestingUserId
    ) {
      return Result.fail(new DeleteBookForbiddenFailure());
    }

    return await this.bookRepository.delete(id);
  }
}
