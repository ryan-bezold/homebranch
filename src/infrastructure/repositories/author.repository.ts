import { Injectable } from '@nestjs/common';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { Repository } from 'typeorm';
import { AuthorEntity } from 'src/infrastructure/database/author.entity';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { AuthorMapper } from 'src/infrastructure/mappers/author.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from 'src/domain/entities/author.entity';
import { AuthorNotFoundFailure } from 'src/domain/failures/author.failures';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';

interface AuthorWithBookCount {
  id: string;
  name: string;
  biography: string | null;
  profilePictureUrl: string | null;
  bookCount: string;
}

@Injectable()
export class TypeOrmAuthorRepository implements IAuthorRepository {
  constructor(
    @InjectRepository(AuthorEntity)
    private authorRepository: Repository<AuthorEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
  ) {}

  async findAll(
    query?: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<Author[]>>> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .select('book.author', 'name')
      .addSelect('COUNT(book.id)', 'bookCount')
      .addSelect('author.id', 'id')
      .addSelect('author.biography', 'biography')
      .addSelect('author.profile_picture_url', 'profilePictureUrl')
      .leftJoin(
        AuthorEntity,
        'author',
        'LOWER(author.name) = LOWER(book.author)',
      )
      .groupBy('book.author')
      .addGroupBy('author.id')
      .addGroupBy('author.biography')
      .addGroupBy('author.profile_picture_url')
      .orderBy('book.author', 'ASC');

    if (query) {
      queryBuilder.where('LOWER(book.author) LIKE LOWER(:query)', {
        query: `%${query}%`,
      });
    }

    const countQueryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .select('COUNT(DISTINCT book.author)', 'count');

    if (query) {
      countQueryBuilder.where('LOWER(book.author) LIKE LOWER(:query)', {
        query: `%${query}%`,
      });
    }

    const countResult = (await countQueryBuilder.getRawOne()) as {
      count: string;
    };
    const total = parseInt(countResult?.count ?? '0', 10);

    if (limit !== undefined) {
      queryBuilder.limit(limit);
    }
    if (offset !== undefined) {
      queryBuilder.offset(offset);
    }

    const rows = (await queryBuilder.getRawMany()) as AuthorWithBookCount[];

    const authors = rows.map((row) => {
      const author = new Author(
        row.id ?? null,
        row.name,
        row.biography ?? null,
        row.profilePictureUrl ?? null,
      );
      author.bookCount = parseInt(row.bookCount, 10);
      return author;
    });

    return Result.ok({
      data: authors,
      limit,
      offset,
      total,
      nextCursor:
        limit && total > (offset ?? 0) + limit ? (offset ?? 0) + limit : null,
    });
  }

  async findByName(name: string): Promise<Result<Author>> {
    const authorEntity = await this.authorRepository
      .createQueryBuilder('author')
      .where('LOWER(author.name) = LOWER(:name)', { name })
      .getOne();

    if (!authorEntity) {
      return Result.fail(new AuthorNotFoundFailure());
    }

    return Result.ok(AuthorMapper.toDomain(authorEntity));
  }

  async create(author: Author): Promise<Result<Author>> {
    const authorEntity = AuthorMapper.toPersistence(author);
    const savedEntity = await this.authorRepository.save(authorEntity);
    return Result.ok(AuthorMapper.toDomain(savedEntity));
  }

  async updateByName(name: string, author: Author): Promise<Result<Author>> {
    const existingEntity = await this.authorRepository
      .createQueryBuilder('author')
      .where('LOWER(author.name) = LOWER(:name)', { name })
      .getOne();

    if (!existingEntity) {
      return Result.fail(new AuthorNotFoundFailure());
    }

    const updatedEntity = AuthorMapper.toPersistence(author);
    await this.authorRepository.save(updatedEntity);
    return Result.ok(AuthorMapper.toDomain(updatedEntity));
  }
}
