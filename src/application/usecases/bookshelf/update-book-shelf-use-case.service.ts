import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { UpdateBookShelfRequest } from '../../contracts/bookshelf/update-book-shelf-request';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';

@Injectable()
export class UpdateBookShelfUseCase
  implements UseCase<UpdateBookShelfRequest, BookShelf>
{
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute(request: UpdateBookShelfRequest): Promise<Result<BookShelf>> {
    const findBookShelfResult = await this.bookShelfRepository.findById(
      request.id,
    );

    if (!findBookShelfResult.isSuccess()) {
      return findBookShelfResult;
    }

    const bookShelf = findBookShelfResult.getValue();

    bookShelf.title = request.title ?? bookShelf.title;

    return await this.bookShelfRepository.update(request.id, bookShelf);
  }
}
