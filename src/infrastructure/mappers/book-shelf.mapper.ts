import { BookShelfEntity } from 'src/infrastructure/database/book-shelf.entity';
import { BookShelf } from 'src/domain/entities/bookshelf.entity';
import { BookShelfFactory } from 'src/domain/entities/bookshelf.factory';
import { BookMapper } from './book.mapper';

export class BookShelfMapper {
  static toDomain(bookShelfEntity: BookShelfEntity): BookShelf {
    return BookShelfFactory.create(
      bookShelfEntity.id,
      bookShelfEntity.title,
      BookMapper.toDomainList(bookShelfEntity.books ?? []),
      bookShelfEntity.createdByUserId,
    );
  }

  static toPersistence(bookShelf: BookShelf): BookShelfEntity {
    return {
      id: bookShelf.id,
      title: bookShelf.title,
      createdByUserId: bookShelf.createdByUserId,
      books: bookShelf.books.map((book) => BookMapper.toPersistence(book)),
    };
  }

  static toDomainList(bookShelfEntityList: BookShelfEntity[]): BookShelf[] {
    return bookShelfEntityList.map((bookShelfEntity) => this.toDomain(bookShelfEntity));
  }

  static toPersistenceList(bookShelfList: BookShelf[]): BookShelfEntity[] {
    return bookShelfList.map((bookShelf) => this.toPersistence(bookShelf));
  }
}
