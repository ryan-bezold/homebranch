import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from '../../interfaces/book-repository';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';

export interface FetchBookSummaryRequest {
  id: string;
}

@Injectable()
export class FetchBookSummaryUseCase implements UseCase<FetchBookSummaryRequest, Book> {
  constructor(
    @Inject('BookRepository') private bookRepository: IBookRepository,
    private openLibraryGateway: OpenLibraryGateway,
  ) {}

  async execute(request: FetchBookSummaryRequest): Promise<Result<Book>> {
    const findResult = await this.bookRepository.findById(request.id);
    if (!findResult.isSuccess()) {
      return findResult;
    }

    const book = findResult.value;
    const summary = await this.openLibraryGateway.findBookSummary(book.title, book.author);

    if (summary === null) {
      return findResult;
    }

    book.summary = summary;
    return await this.bookRepository.update(request.id, book);
  }
}
