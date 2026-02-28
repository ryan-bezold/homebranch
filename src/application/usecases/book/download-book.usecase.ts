import { Inject, Injectable } from '@nestjs/common';
import { IBookRepository } from '../../interfaces/book-repository';
import { Book } from 'src/domain/entities/book.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

export interface DownloadBookRequest {
  id: string;
}

@Injectable()
export class DownloadBookUseCase implements UseCase<DownloadBookRequest, Book> {
  constructor(@Inject('BookRepository') private bookRepository: IBookRepository) {}

  async execute({ id }: DownloadBookRequest): Promise<Result<Book>> {
    return await this.bookRepository.findById(id);
  }
}
