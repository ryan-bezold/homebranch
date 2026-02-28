import { Book } from 'src/domain/entities/book.entity';

export class BookFactory {
  static create(
    id: string,
    title: string,
    author: string,
    fileName: string,
    isFavorite: boolean = false,
    publishedYear?: number,
    coverImageFileName?: string,
    summary?: string,
    uploadedByUserId?: string,
  ): Book {
    if (!title || !author) {
      throw new Error('Title and author are required to create a book.');
    }

    return new Book(
      id,
      title,
      author,
      fileName,
      isFavorite,
      publishedYear,
      coverImageFileName,
      summary,
      uploadedByUserId,
    );
  }
}
