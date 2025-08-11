import { DomainException } from './domain_exception';

export class BookNotFoundError extends DomainException {
  constructor() {
    super('Book not found');
    this.name = 'BookNotFoundError';
  }
}
