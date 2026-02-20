import { Failure } from 'src/core/result';

export class SavedPositionNotFoundFailure extends Failure {
  constructor() {
    super('NOT_FOUND', 'Saved position not found');
  }
}
