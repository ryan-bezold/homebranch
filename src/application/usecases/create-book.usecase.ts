import { Inject, Injectable } from '@nestjs/common';
import { CreateBookRequest } from 'src/application/contracts/create-book-request';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { UseCase } from 'src/core/usecase';
import { BookFactory } from 'src/domain/entities/book.factory';
import { Book } from 'src/domain/entities/book.entity';
import { randomUUID } from 'crypto';
import { Result } from 'src/core/result';

@Injectable()
export class CreateBookUseCase implements UseCase<CreateBookRequest, Book> {
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
  ) {}

  async execute(dto: CreateBookRequest): Promise<Result<Book>> {
    const id = randomUUID();
    const book = BookFactory.create(
      id,
      dto.title,
      dto.author,
      dto.fileName,
      dto.isFavorite ?? false,
      dto.publishedYear ? this._parseYear(dto.publishedYear) : undefined,
      dto.coverImageFileName,
    );
    return await this.bookRepository.create(book);
  }

  _parseYear(year: string): number | undefined {
    const yearNumber = parseInt(year);
    if (isNaN(yearNumber)) {
      return;
    }
    return yearNumber;
  }
}
