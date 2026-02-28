import { Inject, Injectable } from '@nestjs/common';
import { CreateBookRequest } from '../../contracts/book/create-book-request';
import { IBookRepository } from '../../interfaces/book-repository';
import { BookFactory } from 'src/domain/entities/book.factory';
import { Book } from 'src/domain/entities/book.entity';
import { randomUUID } from 'crypto';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';

@Injectable()
export class CreateBookUseCase implements UseCase<CreateBookRequest, Book> {
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
    private openLibraryGateway: OpenLibraryGateway,
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
      undefined,
      dto.uploadedByUserId,
    );

    book.summary = await this.openLibraryGateway.findBookSummary(
      dto.title,
      dto.author,
    ) ?? undefined;

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
