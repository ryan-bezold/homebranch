import { Failure } from 'src/core/result';

export class UserNotFoundFailure extends Failure {
  constructor() {
    super('NOT_FOUND', 'User not found');
  }
}
