import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { UseCase } from 'src/core/usecase';
import { DeleteBookRequest } from 'src/application/contracts/delete-book-request';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';

@Injectable()
export class DeleteBookUseCase implements UseCase<DeleteBookRequest, Book> {
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute({ id }: DeleteBookRequest): Promise<Result<Book>> {
    return await this.bookRepository.delete(id);
  }
}
