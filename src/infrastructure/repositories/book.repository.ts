import { Injectable } from '@nestjs/common';
import { IBookRepository } from 'src/application/interfaces/book-repository';
import { Repository } from 'typeorm';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { BookMapper } from '../mappers/book.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/domain/entities/book.entity';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { BookNotFoundFailure } from 'src/domain/failures/book.failures';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';

@Injectable()
export class TypeOrmBookRepository implements IBookRepository {
  constructor(@InjectRepository(BookEntity) private repository: Repository<BookEntity>) {}

  async create(entity: Book): Promise<Result<Book>> {
    const bookEntity = BookMapper.toPersistence(entity);
    const savedEntity = await this.repository.save(bookEntity);
    return Result.ok(BookMapper.toDomain(savedEntity));
  }

  async findAll(limit?: number, offset?: number): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository.findAndCount({
      order: { author: 'ASC', title: 'ASC' },
      take: limit,
      skip: offset,
    });

    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: offset && limit && total > offset + limit ? offset + limit : null,
    });
  }

  async findById(id: string): Promise<Result<Book>> {
    const bookEntity = (await this.repository.findOne({ where: { id } })) || null;
    if (bookEntity) return Result.ok(BookMapper.toDomain(bookEntity));
    return Result.fail(new BookNotFoundFailure());
  }

  async findByBookShelfId(
    bookShelf: BookShelf,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository
      .createQueryBuilder('book')
      .innerJoin('book.bookShelves', 'shelf', 'shelf.id = :shelfId', {
        shelfId: bookShelf.id,
      })
      .orderBy('book.author', 'ASC')
      .addOrderBy('book.title', 'ASC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset ?? 0) + limit ? (offset ?? 0) + limit : null,
    });
  }

  async update(id: string, book: Book): Promise<Result<Book>> {
    const exists = await this.repository.existsBy({ id: id });

    if (!exists) return Result.fail(new BookNotFoundFailure());

    const bookEntity = BookMapper.toPersistence(book);
    await this.repository.save(bookEntity);
    return Result.ok(BookMapper.toDomain(bookEntity));
  }

  async delete(id: string): Promise<Result<Book>> {
    const findBookResult = await this.findById(id);
    if (!findBookResult.isSuccess()) {
      return Result.fail(new BookNotFoundFailure());
    }

    const book = findBookResult.value;
    if (existsSync(`${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/books/${book.fileName}`)) {
      unlinkSync(`${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/books/${book.fileName}`);
    }
    if (
      existsSync(
        `${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/cover-images/${book.coverImageFileName}`,
      )
    ) {
      unlinkSync(
        `${process.env.UPLOADS_DIRECTORY || join(process.cwd(), 'uploads')}/cover-images/${book.coverImageFileName}`,
      );
    }
    await this.repository.delete(id);
    return Result.ok(book);
  }

  async findByAuthor(author: string, limit?: number, offset?: number): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository.findAndCount({
      where: { author },
      order: { title: 'ASC' },
      take: limit,
      skip: offset,
    });
    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset || 0) + (limit || 0) ? (offset || 0) + (limit || 0) : null,
    });
  }

  async findFavorites(limit?: number, offset?: number): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository.findAndCount({
      where: { isFavorite: true },
      order: { author: 'ASC', title: 'ASC' },
      take: limit,
      skip: offset,
    });
    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset || 0) + (limit || 0) ? (offset || 0) + (limit || 0) : null,
    });
  }

  async findByTitle(title: string): Promise<Result<Book>> {
    const bookEntity = (await this.repository.findOne({ where: { title } })) || null;
    if (bookEntity) return Result.ok(BookMapper.toDomain(bookEntity));
    return Result.fail(new BookNotFoundFailure());
  }

  async searchByTitle(title: string, limit?: number, offset?: number): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository
      .createQueryBuilder('book')
      .where('LOWER(book.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .orderBy('book.author', 'ASC')
      .addOrderBy('book.title', 'ASC')
      .limit(limit)
      .skip(offset)
      .getManyAndCount();

    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset || 0) + (limit || 0) ? (offset || 0) + (limit || 0) : null,
    });
  }

  async searchFavoritesByTitle(
    title: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository
      .createQueryBuilder('book')
      .where('LOWER(book.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .andWhere('book.isFavorite = true')
      .orderBy('book.author', 'ASC')
      .addOrderBy('book.title', 'ASC')
      .limit(limit)
      .skip(offset)
      .getManyAndCount();

    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset || 0) + (limit || 0) ? (offset || 0) + (limit || 0) : null,
    });
  }

  async searchByAuthorAndTitle(
    author: string,
    title: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Book[]>>> {
    const [bookEntities, total] = await this.repository
      .createQueryBuilder('book')
      .where('book.author = :author', { author })
      .andWhere('LOWER(book.title) LIKE LOWER(:title)', { title: `%${title}%` })
      .orderBy('book.title', 'ASC')
      .limit(limit)
      .skip(offset)
      .getManyAndCount();

    return Result.ok({
      data: BookMapper.toDomainList(bookEntities),
      limit: limit,
      offset: offset,
      total: total,
      nextCursor: limit && total > (offset || 0) + (limit || 0) ? (offset || 0) + (limit || 0) : null,
    });
  }
}
