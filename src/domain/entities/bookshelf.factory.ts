import { Book } from './book.entity';
import { BookShelf } from './bookshelf.entity';

export class BookShelfFactory {
  static create(id: string, title: string, books: Book[] = []): BookShelf {
    if (!title) {
      throw new Error('Title is required to create a bookshelf.');
    }

    return new BookShelf(id, title, books);
  }
}
