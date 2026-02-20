import { Failure } from 'src/core/result';

export class RoleNotFoundFailure extends Failure {
  constructor() {
    super('NOT_FOUND', 'Role not found');
  }
}

export class DuplicateRoleNameFailure extends Failure {
  constructor() {
    super('CONFLICT', 'A role with this name already exists');
  }
}

export class RoleHasAssignedUsersFailure extends Failure {
  constructor() {
    super('CONFLICT', 'Cannot delete a role that has assigned users');
  }
}

export class InvalidRoleFailure extends Failure {
  constructor() {
    super('BAD_REQUEST', 'Invalid role');
  }
}
