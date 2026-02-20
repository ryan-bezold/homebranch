import { Book } from 'src/domain/entities/book.entity';
import { BookEntity } from 'src/infrastructure/database/book.entity';
import { BookFactory } from 'src/domain/entities/book.factory';

export class BookMapper {
  static toDomain(bookEntity: BookEntity): Book {
    return BookFactory.create(
      bookEntity.id,
      bookEntity.title,
      bookEntity.author,
      bookEntity.fileName,
      bookEntity.isFavorite,
      bookEntity.publishedYear,
      bookEntity.coverImageFileName,
    );
  }

  static toPersistence(book: Book): BookEntity {
    return {
      id: book.id,
      title: book.title,
      author: book.author,
      fileName: book.fileName,
      isFavorite: book.isFavorite,
      publishedYear: book.publishedYear,
      coverImageFileName: book.coverImageFileName,
    };
  }

  static toDomainList(bookEntityList: BookEntity[]): Book[] {
    return bookEntityList.map((bookEntity) => this.toDomain(bookEntity));
  }
}
