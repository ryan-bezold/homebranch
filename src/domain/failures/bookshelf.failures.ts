import { Failure } from 'src/core/result';

export class BookShelfNotFoundFailure extends Failure {
  constructor() {
    super('BOOK_SHELF_NOT_FOUND', 'Book shelf not found');
  }
}
