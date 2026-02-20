import { Failure } from 'src/core/result';

export class BookNotFoundFailure extends Failure {
  constructor() {
    super('BOOK_NOT_FOUND', 'Book not found');
  }
}
