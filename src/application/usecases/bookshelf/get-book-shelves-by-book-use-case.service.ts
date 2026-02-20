import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { UseCase } from 'src/core/usecase';

interface GetBookShelvesByBookRequest {
  bookId: string;
}

@Injectable()
export class GetBookShelvesByBookUseCase
  implements UseCase<GetBookShelvesByBookRequest, BookShelf[]>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute({
    bookId,
  }: GetBookShelvesByBookRequest): Promise<Result<BookShelf[]>> {
    return await this.bookShelfRepository.findByBookId(bookId);
  }
}
