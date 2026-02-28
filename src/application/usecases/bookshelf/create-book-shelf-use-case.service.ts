import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { IBookShelfRepository } from '../../interfaces/bookshelf-repository';
import { CreateBookShelfRequest } from '../../contracts/bookshelf/create-book-shelf-request';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { BookShelfFactory } from 'src/domain/entities/bookshelf.factory';

@Injectable()
export class CreateBookShelfUseCase implements UseCase<CreateBookShelfRequest, BookShelf> {
  constructor(
    @Inject('BookShelfRepository')
    private bookShelfRepository: IBookShelfRepository,
  ) {}

  async execute(dto: CreateBookShelfRequest): Promise<Result<BookShelf>> {
    const id = randomUUID();
    const bookShelf = BookShelfFactory.create(id, dto.title, [], dto.userId);
    return await this.bookShelfRepository.create(bookShelf);
  }
}
