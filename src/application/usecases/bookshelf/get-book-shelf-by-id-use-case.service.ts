import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { GetBookShelfByIdRequest } from '../../contracts/bookshelf/get-book-shelf-by-id-request';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class GetBookShelfByIdUseCase implements UseCase<GetBookShelfByIdRequest, BookShelf> {
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute({ id }: GetBookShelfByIdRequest): Promise<Result<BookShelf>> {
    return await this.bookShelfRepository.findById(id);
  }
}
