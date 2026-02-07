import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { DeleteBookShelfRequest } from '../../contracts/bookshelf/delete-book-shelf-request';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class DeleteBookShelfUseCase
  implements UseCase<DeleteBookShelfRequest, BookShelf>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute({ id }: DeleteBookShelfRequest): Promise<Result<BookShelf>> {
    return await this.bookShelfRepository.delete(id);
  }
}
