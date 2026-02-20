import { DomainException } from 'src/domain/exceptions/domain_exception';

export class ForbiddenError extends DomainException {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}
