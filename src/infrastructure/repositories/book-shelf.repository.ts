import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result, UnexpectedFailure } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { BookShelfEntity } from 'src/infrastructure/database/book-shelf.entity';
import { IBookShelfRepository } from 'src/application/interfaces/bookshelf-repository';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { BookShelfMapper } from '../mappers/book-shelf.mapper';
import { BookShelfNotFoundFailure } from 'src/domain/failures/bookshelf.failures';

@Injectable()
export class TypeOrmBookShelfRepository implements IBookShelfRepository {
  constructor(
    @InjectRepository(BookShelfEntity)
    private repository: Repository<BookShelfEntity>,
  ) {}

  private readonly logger = new Logger(TypeOrmBookShelfRepository.name);

  async create(entity: BookShelf): Promise<Result<BookShelf>> {
    try {
      const bookShelfEntity = BookShelfMapper.toPersistence(entity);
      const savedEntity = await this.repository.save(bookShelfEntity);
      return Result.ok(BookShelfMapper.toDomain(savedEntity));
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to create book shelf'));
    }
  }

  async findAll(limit?: number, offset?: number, userId?: string): Promise<Result<PaginationResult<BookShelf[]>>> {
    try {
      const [bookShelfEntities, total] = await this.repository.findAndCount({
        where: userId ? { createdByUserId: userId } : undefined,
        relations: ['books'],
        take: limit,
        skip: offset,
      });

      return Result.ok({
        data: BookShelfMapper.toDomainList(bookShelfEntities),
        limit: limit,
        offset: offset,
        total: total,
        nextCursor: limit && total > (offset ?? 0) + limit ? (offset ?? 0) + limit : null,
      });
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to retrieve book shelves'));
    }
  }

  async findById(id: string): Promise<Result<BookShelf>> {
    try {
      const bookShelfEntity =
        (await this.repository.findOne({
          where: { id },
          relations: ['books'],
        })) || null;
      if (bookShelfEntity) {
        return Result.ok(BookShelfMapper.toDomain(bookShelfEntity));
      }
      return Result.fail(new BookShelfNotFoundFailure());
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to retrieve book shelf'));
    }
  }

  async update(id: string, bookShelf: BookShelf): Promise<Result<BookShelf>> {
    try {
      const currentShelf = await this.repository.findOne({
        where: { id },
      });

      if (!currentShelf) return Result.fail(new BookShelfNotFoundFailure());

      currentShelf.title = bookShelf.title;
      await this.repository.save(currentShelf);

      const result = await this.repository.findOne({
        where: { id },
        relations: ['books'],
      });
      return Result.ok(BookShelfMapper.toDomain(result!));
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to update book shelf'));
    }
  }

  async delete(id: string): Promise<Result<BookShelf>> {
    try {
      const findBookShelfResult = await this.findById(id);
      if (!findBookShelfResult.isSuccess()) {
        return Result.fail(new BookShelfNotFoundFailure());
      }

      const bookShelf = findBookShelfResult.value;
      await this.repository.delete(id);
      return Result.ok(bookShelf);
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to delete book shelf'));
    }
  }

  async findByTitle(title: string): Promise<Result<BookShelf>> {
    try {
      const bookShelfEntity = (await this.repository.findOne({ where: { title } })) || null;
      if (bookShelfEntity) {
        return Result.ok(BookShelfMapper.toDomain(bookShelfEntity));
      }
      return Result.fail(new BookShelfNotFoundFailure());
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to retrieve book shelf by title'));
    }
  }

  async addBook(bookShelfId: string, bookId: string): Promise<Result> {
    try {
      await this.repository.createQueryBuilder().relation(BookShelfEntity, 'books').of(bookShelfId).add(bookId);
      return Result.ok();
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to add book to book shelf'));
    }
  }

  async removeBook(bookShelfId: string, bookId: string): Promise<Result> {
    try {
      await this.repository.createQueryBuilder().relation(BookShelfEntity, 'books').of(bookShelfId).remove(bookId);
      return Result.ok();
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to remove book from book shelf'));
    }
  }

  async findByBookId(bookId: string): Promise<Result<BookShelf[]>> {
    try {
      const shelves = await this.repository
        .createQueryBuilder('shelf')
        .innerJoin('shelf.books', 'book', 'book.id = :bookId', { bookId })
        .getMany();

      return Result.ok(shelves.map((shelf) => BookShelfMapper.toDomain(shelf)));
    } catch (error) {
      this.logger.error(error);
      return Result.fail(new UnexpectedFailure('Failed to retrieve book shelves by book ID'));
    }
  }
}
