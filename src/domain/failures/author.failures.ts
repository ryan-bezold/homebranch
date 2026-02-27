import { Failure } from 'src/core/result';

export class AuthorNotFoundFailure extends Failure {
  constructor() {
    super('NOT_FOUND', 'Author not found');
  }
}
