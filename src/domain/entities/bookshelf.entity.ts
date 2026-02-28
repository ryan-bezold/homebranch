import { Book } from './book.entity';

export class BookShelf {
  constructor(
    public id: string,
    public title: string,
    public books: Book[],
    public createdByUserId?: string,
  ) {}
}
